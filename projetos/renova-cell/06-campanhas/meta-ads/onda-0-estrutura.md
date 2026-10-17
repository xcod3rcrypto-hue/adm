# Onda 0 — estrutura completa no Meta Ads

> **O que é:** uma validação de **21 dias**, com pouco dinheiro e **um mercado só (EUA)**, antes da Onda 1. Ela prova que o funil, o rastreamento e a entrega funcionam e descobre quais criativos vendem. A Onda 1 (EUA + Reino Unido + Alemanha/Áustria/Suíça) só começa quando a Onda 0 passar nos critérios da seção 9.
>
> **Arquivos:** este documento (o porquê e o passo a passo) · `onda-0-montagem.xlsx` (campanhas, conjuntos, anúncios com os textos prontos, públicos, checklist) · `onda-0-anuncios.md` (os mesmos anúncios em formato de leitura). A planilha, o arquivo de anúncios e a seção 8.3 deste documento saem de `onda0_build.py` — para mudar um texto, edite o script e rode `python3 onda0_build.py`.
>
> **Por que os EUA:** inglês (os criativos do lote 1 já existem), USD, maior mercado e assinatura é hábito. **Se o primeiro estoque ficar na Alemanha**, a Onda 0 vira DACH: troque o país, o idioma dos anúncios (seção 6.2 do plano de lançamento), a moeda da conta para EUR e o rodapé da FDA pelo rodapé europeu.

---

## 1. Os quatro objetivos da Onda 0

| # | Objetivo | Como medimos | Meta para passar |
|---|---|---|---|
| 1 | O rastreamento funciona | Compras na Meta ÷ compras na Stripe, no mesmo período | ≥ 70% (o resto é quem recusou cookies e não entrou pelo servidor) |
| 2 | Achar criativos que vendem | Custo por compra por `utm_content` (Stripe/Supabase) | ≥ 2 conceitos com CPA ≤ CPA alvo provisório |
| 3 | Conhecer o custo real do funil | Custo por quiz concluído, por checkout e por compra | Números reais para substituir as hipóteses da planilha de metas |
| 4 | A promessa de entrega é verdadeira | 10 pedidos de teste + todos os pedidos da Onda 0 | ≥ 95% entregues em até 2 dias úteis |

**CPA alvo provisório:** sai da planilha `03-estrategia/metas-kpi.xlsx` (aba Unit economics, "CPA alvo") depois de preencher o custo do produto e do frete. Com os custos de exemplo (US$ 6 por unidade e US$ 5 de frete), ele dá **≈ US$ 38**. Use o seu número real.

---

## 2. Configuração do site para a Onda 0

**Sem domínio próprio ainda:** publique o site na Vercel (grátis). Importe o repositório, *Root Directory* = `projetos/renova-cell/site`, branch `ccr-9522a17f-ebs30y`. Dê ao projeto o nome **`renova-cell`**: o endereço fica `https://renova-cell.vercel.app`, que é o usado em todos os anúncios e na planilha (se o nome estiver ocupado, a Vercel sugere outro — aí troque `DOMAIN` em `onda0_build.py` e rode o script de novo) e serve para o pixel, a verificação e os anúncios. Antes de ligar verba de verdade, vale comprar um domínio (cerca de US$ 10–15/ano) e apontar para a Vercel: endereço `.vercel.app` em anúncio passa menos confiança. Anúncio **não** pode apontar para `localhost` — nem a Meta nem o cliente conseguem abrir.

```
SHIP_COUNTRIES=US
FAST_DELIVERY_COUNTRIES=US
AD_SAFE_MODE=paid
NEXT_PUBLIC_META_PIXEL_ID=<id do conjunto de dados>
META_CAPI_TOKEN=<token da API de Conversões>
META_TEST_EVENT_CODE=<só durante os testes; apagar antes de D0>
```

Também: chaves live da Stripe + `npm run stripe:setup`, e rodar de novo `supabase/schema.sql` (cria a coluna `utm`).

---

## 3. Contas — passo a passo (D-10 a D-9)

