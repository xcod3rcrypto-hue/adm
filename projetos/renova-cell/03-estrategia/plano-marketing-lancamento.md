# Plano de marketing e lançamento — RENOVA CELL

> **Data:** 17/10/2026 · **Canal principal:** Instagram (Meta Ads) · **Mercados:** EUA, Europa (exceto Ucrânia e Rússia) e, depois, Canadá, Oceania, Golfo e América Latina
> **Funil:** anúncio → quiz (8 perguntas) → análise → oferta personalizada → checkout Stripe → upsells → obrigado
> **Oferta que pode aparecer em anúncio:** 1 unidade, Kit 3 (90 dias), Kit 6 (6 meses); compra única **ou** assinatura que chega de novo quando o estoque acaba; **frete grátis**; **entrega em até 2 dias úteis**; **embalagem discreta**; garantia de 30 dias; cupom RENOVA10 (10% no 1º pagamento).
>
> **Onda 0 (validação de 21 dias nos EUA, antes da onda 1):** `06-campanhas/meta-ads/onda-0-estrutura.md` + `onda-0-montagem.xlsx`.
>
> Documentos irmãos: criativos do lote 1 (EUA, Meta + TikTok) em `04-copy/criativos-anuncios.md` · modelo financeiro em `03-estrategia/metas-kpi.xlsx` · funil em `site/`.

---

## 0. Resumo em 10 linhas

1. **Lançar em ondas, seguindo o estoque.** A promessa "até 2 dias úteis" só é verdadeira onde houver armazém perto. Onda 1 = **EUA + Reino Unido + Alemanha/Áustria/Suíça**. As outras entram quando a entrega estiver comprovada.
2. **Limitar o envio às ondas abertas.** Hoje o site aceita pedidos de ~60 países. No lançamento, defina `SHIP_COUNTRIES` só com os países da onda (seção 3.3).
3. **O maior risco do projeto é a Meta, não o criativo.** A Meta classifica suplementos como "saúde e bem-estar" e pode **bloquear a otimização por compra**. O plano tem um caminho A (otimiza por compra) e um caminho B (otimiza por visualização da página + criativo forte) — seção 4.
4. **Na Europa, colágeno não tem alegação de saúde aprovada.** Anúncio europeu vende **ritual, conveniência e confiança** (frete grátis, 2 dias, caixa discreta, garantia, assinatura flexível) — não "pele mais firme". Para ter alegação forte, precisamos da fórmula (vitamina C, zinco, biotina etc.).
5. **Libido não entra em anúncio.** A Meta proíbe anúncio focado em desempenho ou prazer sexual. Desejo e vitalidade ficam no quiz e na landing, com a linguagem cuidadosa que já está lá.
6. **Um anúncio, vários idiomas.** Use o recurso de idiomas da Meta (uma peça com traduções) + vídeo dublado por idioma (HeyGen já está integrado). Isso evita 28 conjuntos de anúncios.
7. **Estrutura enxuta:** por mercado, 1 campanha de teste de criativos + 1 campanha de escala + 1 de remarketing. Público amplo; o criativo faz a segmentação.
8. **Criativo é a alavanca.** Meta: 12 conceitos novos (seção 6), estilo nativo de Instagram, 3 variações de gancho cada, 3–5 conceitos novos por semana por mercado.
9. **Medição com fonte da verdade fora da Meta:** Stripe + Supabase. Instalar a API de Conversões (servidor) antes de gastar.
10. **Decisões por regra, não por sensação:** regras de corte e de escala na seção 9.

---

## 1. O que os dados e as regras de 2026 dizem (e o que fazer com isso)

| Sinal | O que significa | Decisão |
|---|---|---|
| A Meta restringe anunciantes de **saúde e bem-estar** (suplementos incluídos): parte das contas não pode otimizar para Purchase/Add to Cart e perde parâmetros de URL. Fontes: guias de agência e ferramentas de rastreio; confirmar na própria conta. | A otimização por compra pode não estar disponível. | Verificar a classificação no Gerenciador de Eventos **antes** do lançamento. Ter o plano B pronto (seção 4.2). |
| Fiscalização por IA de texto, imagem **e landing page** endureceu em 2026 (relato de agências, não confirmado pela Meta). | Uma frase arriscada na landing derruba o anúncio. | Revisar a landing com olho de revisor da Meta (seção 10.3): o pilar "Desejo e vitalidade" é o ponto mais sensível. |
| CPM no Instagram: mediana mundial ~US$ 5 no Feed; EUA bem acima (~US$ 8–15); Reels costuma ser mais barato que Feed com vídeo vertical. Números de terceiros, servem só de ordem de grandeza. | Leste Europeu e Sul da Europa compram atenção mais barata que EUA, Reino Unido e Nórdicos. | Mercados baratos servem para **testar criativo**; mercados caros, para **lucrar**. |
| Colágeno: Europa cresce ~7% ao ano; maiores mercados **Alemanha, França, Itália, Reino Unido**; colágeno marinho é a fonte que mais cresce; europeu valoriza certificação e rótulo limpo. | O europeu compra com a cabeça: origem, pureza, transparência. | Criativos europeus mostram rótulo, origem e "sem hormônios, sem estimulantes". |
| Nos EUA, assinatura direta ao consumidor é parte grande da venda online de colágeno. | Assinatura é comportamento normal, não barreira. | Gancho "chega quando acaba, cancele com 1 clique" (IG05). |
| Criativo nativo (vertical, cru, cara de post) supera produção polida; a Meta pede variedade real de conceitos, não pequenas variações. | Celular + boa luz > estúdio. | Produção em lote com criadores e com a equipe; 3 ganchos por conceito. |

**Padrões que quase ninguém usa nesse nicho (vantagem):**

