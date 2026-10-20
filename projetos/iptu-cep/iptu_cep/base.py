"""Importa o cadastro do IPTU (CSV ou Excel) para SQLite e consulta por CEP.

Serve para a base aberta de São Paulo (GeoSampa) e para planilhas de outras
prefeituras, como a de Itanhaém obtida por pedido de acesso à informação. Como
cada prefeitura nomeia as colunas de um jeito, elas são localizadas por nome
aproximado. Colunas com nome de pessoa, CPF ou CNPJ são descartadas na
importação: o programa nunca guarda nem mostra quem é o dono do imóvel.
"""

from __future__ import annotations

import codecs
import csv
import io
import re
import sqlite3
import unicodedata
import xml.etree.ElementTree as ET
import zipfile
from dataclasses import dataclass, field
from pathlib import Path

from . import cidades
from .cep import CepInvalido, normalizar_cep

# campo interno -> trechos que identificam a coluna (já normalizados).
# "=texto" só aceita a coluna com esse nome exato (ex.: "lote" não pode pegar "loteamento").
COLUNAS = {
    "sql": ["numero do contribuinte", "numero_contribuinte", "sql", "inscricao imobiliaria",
            "inscricao cadastral", "numero do cadastro", "cadastro imobiliario", "=inscricao", "=cadastro",
            "codigo do imovel", "=codigo"],
    "ano_exercicio": ["ano do exercicio", "ano_exercicio", "=exercicio", "=ano"],
    "logradouro": ["nome de logradouro do imovel", "nome do logradouro", "logradouro", "=endereco",
                   "endereco do imovel", "=rua"],
    "numero": ["numero do imovel", "numero_imovel", "=numero", "=no", "=n", "=nro"],
    "complemento": ["complemento do imovel", "complemento"],
    "loteamento": ["=loteamento", "nome do loteamento", "loteamento"],
    "quadra": ["=quadra", "=qd", "quadra do imovel"],
    "lote": ["=lote", "=lt", "lote do imovel"],
    "bairro": ["bairro do imovel", "bairro"],
    "cep": ["cep do imovel", "cep"],
    "fracao_ideal": ["fracao ideal", "fracao_ideal"],
    "area_terreno": ["area do terreno", "area_terreno", "area do lote", "area terreno", "=area territorial"],
    "area_construida": ["area construida", "area_construida", "area edificada", "area da edificacao"],
    "valor_venal": ["valor venal total", "valor venal do imovel", "=valor venal", "=venal total"],
    "area_ocupada": ["area ocupada", "area_ocupada"],
    "valor_m2_terreno": ["valor do m2 do terreno", "valor_m2_terreno"],
    "valor_m2_construcao": ["valor do m2 de construcao", "valor_m2_construcao"],
    "ano_construcao": ["ano da construcao corrigido", "ano da construcao", "ano_construcao"],
    "pavimentos": ["quantidade de pavimentos", "pavimentos"],
    "uso": ["tipo de uso do imovel", "uso do imovel", "tipo_uso", "=uso", "=utilizacao",
            "tipo do imovel", "tipo de imovel", "categoria do imovel"],
    "padrao": ["tipo de padrao da construcao", "padrao da construcao", "padrao"],
    "testada": ["testada para calculo", "testada"],
    "fator_obsolescencia": ["fator de obsolescencia", "fator_obsolescencia"],
}

# Nunca importadas, mesmo que existam no arquivo.
COLUNAS_PESSOAIS = ("nome", "cpf", "cnpj", "compromissario", "contribuinte 1", "contribuinte 2",
                    "propriet", "titular", "responsavel", "correspond", "entrega", "telefone", "email",
                    "e-mail", "rg")

NUMERICOS = {
    "valor_venal", "fracao_ideal", "area_terreno", "area_construida", "area_ocupada",
    "valor_m2_terreno", "valor_m2_construcao", "testada", "fator_obsolescencia",
}


def _norm(texto: str) -> str:
    t = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return re.sub(r"\s+", " ", t.strip().lower())


def _numero(valor: str) -> float | None:
    v = (valor or "").strip()
    if not v:
        return None
    if "," in v:  # formato brasileiro: 1.234,56
        v = v.replace(".", "").replace(",", ".")
    try:
        return float(v)
    except ValueError:
        return None


def mapear_colunas(cabecalho: list[str]) -> dict[str, int]:
    normal = [_norm(c) for c in cabecalho]
    mapa: dict[str, int] = {}
    usados: set[int] = set()
    for campo, chaves in COLUNAS.items():
        for chave in chaves:
            exata = chave.startswith("=")
            chave = chave.lstrip("=")
            # igualdade primeiro, depois "contém", sem reaproveitar colunas
            achado = next((i for i, c in enumerate(normal) if c == chave and i not in usados), None)
            if achado is None and not exata:
                achado = next(
                    (i for i, c in enumerate(normal)
                     if chave in c and i not in usados
                     and not any(p in c for p in COLUNAS_PESSOAIS if p not in chave)),
                    None,
                )
            if achado is not None:
                mapa[campo] = achado
                usados.add(achado)
                break
    if "cep" not in mapa:
        raise ValueError("O arquivo não tem coluna de CEP; confira se é a base do IPTU.")
    return mapa


