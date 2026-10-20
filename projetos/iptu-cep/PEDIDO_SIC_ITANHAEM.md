# Pedido de acesso à informação: cadastro imobiliário do IPTU de Itanhaém

**Onde enviar:** Serviço de Informações ao Cidadão (SIC) da Prefeitura de Itanhaém, operado pela Ouvidoria-Geral do Município (Lei Municipal nº 4.244/2018, Decreto nº 4.434). Use o formulário do SIC no site da Prefeitura (www.itanhaem.sp.gov.br, menu Transparência / Ouvidoria / e-SIC). Também dá para protocolar pessoalmente na Prefeitura, na Av. Washington Luiz, 75, Centro.

**Prazo legal de resposta:** 20 dias, prorrogáveis por mais 10 (Lei nº 12.527/2011, art. 11).

---

## Texto para copiar e colar

> Prezados,
>
> Com fundamento na Lei Federal nº 12.527/2011 (Lei de Acesso à Informação) e na regulamentação municipal (Lei nº 4.244/2018 e Decreto nº 4.434), solicito a disponibilização, **em formato aberto e legível por máquina (CSV ou planilha Excel)**, dos dados do **cadastro imobiliário utilizado para o lançamento do IPTU do exercício de 2026** (ou do último exercício disponível), contendo, para cada imóvel, os seguintes campos:
>
> 1. número da inscrição imobiliária / cadastro;
> 2. endereço do imóvel: logradouro, número, complemento, bairro, loteamento, quadra, lote e CEP;
> 3. área do terreno e área construída;
> 4. tipo de uso do imóvel (residencial, comercial, terreno etc.) e padrão da construção, se houver;
> 5. valor venal do terreno, da construção e total;
> 6. exercício de referência.
>
> **Não solicito dados pessoais.** Os dados podem e devem ser fornecidos **sem** nome, CPF/CNPJ, endereço de correspondência ou qualquer outra informação que identifique o proprietário ou o contribuinte, em conformidade com a Lei nº 13.709/2018 (LGPD) e o art. 31 da Lei nº 12.527/2011. Caso a Prefeitura entenda necessário, aceito a supressão desses campos (tarjamento), nos termos do art. 7º, § 2º, da LAI, sem prejuízo do restante da informação.
>
> Informo que a Prefeitura de São Paulo já disponibiliza dados equivalentes em formato aberto (Decreto Municipal nº 56.701/2015), o que demonstra que se trata de informação de interesse coletivo passível de divulgação.
>
> Caso a informação não possa ser fornecida em sua totalidade, solicito a entrega da parte não sigilosa e a indicação, por escrito, do fundamento legal da restrição e da autoridade competente para recurso (art. 11, § 1º, II, e art. 15 da LAI).
>
> Peço que o arquivo seja enviado por e-mail ou disponibilizado para download.
>
> Atenciosamente,
>
> [Seu nome completo]
> [Seu e-mail e telefone]

---

## Quando receber o arquivo

1. Salve a planilha na pasta **Downloads** com **"itanhaem"** ou **"cadastro"** no nome, por exemplo `cadastro_itanhaem_2026.xlsx`.
2. Dê duplo clique em **`Atualizar base.bat`**, ou rode:
   ```powershell
   py -m iptu_cep local --arquivo "$HOME\Downloads\cadastro_itanhaem_2026.xlsx"
   ```
3. O programa reconhece sozinho as colunas mais comuns (inscrição, logradouro, número, loteamento, quadra, lote, CEP, áreas, valor venal) e descarta nomes, CPF/CNPJ e endereço de correspondência.

**Se o pedido for negado:** a LAI garante recurso em 10 dias à autoridade superior (art. 15). Peça novamente só os campos sem dados pessoais (inscrição, endereço do imóvel, CEP, áreas e valor venal).