- **Fricção de entrega como gancho.** A categoria inteira vende "pele"; quase ninguém vende "chega em 2 dias, de graça, numa caixa sem nome". Para quem tem vergonha de comprar "suplemento de idade" ou "de libido", **embalagem discreta é argumento de compra**, não detalhe.
- **O quiz como produto.** "8 perguntas, 60 segundos, um plano para você" é interativo e não faz alegação nenhuma — passa pela revisão de qualquer país.
- **Ritual a dois.** Mostrar um casal tomando junto de manhã comunica vitalidade e cumplicidade **sem falar de sexo** — é o jeito legal de tocar no pilar "desejo" no anúncio.
- **Transparência como estética.** Mostrar o rótulo em close, dizer o que **não** tem e citar estudo com ressalva cria confiança num mercado cheio de promessa exagerada.

---

## 2. Posicionamento e mensagem

**Frase de posicionamento:** Para adultos de 35+ que querem se sentir bem no próprio corpo, o RENOVA CELL é um ritual diário de colágeno + peptídeos — sem hormônios, sem estimulantes — que chega em até 2 dias, de graça e em embalagem discreta, com um plano escolhido pelas respostas da pessoa.

**Três pilares (iguais aos da landing):**

| Pilar | Na landing / quiz | No anúncio EUA | No anúncio Europa / Reino Unido |
|---|---|---|---|
| Pele com aparência mais jovem | Estudos com ressalva | Linguagem de estrutura/função + estudo com ressalva | Sem alegação. Só ritual, beleza como autocuidado; alegação de vitamina C **se a fórmula tiver** |
| Desejo e vitalidade | Texto cuidadoso, sem hormônio | **Não entra.** No máximo "ritual a dois" (imagem, sem texto sobre sexo) | **Não entra** |
| Disposição | Proteína diária, sem estimulante | "Sem estimulantes, sem queda" | Sem alegação; alegação de vitaminas B/magnésio/ferro **se a fórmula tiver** |

**Argumentos que funcionam em todos os países (sem risco de alegação):** frete grátis · até 2 dias úteis · embalagem discreta · garantia de 30 dias · compra única ou assinatura, cancela quando quiser · sem hormônios, sem estimulantes · uma dose por dia no café/água/vitamina · quiz de 60 segundos.

---

## 3. Mercados e ondas

### 3.1 Priorização

| Onda | Quando | Países | Idioma do anúncio | Moeda | Por quê | Pré-requisito |
|---|---|---|---|---|---|---|
| **1** | Dia 0 | **EUA** | EN | USD | Maior mercado, maior ticket, assinatura é hábito | Estoque nos EUA (3PL) |
| **1** | Dia 0 | **Reino Unido + Irlanda** | EN | GBP / EUR | Mesmo criativo dos EUA (troca rodapé) | Estoque no Reino Unido **ou** transportadora com desembaraço pago (DDP) que cumpra 2 dias |
| **1** | Dia 0 | **Alemanha, Áustria, Suíça** | DE | EUR / CHF | Maior mercado de colágeno da Europa | Estoque na Alemanha. Suíça: alfândega — confirmar prazo |
| **2** | Semana 3–4 | França, Bélgica, Holanda, Luxemburgo, Itália, Espanha, Portugal | FR, NL, IT, ES, PT | EUR | Mercados grandes, atendidos pelo armazém alemão em 1–3 dias | Teste de entrega real (10 pedidos por país) ≤ 2 dias úteis |
| **2** | Semana 3–4 | Suécia, Dinamarca, Finlândia, Noruega | SV, DA, FI, NB | SEK, DKK, EUR, NOK | Poder de compra alto | Noruega: alfândega |
| **3** | Semana 6–8 | Polônia, Chéquia, Eslováquia, Hungria, Romênia, Bulgária, Grécia, Croácia, Eslovênia, Bálticos | idioma local | moeda local | CPM baixo: ótimo para testar criativo | Prazo ≤ 2 dias comprovado |
| **4** | Após validar logística | Canadá, Austrália, Nova Zelândia, Golfo, América Latina | EN / ES / PT | USD | Mercados bons, mas 2 dias exige estoque local | Estoque local ou **trocar a promessa de prazo por país** |

### 3.2 Por que não ir para os 60 países de uma vez

- **Verba diluída:** cada mercado precisa de ~50 conversões por semana por conjunto para a Meta aprender. Dividir pouca verba em muitos países = nenhum aprende.
- **Promessa de 2 dias:** um atraso nos EUA aciona a regra da FTC de vendas à distância; na UE, prazo anunciado vira obrigação de contrato. Reembolso + reclamação + conta de anúncio sinalizada.
- **Atendimento:** cada idioma novo traz e-mails nesse idioma.

### 3.3 Ação no site antes do dia 0

```
# .env de produção — só a onda 1
SHIP_COUNTRIES=US,GB,IE,DE,AT,CH,LI
```

Ucrânia e Rússia já são bloqueadas no código. Visitantes de outros países ainda veem o site no idioma deles, mas o checkout da Stripe só aceita endereço dos países liberados. Em cada nova onda, acrescente os países e faça o deploy.

---

## 4. Instagram / Meta Ads — configuração completa

### 4.1 Antes de gastar 1 real (checklist técnico)

| # | Item | Onde | Por quê |
|---|---|---|---|
| 1 | Business Manager com **2FA**, 2 administradores, verificação da empresa | business.facebook.com | Conta de suplemento cai com frequência; sem backup o lançamento para |
| 2 | Instagram profissional ligado à página do Facebook | Configurações do Instagram | Anúncio sai do perfil da marca |
| 3 | **Uma conta de anúncio por moeda principal** (USD, EUR, GBP) | Business Manager | Relatórios limpos e limite de gasto por conta |
| 4 | Verificar o domínio | Segurança da marca → Domínios | Necessário para eventos |
| 5 | Pixel + **API de Conversões** (servidor) | Gerenciador de Eventos | O pixel só dispara após aceitar cookies → a Meta vê menos compras do que existem. A API de Conversões manda a compra direto do webhook da Stripe |
| 6 | Conferir a **classificação de saúde e bem-estar** do domínio | Gerenciador de Eventos → Visão geral / aviso no topo | Define caminho A ou B |
| 7 | Eventos: PageView, Lead (`quiz_complete`), ViewContent (oferta), InitiateCheckout, Purchase (com valor e moeda) | Ferramenta "Testar eventos" | Testar o funil inteiro antes |
| 8 | ✅ Idade, gênero e persona já não vão para o pixel da Meta (continuam no GA4/PostHog) | `site/lib/analytics.ts` | Parâmetro sensível pode bloquear o evento |
| 9 | Catálogo **não** é necessário no início | — | 3 produtos; anúncio dinâmico só depois |
| 10 | Públicos personalizados criados no dia 0 (ver 4.5) | Públicos | Remarketing começa a acumular |

