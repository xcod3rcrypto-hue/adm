"""Comando `tudo`: acha a base do IPTU, importa, gera o site e publica na Vercel.

A Prefeitura não tem um link fixo para o arquivo do ano, então o programa
procura na pasta Downloads. Se não houver nada, abre o GeoSampa no navegador e
espera o download aparecer na pasta: a única coisa manual é clicar em baixar.
"""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
import time
import webbrowser
import zipfile
from pathlib import Path

GEOSAMPA = "https://geosampa.prefeitura.sp.gov.br/PaginasPublicas/_SBC.aspx"
PADRAO_ARQUIVO = re.compile(r"iptu.*\.(csv|zip)$", re.IGNORECASE)
TEMPORARIOS = (".crdownload", ".part", ".download", ".tmp")


def pasta_downloads() -> Path:
    return Path.home() / "Downloads"


def procurar_base(pasta: Path, desde: float = 0) -> Path | None:
    """O arquivo IPTU*.csv/.zip mais recente da pasta (modificado depois de `desde`)."""
    if not pasta.is_dir():
        return None
    candidatos = [
        p for p in pasta.iterdir()
        if p.is_file() and PADRAO_ARQUIVO.search(p.name) and p.stat().st_mtime >= desde
    ]
    return max(candidatos, key=lambda p: p.stat().st_mtime, default=None)


def _download_em_andamento(pasta: Path) -> bool:
    return any(p.name.lower().endswith(TEMPORARIOS) for p in pasta.iterdir())


def esperar_download(pasta: Path, desde: float, limite_s: int = 3600, intervalo_s: float = 3) -> Path:
    """Espera um IPTU*.csv/.zip novo aparecer na pasta e parar de crescer."""
    fim = time.monotonic() + limite_s
    ultimo = None
    while time.monotonic() < fim:
        achado = procurar_base(pasta, desde)
        if achado and not _download_em_andamento(pasta):
            tamanho = achado.stat().st_size
            if ultimo == (achado, tamanho) and tamanho > 0:
                return achado
            ultimo = (achado, tamanho)
        time.sleep(intervalo_s)
    raise TimeoutError("O download da base do IPTU não apareceu na pasta Downloads.")


def baixar_url(url: str, destino_dir: Path) -> Path:
    from . import fonte
    print(f"Baixando {url} ...")
    arquivo = fonte.baixar(url, destino_dir, "IPTU_baixado",
                           progresso=lambda feito, total: print(f"  {feito / 1e6:,.0f} MB", end="\r"))
    if arquivo is None:
        raise ValueError("Esse link não devolveu a base do IPTU (nem ZIP nem CSV com CEP).")
    print()
    return arquivo


def preparar_csv(arquivo: Path, pasta_trabalho: Path) -> Path:
    """Se for .zip, extrai o maior .csv de dentro; se for .csv, usa direto."""
    if arquivo.suffix.lower() != ".zip":
        return arquivo
    with zipfile.ZipFile(arquivo) as z:
        csvs = [i for i in z.infolist() if i.filename.lower().endswith(".csv") and not i.is_dir()]
        if not csvs:
            raise ValueError(f"O arquivo {arquivo.name} não tem nenhum .csv dentro.")
        maior = max(csvs, key=lambda i: i.file_size)
        pasta_trabalho.mkdir(parents=True, exist_ok=True)
        destino = pasta_trabalho / Path(maior.filename).name
        if destino.exists() and destino.stat().st_size == maior.file_size:
            return destino
        print(f"Extraindo {maior.filename} ({maior.file_size / 1e6:.0f} MB) ...")
        with z.open(maior) as origem, open(destino, "wb") as saida:
            shutil.copyfileobj(origem, saida, length=1 << 20)
    return destino


def _npx() -> str:
    npx = shutil.which("npx") or shutil.which("npx.cmd")
    if not npx:
        raise FileNotFoundError("Não achei o npx. Instale o Node.js (nodejs.org) e abra um terminal novo.")
    return npx


