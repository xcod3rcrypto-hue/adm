"""Cidades que o programa atende: código IBGE, rótulos e links oficiais."""

from __future__ import annotations

PADRAO = "itanhaem"

CIDADES = {
    "itanhaem": {
        "nome": "Itanhaém",
        "uf": "SP",
        "ibge": "3522109",
        "ceps": ("11740000", "11749999"),
        "rotulo_inscricao": "Nº do cadastro (inscrição)",
        # Portal da Fazenda: 2ª via e consulta de débitos pelo nº do cadastro do carnê.
        "link_debitos": "https://transparencia.itanhaem.sp.gov.br/fazenda/",
        "link_segunda_via": "https://transparencia.itanhaem.sp.gov.br/fazenda/",
        "link_certidao": "https://www.itanhaem.sp.gov.br/servicos/",
        "base_publica": False,
    },
    "sao-paulo": {
        "nome": "São Paulo",
        "uf": "SP",
        "ibge": "3550308",
        "ceps": ("01000000", "08499999"),
        "rotulo_inscricao": "Nº do contribuinte (SQL)",
        "link_debitos": "https://prefeitura.sp.gov.br/web/fazenda/w/servicos/certidoes/2407",
        "link_segunda_via": "https://www.prefeitura.sp.gov.br/cidade/secretarias/fazenda/servicos/iptu/",
        "link_certidao": "https://prefeitura.sp.gov.br/web/fazenda/w/servicos/certidoes/2407",
        "base_publica": True,  # GeoSampa publica o cadastro do IPTU todo ano
    },
}


def obter(chave: str | None) -> dict:
    chave = chave or PADRAO
    if chave not in CIDADES:
        raise ValueError(f"Cidade desconhecida: {chave}. Opções: {', '.join(CIDADES)}")
    return {"chave": chave, **CIDADES[chave]}


def cep_da_cidade(cidade: dict, cep: str) -> bool:
    inicio, fim = cidade["ceps"]
    return inicio <= cep <= fim