def _linhas_xlsx(caminho: Path):
    """Lê a primeira planilha de um .xlsx linha a linha (sem bibliotecas externas)."""
    ns = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
    with zipfile.ZipFile(caminho) as z:
        compartilhadas = []
        if "xl/sharedStrings.xml" in z.namelist():
            with z.open("xl/sharedStrings.xml") as f:
                for _, el in ET.iterparse(f):
                    if el.tag == ns + "si":
                        compartilhadas.append("".join(t.text or "" for t in el.iter(ns + "t")))
                        el.clear()
        planilhas = sorted(n for n in z.namelist() if re.match(r"xl/worksheets/sheet\d+\.xml$", n))
        if not planilhas:
            raise ValueError("Planilha vazia ou formato não reconhecido.")
        with z.open(planilhas[0]) as f:
            for _, el in ET.iterparse(f):
                if el.tag != ns + "row":
                    continue
                linha = []
                for c in el.iter(ns + "c"):
                    col = 0
                    for ch in re.match(r"[A-Z]+", c.get("r", "A")).group(0):
                        col = col * 26 + ord(ch) - 64
                    while len(linha) < col - 1:
                        linha.append("")
                    tipo, v = c.get("t"), c.find(ns + "v")
                    if tipo == "s" and v is not None:
                        valor = compartilhadas[int(v.text)]
                    elif tipo == "inlineStr":
                        valor = "".join(t.text or "" for t in c.iter(ns + "t"))
                    else:
                        valor = v.text if v is not None and v.text else ""
                        if re.fullmatch(r"-?\d+\.0", valor):
                            valor = valor[:-2]  # 11740000.0 -> 11740000
                    linha.append(valor)
                el.clear()
                yield linha


def _linhas(caminho: Path):
    if caminho.suffix.lower() in (".xlsx", ".xlsm"):
        yield from _linhas_xlsx(caminho)
        return
    with _abrir_texto(caminho) as f:
        amostra = f.read(4096)
        f.seek(0)
        sep = ";" if amostra.count(";") > amostra.count(",") else ("\t" if "\t" in amostra else ",")
        yield from csv.reader(f, delimiter=sep)


def _abrir_texto(caminho: Path) -> io.TextIOWrapper:
    with open(caminho, "rb") as f:
        bruto = f.read(65536)
    try:
        # final=False: um caractere cortado no fim da amostra não conta como erro
        codecs.getincrementaldecoder("utf-8")().decode(bruto, final=False)
        encoding = "utf-8-sig"
    except UnicodeDecodeError:
        encoding = "latin-1"
    return open(caminho, encoding=encoding, newline="")


def importar_csv(csv_path: str | Path, db_path: str | Path, progresso=None, cidade: str | None = None) -> int:
    """Lê o CSV/Excel da Prefeitura e grava em SQLite indexado por CEP. Retorna o total."""
    csv_path, db_path = Path(csv_path), Path(db_path)
    info_cidade = cidades.obter(cidade)
    fora = 0
    campos = list(COLUNAS)
    # Grava num arquivo temporário: se a importação falhar, a base atual continua valendo.
    temp = db_path.with_name(db_path.name + ".importando")
    temp.unlink(missing_ok=True)
    con = sqlite3.connect(temp)
    leitor = None
    try:
        con.execute("DROP TABLE IF EXISTS imoveis")
        con.execute(
            "CREATE TABLE imoveis (" + ", ".join(
                f"{c} {'REAL' if c in NUMERICOS else 'TEXT'}" for c in campos
            ) + ")"
        )
        total = 0
        leitor = _linhas(csv_path)
        try:
            mapa = mapear_colunas(next(leitor))
        except StopIteration:
            raise ValueError("O arquivo está vazio.") from None
        lote = []
        for linha in leitor:
            registro = {}
            for campo in campos:
                i = mapa.get(campo)
                bruto = linha[i].strip() if i is not None and i < len(linha) else ""
                registro[campo] = _numero(bruto) if campo in NUMERICOS else bruto
            try:
                registro["cep"] = normalizar_cep(registro["cep"])
            except CepInvalido:
                continue
            if not cidades.cep_da_cidade(info_cidade, registro["cep"]):
                fora += 1
            lote.append(tuple(registro[c] for c in campos))
            if len(lote) >= 20000:
                con.executemany(f"INSERT INTO imoveis VALUES ({','.join('?' * len(campos))})", lote)
                total += len(lote)
                lote.clear()
                if progresso:
                    progresso(total)
        if lote:
            con.executemany(f"INSERT INTO imoveis VALUES ({','.join('?' * len(campos))})", lote)
            total += len(lote)
        con.execute("CREATE INDEX idx_cep ON imoveis(cep)")
        exercicio = con.execute("SELECT MAX(ano_exercicio) FROM imoveis").fetchone()[0]
        con.execute("CREATE TABLE meta (chave TEXT PRIMARY KEY, valor TEXT)")
        con.executemany("INSERT INTO meta VALUES (?, ?)", [
            ("cidade", info_cidade["chave"]), ("total", str(total)),
            ("exercicio", exercicio or ""), ("fora_da_cidade", str(fora)),
        ])
        con.commit()
    except BaseException:
        con.close()
        temp.unlink(missing_ok=True)
        raise
    finally:
        if leitor is not None:
            leitor.close()  # fecha o arquivo aberto pelo gerador
    con.close()
    temp.replace(db_path)
    return total