> **Já está no site:** API de Conversões a partir do webhook da Stripe (preencha `META_CAPI_TOKEN`), UTMs gravadas no quiz e no pedido, versão neutra para quem vem de anúncio e prazo de entrega por país (`FAST_DELIVERY_COUNTRIES`). Detalhes no README do site.

### 4.2 Caminho A × caminho B (depende da classificação)

| | **Caminho A — conta sem restrição** | **Caminho B — conta restrita (saúde e bem-estar)** |
|---|---|---|
| Objetivo da campanha | Vendas | Vendas ou Tráfego |
| Evento de otimização | Teste: **Lead** (`quiz_complete`) → Escala: **Purchase** quando houver ~50 compras/semana | **Visualizações da página de destino** (ou Engajamento para o topo) |
| Tipo | Advantage+ (vendas) na escala; manual com orçamento por conjunto no teste | Manual. Advantage+ continua possível, mas sem sinal de compra |
| Como achar o comprador | O algoritmo aprende com compras | **O criativo faz a seleção**: gancho para 35+, texto qualificador ("para quem quer um ritual diário…"), quiz filtra curiosos |
| Medição | Meta + Stripe | **Só Stripe/Supabase por UTM** (`utm_content` por anúncio) e MER por país |
| Compensação | — | Mais verba em Reels de topo, remarketing por engajamento (vídeo 50%, perfil), e-mail/SMS do quiz fazendo a conversão |

Também ajuda a reduzir o risco de classificação: domínio, página e perfil falando de **beleza e ritual** (não de doença, idade ou peso), e nenhuma URL ou parâmetro com termos de saúde.

### 4.3 Estrutura de campanhas (por mercado da onda 1)

Nomenclatura: `RC | {mercado} | {etapa} | {tipo} | {data}` — ex.: `RC | US | TESTE | ABO | 2026-11`.

```
RC | {MERCADO} | 1-TESTE | ABO                    (20–30% da verba do mercado)
 ├─ CJ | Conceito IG01 Ritual       | amplo 35–65+ | Reels+Stories+Feed
 │    └─ 3 anúncios (gancho A/B/C)
 ├─ CJ | Conceito IG03 Frete 2 dias | amplo 35–65+
 ├─ CJ | Conceito IG04 Quiz         | amplo 35–65+
 └─ … (3–5 conceitos por semana)

RC | {MERCADO} | 2-ESCALA | Advantage+ ou CBO     (60–70%)
 └─ 1 conjunto amplo (ou Advantage+): os vencedores do teste (8–15 anúncios)

RC | {MERCADO} | 3-REMARKETING | ABO             (10–15%)
 ├─ CJ | Iniciou quiz / viu oferta 14 d (exclui compradores 180 d)
 │    └─ IG08 Garantia, IG03 Frete, IG05 Assinatura, AD05/AD09 do lote 1
 └─ CJ | Engajou com o perfil/vídeo 50% 30 d (exclui quem iniciou o quiz)
      └─ IG04 Quiz, IG09 Carrossel
```

Mercados e contas:

| Conta (moeda) | Campanhas | Países no conjunto | Idiomas do anúncio |
|---|---|---|---|
| USD | RC \| US | EUA | EN |
| GBP | RC \| UK | Reino Unido (+ Irlanda num conjunto à parte na conta EUR) | EN |
| EUR | RC \| DACH | Alemanha, Áustria (+ Suíça, mesmo conjunto) | DE (+ EN como idioma extra) |
| EUR (onda 2) | RC \| EU-WEST, RC \| NORDICS | FR, BE, NL, LU, IT, ES, PT / SE, DK, FI, NO | Um anúncio com **todas as traduções** (recurso de idiomas) |
| EUR (onda 3) | RC \| EU-CEE | PL, CZ, SK, HU, RO, BG, GR, HR, SI, EE, LV, LT | Um anúncio com todas as traduções |

> **Recurso de idiomas da Meta:** ao criar o anúncio, em "Idiomas", adicione traduções do texto, título e — se quiser — um vídeo diferente por idioma. A Meta entrega a versão do idioma do celular da pessoa (o mesmo critério do site). Assim, a onda 2 inteira cabe em **uma** campanha.

### 4.4 Segmentação

- **Idade:** 35–65+. **Gênero:** todos (o criativo fala com cada persona). Nada de interesse no início: público amplo + Advantage+ público, com 35+ como sugestão.
- **Exclusões:** compradores dos últimos 180 dias (lista de clientes da Stripe/Supabase ou evento Purchase).
- **Posicionamentos:** Reels, Stories e Feed do Instagram + Reels/Feed do Facebook (Advantage+ posicionamentos). Excluir Audience Network e Messenger no teste.
- **Nunca segmentar por peso, condição de saúde ou "obesidade"** — a Meta não permite, e o produto não é para emagrecimento. Os países com mais obesidade entram pelo mercado (EUA, Reino Unido, Hungria, Malta, Croácia, Golfo), nunca pela mensagem.

### 4.5 Públicos personalizados (criar no dia 0)

| Público | Origem | Janela |
|---|---|---|
| Iniciou o quiz | evento `quiz_start` ou URL `/quiz` | 14 e 30 dias |
| Concluiu o quiz (Lead) | `quiz_complete` | 14 e 30 dias |
| Viu a oferta | URL `/offer` | 7 e 14 dias |
| Iniciou checkout | InitiateCheckout | 7 dias |
| Compradores | Purchase + lista de clientes | 180 dias (exclusão) |
| Engajou com o Instagram | Perfil do Instagram | 30 e 90 dias |
| Viu 50% do vídeo | Visualização de vídeo | 30 dias |
| Semelhante (Lookalike) 1% de compradores | quando houver ≥ 100 compradores no país | — |

