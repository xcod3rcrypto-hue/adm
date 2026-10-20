"""Importa a base aberta do IPTU (São Paulo) para SQLite e consulta por CEP.

A Prefeitura de São Paulo publica anualmente o cadastro fiscal de imóveis
(TPCL) em CSV. O cabeçalho muda um pouco entre os anos, então as colunas são
localizadas por nome aproximado. Colunas com nome de pessoa (contribuinte,
compromissário) são descartadas na importação: o programa nunca guarda nem
mostra quem é o dono do imóvel.
"""

from __future__ import annotations

import codecs
import csv
import io
import re
import sqlite3
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path

from .cep import CepInvalido, normalizar_cep

# campo interno -> trechos que identificam a coluna no CSV (já normalizados)
COLUNAS = {
    "sql": ["numero do contribuinte", "numero_contribuinte", "sql"],
    "ano_exercicio": ["ano do exercicio", "ano_exercicio"],
    "logradouro": ["nome de logradouro do imovel", "nome do logradouro", "logradouro"],
    "numero": ["numero do imovel", "numero_imovel"],
    "complemento": ["complemento do imovel", "complemento"],
    "bairro": ["bairro do imovel", "bairro"],
    "cep": ["cep do imovel", "cep"],
    "fracao_ideal": ["fracao ideal", "fracao_ideal"],
    "area_terreno": ["area do terreno", "area_terreno"],
    "area_construida": ["area construida", "area_construida"],
    "area_ocupada": ["area ocupada", "area_ocupada"],
    "valor_m2_terreno": ["valor do m2 do terreno", "valor_m2_terreno"],
    "valor_m2_construcao": ["valor do m2 de construcao", "valor_m2_construcao"],
    "ano_construcao": ["ano da construcao corrigido", "ano da construcao", "ano_construcao"],
    "pavimentos": ["quantidade de pavimentos", "pavimentos"],
    "uso": ["tipo de uso do imovel", "uso do imovel", "tipo_uso"],
    "padrao": ["tipo de padrao da construcao", "padrao da construcao", "padrao"],
    "testada": ["testada para calculo", "testada"],
    "fator_obsolescencia": ["fator de obsolescencia", "fator_obsolescencia"],
}

# Nunca importadas, mesmo que existam no arquivo.
COLUNAS_PESSOAIS = ("nome", "cpf", "cnpj", "compromissario", "contribuinte 1", "contribuinte 2")

NUMERICOS = {
    "fracao_ideal", "area_terreno", "area_construida", "area_ocupada",
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
            # igualdade primeiro, depois "contém", sem reaproveitar colunas
            achado = next((i for i, c in enumerate(normal) if c == chave and i not in usados), None)
            if achado is None:
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


def importar_csv(csv_path: str | Path, db_path: str | Path, progresso=None) -> int:
    """Lê o CSV da Prefeitura e grava em SQLite indexado por CEP. Retorna o total."""
    csv_path, db_path = Path(csv_path), Path(db_path)
    campos = list(COLUNAS)
    # Grava num arquivo temporário: se a importação falhar, a base atual continua valendo.
    temp = db_path.with_name(db_path.name + ".importando")
    temp.unlink(missing_ok=True)
    con = sqlite3.connect(temp)
    try:
        con.execute("DROP TABLE IF EXISTS imoveis")
        con.execute(
            "CREATE TABLE imoveis (" + ", ".join(
                f"{c} {'REAL' if c in NUMERICOS else 'TEXT'}" for c in campos
            ) + ")"
        )
        total = 0
        with _abrir_texto(csv_path) as f:
            amostra = f.read(4096)
            f.seek(0)
            sep = ";" if amostra.count(";") > amostra.count(",") else ","
            leitor = csv.reader(f, delimiter=sep)
            mapa = mapear_colunas(next(leitor))
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
        con.commit()
    except BaseException:
        con.close()
        temp.unlink(missing_ok=True)
        raise
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
    bairro: str = ""
    cep: str = ""
    fracao_ideal: float | None = None
    area_terreno: float | None = None
    area_construida: float | None = None
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
        então o valor do carnê pode ser diferente.
        """
        if self.area_terreno is None or self.valor_m2_terreno is None:
            return None
        fracao = self.fracao_ideal if self.fracao_ideal else 1.0
        terreno = self.area_terreno * self.valor_m2_terreno * fracao
        construcao = 0.0
        if self.area_construida and self.valor_m2_construcao:
            construcao = self.area_construida * self.valor_m2_construcao * (self.fator_obsolescencia or 1.0)
        return round(terreno + construcao, 2)

    @property
    def endereco(self) -> str:
        partes = [self.logradouro, self.numero]
        texto = ", ".join(p for p in partes if p)
        if self.complemento:
            texto += f" - {self.complemento}"
        return texto


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
