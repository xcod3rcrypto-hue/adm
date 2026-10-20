# IPTU pelo CEP

Programa de linha de comando que recebe um **CEP** e lista os imóveis daquele CEP com os dados do cadastro do IPTU: número do contribuinte (SQL), endereço, uso, padrão, áreas, valores do m² e **valor venal estimado**.

Hoje funciona para a **cidade de São Paulo**, que publica a base completa do IPTU como dado aberto. Só usa a biblioteca padrão do Python 3.10+, sem nada para instalar.

## Como funciona

1. O CEP é validado e consultado no **ViaCEP**. Se ele falhar, o programa usa a **BrasilAPI**. Isso confirma o logradouro e a cidade.
2. Os imóveis são buscados numa base local em SQLite, montada a partir do CSV oficial da Prefeitura e indexada por CEP. Assim a consulta é instantânea, mesmo com mais de 3 milhões de imóveis.
3. O resultado sai como texto, JSON ou CSV.

## Jeito mais fácil: um comando faz tudo

```powershell
cd projetos\iptu-cep
py -m iptu_cep tudo
```

O programa:
1. procura a base do IPTU (`IPTU*.zip` ou `IPTU*.csv`) na pasta **Downloads**;
2. se não achar, **tenta baixar sozinho** dos sites da Prefeitura: procura links do IPTU nas páginas do GeoSampa e no Portal de Dados Abertos, e testa o formato de link de download do GeoSampa para os últimos anos. Só aceita o arquivo se for de fato um ZIP ou um CSV com coluna de CEP;
3. se mesmo assim não conseguir (a Prefeitura muda o site de vez em quando), abre o GeoSampa no navegador: clique em *Download de arquivos > Cadastro > IPTU*, baixe o ano mais recente, e ele continua sozinho quando o download terminar;
4. descompacta o ZIP, importa e gera o site;
5. publica na Vercel (na primeira vez abre o navegador para você fazer login) e mostra o endereço, por exemplo `https://iptu-cep.vercel.app`.

Opções: `--arquivo caminho.zip` usa um arquivo específico; `--url link` baixa de um link direto; `--sem-vercel` só gera o site.

## Tela (recomendado)

```bash
cd projetos/iptu-cep
python3 -m iptu_cep web
```

O navegador abre em `http://127.0.0.1:8765`. Na primeira vez, a tela pede o caminho do CSV do IPTU para importar. Depois é só digitar o CEP. A tela mostra:

- **todos os imóveis do CEP**: casas, apartamentos, terrenos e comércios, com ou sem número (`s/n`)
- **nº do IPTU** (número do contribuinte/SQL), com botão de copiar
- áreas, uso, padrão, ano da construção e **valor venal estimado**
- um resumo do CEP: quantos imóveis de cada tipo, quantos sem número e o valor venal somado
- filtros por tipo, "só sem número", situação de débito e busca por número, complemento ou nº do IPTU; as colunas ordenam com um clique
- **Débitos em abas:** "Todos", "Não consultados", "Com débito" e "Sem débito", com a contagem de cada uma
- **Consultar em sequência:** a barra fixa no rodapé mostra o próximo imóvel não consultado, já com o nº do IPTU copiado. "Abrir certidão" abre a página oficial, sempre na mesma aba. Você confere o resultado e clica em "Sem débito" ou "Com débito" (no computador também funcionam as teclas S e C), e o próximo entra na fila. As marcações ficam salvas no navegador
- exportação da lista filtrada em CSV, já com a situação de débito marcada

> **Por que os débitos não vêm automáticos:** a Prefeitura não publica débitos na base aberta. Ela só informa imóvel a imóvel, na certidão de débitos ou no DUC, que pede Senha Web. O programa não tenta driblar essa proteção. Ele leva você direto ao lugar certo, com o número pronto para colar.

## Publicar na Vercel (acesso de qualquer lugar, no celular também)

A versão online é um **site estático**: a base é dividida pelos 5 primeiros dígitos do CEP em arquivos compactados (`dados/01310.bin`, ...). A página baixa só o arquivo do CEP digitado, normalmente algumas centenas de KB, e o descompacta no próprio navegador. Não tem servidor nem banco de dados online, então cabe no plano grátis da Vercel. A base completa de São Paulo deve ficar em torno de 100 MB no total.

Você precisa de: Python 3.10+, Node.js (para o `npx`) e uma conta grátis em vercel.com.

```bash
cd projetos/iptu-cep

# 1) importe a base (uma vez por ano), se ainda não importou
python3 -m iptu_cep importar ~/Downloads/IPTU_2026.csv

# 2) gere o site (cria a pasta site/ com index.html, meta.json, vercel.json e dados/)
python3 -m iptu_cep publicar

# 3) publique
cd site
npx vercel --prod
```

Na primeira vez, o `vercel` pede login (abre o navegador) e faz algumas perguntas. Aceite os padrões: escopo pessoal, nome do projeto (ex.: `iptu-cep`), "In which directory is your code located?" → `./`, e não altere as configurações de build. No fim ele mostra o endereço, algo como `https://iptu-cep.vercel.app`, que funciona de qualquer lugar.

Quando sair a base do ano seguinte: repita os passos 1, 2 e 3. A URL continua a mesma.

Observações:
- A pasta `site/` não vai para o Git (fica no `.gitignore`). Por isso a publicação é pelo `npx vercel`, do seu computador, e não por push no GitHub.
- Na versão online, a importação de CSV não existe: a tela só consulta.
- A marcação "com débito / sem débito" fica salva **no navegador de cada aparelho**; ela não passa do celular para o computador. Use "Exportar CSV" para levar a lista.
- Os dados publicados são os mesmos da base aberta da Prefeitura, sem nomes, CPF ou CNPJ.

## Backup

**Marcações de débito (no site):** o quadro "Backup das marcações de débito" tem **Baixar backup**, que salva um arquivo `iptu-debitos-backup-AAAA-MM-DD.json` na pasta de downloads do navegador, e **Restaurar backup**, que junta as marcações do arquivo às deste navegador. O arquivo também serve para levar as marcações do celular para o computador e vice-versa.

**Base do IPTU (no PC):**
```powershell
py -m iptu_cep backup                                   # salva em Documentos\IPTU-backup
py -m iptu_cep backup --pasta "D:\Backups\IPTU"         # ou numa pasta à sua escolha
py -m iptu_cep restaurar "$HOME\Documents\IPTU-backup\iptu-backup-2026-10-20_1530.zip"
```

## Uso na linha de comando

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