1. **Portfólio empresarial** (business.facebook.com → Configurações): verificar a empresa, 2 administradores com autenticação de dois fatores.
2. **Página do Facebook + Instagram profissional** do RENOVA CELL conectados ao portfólio. No Instagram: Configurações → Conteúdo de marca → permitir **anúncios de parceria** (para o criador).
3. **Conta de anúncios** `RC | US | USD`: moeda **USD** e fuso de quem opera. Moeda e fuso não mudam depois. Forma de pagamento principal + uma reserva.
4. **Domínio verificado:** Segurança da marca → Domínios → adicionar → método **meta-tag** → copiar só o valor `content` para `NEXT_PUBLIC_FB_DOMAIN_VERIFICATION` e fazer o deploy. Funciona também no endereço grátis da Vercel (`renova-cell.vercel.app`), sem mexer em DNS. Com domínio próprio, pode usar o registro TXT.
5. **Conjunto de dados (pixel):** Gerenciador de Eventos → conectar o site → copiar o ID para `NEXT_PUBLIC_META_PIXEL_ID`. Em Configurações → API de Conversões → **gerar token** → `META_CAPI_TOKEN`.
6. **Classificação de saúde e bem-estar:** no Gerenciador de Eventos, veja se há aviso de restrição no conjunto de dados. **Sem restrição = caminho A. Com restrição = caminho B** (seção 5).
7. **Conta nova cuidada:** não comece com verba alta, não mude a forma de pagamento nos primeiros dias, não suba anúncio que viola política "para testar". Se um anúncio for reprovado, corrija e peça revisão — **nunca** crie contas novas para contornar uma restrição (isso derruba o portfólio inteiro).

---

## 4. Rastreamento — eventos e teste (D-7)

| Evento | Quando dispara | Onde | Valor | Usado para |
|---|---|---|---|---|
| PageView | Toda página | Pixel (após aceitar cookies) | — | Públicos |
| `quiz_start` (personalizado) | 1ª pergunta do quiz | Pixel | — | Público "iniciou o quiz" |
| Lead | Quiz concluído | Pixel | — | **Otimização do teste (C1)** |
| ViewContent | Oferta vista | Pixel | — | Público "viu a oferta" |
| InitiateCheckout | Clicou em pagar no carrinho | Pixel | valor + moeda | Otimização intermediária / público |
| Purchase | Pagamento confirmado | **Pixel + servidor** (mesmo `eventID` = id da sessão Stripe) | valor + moeda | Otimização da escala / remarketing |

Idade, gênero e persona do quiz **não** vão para a Meta (o site já filtra).

**Teste (Gerenciador de Eventos → Testar eventos):**
1. Preencha `META_TEST_EVENT_CODE` no ambiente e faça o deploy.
2. Abra `https://renova-cell.vercel.app/quiz?utm_source=meta&utm_medium=paid&utm_content=teste`, aceite os cookies, faça o quiz, chegue ao checkout e pague com cartão real (reembolse depois).
3. Confira: cada evento aparece; o Purchase aparece **uma vez** com "Navegador" e "Servidor" juntos (deduplicado), valor e moeda corretos.
4. No Supabase: a linha em `orders` tem `utm.utm_content = "teste"`.
5. Apague `META_TEST_EVENT_CODE` e faça o deploy de novo.

---

## 5. Caminho A × caminho B

| | Caminho A (conjunto de dados sem restrição) | Caminho B (restrito: saúde e bem-estar) |
|---|---|---|
| C0 aquecimento | Engajamento → ThruPlay | Igual |
| C1 teste | Vendas, otimizar **Lead** | Vendas ou Tráfego, otimizar **Visualizações da página de destino** |
| C2 escala | Vendas Advantage+, **Purchase** (se ≥ 10 compras/semana) ou **InitiateCheckout** | Vendas/Tráfego, **Visualizações da página** |
| C3 remarketing | Vendas, **Purchase** | **Visualizações da página** |
| Como julgar | Meta + Stripe | **Só Stripe/Supabase por `utm_content`** |

