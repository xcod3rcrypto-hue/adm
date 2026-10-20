"""Consulta de endereço por CEP (ViaCEP, com BrasilAPI como reserva)."""

from __future__ import annotations

import json
import re
import urllib.error
import urllib.request
from dataclasses import dataclass

TIMEOUT = 10


class CepInvalido(ValueError):
    pass


class CepNaoEncontrado(LookupError):
    pass


@dataclass
class Endereco:
    cep: str
    logradouro: str
    bairro: str
    cidade: str
    uf: str
    ibge: str = ""
    fonte: str = ""


def normalizar_cep(cep: str) -> str:
    digitos = re.sub(r"\D", "", str(cep))
    # Bases antigas guardam o CEP como número e perdem o zero à esquerda.
    if 0 < len(digitos) < 8:
        digitos = digitos.zfill(8)
    if len(digitos) != 8:
        raise CepInvalido(f"CEP inválido: {cep!r} (use 8 dígitos, ex.: 01310-100)")
    return digitos


def formatar_cep(cep: str) -> str:
    c = normalizar_cep(cep)
    return f"{c[:5]}-{c[5:]}"


def _get_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "iptu-cep/1.0"})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _viacep(cep: str) -> Endereco:
    dados = _get_json(f"https://viacep.com.br/ws/{cep}/json/")
    if dados.get("erro"):
        raise CepNaoEncontrado(cep)
    return Endereco(
        cep=cep,
        logradouro=dados.get("logradouro", ""),
        bairro=dados.get("bairro", ""),
        cidade=dados.get("localidade", ""),
        uf=dados.get("uf", ""),
        ibge=dados.get("ibge", ""),
        fonte="ViaCEP",
    )


def _brasilapi(cep: str) -> Endereco:
    try:
        dados = _get_json(f"https://brasilapi.com.br/api/cep/v2/{cep}")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            raise CepNaoEncontrado(cep) from e
        raise
    return Endereco(
        cep=cep,
        logradouro=dados.get("street", ""),
        bairro=dados.get("neighborhood", ""),
        cidade=dados.get("city", ""),
        uf=dados.get("state", ""),
        fonte="BrasilAPI",
    )


def buscar_endereco(cep: str) -> Endereco:
    """Tenta ViaCEP e, se falhar por rede, BrasilAPI."""
    cep = normalizar_cep(cep)
    erros = []
    for fonte in (_viacep, _brasilapi):
        try:
            return fonte(cep)
        except CepNaoEncontrado:
            raise
        except (urllib.error.URLError, OSError, ValueError) as e:
            erros.append(f"{fonte.__name__.lstrip('_')}: {e}")
    raise ConnectionError("Não foi possível consultar o CEP. " + "; ".join(erros))