### 4.6 Verba (exemplo — ajuste ao CPA que a planilha permitir)

A verba não foi definida. Regra prática: **cada conjunto de teste precisa de verba diária ≥ CPA alvo** para gerar uma leitura em ~3–7 dias. O CPA alvo sai da planilha `metas-kpi.xlsx` (margem de contribuição da 1ª compra) — preencha custo do produto e frete reais.

| Fase | Duração | Exemplo de verba diária | Divisão |
|---|---|---|---|
| Teste (onda 1) | Semanas 1–2 | US$ 300/dia | EUA 50% · Reino Unido 20% · DACH 30%; dentro de cada mercado, 70% teste + 30% remarketing/escala |
| Escala | Semanas 3–6 | +20–30% a cada 3 dias nos conjuntos que batem a meta | Verba migra para quem tem CPA ≤ alvo |
| Onda 2 | A partir da semana 3–4 | +US$ 150–250/dia | Campanha EU-WEST e NORDICS com o que venceu na onda 1 |
| Onda 3 | Semana 6–8 | +US$ 80–150/dia | CEE como laboratório de criativo barato |

*Os valores são um exemplo de proporção, não uma recomendação de investimento. Comece pelo valor que você aceita perder enquanto o funil aprende.*

---

## 5. Instagram orgânico (o que o perfil precisa ter antes dos anúncios)

Quem vê o anúncio clica no perfil antes de comprar. Perfil vazio = conversão baixa.

**Perfil**

- Nome: `RENOVA CELL · Collagen ritual` · @ igual em todos os países (um perfil global em inglês; os anúncios saem traduzidos).
- Bio (EN): "Daily collagen + peptide ritual · No hormones, no stimulants · Free shipping · Delivered in 2 business days · Discreet packaging ↓ Take the 60-sec quiz"
- Link: `/quiz?utm_source=instagram&utm_medium=bio`
- Destaques: **Quiz** · **How to take** · **Free shipping** (2 dias + caixa discreta) · **Subscribe or once** · **Science** (os 3 estudos com ressalva) · **Guarantee** · **FAQ**

**Grade inicial (9 posts antes de ligar os anúncios)**

| # | Formato | Conteúdo |
|---|---|---|
| 1 | Reels | Ritual da manhã (versão orgânica do IG01) |
| 2 | Carrossel | "O que tem — e o que não tem — no RENOVA CELL" (rótulo) |
| 3 | Imagem | Produto + "Free shipping · 2 business days · discreet box" |
| 4 | Reels | Unboxing da caixa neutra (IG03) |
| 5 | Carrossel | "Os 3 estudos que citamos — e o que eles **não** provam" |
| 6 | Reels | Como tomar: café, água, vitamina (3 formas em 15 s) |
| 7 | Carrossel | Compra única × assinatura: como funciona e como cancelar |
| 8 | Reels | Casal: ritual a dois de manhã (IG06) |
| 9 | Imagem | Garantia de 30 dias |

**Ritmo depois do lançamento:** 4 Reels + 2 carrosséis + Stories diários por semana. Stories com enquete ("Café ou vitamina?") e caixa de perguntas alimentam o público de engajamento para o remarketing.

**DM automática:** palavra-chave "QUIZ" nos comentários ou no direct → resposta automática com o link do quiz (ManyChat ou automação nativa do Instagram). Responder comentários em até 2 horas nas primeiras semanas.

**Criadores (parceria paga)**

- Onda 1: 10–20 microcriadores (10–100 mil seguidores) por mercado, 35+, nichos rotina de manhã, bem-estar, casal, "vida depois dos 40".
- Contrato: uso do conteúdo em **anúncio de parceria** por 90 dias, 1 Reels + 3 Stories, direito de editar ganchos, aprovação antes de publicar.
- Brief: só a própria experiência **real** (usou de fato), nada de resultado, nada de libido, nada de "antes e depois".
- Divulgação obrigatória: rótulo "Parceria paga" + EUA/Reino Unido "#ad" · Alemanha "Werbung"/"Anzeige" · França "Publicité" ou "Collaboration commerciale" (e "Image retouchée"/"Image virtuelle" se houver retoque ou IA) · Espanha/Itália "#publicidad"/"#adv".

---

## 6. Criativos para o Instagram — lote 2 (lançamento)

Formatos: Reels/Stories 9:16 (1080×1920), Feed 4:5 (1080×1350), carrossel 1:1 ou 4:5. Legenda queimada sempre. Texto na área segura (longe do topo, da base e da lateral direita).

Cada conceito tem **3 ganchos** (A/B/C) — sobe como 3 anúncios no mesmo conjunto de teste.

**Rodapé por região** (no fim do texto principal e em letra pequena no último frame):

- **EUA:** "Individual results vary. These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease."
- **Europa / Reino Unido:** "Food supplement. Individual results vary. Not a substitute for a varied and balanced diet and a healthy lifestyle." (a versão longa, já traduzida nos 28 idiomas, está em `common.euDisclaimer` no site)

### IG01 — Ritual da manhã · topo · todos os mercados

- **Formato:** Reels 9:16, 15–20 s, estilo celular, som ambiente (café, colher, pássaros) + música da biblioteca comercial.
- **Persona:** mulher 35–50 (versão A) / homem 35–55 (versão B, mesma cena).
- **Ganchos (0–2 s, texto na tela):**
  - A: "My 30-second morning ritual" → *Meu ritual de 30 segundos de manhã* (só com pessoa real ou criadora; com ator use "A 30-second morning ritual")
  - B: "One scoop. Every morning. That's it." → *Uma dose. Toda manhã. Só isso.*
  - C: "The only supplement that fits in my coffee" → *O único suplemento que cabe no meu café* (criadora)