No caminho B o criativo faz a seleção do público: mantenha os ganchos voltados para quem quer um ritual diário (35+), e o quiz filtra curiosos.

---

## 6. Nomes e parâmetros de URL

- **Campanha:** `rc_us_c{n}_{etapa}` → `rc_us_c1_teste`
- **Conjunto:** `{conceito}_{tema}` → `ig01_ritual`; remarketing `rt1_quiz_oferta_14d`
- **Anúncio:** `{conceito}{gancho}` → `ig01a`, `ig01b`, `ig01c`
- Tudo em minúsculas, sem espaço nem acento: os nomes viram UTM.

**Parâmetros de URL** (campo "Parâmetros de URL" de **todo** anúncio — a URL do site fica limpa):

```
utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}&utm_term={{adset.name}}&utm_content={{ad.name}}
```

`utm_medium=paid` também liga a versão neutra do site (sem textos de "desejo") — é o que o revisor da Meta e quem clica veem.

---

## 7. Públicos (criar no D-1)

| Nome | Origem | Regra | Janela | Uso |
|---|---|---|---|---|
| `aud_quiz_start_14d` | Site | Evento `quiz_start` (ou URL contém /quiz) | 14 d | RT1 |
| `aud_quiz_start_30d` | Site | Evento `quiz_start` | 30 d | Exclusão do RT2 |
| `aud_lead_30d` | Site | Lead | 30 d | Leitura; semelhante no futuro |
| `aud_offer_14d` | Site | URL contém /offer | 14 d | RT1 |
| `aud_checkout_7d` | Site | InitiateCheckout | 7 d | RT1 / cupom |
| `aud_compradores_180d` | Site + lista | Purchase + lista de e-mails da Stripe | 180 d | **Exclusão em tudo** |
| `aud_ig_engajou_30d` | Perfil do Instagram | Todas as interações | 30 d | RT2 |
| `aud_video50_30d` | Vídeo | 50% de qualquer vídeo do C0/C1 | 30 d | RT2 |
| `lal_compradores_1pct` | Semelhante | Compradores, EUA, 1% | — | Só com ≥ 100 compradores (Onda 1) |

---

## 8. Campanhas, conjuntos e anúncios

### 8.1 Visão geral

```
rc_us_c0_aquecimento   Engajamento · ThruPlay · ABO · US$ 15/dia · D0–D3
 └─ aq_video_amplo      ig01a · ig06a · ig04a (mesmas publicações do teste)

rc_us_c1_teste         Vendas · Lead (A) / LPV (B) · ABO · US$ 100/dia · D4–D17
 ├─ ig01_ritual         US$ 20 · ig01a ig01b ig01c
 ├─ ig03_unboxing       US$ 20 · ig03a ig03b ig03c
 ├─ ig04_quiz           US$ 20 · ig04a ig04b ig04c
 ├─ ig06_a_dois         US$ 20 · ig06a ig06b ig06c
 └─ ig10_criador        US$ 20 · ig10a ig10b ig10c   (reserva: ig05_assinatura)

rc_us_c2_escala        Vendas Advantage+ · Purchase/InitiateCheckout (A) · orç. de campanha · US$ 60/dia · D11–D21
 └─ escala_amplo        3–6 vencedores do C1 (mesmo Post ID)

rc_us_c3_remarketing   Vendas · Purchase (A) / LPV (B) · ABO · US$ 15/dia · D4–D21
 ├─ rt1_quiz_oferta_14d US$ 10 · ig08a ig12a ig03b ig13a
 └─ rt2_engajou_30d     US$ 5  · ig04a ig08a
```

**Verba de exemplo:** C0 US$ 60 + C1 US$ 1.400 + C2 US$ 660 + C3 US$ 270 ≈ **US$ 2.390 em 21 dias**. A conta é feita na aba Campanhas da planilha; troque os valores pelo que você aceita investir. Regra: **cada conjunto de teste precisa de verba diária ≥ CPA alvo provisório**. Com menos verba, teste menos conceitos (3 em vez de 5), não divida em conjuntos menores.

