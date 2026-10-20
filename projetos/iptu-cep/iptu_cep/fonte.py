"""Tenta achar e baixar sozinho a base do IPTU de São Paulo.

A Prefeitura não publica um link fixo para o arquivo do ano. O programa tenta,
nesta ordem:
  1. procurar links IPTU_<ano>.zip nas páginas do GeoSampa e nas fichas de
     metadados da camada (GeoNetwork);
  2. procurar o conjunto "IPTU" na API do Portal de Dados Abertos (CKAN);
  3. montar o link no formato usado pelo GeoSampa para os downloads
     (downloadArquivo.aspx?orig=...&arq=...&arqTipo=...), para os últimos anos.
Cada candidato só é aceito se o servidor devolver de fato um ZIP ou um CSV com
coluna de CEP. Se nada der certo, quem chama cai no plano B (abrir o navegador).
"""

from __future__ import annotations

import html
import json
import re
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

TIMEOUT = 30
UA = {"User-Agent": "Mozilla/5.0 (iptu-cep)"}
GEOSAMPA_DL = "https://download.geosampa.prefeitura.sp.gov.br/PaginasPublicas/downloadArquivo.aspx"
PAGINAS_GEOSAMPA = [
    "https://download.geosampa.prefeitura.sp.gov.br/",
    "https://geosampa.prefeitura.sp.gov.br/PaginasPublicas/_SBC.aspx",
]
# Fichas de metadados do GeoSampa (GeoNetwork) ligadas ao IPTU / camada Lote.
METADADOS = "https://metadados.geosampa.prefeitura.sp.gov.br/geonetwork/srv/api/records/{}/formatters/xml"
FICHAS_IPTU = ["62c1113c-36a4-43d1-b763-81ec63b58116", "b971efa1-aad5-42f3-ad28-18f1f4efe270"]
CKAN_BUSCA = "https://dados.prefeitura.sp.gov.br/api/3/action/package_search?q=IPTU&rows=20"
ANO = r"((?:19|20)\d{2})(?!\d)"
LINK_IPTU = re.compile(r"""(?:href|value|url)\s*[=:]\s*["']([^"']*IPTU[_-]?""" + ANO + r"""[^"']*)["']""", re.IGNORECASE)
# URL solta no texto (ex.: <gmd:URL>...</gmd:URL> nas fichas de metadados)
URL_IPTU = re.compile(r"""(https?://[^\s"'<>]*IPTU[_-]?""" + ANO + r"""[^\s"'<>]*)""", re.IGNORECASE)


def _abrir(url: str):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=TIMEOUT)


def _texto(url: str) -> str:
    with _abrir(url) as r:
        return r.read(5_000_000).decode("utf-8", "replace")


def links_nas_paginas(paginas=PAGINAS_GEOSAMPA, ler=_texto) -> list[tuple[int, str]]:
    achados = []
    for pagina in paginas:
        try:
            conteudo = ler(pagina)
        except (OSError, ValueError):
            continue
        for bruto, ano in LINK_IPTU.findall(conteudo) + URL_IPTU.findall(conteudo):
            url = urllib.parse.urljoin(pagina, html.unescape(bruto))
            if url.startswith("http"):
                achados.append((int(ano), url))
    return achados


def links_nos_metadados(fichas=FICHAS_IPTU, ler=_texto) -> list[tuple[int, str]]:
    return links_nas_paginas([METADADOS.format(f) for f in fichas], ler=ler)


def links_no_ckan(ler=_texto) -> list[tuple[int, str]]:
    try:
        dados = json.loads(ler(CKAN_BUSCA))
    except (OSError, ValueError):
        return []
    achados = []
    for pacote in dados.get("result", {}).get("results", []):
        for rec in pacote.get("resources", []):
            texto = f"{rec.get('name', '')} {rec.get('url', '')}"
            ano = re.search(r"IPTU[\s_-]*(\d{4})", texto, re.IGNORECASE)
            formato = (rec.get("format") or "").lower()
            if ano and rec.get("url") and (formato in ("zip", "csv") or re.search(r"\.(zip|csv)$", rec["url"], re.I)):
                achados.append((int(ano.group(1)), rec["url"]))
    return achados


