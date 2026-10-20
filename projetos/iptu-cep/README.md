# IPTU pelo CEP

Programa de linha de comando que recebe um **CEP** e lista os imóveis daquele CEP com os dados do cadastro do IPTU: número do contribuinte (SQL), endereço, uso, padrão, áreas, valores do m² e **valor venal estimado**.

Hoje funciona para a **cidade de São Paulo**, que publica a base completa do IPTU como dado aberto. Só usa a biblioteca padrão do Python 3.10+, sem nada para instalar.

## Como funciona

1. O CEP é validado e consultado no **ViaCEP**. Se ele falhar, o programa usa a **BrasilAPI**. Isso confirma o logradouro e a cidade.
2. Os imóveis são buscados numa base local em SQLite, montada a partir do CSV oficial da Prefeitura e indexada por CEP. Assim a consulta é instantânea, mesmo com mais de 3 milhões de imóveis.
3. O resultado sai como texto, JSON ou CSV.

## Uso

```bash
cd projetos/iptu-cep

# 1) Uma vez por ano: baixe a base do IPTU e importe
#    GeoSampa (geosampa.prefeitura.sp.gov.br) > Download de arquivos > Cadastro > IPTU
#    ou o Portal de Dados Abertos (dados.prefeitura.sp.gov.br), busca "IPTU"
python3 -m iptu_cep importar ~/Downloads/IPTU_2026.csv

# 2) Consulte
python3 -m iptu_cep consultar 01310-100
python3 -m iptu_cep consultar 01310-100 --numero 1000     # só um número da rua
python3 -m iptu_cep consultar 01310-100 -f json > saida.json
python3 -m iptu_cep consultar 01310-100 -f csv  > saida.csv   # abre no Excel
python3 -m iptu_cep consultar 01310-100 --offline         # sem consultar a API de CEP
```

A base fica em `dados/iptu_sp.sqlite`. Para usar outro arquivo, passe `--db caminho.sqlite` antes do comando.

## Limites (leia antes de usar)

- **O valor do carnê não está na base aberta.** O programa mostra uma estimativa do valor venal: terreno × m² × fração ideal, mais construção × m² × obsolescência. A Prefeitura aplica outros fatores, descontos e isenções, então o imposto real só aparece na emissão da 2ª via, no site da Prefeitura, com o número do contribuinte que o programa mostra.
- **Privacidade (LGPD):** colunas com nome, CPF ou CNPJ são descartadas na importação. O programa não guarda nem mostra quem é o dono do imóvel.
- **Outras cidades:** se o CEP for de outro município, o programa avisa e encerra. Para incluir uma cidade, ela precisa publicar a base do IPTU, e o código IBGE dela entra em `CIDADES_SUPORTADAS`, em `iptu_cep/__main__.py`.
- O cabeçalho do CSV muda entre os anos. As colunas são reconhecidas por nome aproximado e a importação para com erro claro se não houver coluna de CEP.

## Testes

```bash
python3 -m unittest discover -s tests -t . -v
```