### 8.2 Configuração campo a campo

**Em todas as campanhas**
- Categoria especial de anúncio: nenhuma.
- Atribuição: 7 dias após o clique e 1 dia após a visualização (padrão).
- Estratégia de lance: maior volume (sem limite de custo na Onda 0).
- Identidade: página e Instagram do RENOVA CELL (no ig10, anúncio de parceria com o criador).
- Recursos de criativo Advantage+ (melhorias automáticas): **desligar** "adicionar música", "variações de texto" e "imagens geradas" — a IA da Meta pode criar texto que quebra as regras de alegação. Manter só ajustes de recorte/brilho.
- Destino: site. URL `https://renova-cell.vercel.app/quiz` (teste/C0/C2) ou `/offer` (remarketing; quem não fez o quiz cai no quiz). Parâmetros de URL da seção 6.

**Conjuntos do C0, C1 e C2**
- Local: Estados Unidos (pessoas que moram ou estiveram recentemente).
- Público: **Público Advantage+** com sugestão 35–65+. Se você precisar de 35+ como regra fixa, use "Opções de público originais": 35–65+, todos os gêneros, sem interesses.
- Idioma: inglês (ou deixe em branco se o alcance ficar pequeno).
- Exclusão: `aud_compradores_180d`.
- Posicionamentos: **Advantage+** (Instagram + Facebook). O público 35–65+ está muito no Facebook; restringir só ao Instagram encarece a impressão. Excluir Audience Network e Messenger.
- Programação: contínua, sem data de fim (encerra manualmente).

**Conjuntos do C3**
- `rt1_quiz_oferta_14d`: incluir `aud_quiz_start_14d` + `aud_offer_14d` + `aud_checkout_7d`; excluir compradores. Posicionamentos Advantage+.
- `rt2_engajou_30d`: incluir `aud_ig_engajou_30d` + `aud_video50_30d`; excluir `aud_quiz_start_30d` e compradores.
- Público pequeno no começo é normal: a Meta entrega menos e gasta menos que a verba.

**Reaproveitar o engajamento (Post ID):** publique cada anúncio como post (orgânico ou "não publicado" da página), anote o ID e use **"Usar publicação existente"** no C0, C1 e C2. Curtidas e comentários se acumulam no mesmo post — prova social que acompanha o anúncio vencedor quando ele vai para a escala.

### 8.3 Anúncios — textos prontos

Formatos: vídeo 9:16 1080×1920 (Reels/Stories) com corte 4:5 1080×1350 para o Feed (use "personalizar por posicionamento"); imagens 4:5 + 9:16. Legenda queimada sempre; texto longe do topo, da base e da lateral direita.

<!-- ANUNCIOS:INICIO (gerado por onda0_build.py — não editar aqui) -->
#### IG01 — Ritual da manhã · conjunto `ig01_ritual`

- **Formato:** Vídeo 9:16 (Reels/Stories) + corte 4:5 (Feed) · 15–20 s
- **Cenas:** Colher no pó (câmera lenta, som de ASMR) → mistura no café → gole na janela → produto na bancada → cartão final "Free shipping · 2 business days · Take the 60-sec quiz". Selo "Dramatization" se for ator.
- **Texto principal (EN, igual nos 3 anúncios):**

  > A 30-second daily ritual: one serving of collagen + peptides in coffee, water or a smoothie. No hormones, no stimulants.
  >
  > Free shipping, delivered in up to 2 business days in plain, discreet packaging.
  >
  > Take the 60-second quiz to get the plan that matches your answers. Buy once or subscribe, cancel anytime. 30-day money-back guarantee.
  >
  > Individual results vary. These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.

  *Um ritual diário de 30 segundos: uma dose de colágeno + peptídeos no café, na água ou na vitamina. Sem hormônios, sem estimulantes. Frete grátis, entrega em até 2 dias úteis em embalagem discreta. Faça o quiz de 60 segundos. Compra única ou assinatura, cancele quando quiser. Garantia de 30 dias.*