def extrair_url_publica(saida: str) -> str | None:
    """Da saída do `vercel --prod`, o endereço público (o 'Aliased'), ou o da publicação."""
    urls = re.findall(r"https://[\w.-]+\.vercel\.app", saida)
    for linha in saida.splitlines():
        if "alias" in linha.lower():
            achado = re.search(r"https://[\w.-]+\.vercel\.app", linha)
            if achado:
                return achado.group(0)
    return min(urls, key=len) if urls else None


def publicar_vercel(pasta_site: Path, executar=subprocess.run, popen=subprocess.Popen) -> str | None:
    npx = _npx()
    base = [npx, "--yes", "vercel"]
    if executar(base + ["whoami"], cwd=pasta_site, capture_output=True).returncode != 0:
        print("\nFaça login na Vercel (o navegador vai abrir):")
        if executar(base + ["login"], cwd=pasta_site).returncode != 0:
            raise RuntimeError("Login na Vercel não concluído.")
    print("\nPublicando na Vercel ...")
    proc = popen(base + ["--prod", "--yes"], cwd=pasta_site, stdout=subprocess.PIPE,
                 stderr=subprocess.STDOUT, text=True, encoding="utf-8", errors="replace")
    linhas = []
    for linha in proc.stdout:
        sys.stdout.write(linha)
        linhas.append(linha)
    if proc.wait() != 0:
        raise RuntimeError("A Vercel recusou a publicação (veja a mensagem acima).")
    return extrair_url_publica("".join(linhas))


def baixar_sozinho(pasta: Path) -> Path | None:
    from . import fonte
    return fonte.baixar_automatico(pasta)


def tudo(db: Path, site: Path, arquivo: Path | None = None, url: str | None = None,
         publicar_online: bool = True, abrir_navegador: bool = True) -> str | None:
    from . import base, publicar

    trabalho = db.parent
    if url:
        arquivo = baixar_url(url, trabalho)
    if arquivo is None:
        arquivo = procurar_base(pasta_downloads()) or procurar_base(trabalho)
        if arquivo:
            print(f"Base encontrada: {arquivo}")
        else:
            arquivo = baixar_sozinho(trabalho)
        if arquivo is None:
            inicio = time.time()
            print(
                "\nNão consegui baixar a base sozinho (o site da Prefeitura pode ter mudado).\n"
                "Vou abrir o GeoSampa. Lá, clique em: Download de arquivos > Cadastro > IPTU\n"
                "e baixe o arquivo do ano mais recente. O programa continua sozinho quando o\n"
                "download terminar (Ctrl+C para cancelar).\n"
                "Dica: se preferir, clique com o botão direito no arquivo do IPTU, copie o link e rode\n"
                '  py -m iptu_cep tudo --url "LINK_COPIADO"'
            )
            webbrowser.open(GEOSAMPA)
            arquivo = esperar_download(pasta_downloads(), inicio)
            print(f"Download recebido: {arquivo}")
    if not arquivo.is_file():
        raise FileNotFoundError(f"Arquivo não encontrado: {arquivo}")

    csv_path = preparar_csv(arquivo, trabalho)
    db.parent.mkdir(parents=True, exist_ok=True)
    print(f"Importando {csv_path.name} ...")
    total = base.importar_csv(csv_path, db, progresso=lambda n: print(f"  {n:,} imóveis".replace(",", "."), end="\r"))
    print(f"\nImportados: {total:,} imóveis.".replace(",", "."))

    print("Gerando o site (separando por CEP) ...")
    r = publicar.publicar(db, site, progresso=lambda n: print(f"  {n:,} imóveis".replace(",", "."), end="\r"))
    print()
    print(f"Site gerado: {r['arquivos']} arquivos, {r['megabytes']} MB.")
    if not publicar_online:
        return None

    endereco = publicar_vercel(site)
    if endereco and abrir_navegador:
        webbrowser.open(endereco)
    return endereco