@dataclass
class Imovel:
    sql: str = ""
    ano_exercicio: str = ""
    logradouro: str = ""
    numero: str = ""
    complemento: str = ""
    loteamento: str = ""
    quadra: str = ""
    lote: str = ""
    bairro: str = ""
    cep: str = ""
    fracao_ideal: float | None = None
    area_terreno: float | None = None
    area_construida: float | None = None
    valor_venal: float | None = None
    area_ocupada: float | None = None
    valor_m2_terreno: float | None = None
    valor_m2_construcao: float | None = None
    ano_construcao: str = ""
    pavimentos: str = ""
    uso: str = ""
    padrao: str = ""
    testada: float | None = None
    fator_obsolescencia: float | None = None
    extras: dict = field(default_factory=dict)

    @property
    def valor_venal_estimado(self) -> float | None:
        """Estimativa simplificada (não oficial) do valor venal.

        Terreno: área × valor do m² × fração ideal.
        Construção: área construída × valor do m² × fator de obsolescência.
        A Prefeitura aplica ainda fatores de profundidade, esquina e outros,
        então o valor do carnê pode ser diferente. Se a planilha da Prefeitura
        já traz o valor venal (como a de Itanhaém), ele é usado direto.
        """
        if self.valor_venal:
            return round(self.valor_venal, 2)
        if self.area_terreno is None or self.valor_m2_terreno is None:
            return None
        fracao = self.fracao_ideal if self.fracao_ideal else 1.0
        terreno = self.area_terreno * self.valor_m2_terreno * fracao
        construcao = 0.0
        if self.area_construida and self.valor_m2_construcao:
            construcao = self.area_construida * self.valor_m2_construcao * (self.fator_obsolescencia or 1.0)
        return round(terreno + construcao, 2)

    @property
    def sem_numero(self) -> bool:
        n = (self.numero or "").strip()
        return not n.strip("0 ") or _norm(n) in {"sn", "s/n", "s/no", "s n"}

    @property
    def endereco(self) -> str:
        partes = [self.logradouro, "s/n" if self.sem_numero else self.numero]
        texto = ", ".join(p for p in partes if p)
        if self.complemento:
            texto += f" - {self.complemento}"
        quadra_lote = " ".join(p for p in (f"Qd {self.quadra}" if self.quadra else "",
                                           f"Lt {self.lote}" if self.lote else "") if p)
        if quadra_lote:
            texto += f" ({quadra_lote})"
        return texto


def ler_meta(db_path: str | Path) -> dict:
    """Cidade, total e exercício gravados na importação (bases antigas: São Paulo)."""
    con = sqlite3.connect(db_path)
    try:
        meta = dict(con.execute("SELECT chave, valor FROM meta").fetchall())
    except sqlite3.Error:
        meta = {"cidade": "sao-paulo"}  # importada antes de existir a tabela meta
    finally:
        con.close()
    return meta


def consultar(db_path: str | Path, cep: str, numero: str | None = None) -> list[Imovel]:
    db_path = Path(db_path)
    if not db_path.exists():
        raise FileNotFoundError(
            f"Base não encontrada em {db_path}. Rode primeiro: python -m iptu_cep importar <arquivo.csv>"
        )
    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    sql = "SELECT * FROM imoveis WHERE cep = ?"
    args: list = [normalizar_cep(cep)]
    if numero:
        sql += " AND ltrim(numero, '0') = ltrim(?, '0')"
        args.append(str(numero).strip())
    sql += " ORDER BY logradouro, CAST(numero AS INTEGER), complemento"
    linhas = con.execute(sql, args).fetchall()
    con.close()
    return [Imovel(**dict(l)) for l in linhas]