| Anúncio | Gancho na tela (0–2 s) | Título |
|---|---|---|
| `ig01a` | "One scoop. Every morning. That's it." | "Your 30-second daily ritual" |
| `ig01b` | "A 30-second morning ritual" | "Free shipping · 2 business days" |
| `ig01c` | "The supplement that fits in a coffee mug" | "Find your plan in 60 seconds" |

- **Descrição:** "Buy once or subscribe · cancel anytime" · **CTA:** Saiba mais (Learn more) · **URL:** `https://renova-cell.vercel.app/quiz`

#### IG03 — Unboxing discreto + 2 dias · conjunto `ig03_unboxing`

- **Formato:** Vídeo 9:16 só com mãos · 12–15 s
- **Cenas:** Caixa neutra na porta → close da caixa sem marca → abre → produto → mistura na água → cartão final. Gancho C só depois de comprovar a entrega real.
- **Texto principal (EN, igual nos 3 anúncios):**

  > Some things are nobody else's business. RENOVA CELL ships in a plain box with no product name on the outside.
  >
  > Free shipping, delivered in up to 2 business days with tracking. Buy once, or subscribe and it arrives again when you run out. Cancel anytime.
  >
  > Take the 60-second quiz to find your plan. 30-day money-back guarantee.
  >
  > Individual results vary. These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.

  *Tem coisa que não é da conta de ninguém. O RENOVA CELL chega numa caixa neutra, sem o nome do produto por fora. Frete grátis, entrega em até 2 dias úteis com rastreio. Compra única ou assinatura que chega de novo quando acaba. Faça o quiz de 60 segundos. Garantia de 30 dias.*

| Anúncio | Gancho na tela (0–2 s) | Título |
|---|---|---|
| `ig03a` | "No logo on the box. On purpose." | "Free shipping · discreet box" |
| `ig03b` | "Free shipping. 2 business days. Plain box." | "Delivered in up to 2 business days" |
| `ig03c` | "Ordered Monday. Here Wednesday." | "Plain box. Fast delivery." |

- **Descrição:** "Tracked · discreet · free" · **CTA:** Saiba mais (Learn more) · **URL:** `https://renova-cell.vercel.app/quiz`

#### IG04 — O quiz é o anúncio · conjunto `ig04_quiz`

- **Formato:** Vídeo 9:16: gravação de tela do quiz real (rápida, com cliques) · 12–15 s
- **Cenas:** Dedo respondendo as 8 perguntas em velocidade 2× → tela "Analysis complete" → plano recomendado → cartão final.
- **Texto principal (EN, igual nos 3 anúncios):**

  > 8 quick questions, about 60 seconds, and you get a daily collagen + peptide plan matched to your answers: 1 month, 3 months or 6 months.
  >
  > Free shipping in up to 2 business days, discreet packaging, 30-day money-back guarantee.
  >
  > Individual results vary. These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.

  *8 perguntas rápidas, cerca de 60 segundos, e você recebe um plano diário de colágeno + peptídeos de acordo com as suas respostas: 1, 3 ou 6 meses. Frete grátis em até 2 dias úteis, embalagem discreta, garantia de 30 dias.*

| Anúncio | Gancho na tela (0–2 s) | Título |
|---|---|---|
| `ig04a` | "Answer 8 questions. Get your collagen plan." | "Take the 60-second quiz" |
| `ig04b` | "Which plan fits your routine? 60 seconds." | "Get your plan in 60 seconds" |
| `ig04c` | "Coffee, water or smoothie? Start here." | "8 questions. 1 plan." |

- **Descrição:** "Free shipping · 2 business days" · **CTA:** Saiba mais (Learn more) · **URL:** `https://renova-cell.vercel.app/quiz`

#### IG06 — Ritual a dois · conjunto `ig06_a_dois`