- **Cenas:** colher no pó em câmera lenta (ASMR) → mistura no café → gole na janela → produto na bancada → cartão final.
- **Texto na tela (meio):** "Collagen + peptides · No hormones · No stimulants"
- **Cartão final:** "Free shipping · 2 business days · Take the 60-sec quiz"
- **Texto principal (EN):** "A daily ritual that takes 30 seconds: one serving of collagen + peptides in coffee, water or a smoothie. No hormones, no stimulants. Free shipping, delivered in up to 2 business days in discreet packaging. Take the 60-second quiz to find your plan. [+ Rodapé]"
  - *Um ritual diário de 30 segundos: uma dose de colágeno + peptídeos no café, na água ou na vitamina. Sem hormônios, sem estimulantes. Frete grátis, entrega em até 2 dias úteis em embalagem discreta. Faça o quiz de 60 segundos e descubra o seu plano.*
- **Título:** "Your 30-second daily ritual" · **CTA:** Saiba mais · **UTM:** `utm_content=ig01a|b|c`

### IG02 — "3 coisas que eu olho num rótulo de colágeno" · meio · EUA/Reino Unido/DACH

- **Formato:** Reels 9:16, 25–30 s, pessoa falando para a câmera (criadora ou apresentador da marca, identificado como "not a doctor").
- **Ganchos:** A: "Before you buy collagen, flip the tub." (*Antes de comprar colágeno, vire o pote.*) · B: "3 things on a collagen label nobody checks" · C: "Most collagen ads never show the label. Here's ours."
- **Roteiro:** 1) **Fonte** (bovina/marinha — mostrar no rótulo) 2) **Quantidade por dose** (mostrar o número **real** do rótulo) 3) **O que não tem** (hormônios, estimulantes, açúcar — só se for verdade) → "That's why we show ours." → cartão final.
- **Por que funciona:** transparência num nicho de promessa; não faz alegação de efeito.
- **Depende de:** rótulo final. Sem rótulo, não grave.

### IG03 — Unboxing discreto + 2 dias · meio/fundo · todos os mercados

- **Formato:** Reels/Stories 9:16, 12–15 s, mãos apenas (sem rosto), luz de dia.
- **Ganchos:** A: "Ordered Monday. Here Wednesday." (*Pedi na segunda. Chegou na quarta.*) — **só se for verdade no mercado** · B: "No logo on the box. On purpose." (*Sem logo na caixa. De propósito.*) · C: "Free shipping, 2 days, plain box."
- **Cenas:** caixa neutra na porta → close da caixa sem marca → abre → produto → mistura na água → cartão final.
- **Texto principal (EN):** "Free shipping to [país]. Delivered in up to 2 business days, in a plain box with no product name outside. Buy once or subscribe — cancel anytime. 30-day money-back guarantee. [+ Rodapé]"
- **Uso:** principal criativo de remarketing; ótimo para quem viu a oferta e não comprou (objeção de frete, prazo e privacidade).

### IG04 — O quiz é o anúncio · topo · todos os mercados (melhor para Europa)

- **Formato A:** Stories 9:16 com 3 telas, figurinha de enquete na tela 1 (o anúncio de Stories aceita enquete).
  - Tela 1: "Coffee, water or smoothie?" (enquete)
  - Tela 2: "8 questions. 60 seconds. A plan matched to your answers."
  - Tela 3: "Free shipping · 2 business days · Take the quiz"
- **Formato B:** Reels gravando a tela do celular respondendo o quiz real (rápido, com cliques sonoros) até a tela "Analysis complete".
- **Ganchos:** A: "Answer 8 questions, get your collagen plan" · B: "Which RENOVA CELL plan fits your routine?" · C: "60 seconds. No email needed to see your plan." (o contato é opcional no quiz — confirmar antes de usar)
- **Por que funciona na Europa:** zero alegação de saúde; curiosidade + personalização.

### IG05 — "Chega quando acaba" (assinatura) · meio · EUA, Reino Unido, Nórdicos

- **Formato:** Reels 9:16, 15 s, animação simples de calendário + produto.
- **Ganchos:** A: "It shows up right when you run out." · B: "1 month, 3 months or 6 months — you choose." · C: "Subscribe or buy once. Same price."
- **Roteiro:** calendário → pacote chega no fim do estoque (1 unidade todo mês / Kit 3 a cada 3 meses / Kit 6 a cada 6 meses) → "Cancel anytime from your receipt email" → cartão final.
- **Regra:** sempre dizer "cancel anytime" e mostrar que o preço é o mesmo; nunca esconder a recorrência (FTC "click-to-cancel" nos EUA; diretiva de consumo na UE).

### IG06 — Ritual a dois · topo · todos os mercados

- **Formato:** Reels 9:16, 15–20 s, casal 40–55 na cozinha de manhã, cumplicidade leve (risada, café, um abraço rápido). Selo "Dramatization" se forem atores.
- **Ganchos:** A: "Our morning thing." (*A nossa coisa da manhã.*) · B: "Two mugs. One ritual." · C: "Self-care is better together."
- **Texto principal:** "A daily ritual for two: one serving of collagen + peptides each, in coffee or a smoothie. No hormones, no stimulants. Free shipping in 2 business days, discreet packaging. [+ Rodapé]"
- **Limite:** nada de cama, toque sensual, "spice", "desire", "spark", "performance". A imagem comunica vitalidade; o texto fala só de ritual. É o máximo que o pilar "desejo e vitalidade" pode aparecer em anúncio.

### IG07 — Por que criamos (fundador) · meio · todos

- **Formato:** Reels 9:16, 30–45 s, fundador(a) real falando para a câmera.
- **Ganchos:** A: "I started RENOVA CELL because…" · B: "We left one thing out of our formula on purpose." · C: "Why our box has no logo."
- **Roteiro:** história real (por que o produto existe) → o que tem / não tem → frete grátis e caixa discreta → garantia → quiz.
- **Depende de:** pessoa real disposta a aparecer. **Se não houver, pule** (não use ator fingindo ser fundador).

### IG08 — Garantia de 30 dias · fundo (remarketing)

- **Formato:** imagem 4:5 + versão Stories.
- **Arte:** produto + "30-day money-back guarantee · Free shipping · 2 business days".
- **Texto principal:** "Still thinking about it? Try RENOVA CELL for 30 days. If it's not for you, email us and we'll refund your first order. Free shipping, discreet packaging, delivered in up to 2 business days. [+ Rodapé]"
- **Regra:** não dizer "risk-free" enquanto não estiver confirmado que o reembolso não exige devolução e cobre o frete.

