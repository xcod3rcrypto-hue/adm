"""Tela no navegador: digita o CEP e vê todos os imóveis e o IPTU de cada um.

Servidor local só com a biblioteca padrão. Rotas:
  GET  /                    página
  GET  /api/status          se a base foi importada e quantos imóveis tem
  GET  /api/consulta?cep=   endereço do CEP + imóveis
  POST /api/importar        {"csv": "caminho/do/arquivo.csv"}
"""

from __future__ import annotations

import json
import sqlite3
import threading
import webbrowser
from dataclasses import asdict
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from . import base, cep, cidades

PAGINA = Path(__file__).with_name("pagina.html")


def cidade_da_base(db: Path) -> dict:
    """A cidade da base importada (antes de importar: a cidade padrão, Itanhaém)."""
    chave = base.ler_meta(db).get("cidade") if Path(db).exists() else None
    return cidades.obter(chave)


def links(cidade: dict) -> dict:
    return {"debitos": cidade["link_debitos"], "segunda_via": cidade["link_segunda_via"],
            "certidao": cidade["link_certidao"]}


def cidade_publica(cidade: dict) -> dict:
    """O que a página precisa saber da cidade."""
    return {"nome": cidade["nome"], "uf": cidade["uf"], "ibge": cidade["ibge"],
            "rotulo_inscricao": cidade["rotulo_inscricao"], "chave": cidade["chave"]}


def classificar(imovel: base.Imovel) -> str:
    """Agrupa o 'tipo de uso' da Prefeitura em categorias simples para o filtro."""
    uso = base._norm(imovel.uso)
    if "terreno" in uso or (not imovel.area_construida and imovel.area_terreno):
        return "terreno"
    if "apartamento" in uso or "condominio" in uso:
        return "apartamento"
    if "residen" in uso or "casa" in uso or "domicilio particular" in uso:
        return "casa"
    if any(p in uso for p in ("comerc", "servic", "loja", "escritorio", "industr", "garage", "agropecuar")):
        return "comercial"
    return "outro"


def para_dict(imovel: base.Imovel) -> dict:
    """Dados de um imóvel como a tela usa (o site estático grava o mesmo formato)."""
    d = {k: v for k, v in asdict(imovel).items() if k != "extras"}
    d.update(
        endereco=imovel.endereco,
        categoria=classificar(imovel),
        sem_numero=imovel.sem_numero,
        valor_venal_estimado=imovel.valor_venal_estimado,
        valor_venal_oficial=bool(imovel.valor_venal),
    )
    return d


def _status(db: Path) -> dict:
    cidade = cidade_publica(cidade_da_base(db))
    if not db.exists():
        return {"importada": False, "total": 0, "cidade": cidade}
    con = sqlite3.connect(db)
    try:
        total, ano = con.execute("SELECT COUNT(*), MAX(ano_exercicio) FROM imoveis").fetchone()
    except sqlite3.Error:
        return {"importada": False, "total": 0, "cidade": cidade}
    finally:
        con.close()
    fonte = base.ler_meta(db).get("fonte", "prefeitura")
    return {"importada": True, "total": total, "exercicio": ano, "cidade": cidade, "fonte": fonte}