- **Formato:** Vídeo 9:16 + corte 4:5 · 15–20 s
- **Cenas:** Casal 40–55 na cozinha de manhã, duas canecas, risada, abraço rápido; nada de cama nem toque sensual. Selo "Dramatization" se forem atores.
- **Texto principal (EN, igual nos 3 anúncios):**

  > A daily ritual for two: one serving of collagen + peptides each, in coffee or a smoothie. No hormones, no stimulants.
  >
  > Free shipping, delivered in up to 2 business days in discreet packaging. Buy once or subscribe, cancel anytime.
  >
  > Take the 60-second quiz to find your plan.
  >
  > Individual results vary. These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.

  *Um ritual diário a dois: uma dose de colágeno + peptídeos para cada um, no café ou na vitamina. Sem hormônios, sem estimulantes. Frete grátis em até 2 dias úteis, embalagem discreta. Compra única ou assinatura. Faça o quiz de 60 segundos.*

| Anúncio | Gancho na tela (0–2 s) | Título |
|---|---|---|
| `ig06a` | "Our morning thing." | "A daily ritual for two" |
| `ig06b` | "Two mugs. One ritual." | "Free shipping · 2 business days" |
| `ig06c` | "Self-care is better together." | "Take the 60-second quiz" |

- **Descrição:** "No hormones · no stimulants" · **CTA:** Saiba mais (Learn more) · **URL:** `https://renova-cell.vercel.app/quiz`

#### IG10 — Criador (anúncio de parceria) · conjunto `ig10_criador`

- **Formato:** Reels do criador, 9:16, 20–40 s, publicado no perfil dele e impulsionado como anúncio de parceria
- **Cenas:** Rotina real do criador + caixa discreta chegando + preparo no café. Três aberturas gravadas (A/B/C). Rótulo "Paid partnership" + "#ad" + divulgação falada nos primeiros segundos.
- **Texto principal (EN, igual nos 3 anúncios):**

  > [Legenda do próprio criador, aprovada pela marca — só experiência real, sem resultado.] Example: "I've been adding RENOVA CELL to my morning coffee for 4 weeks. One scoop and done. Free shipping, and it came in a plain box. #ad"
  >
  > Individual results vary. These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.

  *[Legenda do criador.] Exemplo: "Faz 4 semanas que coloco RENOVA CELL no meu café da manhã. Uma dose e pronto. Frete grátis, e chegou numa caixa neutra. #publi" — só se for verdade.*

| Anúncio | Gancho na tela (0–2 s) | Título |
|---|---|---|
| `ig10a` | "[Abertura A do criador]" | "Take the 60-second quiz" |
| `ig10b` | "[Abertura B do criador]" | "Free shipping · 2 business days" |
| `ig10c` | "[Abertura C do criador]" | "Find your plan in 60 seconds" |

- **Descrição:** "Paid partnership" · **CTA:** Saiba mais (Learn more) · **URL:** `https://renova-cell.vercel.app/quiz`

#### IG05 — Chega quando acaba (reserva do ig10) · conjunto `ig05_assinatura`

- **Formato:** Vídeo 9:16 animado (calendário + produto) · 15 s
- **Cenas:** Calendário → pacote chegando no fim do estoque (1, 3 ou 6 meses) → "Cancel anytime from your receipt email" → cartão final.
- **Texto principal (EN, igual nos 3 anúncios):**

  > Choose your plan: 1 month, 3 months or 6 months. Buy once, or subscribe and it arrives again right when you run out. Same price, cancel anytime from your receipt email.
  >
  > Free shipping in up to 2 business days, discreet packaging. 30-day money-back guarantee.
  >
  > Individual results vary. These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.

  *Escolha 1, 3 ou 6 meses. Compre uma vez ou assine e ele chega de novo quando acabar. Mesmo preço, cancele quando quiser pelo e-mail do recibo. Frete grátis em até 2 dias úteis, embalagem discreta. Garantia de 30 dias.*

| Anúncio | Gancho na tela (0–2 s) | Título |
|---|---|---|
| `ig05a` | "It shows up right when you run out." | "Subscribe or buy once" |
| `ig05b` | "1, 3 or 6 months. You choose." | "Same price · cancel anytime" |
| `ig05c` | "Subscribe or buy once. Same price." | "Free shipping · 2 business days" |