### IG09 — Carrossel "Mitos e fatos do colágeno" · meio · EUA (Europa com versão sem alegação)

- **Formato:** carrossel 4:5, 6 cards, fundo creme e verde da marca.
- **Cards (EUA):** 1) "Collagen: 5 myths, 5 facts" 2) "Myth: results overnight. Fact: studies ran 8–12 weeks." 3) "Myth: all collagen is the same. Fact: studies tested specific formulas — results may not apply to every product." 4) "Myth: it's a hormone thing. Fact: no hormones, no stimulants." 5) "Myth: it's hard to take. Fact: one serving in coffee." 6) "Free shipping · 2 business days · Take the quiz" + rodapé.
- **Versão Europa:** troque os cards 2 e 3 por fatos de uso (formas de tomar, como funciona a assinatura, frete e caixa discreta).

### IG10 — Anúncio de parceria com criador · topo/meio · todos

- **Formato:** o Reels original do criador, impulsionado pela marca (anúncio de parceria: aparece com os dois nomes).
- **Brief para o criador (resumo):** mostrar a rotina real, mostrar a caixa discreta chegando, falar "I've been taking it in my coffee for X weeks" **só se for verdade**, sem resultado, sem antes/depois, sem libido; rótulo de parceria + divulgação do país; 3 ganchos diferentes gravados no início.
- **Teste:** 3 criadores diferentes = 3 conjuntos no teste.

### IG11 — Stories "Isto ou aquilo" · topo · Europa e CEE

- **Formato:** Stories 9:16, 3 telas com figurinha de enquete/teste.
- Tela 1: "Morning coffee or evening smoothie?" (enquete) · Tela 2: "RENOVA CELL fits either. One serving a day." · Tela 3: "Free shipping · 2 business days · Take the 60-sec quiz".
- Barato de produzir, fácil de traduzir para 28 idiomas.

### IG12 — "O que vem na caixa" · fundo · todos

- **Formato:** imagem 4:5 (flat lay de cima): caixa neutra aberta, produto, cartão de boas-vindas, colher.
- **Arte:** "What's in the box" + 4 rótulos: "Your plan (1, 3 or 6 months)" · "Plain outer box" · "Free shipping" · "30-day guarantee".
- **Uso:** remarketing de quem iniciou o checkout e não pagou.

### 6.1 Mapa: conceito × etapa × mercado

| ID | Etapa | EUA | Reino Unido | DACH | Onda 2 | Onda 3 (CEE) |
|---|---|---|---|---|---|---|
| IG01 Ritual | Topo | ✔ | ✔ | ✔ | ✔ | ✔ |
| IG02 Rótulo | Meio | ✔ | ✔ | ✔ | ✔ | — |
| IG03 Unboxing 2 dias | Meio/fundo | ✔ | ✔* | ✔ | ✔* | ✔* |
| IG04 Quiz | Topo | ✔ | ✔ | ✔ | ✔ | ✔ |
| IG05 Assinatura | Meio | ✔ | ✔ | ✔ | Nórdicos | — |
| IG06 Ritual a dois | Topo | ✔ | ✔ | ✔ | ✔ | ✔ |
| IG07 Fundador | Meio | se houver | se houver | se houver | se houver | — |
| IG08 Garantia | Fundo | ✔ | ✔ | ✔ | ✔ | ✔ |
| IG09 Mitos | Meio | ✔ | versão UE | versão UE | versão UE | — |
| IG10 Criador | Topo/meio | ✔ | ✔ | ✔ | ✔ | — |
| IG11 Isto ou aquilo | Topo | — | — | ✔ | ✔ | ✔ |
| IG12 O que vem na caixa | Fundo | ✔ | ✔ | ✔ | ✔ | ✔ |

\* só com o prazo de 2 dias comprovado nesse país.

**Primeira semana de teste por mercado (5 conceitos × 3 ganchos = 15 anúncios):** IG01, IG03, IG04, IG06, IG10. Remarketing: IG08 + IG12 + IG03.

### 6.2 Localização dos ganchos (onda 1 e 2)

| Gancho (EN) | DE | FR | ES | IT | NL | SV | PT |
|---|---|---|---|---|---|---|---|
| One scoop. Every morning. That's it. | Ein Löffel. Jeden Morgen. Das war's. | Une dose. Chaque matin. C'est tout. | Una dosis. Cada mañana. Y ya. | Una dose. Ogni mattina. Tutto qui. | Eén schep. Elke ochtend. Klaar. | En skopa. Varje morgon. Klart. | Uma dose. Toda manhã. Só isso. |
| No logo on the box. On purpose. | Kein Logo auf dem Karton. Mit Absicht. | Aucun logo sur le colis. Exprès. | Sin logo en la caja. A propósito. | Nessun logo sulla scatola. Di proposito. | Geen logo op de doos. Expres. | Ingen logga på kartongen. Med flit. | Sem logo na caixa. De propósito. |
| Free shipping · 2 business days | Kostenloser Versand · max. 2 Werktage | Livraison gratuite · 2 jours ouvrés max. | Envío gratis · máx. 2 días hábiles | Spedizione gratuita · max 2 giorni lavorativi | Gratis verzending · binnen 2 werkdagen | Fri frakt · inom 2 arbetsdagar | Frete grátis · até 2 dias úteis |
| 8 questions. 60 seconds. Your plan. | 8 Fragen. 60 Sekunden. Dein Plan. | 8 questions. 60 secondes. Votre plan. | 8 preguntas. 60 segundos. Tu plan. | 8 domande. 60 secondi. Il tuo piano. | 8 vragen. 60 seconden. Jouw plan. | 8 frågor. 60 sekunder. Din plan. | 8 perguntas. 60 segundos. Seu plano. |
| Two mugs. One ritual. | Zwei Tassen. Ein Ritual. | Deux tasses. Un rituel. | Dos tazas. Un ritual. | Due tazze. Un rituale. | Twee mokken. Eén ritueel. | Två muggar. Ett ritual. | Duas canecas. Um ritual. |
| Subscribe or buy once. Same price. | Abo oder einmalig. Gleicher Preis. | Abonnement ou achat unique. Même prix. | Suscríbete o compra una vez. Mismo precio. | Abbonamento o acquisto singolo. Stesso prezzo. | Abonnement of eenmalig. Zelfde prijs. | Prenumerera eller köp en gång. Samma pris. | Assine ou compre uma vez. Mesmo preço. |
| 30-day money-back guarantee | 30 Tage Geld-zurück-Garantie | Satisfait ou remboursé 30 jours | Garantía de devolución de 30 días | Soddisfatti o rimborsati 30 giorni | 30 dagen geld-terug-garantie | 30 dagars pengarna-tillbaka-garanti | Garantia de 30 dias ou seu dinheiro de volta |

