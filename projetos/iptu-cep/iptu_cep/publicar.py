"""Gera o site estático para publicar na Vercel (ou qualquer hospedagem de arquivos).

A base importada é dividida pelos 5 primeiros dígitos do CEP. Cada pedaço vira
um JSON compactado com gzip (`dados/01310.bin`), e a página baixa só o pedaço do
CEP digitado e o descompacta no navegador. Não precisa de servidor nem de banco
de dados online.
"""

from __future__ import annotations

import gzip
import json
import shutil
import sqlite3
from datetime import date
from pathlib import Path

from . import base, web

# Só o que a tela mostra, para os arquivos ficarem pequenos.
CAMPOS_SITE = [
    "sql", "logradouro", "numero", "complemento", "loteamento", "quadra", "lote", "bairro", "cep", "endereco",
    "categoria", "sem_numero", "uso", "padrao", "ano_construcao",
    "area_terreno", "area_construida", "valor_venal_estimado", "valor_venal_oficial", "ano_exercicio",
]

VERCEL_JSON = {
    "cleanUrls": True,
    "headers": [
        {
            "source": "/dados/(.*)",
            "headers": [
                {"key": "Content-Type", "value": "application/octet-stream"},
                {"key": "Cache-Control", "value": "public, max-age=86400, s-maxage=604800"},
            ],
        },
        {
            "source": "/(.*)",
            "headers": [
                {"key": "X-Content-Type-Options", "value": "nosniff"},
                {"key": "Referrer-Policy", "value": "no-referrer"},
            ],
        },
    ],
}


def _gravar(pasta: Path, prefixo: str, ceps: dict[str, list]) -> int:
    corpo = json.dumps({"campos": CAMPOS_SITE, "ceps": ceps}, ensure_ascii=False, separators=(",", ":"))
    dados = gzip.compress(corpo.encode("utf-8"), compresslevel=9, mtime=0)
    (pasta / f"{prefixo}.bin").write_bytes(dados)
    return len(dados)


def publicar(db_path: str | Path, destino: str | Path, progresso=None) -> dict:
    db_path, destino = Path(db_path), Path(destino)
    if not db_path.exists():
        raise FileNotFoundError(f"Base não encontrada em {db_path}. Importe o CSV antes.")

    pasta_dados = destino / "dados"
    if pasta_dados.exists():
        shutil.rmtree(pasta_dados)
    pasta_dados.mkdir(parents=True)

    cidade = web.cidade_da_base(db_path)
    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    total = arquivos = bytes_total = 0
    exercicio = ""
    atual, ceps = None, {}
    try:
        for linha in con.execute("SELECT * FROM imoveis ORDER BY cep, logradouro, numero, complemento"):
            imovel = base.Imovel(**dict(linha))
            prefixo = imovel.cep[:5]
            if prefixo != atual:
                if ceps:
                    bytes_total += _gravar(pasta_dados, atual, ceps)
                    arquivos += 1
                    if progresso:
                        progresso(total)
                atual, ceps = prefixo, {}
            d = web.para_dict(imovel)
            ceps.setdefault(imovel.cep, []).append([d[c] for c in CAMPOS_SITE])
            exercicio = max(exercicio, imovel.ano_exercicio or "")
            total += 1
        if ceps:
            bytes_total += _gravar(pasta_dados, atual, ceps)
            arquivos += 1
    finally:
        con.close()

    meta = {
        "modo": "estatico",
        "total": total,
        "exercicio": exercicio or None,
        "gerado_em": date.today().isoformat(),
        "cidade": web.cidade_publica(cidade),
        "links": web.links(cidade),
    }
    (destino / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    shutil.copyfile(web.PAGINA, destino / "index.html")
    (destino / "vercel.json").write_text(json.dumps(VERCEL_JSON, indent=2), encoding="utf-8")
    return {"imoveis": total, "arquivos": arquivos, "megabytes": round(bytes_total / 1e6, 1)}