- **Descrição:** "Cancel anytime" · **CTA:** Saiba mais (Learn more) · **URL:** `https://renova-cell.vercel.app/quiz`

#### Remarketing · conjuntos `rt1_quiz_oferta_14d` e `rt2_engajou_30d`

| Anúncio | Peça | Formato | Texto na arte | Texto principal (EN) | Título | CTA | URL |
|---|---|---|---|---|---|---|---|
| `ig08a` | Garantia de 30 dias | Imagem 4:5 + versão 9:16 (Stories) | Arte: produto + "30-day money-back guarantee · Free shipping · 2 business days" | Still thinking about it? Try RENOVA CELL for 30 days. If it's not for you, email us and we'll refund your first order. Free shipping, delivered in up to 2 business days in discreet packaging. | "30-day money-back guarantee" | Comprar agora (Shop now) | `https://renova-cell.vercel.app/offer` |
| `ig12a` | O que vem na caixa | Imagem 4:5 (flat lay) + 9:16 | Arte: "What's in the box" · "Your plan (1, 3 or 6 months)" · "Plain outer box" · "Free shipping" · "30-day guarantee" | Your plan, a plain outer box and free delivery in up to 2 business days. Buy once or subscribe, cancel anytime. 30-day money-back guarantee. | "Free shipping · 2 business days" | Comprar agora (Shop now) | `https://renova-cell.vercel.app/offer` |
| `ig03b` | Unboxing (reaproveitado do teste) | Mesma publicação do C1 (Post ID) | Gancho B do ig03 | (mesmo texto do ig03) | "Delivered in up to 2 business days" | Comprar agora (Shop now) | `https://renova-cell.vercel.app/offer` |
| `ig13a` | Cupom RENOVA10 (quem iniciou o checkout) | Imagem 4:5 + 9:16 | Arte: "10% off your first payment · code RENOVA10" + produto | Your plan is still waiting. Use code RENOVA10 for 10% off your first payment. Free shipping in up to 2 business days, discreet packaging, 30-day money-back guarantee. | "10% off with RENOVA10" | Obter oferta (Get offer) | `https://renova-cell.vercel.app/offer` |

Todo texto principal de remarketing termina com o mesmo rodapé da FDA.
<!-- ANUNCIOS:FIM -->

---

## 9. Calendário dia a dia

| Dia | O que fazer |
|---|---|
| **D-10** | Variáveis do site (seção 2), Stripe live, contas (seção 3) |
| **D-9** | Domínio verificado; conferir a classificação de saúde e bem-estar → caminho A ou B |
| **D-7** | Teste completo de eventos e compra real (seção 4); 10 pedidos de teste de entrega |
| **D-7 a D-3** | Gravação e edição: 15 vídeos do teste + 4 peças de remarketing; brief e contrato do criador |
| **D-3** | Entrega dos pedidos de teste conferida (≤ 2 dias úteis?). Se não, **não ligue** o ig03c e reveja a promessa |
| **D-2** | Grade de 9 posts no Instagram; publicar os posts dos anúncios e anotar os Post IDs |
| **D-1** | Públicos (seção 7); subir C0, C1 e C3 **pausados**; abrir cada URL e conferir o UTM |
| **D0** | Ligar **C0** (aquecimento) |
| **D1–D3** | Só observar: entrega, reprovações, comentários (responder em até 2 h) |
| **D4** | Ligar **C1** e **C3**; desligar C0 |
| **D7** | 1ª leitura de gancho e de custo por quiz; cortes (seção 10) |
| **D10** | 1ª leitura de custo por compra (Stripe por `utm_content`) |
| **D11** | Montar **C2** com os vencedores; cortar os perdedores do C1 (a verba do C1 cai junto) |
| **D14** | Leitura semanal; 2–3 ganchos novos para os conceitos vencedores (no C1) |
| **D17** | Fim do C1 |
| **D18–D21** | C2 + C3 rodando; fechamento e decisão da Onda 1 (seção 11) |

---

## 10. Rotina e regras de decisão