Para os demais idiomas (onda 3), use o mesmo texto que já está nos dicionários do site (`site/lib/i18n/*.ts` → `offer.shipping`, `offer.pricing`, `offer.guarantee`) — já revisados quanto a marcas e números.

**Vídeo por idioma:** grave a versão em inglês sem fala da atriz (só locução + texto). Depois troque locução e legenda por idioma (HeyGen tradução de vídeo ou locutor nativo). Avatar de IA só como "brand presenter" identificado, **nunca** como cliente.

---

## 7. Cronograma de lançamento

| Quando | Entregas |
|---|---|
| **D-21 a D-14** | Fechar 3PL nos EUA e na Alemanha (e solução para Reino Unido); rótulo final; **fórmula**; custos na planilha; Business Manager + contas + domínio; API de Conversões; contratar 10–20 criadores por mercado |
| **D-14 a D-7** | Gravar IG01, IG03, IG04, IG06, IG08, IG12 (+ IG02/IG07 se houver rótulo/fundador); receber conteúdo dos criadores; publicar a grade de 9 posts; destaques |
| **D-7 a D-3** | Teste de entrega real: 5–10 pedidos para endereços em cada país da onda 1, medir dias úteis; testar o funil com cartão de teste e eventos; revisar landing com a lista da seção 10.3 |
| **D-2** | Subir tudo **pausado**; revisão final de políticas; definir `SHIP_COUNTRIES` da onda 1 |
| **D0** | Ligar teste + remarketing em EUA, Reino Unido e DACH; criadores publicam no mesmo dia (prova social orgânica) |
| **D+3** | Primeira leitura de gancho (seção 8); corte dos piores |
| **D+7** | Primeira leitura de custo por quiz e por compra; 3–5 conceitos novos |
| **D+10 a D+14** | Campanha de escala com os vencedores; lookalike se ≥100 compradores |
| **D+21 a D+28** | Onda 2 (após teste de entrega), anúncios com traduções |
| **D+42 a D+56** | Onda 3 (CEE); onda 4 só com estoque local ou prazo por país |
| **Todo mês** | Relatório por país em `08-relatorios/` (MER, CPA, assinaturas ativas, cancelamentos, reembolsos) |

---

## 8. Métricas e metas de leitura

| Métrica | Fórmula | Referência inicial* | Se estiver abaixo |
|---|---|---|---|
| Taxa de gancho | visualizações de 3 s ÷ impressões | ≥ 25–30% | Trocar os 2 primeiros segundos |
| Retenção | ThruPlay (ou 15 s) ÷ 3 s | ≥ 20–25% | Encurtar, cortar o meio |
| CTR no link | cliques no link ÷ impressões | ≥ 0,8–1,2% | Cartão final e CTA mais claros |
| Página → quiz | `quiz_start` ÷ visualizações da página | ≥ 60% | Velocidade do site; promessa do anúncio × primeira tela |
| Quiz concluído | `quiz_complete` ÷ `quiz_start` | ≥ 55–65% | Perguntas, ordem, tempo |
| Oferta → checkout | InitiateCheckout ÷ ViewContent | ≥ 10–15% | Preço, selos de frete/garantia, prova |
| Checkout → compra | Purchase ÷ InitiateCheckout | ≥ 40–50% | Página da Stripe, métodos de pagamento |
| **CPA** | gasto ÷ compras (Stripe) | ≤ CPA alvo da planilha | Regras da seção 9 |
| **MER por país** | receita Stripe ÷ gasto total | ≥ meta de margem | Cortar mercado / onda |
| Assinaturas | % de pedidos com assinatura | acompanhar | Ajustar destaque do seletor |

\* Referências de partida para calibrar, não metas garantidas — o projeto ainda não tem histórico. Depois de 2 semanas, troque pelos números reais de cada país.

**Fonte da verdade:** compras e receita sempre pela Stripe/Supabase (por `utm_campaign`/`utm_content`), não pelo Gerenciador de Anúncios — a Meta perde quem não aceitou cookies e, no caminho B, não otimiza por compra.

---

## 9. Regras de decisão (teste e escala)

**Corte (por anúncio, após gasto ≥ 1× CPA alvo):**
- Gancho < 20% e CTR < 0,6% → pausar.
- Zero quiz concluído com gasto ≥ 1× CPA alvo → pausar.

**Corte (por conjunto, após gasto ≥ 2× CPA alvo):**
- Nenhuma compra → pausar.
- CPA > 1,5× alvo após 3× CPA alvo de gasto → pausar.

**Vencedor:** CPA ≤ alvo com ≥ 3 compras (ou, no caminho B, custo por quiz concluído ≤ meta e ≥ 1 compra por UTM) → duplica para a campanha de escala.

**Escala:** +20–30% de verba a cada 72 h enquanto o CPA ficar ≤ alvo. Se o CPA subir > 30% por 3 dias, volta um degrau.

**Renovação de criativo:** frequência > 3 em 7 dias no remarketing ou > 2 no topo, ou CTR caindo 30% da média → entram conceitos novos. Proporção semanal: ~70% verba nos vencedores, ~30% em teste.

**Não mexer** em conjunto em fase de aprendizado (sem editar público, verba > 30%, criativo) nos primeiros 3 dias.

---

## 10. Compliance por região (resumo de trabalho — reconferir antes de subir)

