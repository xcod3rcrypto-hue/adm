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

from . import base, cep

PAGINA = Path(__file__).with_name("pagina.html")
CIDADES_SUPORTADAS = {"3550308": "São Paulo"}  # código IBGE
LINK_DEBITOS = "https://prefeitura.sp.gov.br/web/fazenda/w/servicos/certidoes/2407"
LINK_2A_VIA = "https://www.prefeitura.sp.gov.br/cidade/secretarias/fazenda/servicos/iptu/"


def classificar(imovel: base.Imovel) -> str:
    """Agrupa o 'tipo de uso' da Prefeitura em categorias simples para o filtro."""
    uso = base._norm(imovel.uso)
    if "terreno" in uso or (not imovel.area_construida and imovel.area_terreno):
        return "terreno"
    if "apartamento" in uso or "condominio" in uso:
        return "apartamento"
    if "residen" in uso:
        return "casa"
    if any(p in uso for p in ("comerc", "servic", "loja", "escritorio", "industr", "garage")):
        return "comercial"
    return "outro"


def _sem_numero(numero: str) -> bool:
    return not numero or not numero.strip("0 ") or base._norm(numero) in {"sn", "s/n", "s/no"}


def para_dict(imovel: base.Imovel) -> dict:
    """Dados de um imóvel como a tela usa (o site estático grava o mesmo formato)."""
    d = {k: v for k, v in asdict(imovel).items() if k != "extras"}
    d.update(
        endereco=imovel.endereco,
        categoria=classificar(imovel),
        sem_numero=_sem_numero(imovel.numero),
        valor_venal_estimado=imovel.valor_venal_estimado,
    )
    return d


def _status(db: Path) -> dict:
    if not db.exists():
        return {"importada": False, "total": 0}
    con = sqlite3.connect(db)
    try:
        total, ano = con.execute("SELECT COUNT(*), MAX(ano_exercicio) FROM imoveis").fetchone()
    except sqlite3.Error:
        return {"importada": False, "total": 0}
    finally:
        con.close()
    return {"importada": True, "total": total, "exercicio": ano}


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
    if endereco and endereco.ibge and endereco.ibge not in CIDADES_SUPORTADAS:
        return 422, {
            "erro": f"Esse CEP é de {endereco.cidade}/{endereco.uf}. Por enquanto só a cidade de São Paulo "
                    "publica a base do IPTU que o programa usa.",
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
        "links": {"debitos": LINK_DEBITOS, "segunda_via": LINK_2A_VIA},
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
            try:
                tamanho = int(self.headers.get("Content-Length", 0))
                caminho = Path(json.loads(self.rfile.read(tamanho) or b"{}").get("csv", "")).expanduser()
            except (ValueError, json.JSONDecodeError):
                return self._json(400, {"erro": "pedido inválido"})
            if not caminho.is_file():
                return self._json(400, {"erro": f"Arquivo não encontrado: {caminho}"})
            try:
                db.parent.mkdir(parents=True, exist_ok=True)
                total = base.importar_csv(caminho, db)
            except (ValueError, OSError, UnicodeDecodeError) as e:
                return self._json(400, {"erro": f"Não consegui importar: {e}"})
            self._json(200, {"total": total})

    return Handler


def servir(db: Path, porta: int = 8765, abrir: bool = True) -> None:
    # Só escuta no próprio computador: a base não fica exposta na rede.
    servidor = ThreadingHTTPServer(("127.0.0.1", porta), criar_handler(Path(db)))
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