**Todo dia (10 min, mesma hora):** gasto × verba, reprovações, comentários, `compras na Stripe` × `compras na Meta`, e-mails de clientes sobre entrega.

**Corte por anúncio** (depois de gastar ≥ 1× CPA alvo):
- Gancho (visualizações de 3 s ÷ impressões) < 20% **e** CTR do link < 0,6% → pausar.
- Nenhum quiz concluído → pausar.

**Corte por conjunto** (depois de gastar ≥ 2× CPA alvo):
- Nenhuma compra na Stripe com aquele `utm_term` → pausar.
- CPA > 1,5× o alvo depois de gastar 3× o alvo → pausar.

**Vencedor:** CPA (Stripe) ≤ alvo com ≥ 3 compras → vai para o C2 (mesmo Post ID). No caminho B: custo por quiz concluído entre os 2 melhores **e** ≥ 1 compra.

**Não mexa** nos primeiros 3 dias de um conjunto (público, verba > 30%, criativo). Pausar anúncio ruim pode.

**Consulta de vendas por anúncio (Supabase):**

```sql
select utm->>'utm_content' as anuncio, count(*) as compras, sum(amount_cents) / 100.0 as receita
from orders
where status = 'paid' and created_at >= now() - interval '7 days'
group by 1 order by compras desc;
```

Divida o gasto de cada anúncio (Gerenciador de Anúncios) pelas compras da consulta = **CPA real**.

---

## 11. Critérios para abrir a Onda 1

| Critério | Passa se |
|---|---|
| Rastreamento | Compras Meta ÷ Stripe ≥ 70% |
| Criativos | ≥ 2 conceitos com CPA ≤ alvo e ≥ 3 compras cada |
| Margem | CPA médio da Onda 0 ≤ CPA de equilíbrio da planilha (com custos reais) |
| Entrega | ≥ 95% dos pedidos em até 2 dias úteis |
| Qualidade | Reembolsos < 5% e nenhuma reprovação recorrente/restrição de conta |
| Assinatura | % de pedidos com assinatura medido (substitui a hipótese de 30% da planilha) |

**Se passar:** Onda 1 com os vencedores, adicionando Reino Unido e DACH (plano de lançamento, seção 3). **Se não passar:** mais 14 dias de Onda 0 com 3 conceitos novos — trocando primeiro o que falhou (criativo, oferta ou entrega), não a estrutura.

---

## 12. Entregáveis de produção

| Peça | Quantidade | Formatos |
|---|---|---|
| Vídeos do teste (ig01, ig03, ig04, ig06, ig10 ou ig05) | 5 conceitos × 3 ganchos = 15 | 9:16 + corte 4:5 |
| Remarketing (ig08, ig12, ig13) | 3 | Imagem 4:5 + 9:16 |
| Grade inicial do Instagram | 9 posts | ver plano de lançamento, seção 5 |
| Legendas queimadas | em todos os vídeos | inglês |

**Antes de gravar:** confirme o formato físico (pó, sachê), a embalagem e o rótulo, e que "No hormones, no stimulants" é verdadeiro para a fórmula. Selo "Dramatization" em vídeo com ator; "Paid models" em foto com modelo.

---

## 13. Se algo der errado

| Problema | O que fazer |
|---|---|
| Anúncio reprovado | Ler o motivo, corrigir o trecho (texto, imagem ou landing) e pedir revisão. Não subir cópias do mesmo anúncio |
| Conta restrita | Pedir revisão pelo Account Quality; pausar o que gerou a restrição. Nunca abrir conta nova para contornar |
| Purchase não aparece na Meta | Conferir `META_CAPI_TOKEN`, o pixel e os logs do webhook da Stripe ("meta capi failed") |
| Compras na Stripe sem `utm` | Visitante veio de fora do anúncio ou o campo "Parâmetros de URL" ficou vazio — conferir anúncio por anúncio |
| Entrega passou de 2 dias | Avisar o cliente, oferecer reembolso; se repetir, tirar o país de `FAST_DELIVERY_COUNTRIES` e pausar o ig03c |