### 10.1 Meta (todas as regiões)
- **Atributos pessoais:** nunca "você está com rugas / acima de 40 / cansado(a)". Idade e gênero só na segmentação.
- **Antes/depois, close de "defeito", autoimagem negativa:** proibidos.
- **Saúde sexual:** anúncio focado em desempenho/prazer sexual é proibido → libido fora de todos os anúncios.
- **Peso:** nada de emagrecimento, corpo, balança.
- **Público 18+** (usamos 35+).

### 10.2 Alegações de saúde
- **EUA (FTC/FDA):** estrutura/função com prova; rodapé da FDA; estudos sempre com ressalva; nada de doença.
- **UE e Reino Unido (Reg. 1924/2006 e registro britânico):** **só alegações autorizadas, ligadas a um nutriente presente em quantidade significativa.** O colágeno em si não tem alegação autorizada. Exemplos autorizados úteis **se a fórmula tiver o nutriente**:
  - Vitamina C → "contributes to normal collagen formation for the normal function of the skin"
  - Zinco → "contributes to the maintenance of normal skin" e "contributes to the maintenance of normal testosterone levels in the blood"
  - Biotina → "contributes to the maintenance of normal skin and hair"
  - Vitaminas B6/B12, magnésio, ferro → "contribute to the reduction of tiredness and fatigue"
  - Sem a fórmula, o anúncio europeu fica em ritual, conveniência, entrega e garantia.
- **Citação de estudos na UE:** referência a estudo que sugere efeito do produto também conta como alegação → nos anúncios europeus, não citar os estudos (eles ficam só na landing, com ressalva).

### 10.3 Landing page vista pelo revisor da Meta
- O pilar **"Desire & vitality"** é o trecho mais arriscado para a revisão automática. Opção recomendada: mostrar esse pilar só para quem chega pelo quiz orgânico/e-mail e uma versão neutra ("Feel good in your body") para tráfego pago — posso deixar isso como chave no site.
- Conferir que nenhuma página promete "rejuvenescer", "anti-aging" ou prazo de resultado.

### 10.4 Consumidor
- **Assinatura:** recorrência, preço e como cancelar ditos antes do pagamento (já está no site); cancelamento tão fácil quanto a contratação (EUA e UE).
- **Prazo de 2 dias úteis:** é promessa. Se um país não cumprir, troque a promessa daquele país antes de anunciar.
- **Influenciadores:** divulgação conforme o país (seção 5).

---

## 11. Pendências que dependem de você

| # | Pendência | Impacto |
|---|---|---|
| 1 | **Fórmula/ingredientes e rótulo** | Libera alegações aprovadas na Europa (vitamina C, zinco, vitaminas B) e os criativos IG02/IG09 |
| 2 | **Onde fica o estoque** (EUA, Alemanha, Reino Unido?) | Define as ondas e se o "2 dias úteis" é verdadeiro em cada país |
| 3 | **Custo do produto e do frete** | Planilha calcula o CPA alvo e a verba |
| 4 | **Verba mensal** | Divisão por mercado da seção 4.6 |
| 5 | **Fundador(a) disposto(a) a aparecer?** | IG07 |
| 6 | **Reembolso exige devolução? Cobre frete?** | Libera "risk-free" |
| 7 | **Formato físico** (pó, sachê, cápsula) | Todas as cenas supõem pó misturado na bebida |

## 12. Itens técnicos no site (feitos em 17/10/2026)

1. ✅ API de Conversões da Meta a partir do webhook da Stripe (respeita o consentimento: Europa só com aceite).
2. ✅ UTMs salvas no quiz e no pedido (coluna `utm`), leitura por criativo sem depender do pixel.
3. ✅ Versão neutra para quem vem de anúncio (`AD_SAFE_MODE`), sem os textos de "desejo" no HTML.
4. ✅ Prazo por país (`FAST_DELIVERY_COUNTRIES` + `STANDARD_DELIVERY_DAYS`). Na onda 1: `FAST_DELIVERY_COUNTRIES=US,GB,IE,DE,AT,CH,LI`.
5. ✅ Planilha `metas-kpi.xlsx` no modelo novo (assinatura opcional em todos os planos com a premissa "% que assina", Kit 6 a cada 6 meses, upsell 2 trimestral, frete grátis como custo da empresa).

---

### Fontes consultadas (17/10/2026)

- Restrições de saúde e bem-estar da Meta: [JetFuel](https://jetfuel.agency/meta-health-wellness-ad-restrictions-2026/), [PixelFlow](https://docs.pixelflow.so/troubleshooting/what-are-meta-s-health-and-wellness-restrictions-and-how-do-they-affect-tracking-ce3t3), [Accelerated Digital Media](https://www.accelerateddigitalmedia.com/insights/guide-to-social-media-health-ad-restrictions-2026/), [Aimerce](https://www.aimerce.ai/blogs/what-metas-health-wellness-ad-policy-actually-allows)
- Estrutura de campanhas e teste de criativos: [ATTN Agency](https://www.attnagency.com/blog/meta-advantage-plus-shopping-2026-campaign-structure-optimization), [Bïrch](https://bir.ch/blog/meta-ad-creative-testing-framework), [Flighted](https://www.flighted.co/blog/meta-ads-best-practices), [1ClickReport](https://www.1clickreport.com/blog/advantage-plus-shopping-best-practices-2026)
- Custos no Instagram: [AdsUploader](https://adsuploader.com/blog/instagram-ads-cost), [Top Growth Marketing](https://topgrowthmarketing.com/instagram-ads-cost/), [AdManage](https://admanage.ai/blog/how-much-do-instagram-ads-cost)
- Mercado de colágeno: [Foodcom](https://foodcom.pl/en/collagen-market-overview-global-report/), [Ringly](https://www.ringly.io/discover/collagen-statistics-2026)

As fontes de terceiros (agências, ferramentas) foram usadas como direção, não como regra. Antes de subir, confira as páginas oficiais: Padrões de Publicidade da Meta, registro de alegações da UE (EU Register of nutrition and health claims) e do Reino Unido, e as orientações da FTC.