def consultar_cep(db: Path, cep_texto: str, buscar_endereco=cep.buscar_endereco) -> tuple[int, dict]:
    try:
        cep_num = cep.normalizar_cep(cep_texto)
    except cep.CepInvalido as e:
        return 400, {"erro": str(e)}

    endereco, aviso = None, None
    try:
        endereco = buscar_endereco(cep_num)
    except cep.CepNaoEncontrado:
        return 404, {"erro": f"O CEP {cep.formatar_cep(cep_num)} não existe."}
    except ConnectionError:
        aviso = "Não deu para consultar o endereço do CEP agora; mostrando só a base do IPTU."
    cidade = cidade_da_base(db)
    if endereco and endereco.ibge and endereco.ibge != cidade["ibge"]:
        return 422, {
            "erro": f"Esse CEP é de {endereco.cidade}/{endereco.uf}. A base carregada é de "
                    f"{cidade['nome']}/{cidade['uf']}.",
            "endereco": asdict(endereco),
        }

    try:
        imoveis = base.consultar(db, cep_num)
    except FileNotFoundError:
        return 409, {"erro": "A base do IPTU ainda não foi importada."}

    lista = [para_dict(i) for i in imoveis]
    return 200, {
        "cep": cep.formatar_cep(cep_num),
        "endereco": asdict(endereco) if endereco else None,
        "aviso": aviso,
        "total": len(lista),
        "imoveis": lista,
        "links": links(cidade),
        "cidade": cidade_publica(cidade),
        "fonte": base.ler_meta(db).get("fonte", "prefeitura"),
    }


def criar_handler(db: Path):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args):  # silencia o log padrão
            pass

        def _json(self, codigo: int, dados: dict):
            corpo = json.dumps(dados, ensure_ascii=False).encode("utf-8")
            self.send_response(codigo)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(corpo)))
            self.end_headers()
            self.wfile.write(corpo)

        def do_GET(self):
            url = urlparse(self.path)
            if url.path == "/":
                corpo = PAGINA.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(corpo)))
                self.end_headers()
                self.wfile.write(corpo)
            elif url.path == "/api/status":
                self._json(200, _status(db))
            elif url.path == "/api/consulta":
                cep_texto = parse_qs(url.query).get("cep", [""])[0]
                self._json(*consultar_cep(db, cep_texto))
            else:
                self._json(404, {"erro": "não encontrado"})

        def do_POST(self):
            if urlparse(self.path).path != "/api/importar":
                return self._json(404, {"erro": "não encontrado"})
            # Exigir JSON obriga o navegador a pedir permissão (preflight) em chamadas de
            # outros sites, que este servidor não concede: só a própria página importa.
            if not self.headers.get("Content-Type", "").startswith("application/json"):
                return self._json(415, {"erro": "envie JSON"})
            try:
                tamanho = int(self.headers.get("Content-Length", 0))
                pedido = json.loads(self.rfile.read(tamanho) or b"{}")
                caminho = Path(str(pedido.get("csv", "")).strip().strip('"')).expanduser()
                cidade = cidades.obter(pedido.get("cidade")).get("chave")
            except (ValueError, json.JSONDecodeError):
                return self._json(400, {"erro": "pedido inválido"})
            if not caminho.is_file():
                return self._json(400, {"erro": f"Arquivo não encontrado: {caminho}"})
            try:
                db.parent.mkdir(parents=True, exist_ok=True)
                total = base.importar_csv(caminho, db, cidade=cidade)
            except (ValueError, OSError, UnicodeDecodeError) as e:
                return self._json(400, {"erro": f"Não consegui importar: {e}"})
            self._json(200, {"total": total})

    return Handler


def servir(db: Path, porta: int = 8765, abrir: bool = True) -> None:
    # Só escuta no próprio computador: a base não fica exposta na rede.
    try:
        servidor = ThreadingHTTPServer(("127.0.0.1", porta), criar_handler(Path(db)))
    except OSError as e:
        if getattr(e, "errno", None) in (98, 48, 10048) or getattr(e, "winerror", None) == 10048:
            raise OSError(
                f"A porta {porta} já está em uso: provavelmente outra janela do IPTU pelo CEP (talvez uma "
                "versão antiga) continua aberta. Feche todas as janelas pretas do programa e abra de novo."
            ) from e
        raise
    url = f"http://127.0.0.1:{porta}/"
    print(f"IPTU pelo CEP aberto em {url}  (Ctrl+C para sair)")
    if abrir:
        threading.Timer(0.5, webbrowser.open, args=(url,)).start()
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        servidor.server_close()