def links_montados(hoje: date | None = None) -> list[tuple[int, str]]:
    ano_atual = (hoje or date.today()).year
    achados = []
    for ano in (ano_atual, ano_atual - 1, ano_atual - 2):
        for orig, pasta, tipo in (
            ("DownloadCadastro", "IPTU", "CADASTRO"),
            ("DownloadIPTU", "IPTU", "IPTU"),
            ("DownloadCadastro", "CADASTRO\\IPTU", "CADASTRO"),
        ):
            q = urllib.parse.urlencode({"orig": orig, "arq": f"{pasta}\\IPTU_{ano}.zip", "arqTipo": tipo})
            achados.append((ano, f"{GEOSAMPA_DL}?{q}"))
    return achados


def candidatos() -> list[tuple[int, str]]:
    vistos, lista = set(), []
    for ano, url in links_nas_paginas() + links_nos_metadados() + links_no_ckan() + links_montados():
        if url not in vistos:
            vistos.add(url)
            lista.append((ano, url))
    # Mais recente primeiro; links encontrados antes dos montados no mesmo ano.
    return sorted(lista, key=lambda x: -x[0])


def _parece_base(inicio: bytes) -> str | None:
    if inicio.startswith(b"PK"):
        return ".zip"
    cabecalho = inicio[:2000].decode("latin-1").upper()
    if "CEP" in cabecalho and ";" in cabecalho:
        return ".csv"
    return None


def baixar(url: str, pasta: Path, nome_base: str, progresso=None) -> Path | None:
    """Baixa se o conteúdo for de fato a base; senão devolve None sem gravar nada."""
    try:
        resp = _abrir(url)
    except (OSError, ValueError):
        return None
    with resp:
        inicio = resp.read(4096)
        extensao = _parece_base(inicio)
        if not extensao:
            return None
        pasta.mkdir(parents=True, exist_ok=True)
        destino = pasta / f"{nome_base}{extensao}"
        parcial = destino.with_name(destino.name + ".baixando")
        total = int(resp.headers.get("Content-Length") or 0)
        feito = len(inicio)
        try:
            with open(parcial, "wb") as f:
                f.write(inicio)
                while bloco := resp.read(1 << 20):
                    f.write(bloco)
                    feito += len(bloco)
                    if progresso:
                        progresso(feito, total)
        except OSError:
            parcial.unlink(missing_ok=True)
            return None
    parcial.replace(destino)
    return destino


def baixar_automatico(pasta: Path, avisar=print) -> Path | None:
    avisar("Procurando a base do IPTU nos sites da Prefeitura ...")
    for ano, url in candidatos():
        avisar(f"  tentando IPTU {ano}: {url[:90]}{'...' if len(url) > 90 else ''}")
        arquivo = baixar(
            url, pasta, f"IPTU_{ano}",
            progresso=lambda feito, total: print(
                f"    {feito / 1e6:,.0f} MB" + (f" de {total / 1e6:,.0f} MB" if total else ""), end="\r"),
        )
        if arquivo:
            avisar(f"\n  baixado: {arquivo}")
            return arquivo
    return None



def _testar(url: str) -> str:
    try:
        with _abrir(url) as r:
            inicio = r.read(4096)
            tipo = r.headers.get("Content-Type", "?")
            tamanho = r.headers.get("Content-Length", "?")
    except (OSError, ValueError) as e:
        return f"falhou: {e}"
    if _parece_base(inicio):
        return f"É A BASE! ({tipo}, {tamanho} bytes)"
    trecho = re.sub(r"\s+", " ", inicio[:160].decode("latin-1"))
    return f"não é a base ({tipo}): {trecho}"


def diagnostico(ler=_texto, avisar=print, testar=_testar) -> None:
    """Mostra o que cada fonte devolve, para descobrir o link certo da base."""
    fontes = [("GeoSampa", u) for u in PAGINAS_GEOSAMPA] + \
             [("Ficha de metadados", METADADOS.format(f)) for f in FICHAS_IPTU]
    for nome, url in fontes:
        try:
            conteudo = ler(url)
        except (OSError, ValueError) as e:
            avisar(f"\n[{nome}] {url}\n  falhou: {e}")
            continue
        avisar(f"\n[{nome}] {url}\n  OK, {len(conteudo):,} caracteres. Trechos com 'IPTU':")
        trechos = [m.start() for m in re.finditer("iptu", conteudo, re.IGNORECASE)]
        for i in trechos[:25]:
            avisar("    ..." + re.sub(r"\s+", " ", conteudo[max(0, i - 120): i + 160]) + "...")
        if not trechos:
            avisar("    (nenhum)")
    avisar("\nTestando os links candidatos:")
    for ano, url in candidatos():
        avisar(f"  {ano}: {url}\n      -> {testar(url)}")
