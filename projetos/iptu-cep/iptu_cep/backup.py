"""Backup da base do IPTU importada numa pasta do computador."""

from __future__ import annotations

import sqlite3
import zipfile
from datetime import datetime
from pathlib import Path

PASTA_PADRAO = Path.home() / "Documents" / "IPTU-backup"


def fazer_backup(db: Path, pasta: Path = PASTA_PADRAO) -> Path:
    if not db.is_file():
        raise FileNotFoundError(f"Base não encontrada em {db}. Importe a base antes (py -m iptu_cep tudo).")
    pasta.mkdir(parents=True, exist_ok=True)
    carimbo = datetime.now().strftime("%Y-%m-%d_%H%M")
    copia = pasta / f"iptu_sp_{carimbo}.sqlite"
    # API de backup do SQLite: copia consistente mesmo com a base aberta.
    origem, destino = sqlite3.connect(db), sqlite3.connect(copia)
    try:
        origem.backup(destino)
    finally:
        destino.close()
        origem.close()
    arquivo = pasta / f"iptu-backup-{carimbo}.zip"
    try:
        with zipfile.ZipFile(arquivo, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as z:
            z.write(copia, "iptu_sp.sqlite")
    finally:
        copia.unlink(missing_ok=True)
    return arquivo


def restaurar_backup(arquivo: Path, db: Path) -> int:
    with zipfile.ZipFile(arquivo) as z:
        if "iptu_sp.sqlite" not in z.namelist():
            raise ValueError(f"{arquivo.name} não é um backup do IPTU pelo CEP.")
        db.parent.mkdir(parents=True, exist_ok=True)
        temp = db.with_name(db.name + ".restaurando")
        with z.open("iptu_sp.sqlite") as origem, open(temp, "wb") as saida:
            while bloco := origem.read(1 << 20):
                saida.write(bloco)
    con = sqlite3.connect(temp)
    try:
        total = con.execute("SELECT COUNT(*) FROM imoveis").fetchone()[0]
    except sqlite3.Error as e:
        temp.unlink(missing_ok=True)
        raise ValueError(f"Backup corrompido: {e}") from e
    finally:
        con.close()
    temp.replace(db)
    return total
