# Criativos de anúncio — RENOVA CELL · Lote 1 (EUA)

> **Status:** rascunho para aprovação do cliente · **Data:** 16/10/2026 · **Mercado:** EUA (anúncios em inglês)
> **Lote:** 15 criativos — 6 Meta Reels/Stories (vídeo 9:16), 4 Meta Feed (imagem ou carrossel), 5 TikTok In-Feed (vídeo 9:16)

**Como ler este documento**

- Tudo o que vai ao ar está em **inglês**, entre aspas ou em bloco de citação. A tradução em português aparece logo abaixo, *em itálico*, só para o cliente acompanhar. **A tradução não vai ao ar.**
- Direção de cena, rótulos e explicações estão em português.
- `SEU_DOMINIO` deve ser trocado pelo domínio do funil antes de subir.
- A copy segue a landing (`site/lib/i18n/en.ts`) e os roteiros de VSL (`site/lib/vsl-scripts.ts`). Os ângulos vêm de `03-estrategia/estrategia.md`.

---

## Oferta: só estes números podem aparecer

| Item | Condição (fonte: `site/lib/products.ts` e `en.ts`) | Como escrever no anúncio |
|---|---|---|
| 1 unidade | US$ 29,90 | "1 unit — $29.90" |
| Kit 3 | US$ 80, pagamento único, ciclo de 90 dias | "Kit 3 — the 90-day cycle, $80 one-time" |
| Kit 6 | US$ 140 cobrados todo mês, cancela quando quiser | "Kit 6 — $140/month, cancel anytime" |
| Cupom | RENOVA10 = 10% de desconto no primeiro pagamento | "Code RENOVA10: 10% off your first payment" |
| Garantia | 30 dias, reembolso do primeiro pedido (`/terms`) | "30-day money-back guarantee" (nos anúncios de garantia: "on your first order") |

O order bump (+1 unidade por US$ 19,90) e os upsells (Kit 6 avulso por US$ 77; Kit 3 mensal por US$ 56) só existem depois da compra. **Nunca aparecem em anúncio.**

---

## Regras que todos os criativos seguem

> **Atenção:** este é um resumo de trabalho feito em 16/10/2026. As plataformas mudam as regras com frequência. **Antes de subir, reconfira as versões atuais:** Padrões de Publicidade da Meta (atributos pessoais; saúde e aparência; suplementos; conteúdo de marca), Políticas de Publicidade do TikTok (setor de suplementos alimentares; divulgação de conteúdo de marca), Guias de Endosso da FTC (16 CFR Parte 255) e o *Health Products Compliance Guidance* da FTC.

**1. Atributos pessoais (Meta; mesma postura no TikTok)**

- Nunca afirmar nem sugerir idade, condição de saúde, aparência, gênero ou qualquer outro atributo pessoal de quem assiste.
- Proibido: "Are you over 50?", "Your joint pain…", "your skin", "your wrinkles", "Tired of feeling old?", ou qualquer "you/your" + condição.
- Permitido: falar das pessoas em geral ("the body", "skin", "everyone") ou em primeira pessoa, por alguém identificado (criadora paga) e só com o que for verdade.
- "You/your" só aparece com coisas neutras: "your answers", "your plan", "your first payment", "your order".
- Idade e gênero ficam **na segmentação** do conjunto de anúncios, nunca no texto.

| Não escrever | Escrever |
|---|---|
| "Are you over 50? Your joints need this." | "Tendons and cartilage are made largely of collagen." |
| "Your skin is losing firmness." | "Skin changes with time. Everyone's does." |
| "Women 40+: fix your skin." | (idade só na segmentação) "A daily ritual for skin and well-being." |

**2. Saúde e aparência (Meta e TikTok)**

- Sem antes/depois, tela dividida, "Day 1 vs Day 90" ou montagem que sugira mudança física com o tempo.
- Sem close em rugas, pescoço, olheiras ou articulações; ninguém belisca a pele, faz careta de dor ou segura o joelho.
- Nada que gere autoimagem negativa ("hate the mirror", "embarrassed", "old").
- Sem resultado irreal: modelos com pele real (sem retoque pesado); nunca "look 10 years younger", "anti-aging", "glow in 7 days".
- Público sempre 18+ (este lote usa 35+).

**3. Suplementos no TikTok**

- O TikTok trata suplementos alimentares como categoria restrita: depende do país, exige público 18+ e proíbe alegação de cura ou tratamento, efeito rápido ou exagerado, antes/depois e foco em peso; suplementos de "desempenho sexual" são proibidos. Confirme a página do setor antes de subir.
- Música só da Biblioteca de Música Comercial do TikTok (na Meta, da Coleção de Sons). Nada de som em alta com direitos.
- Texto do anúncio com no máximo 100 caracteres e sem emoji (confirmar o limite atual).
- No TikTok In-Feed não existem os campos "título" e "descrição". Neste documento, o **título** vira o texto grande do cartão final e a **descrição** vira a linha pequena do cartão final.

**4. FTC: depoimentos, atores e criadores**

- Nenhum depoimento, avaliação, nota em estrelas ou "cliente real". O site ainda não tem nenhum (`site/content/proof.ts` está vazio de propósito).
- Se aparece ator ou modelo: selo **"Dramatization"** na tela durante todo o vídeo (em imagem, **"Paid models"**). O ator nunca fala como cliente ("I've been using it…").
- Se aparece criador: rótulo "Paid partnership" ligado (ferramenta de conteúdo de marca da Meta / divulgação de conteúdo do TikTok), "#ad" no texto, e a parceria paga dita **em voz e na tela** nos primeiros segundos. O criador só fala da própria experiência se for verdade (usou de fato) e nunca fala de resultado.
- Ninguém é médico: sem jaleco, estetoscópio, consultório, "Dr.", "expert" ou "nutritionist". Apresentador pago aparece como "not a doctor".

**5. Regras da casa (FTC / FDA / ANVISA / CONAR)**

- Só linguagem de estrutura e função: pele, articulações, bem-estar. Nunca tratar, curar ou prevenir doença (artrite, osteoporose etc.).
- Nunca hormônio (testosterona, estrogênio) nem desejo ou disfunção sexual. A opção "Low desire / vitality" do quiz **não entra em anúncio**. "No hormones" é permitido (descreve a fórmula, não promete efeito).
- Sem prazo prometido. A duração dos estudos só aparece como fato do estudo ("the study ran 8 weeks"), nunca como "results in 8 weeks".
- Só três estudos podem ser citados (Proksch 2014, Clark 2008, Pu 2023), sempre com a ressalva "tested specific formulas; results may not apply to every product, including ours". Nunca dizer que o RENOVA CELL usa a mesma dose ou fórmula dos estudos: a dose por porção não está documentada no projeto.
- Sem estatística inventada. O "~1% a menos de colágeno por ano" da landing é uma média citada sem fonte entre os três estudos, então **não usamos esse número em anúncio**. O máximo é "the body makes less collagen with age".
- Sem "risk-free" / "risco zero" no texto até confirmar que o reembolso cobre o frete e não exige devolução. Usamos "30-day money-back guarantee".
- Sem escassez ou urgência falsa ("only today", "almost sold out"): nada disso existe na oferta.

**6. Rodapé obrigatório**

Vai no fim de todo texto principal da Meta, na arte do último card ou da imagem estática e em letra pequena no cartão final de todo vídeo (no TikTok, só no cartão final, porque não cabe nos 100 caracteres). É o mesmo texto da landing (`common.resultsVary` + `common.fdaDisclaimer`).

> "Individual results vary. These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease."
>
> *Os resultados variam de pessoa para pessoa. Estas declarações não foram avaliadas pela FDA (agência americana de alimentos e medicamentos). Este produto não se destina a diagnosticar, tratar, curar ou prevenir nenhuma doença.*

Nos criativos abaixo, **[+ Rodapé obrigatório]** indica onde colar esse texto.

**7. Produção (resumo)**

- Vídeo 9:16 em 1080×1920; Feed em 4:5 (1080×1350); carrossel em 1:1 (1080×1080).
- Legenda queimada em todo vídeo (muita gente assiste sem som).
- Texto sempre no centro da tela, longe do topo, da base (legenda e botão) e da lateral direita (ícones). Confira o modelo de área segura de cada plataforma.
- As cenas supõem uma dose misturada na bebida, como descreve o site. **Confirme com o cliente o formato físico (pó, sachê), a embalagem real e o rótulo antes de filmar.**

---

## Mapa dos 15 criativos

| ID | Plataforma e formato | Duração | Persona | Ângulo | Etapa |
|---|---|---|---|---|---|
| AD01 | Meta Reels/Stories — vídeo 9:16 | 20–25 s | Mulher 35–50 | 1. Espelho | Topo |
| AD02 | Meta Reels — vídeo 9:16 | 25–30 s | Homem 35–55 | 3. Ciência honesta | Meio |
| AD03 | Meta Reels — vídeo 9:16 | 25 s | 50+ unissex | 4. Articulações e movimento | Meio |
| AD04 | Meta Reels — vídeo 9:16 | 25 s | Mulher 35–50 | 2. Constância | Meio |
| AD05 | Meta Stories — vídeo 9:16 (3 telas) | 15 s | 50+ unissex | 5. Garantia de 30 dias | Fundo (remarketing) |
| AD06 | Meta Reels/Stories — vídeo 9:16 | 15 s | Homem 35–55 | 2. Constância | Meio |
| AD07 | Meta Feed — carrossel 1:1, 5 cards | — | Mulher 35–50 | 3. Ciência honesta | Meio |
| AD08 | Meta Feed — imagem única 4:5 | — | 50+ unissex | 4. Articulações e movimento | Meio |
| AD09 | Meta Feed — imagem única 4:5 | — | Homem 35–55 | 5. Garantia de 30 dias | Fundo (remarketing) |
| AD10 | Meta Feed — carrossel 1:1, 5 cards | — | 50+ unissex | 2. Constância | Meio |
| AD11 | TikTok In-Feed — vídeo 9:16 (Spark Ad de criadora) | 25–30 s | Mulher 35–50 | 1. Espelho | Topo |
| AD12 | TikTok In-Feed — vídeo 9:16 | 25 s | Homem 35–55 | 1. Espelho | Topo |
| AD13 | TikTok In-Feed — vídeo 9:16 | 30–35 s | 50+ unissex | 3. Ciência honesta | Meio |
| AD14 | TikTok In-Feed — vídeo 9:16 | 25–28 s | Homem 35–55 | 4. Articulações e movimento | Meio |
| AD15 | TikTok In-Feed — vídeo 9:16 | 20–22 s | Mulher 35–50 | 5. Garantia de 30 dias | Fundo (remarketing) |

Cada persona tem 5 criativos e cada ângulo tem 3.

> **Nota sobre a persona 50+:** no quiz, a persona sênior (plano Kit 6) é atribuída a quem marca **55+**; quem tem 50–54 cai nas personas mulher ou homem (Kit 3). Isso não muda os anúncios, porque todos levam ao quiz e o quiz escolhe o plano. Só não prometa "Kit 6" para quem tem 50–54.

### UTMs

Padrão: `https://SEU_DOMINIO/quiz?utm_source={meta|tiktok}&utm_medium=paid&utm_campaign={campanha}&utm_content=adNN`

| utm_campaign | Ângulo / etapa | Criativos |
|---|---|---|
| `rc-us-topo-espelho` | Espelho, topo | AD01, AD11, AD12 |
| `rc-us-meio-constancia` | Constância, meio | AD04, AD06, AD10 |
| `rc-us-meio-ciencia` | Ciência honesta, meio | AD02, AD07, AD13 |
| `rc-us-meio-articulacoes` | Articulações e movimento, meio | AD03, AD08, AD14 |
| `rc-us-fundo-garantia` | Garantia de 30 dias, fundo | AD05, AD09, AD15 |

---

## Criativos

### AD01 — Meta Reels · Mulher 35–50 · Espelho

| Campo | |
|---|---|
| Plataforma / posicionamento | Meta — Instagram Reels e Facebook Reels (também roda em Stories) |
| Formato / duração | Vídeo 9:16, legendas queimadas · 20–25 s |
| Persona | Mulher 35–50 |
| Ângulo | 1. Espelho (topo), reescrito em terceira pessoa e em tom positivo: o anúncio não pode dizer "a sua pele mudou" |

**Gancho (0–3 s)**

Cena: mulher de ~42 anos em plano médio (rosto e ombros, sem zoom), sorrindo para o espelho enquanto prende o cabelo; luz natural da manhã. Selo fixo no canto superior durante todo o vídeo: "Dramatization".

> "Skin changes with time. That's not a flaw."
>
> *A pele muda com o tempo. Isso não é defeito.*

**Roteiro**

**0–3 s** — Cena do gancho.

- Texto na tela: "Skin changes with time. That's not a flaw."

  *A pele muda com o tempo. Isso não é defeito.*
- Locução (voz feminina calma, da marca; a atriz não fala): "Skin changes with time. Everyone's does."

  *A pele muda com o tempo. A de todo mundo muda.*

**3–8 s** — Cozinha. Ela mistura uma dose de RENOVA CELL no café. Close no produto e na caneca, não no rosto.

- Texto na tela e locução: "Collagen is the protein that gives skin its structure."

  *O colágeno é a proteína que dá estrutura à pele.*

**8–14 s** — Ela toma o café na varanda, tranquila.

- Texto na tela: "1 serving a day · coffee, water or a smoothie"

  *1 dose por dia · café, água ou vitamina*
- Locução: "RENOVA CELL turns it into a daily ritual: one serving, in coffee, water or a smoothie."

  *O RENOVA CELL transforma isso num ritual diário: uma dose, no café, na água ou na vitamina.*

**14–19 s** — Pack shot na bancada.

- Texto na tela e locução: "Collagen peptides plus a peptide blend. No hormones. No stimulants."

  *Peptídeos de colágeno mais um blend de peptídeos. Sem hormônios. Sem estimulantes.*

**19–25 s** — Cartão final: logo, produto e botão.

- Texto na tela: "Take the quick quiz · Get a plan matched to your answers"

  *Faça o quiz rápido · Receba um plano de acordo com as suas respostas*
- Texto na tela: "30-day money-back guarantee"

  *Garantia de 30 dias ou seu dinheiro de volta*
- Locução: "Take the quick quiz and get a plan matched to your answers."

  *Faça o quiz rápido e receba um plano de acordo com as suas respostas.*
- [+ Rodapé obrigatório]

**Texto principal**

> "Skin changes with time. Everyone's does, and that's okay."
>
> *A pele muda com o tempo. A de todo mundo muda, e tudo bem.*
>
> "RENOVA CELL is a daily collagen + peptide formula: one serving a day in coffee, water or a smoothie. No hormones, no stimulants."
>
> *O RENOVA CELL é uma fórmula diária de colágeno + peptídeos: uma dose por dia no café, na água ou na vitamina. Sem hormônios, sem estimulantes.*
>
> "Take the quick quiz (8 questions, about 60 seconds) and get a plan matched to your answers. 30-day money-back guarantee."
>
> *Faça o quiz rápido (8 perguntas, cerca de 60 segundos) e receba um plano de acordo com as suas respostas. Garantia de 30 dias ou seu dinheiro de volta.*
>
> [+ Rodapé obrigatório]

**Título:** "A daily ritual for skin and well-being"

*Um ritual diário para a pele e o bem-estar*

**Descrição:** "8 questions · about 60 seconds"

*8 perguntas · cerca de 60 segundos*

**Botão (CTA):** Learn More (*Saiba mais*)

**URL de destino:** `https://SEU_DOMINIO/quiz?utm_source=meta&utm_medium=paid&utm_campaign=rc-us-topo-espelho&utm_content=ad01`

**Compliance:** fala da pele de todo mundo, não da de quem assiste; sem antes/depois, sem close em "defeito" e sem promessa ou prazo; a atriz aparece sinalizada como dramatização.

---

### AD02 — Meta Reels · Homem 35–55 · Ciência honesta

| Campo | |
|---|---|
| Plataforma / posicionamento | Meta — Instagram Reels e Facebook Reels |
| Formato / duração | Vídeo 9:16, legendas queimadas · 25–30 s |
| Persona | Homem 35–55 |
| Ângulo | 3. Ciência honesta (meio): o que os estudos mediram, com os limites |

**Gancho (0–3 s)**

Cena: homem de ~45 anos amarra o tênis na porta de casa, ao amanhecer. Selo fixo: "Dramatization".

> "What collagen research actually measured. No hype."
>
> *O que as pesquisas com colágeno mediram de verdade. Sem exagero.*

**Roteiro**

**0–3 s** — Cena do gancho. Texto na tela e locução (voz masculina da marca; o ator não fala): mesma frase do gancho.

**3–11 s** — Corrida leve pelo bairro, em cortes rápidos. Texto simples sobre o vídeo (sem laboratório, sem jaleco).

- Texto na tela: "Athletes · 10 g/day of collagen hydrolysate · 24 weeks → less activity-related joint pain vs. placebo"

  *Atletas · 10 g/dia de colágeno hidrolisado · 24 semanas → menos dor articular ligada à atividade do que o placebo*
- Texto pequeno: "Clark et al., Curr Med Res Opin, 2008"
- Locução: "In a 24-week study, athletes taking 10 grams a day of collagen hydrolysate reported less activity-related joint pain than placebo."

  *Em um estudo de 24 semanas, atletas que tomaram 10 gramas por dia de colágeno hidrolisado relataram menos dor articular ligada à atividade do que o grupo placebo.*

**11–17 s** — Volta para casa, alongamento leve no quintal.

- Texto na tela: "26 randomized trials · 1,721 participants → better skin hydration and elasticity vs. placebo"

  *26 estudos randomizados · 1.721 participantes → mais hidratação e elasticidade da pele do que o placebo*
- Texto pequeno: "Pu et al., Nutrients, 2023"
- Locução: "A 2023 review of 26 trials found better skin hydration and elasticity than placebo."

  *Uma revisão de 2023 com 26 estudos encontrou mais hidratação e elasticidade da pele do que o placebo.*

**17–21 s** — Tela limpa, só texto.

- Texto na tela e locução: "The fine print: those studies tested specific formulas. Results may not apply to every product, including ours."

  *As letras miúdas: esses estudos testaram fórmulas específicas. Os resultados podem não valer para todo produto, inclusive o nosso.*

**21–26 s** — Cozinha. Ele mistura uma dose de RENOVA CELL no shake.

- Texto na tela: "RENOVA CELL · daily collagen + peptides · no stimulants, no hormones"

  *RENOVA CELL · colágeno + peptídeos todo dia · sem estimulantes, sem hormônios*
- Locução: "RENOVA CELL is a daily collagen and peptide formula. One serving a day."

  *O RENOVA CELL é uma fórmula diária de colágeno e peptídeos. Uma dose por dia.*

**26–30 s** — Cartão final.

- Texto na tela: "Take the quick quiz · 30-day money-back guarantee"

  *Faça o quiz rápido · Garantia de 30 dias ou seu dinheiro de volta*
- Locução: "Take the quick quiz to see the plan matched to your answers."

  *Faça o quiz rápido para ver o plano de acordo com as suas respostas.*
- [+ Rodapé obrigatório]

**Texto principal**

> "What collagen research actually measured:"
>
> *O que as pesquisas com colágeno mediram de verdade:*
>
> "• Athletes, 10 g/day of collagen hydrolysate, 24 weeks: less activity-related joint pain vs. placebo (Clark et al., 2008)."
>
> *• Atletas, 10 g/dia de colágeno hidrolisado, 24 semanas: menos dor articular ligada à atividade do que o placebo (Clark et al., 2008).*
>
> "• 26 randomized trials, 1,721 participants: better skin hydration and elasticity vs. placebo (Pu et al., 2023)."
>
> *• 26 estudos randomizados, 1.721 participantes: mais hidratação e elasticidade da pele do que o placebo (Pu et al., 2023).*
>
> "Those studies tested specific formulas, so results may not apply to every product, including ours."
>
> *Esses estudos testaram fórmulas específicas, então os resultados podem não valer para todo produto, inclusive o nosso.*
>
> "RENOVA CELL is a daily collagen + peptide formula for joints, skin and well-being. Take the quick quiz to see the plan matched to your answers."
>
> *O RENOVA CELL é uma fórmula diária de colágeno + peptídeos para articulações, pele e bem-estar. Faça o quiz rápido para ver o plano de acordo com as suas respostas.*
>
> [+ Rodapé obrigatório]

**Título:** "Collagen research, minus the hype"

*Pesquisa sobre colágeno, sem exagero*

**Descrição:** "Sources on screen"

*Fontes na tela*

**Botão (CTA):** Learn More (*Saiba mais*)

**URL de destino:** `https://SEU_DOMINIO/quiz?utm_source=meta&utm_medium=paid&utm_campaign=rc-us-meio-ciencia&utm_content=ad02`

**Compliance:** cita dois dos três estudos aprovados exatamente como publicados e com a ressalva de fórmula específica; nada é prometido a quem assiste; ninguém aparece como médico; o ator é sinalizado como dramatização.

---

### AD03 — Meta Reels · 50+ unissex · Articulações e movimento

| Campo | |
|---|---|
| Plataforma / posicionamento | Meta — Instagram Reels e Facebook Reels |
| Formato / duração | Vídeo 9:16, legendas queimadas, letra grande · 25 s |
| Persona | 50+ unissex |
| Ângulo | 4. Articulações e movimento (meio) |

**Gancho (0–3 s)**

Cena: mulher de ~62 anos calça o tênis de caminhada; homem de ~65 abre a porta para o cachorro; os dois saem rindo. Selo fixo: "Dramatization".

> "Moving every day is a habit. Collagen can be one too."
>
> *Se mexer todo dia é um hábito. O colágeno também pode ser.*

**Roteiro**

**0–3 s** — Cena do gancho. Texto na tela e locução (voz calma da marca): mesma frase do gancho.

**3–9 s** — Caminhada no parque, jardinagem, dança na cozinha. Tudo alegre: sem careta, sem mão no joelho.

- Texto na tela e locução: "Collagen is the protein that gives structure to cartilage, tendons and skin."

  *O colágeno é a proteína que dá estrutura à cartilagem, aos tendões e à pele.*

**9–14 s** — Os dois tomam café da manhã ao ar livre.

- Texto na tela e locução: "With age, the body makes less of it."

  *Com a idade, o corpo produz menos dele.*

**14–20 s** — Ela mexe uma dose no chá.

- Texto na tela: "1 serving a day · coffee, tea, water or a smoothie · no stimulants, no hormones"

  *1 dose por dia · café, chá, água ou vitamina · sem estimulantes, sem hormônios*
- Locução: "RENOVA CELL is one serving a day, stirred into coffee, tea, water or a smoothie. Easy to take, and easy to keep taking."

  *O RENOVA CELL é uma dose por dia, misturada no café, no chá, na água ou na vitamina. Fácil de tomar e fácil de manter.*

**20–25 s** — Cartão final.

- Texto na tela: "Take the quick quiz · 30-day money-back guarantee"

  *Faça o quiz rápido · Garantia de 30 dias ou seu dinheiro de volta*
- Texto pequeno: "Anyone taking medication or managing a health condition should check with a doctor first."

  *Quem toma remédios ou cuida de alguma condição de saúde deve consultar um médico antes.*
- Locução: "Take the quick quiz to see the plan matched to your answers."

  *Faça o quiz rápido para ver o plano de acordo com as suas respostas.*
- [+ Rodapé obrigatório]

**Texto principal**

> "Morning walks, gardening, dancing in the kitchen: moving every day is a habit worth keeping."
>
> *Caminhada de manhã, jardinagem, dança na cozinha: se mexer todo dia é um hábito que vale manter.*
>
> "Collagen is the protein that gives structure to cartilage, tendons and skin, and the body makes less of it with age."
>
> *O colágeno é a proteína que dá estrutura à cartilagem, aos tendões e à pele, e o corpo produz menos dele com a idade.*
>
> "RENOVA CELL is a daily collagen + peptide formula. One serving a day in coffee, tea or water. No stimulants, no hormones."
>
> *O RENOVA CELL é uma fórmula diária de colágeno + peptídeos. Uma dose por dia no café, no chá ou na água. Sem estimulantes, sem hormônios.*
>
> "Take the quick quiz to see the plan matched to your answers. 30-day money-back guarantee."
>
> *Faça o quiz rápido para ver o plano de acordo com as suas respostas. Garantia de 30 dias ou seu dinheiro de volta.*
>
> "Anyone taking medication or managing a health condition should check with a doctor before starting a supplement."
>
> *Quem toma remédios ou cuida de alguma condição de saúde deve consultar um médico antes de começar um suplemento.*
>
> [+ Rodapé obrigatório]

**Título:** "Daily collagen for an active routine"

*Colágeno diário para uma rotina ativa*

**Descrição:** "One serving a day"

*Uma dose por dia*

**Botão (CTA):** Learn More (*Saiba mais*)

**URL de destino:** `https://SEU_DOMINIO/quiz?utm_source=meta&utm_medium=paid&utm_campaign=rc-us-meio-articulacoes&utm_content=ad03`

**Compliance:** mostra movimento com alegria, sem dor nem articulação "problema"; a idade fica só na segmentação; a queda de colágeno é citada sem número; o aviso de medicação está em terceira pessoa.

---

### AD04 — Meta Reels · Mulher 35–50 · Constância

| Campo | |
|---|---|
| Plataforma / posicionamento | Meta — Instagram Reels e Facebook Reels |
| Formato / duração | Vídeo 9:16, legendas queimadas · 25 s |
| Persona | Mulher 35–50 |
| Ângulo | 2. Constância (meio): para quem já tentou colágeno e parou cedo, sem dizer isso de quem assiste |

**Gancho (0–3 s)**

Cena: montagem rápida da mesma caneca em manhãs diferentes (muda a roupa, o clima na janela e a luz). **O rosto não é o foco**, para a montagem não virar "antes e depois". Selo fixo: "Dramatization".

> "The least exciting thing about collagen: it's a daily habit."
>
> *A parte menos empolgante do colágeno: é um hábito diário.*

**Roteiro**

**0–3 s** — Cena do gancho.

- Texto na tela: frase do gancho.
- Locução: "Here's the least exciting thing about collagen: it's a daily habit, not a quick fix."

  *A parte menos empolgante do colágeno é esta: é um hábito diário, não uma solução rápida.*

**3–9 s** — A mesma caneca, outra manhã.

- Texto na tela: "The skin study we cite: 8 weeks, every day."

  *O estudo de pele que citamos: 8 semanas, todos os dias.*
- Texto pequeno: "Proksch et al., Skin Pharmacol Physiol, 2014"
- Locução: "The skin-elasticity study we cite ran eight weeks, with a dose every single day."

  *O estudo de elasticidade da pele que citamos durou oito semanas, com uma dose todo santo dia.*

**9–13 s** — Tela limpa.

- Texto na tela e locução: "It tested a specific formula, and results vary."

  *Ele testou uma fórmula específica, e os resultados variam.*

**13–19 s** — Ela mistura uma dose na vitamina e sai para o trabalho.

- Texto na tela e locução: "So we made RENOVA CELL easy to keep: one serving, in coffee, water or a smoothie."

  *Por isso fizemos o RENOVA CELL fácil de manter: uma dose, no café, na água ou na vitamina.*

**19–25 s** — Cartão final.

- Texto na tela: "1 unit — $29.90 · Kit 3, the 90-day cycle — $80"

  *1 unidade — US$ 29,90 · Kit 3, o ciclo de 90 dias — US$ 80*
- Texto na tela: "Take the quick quiz · 30-day money-back guarantee"

  *Faça o quiz rápido · Garantia de 30 dias ou seu dinheiro de volta*
- Locução: "Take the quick quiz to see which plan fits your answers."

  *Faça o quiz rápido para ver qual plano combina com as suas respostas.*
- [+ Rodapé obrigatório]

**Texto principal**

> "The least exciting thing about collagen: it's a daily habit, not a quick fix."
>
> *A parte menos empolgante do colágeno: é um hábito diário, não uma solução rápida.*
>
> "The skin-elasticity study we cite ran 8 weeks with a daily dose (Proksch et al., 2014). It tested a specific formula, and results vary."
>
> *O estudo de elasticidade da pele que citamos durou 8 semanas, com dose diária (Proksch et al., 2014). Ele testou uma fórmula específica, e os resultados variam.*
>
> "So we built RENOVA CELL to be easy to keep: one serving a day in coffee, water or a smoothie."
>
> *Por isso criamos o RENOVA CELL para ser fácil de manter: uma dose por dia no café, na água ou na vitamina.*
>
> "1 unit — $29.90 · Kit 3, the 90-day cycle — $80 one-time · 30-day money-back guarantee."
>
> *1 unidade — US$ 29,90 · Kit 3, o ciclo de 90 dias — US$ 80 em pagamento único · Garantia de 30 dias ou seu dinheiro de volta.*
>
> "Take the quick quiz to see the plan matched to your answers."
>
> *Faça o quiz rápido para ver o plano de acordo com as suas respostas.*
>
> [+ Rodapé obrigatório]

**Título:** "Built for the habit, not the hype"

*Feito para o hábito, não para o exagero*

**Descrição:** "Kit 3: the 90-day cycle, $80"

*Kit 3: o ciclo de 90 dias, US$ 80*

**Botão (CTA):** Learn More (*Saiba mais*)

**URL de destino:** `https://SEU_DOMINIO/quiz?utm_source=meta&utm_medium=paid&utm_campaign=rc-us-meio-constancia&utm_content=ad04`

**Compliance:** a duração do estudo aparece como fato do estudo, não como prazo de resultado; a montagem não mostra mudança no rosto (não é antes/depois); os preços são exatamente os da landing.

---

### AD05 — Meta Stories · 50+ unissex · Garantia de 30 dias

| Campo | |
|---|---|
| Plataforma / posicionamento | Meta — Instagram Stories e Facebook Stories (também roda em Reels) |
| Formato / duração | Vídeo 9:16 em 3 telas de 5 s, letra grande e alto contraste · 15 s |
| Persona | 50+ unissex (remarketing: quem começou o quiz e não terminou; quem viu a oferta e não comprou) |
| Ângulo | 5. Garantia de 30 dias (fundo) |

**Gancho (0–3 s)**

Cena: produto na mesa do café da manhã, luz natural. Sem pessoas.

> "Try it for 30 days. Not happy? We'll refund your order."
>
> *Experimente por 30 dias. Não gostou? Devolvemos o valor do pedido.*

**Roteiro**

**Tela 1 (0–5 s)** — Produto na mesa.

- Texto na tela: frase do gancho.

**Tela 2 (5–10 s)** — Produto ao lado de um calendário de parede.

- Texto na tela: "Kit 6 · $140/month · delivered monthly · cancel anytime"

  *Kit 6 · US$ 140/mês · entregue todo mês · cancele quando quiser*

**Tela 3 (10–15 s)** — Produto em close, seta apontando para o botão.

- Texto na tela: "Code RENOVA10 = 10% off your first payment"

  *Código RENOVA10 = 10% de desconto no primeiro pagamento*
- [+ Rodapé obrigatório]

**Locução (opcional, voz calma):** "Try RENOVA CELL for 30 days. If you're not happy, email us and we'll refund your first order. Use code RENOVA10 for 10% off your first payment."

*Experimente o RENOVA CELL por 30 dias. Se não gostar, mande um e-mail e devolvemos o valor do seu primeiro pedido. Use o código RENOVA10 para ter 10% de desconto no primeiro pagamento.*

**Texto principal**

> "Try RENOVA CELL for 30 days. If you're not happy, email us and we'll refund your first order, no questions asked."
>
> *Experimente o RENOVA CELL por 30 dias. Se não gostar, mande um e-mail e devolvemos o valor do seu primeiro pedido, sem perguntas.*
>
> "One serving a day of collagen + peptides. Kit 6 is delivered every month for $140/month, and you can cancel anytime."
>
> *Uma dose por dia de colágeno + peptídeos. O Kit 6 é entregue todo mês por US$ 140/mês, e dá para cancelar quando quiser.*
>
> "Code RENOVA10: 10% off your first payment."
>
> *Código RENOVA10: 10% de desconto no primeiro pagamento.*
>
> [+ Rodapé obrigatório]

**Título:** "30-day money-back guarantee"

*Garantia de 30 dias ou seu dinheiro de volta*

**Descrição:** "RENOVA10: 10% off your first payment"

*RENOVA10: 10% de desconto no primeiro pagamento*

**Botão (CTA):** Shop Now (*Comprar agora*)

**URL de destino:** `https://SEU_DOMINIO/quiz?utm_source=meta&utm_medium=paid&utm_campaign=rc-us-fundo-garantia&utm_content=ad05`

**Compliance:** garantia, preço e cupom idênticos ao checkout e aos termos ("first order"); a recorrência e o cancelamento do Kit 6 ficam claros; sem pessoas, então não há risco de depoimento; sem "risk-free".

---

### AD06 — Meta Reels/Stories · Homem 35–55 · Constância

| Campo | |
|---|---|
| Plataforma / posicionamento | Meta — Reels e Stories (Instagram e Facebook) |
| Formato / duração | Vídeo 9:16, legendas queimadas · 15 s |
| Persona | Homem 35–55 |
| Ângulo | 2. Constância (meio) |

**Gancho (0–3 s)**

Cena: close numa caneca preta; mão masculina coloca uma dose no café e a colher gira (som de mexer bem audível). Selo fixo: "Dramatization".

> "The secret to collagen is boring: same mug, same time, every day."
>
> *O segredo do colágeno é chato: mesma caneca, mesmo horário, todo dia.*

**Roteiro**

**0–3 s** — Cena do gancho. Texto na tela e locução (voz masculina da marca): mesma frase do gancho.

**3–7 s** — Homem de ~45 anos toma o café, pega a chave e a bolsa da academia.

- Texto na tela e locução: "One serving a day. In coffee, water or a shake."

  *Uma dose por dia. No café, na água ou no shake.*

**7–11 s** — Pack shot.

- Texto na tela e locução: "Collagen peptides plus a peptide blend. No stimulants. No hormones."

  *Peptídeos de colágeno mais um blend de peptídeos. Sem estimulantes. Sem hormônios.*

**11–15 s** — Cartão final.

- Texto na tela: "Kit 3 · the 90-day cycle · $80 · Take the quick quiz"

  *Kit 3 · o ciclo de 90 dias · US$ 80 · Faça o quiz rápido*
- Texto na tela: "30-day money-back guarantee"

  *Garantia de 30 dias ou seu dinheiro de volta*
- Locução: "Kit 3 is the 90-day cycle. Take the quick quiz."

  *O Kit 3 é o ciclo de 90 dias. Faça o quiz rápido.*
- [+ Rodapé obrigatório]

**Texto principal**

> "The secret to collagen is boring: same mug, same time, every day."
>
> *O segredo do colágeno é chato: mesma caneca, mesmo horário, todo dia.*
>
> "RENOVA CELL is a daily collagen + peptide formula for skin, joints and well-being. One serving in coffee, water or a shake. No stimulants, no hormones."
>
> *O RENOVA CELL é uma fórmula diária de colágeno + peptídeos para pele, articulações e bem-estar. Uma dose no café, na água ou no shake. Sem estimulantes, sem hormônios.*
>
> "The studies we cite ran for weeks, not days. That's why Kit 3 is the 90-day cycle: $80, one-time."
>
> *Os estudos que citamos duraram semanas, não dias. Por isso o Kit 3 é o ciclo de 90 dias: US$ 80, pagamento único.*
>
> "Take the quick quiz to get the plan matched to your answers. 30-day money-back guarantee."
>
> *Faça o quiz rápido para receber o plano de acordo com as suas respostas. Garantia de 30 dias ou seu dinheiro de volta.*
>
> [+ Rodapé obrigatório]

**Título:** "Same mug. Same time. Every day."

*Mesma caneca. Mesmo horário. Todo dia.*

**Descrição:** "Kit 3: the 90-day cycle, $80"

*Kit 3: o ciclo de 90 dias, US$ 80*

**Botão (CTA):** Learn More (*Saiba mais*)

**URL de destino:** `https://SEU_DOMINIO/quiz?utm_source=meta&utm_medium=paid&utm_campaign=rc-us-meio-constancia&utm_content=ad06`

**Compliance:** fala do hábito, não do corpo de quem assiste; "weeks, not days" descreve os estudos sem prometer prazo; o ator não dá depoimento e é sinalizado como dramatização.

---

### AD07 — Meta Feed (carrossel) · Mulher 35–50 · Ciência honesta

| Campo | |
|---|---|
| Plataforma / posicionamento | Meta — Feed do Instagram e do Facebook |
| Formato | Carrossel 1:1 (1080×1080), 5 cards; fundo claro, tipografia grande, **sem pessoas** (a persona entra pela segmentação e pela paleta) |
| Persona | Mulher 35–50 |
| Ângulo | 3. Ciência honesta (meio) |

**Gancho (primeira linha do texto + card 1)**

> "We only cite research we can link to, and we show its limits."
>
> *Só citamos pesquisas com link, e mostramos os limites delas.*

**Direção dos cards**

**Card 1** — Produto em destaque e título grande.

- Arte: "3 studies. Zero hype."

  *3 estudos. Zero exagero.*
- Título do card: "What research says"

  *O que a pesquisa diz*
- Descrição do card: "Sources on every card"

  *Fonte em todos os cards*

**Card 2** — Só tipografia.

- Arte: "69 women · 2.5 g or 5 g of specific collagen peptides or placebo · 8 weeks → better skin elasticity vs. placebo"

  *69 mulheres · 2,5 g ou 5 g de peptídeos de colágeno específicos ou placebo · 8 semanas → mais elasticidade da pele do que o placebo*
- Arte (pequeno): "Proksch et al., Skin Pharmacol Physiol, 2014 · DOI 10.1159/000351376"
- Título do card: "Skin elasticity"

  *Elasticidade da pele*
- Descrição do card: "Proksch et al., 2014"

**Card 3**

- Arte: "Meta-analysis · 26 randomized trials · 1,721 participants → better skin hydration and elasticity vs. placebo"

  *Meta-análise · 26 estudos randomizados · 1.721 participantes → mais hidratação e elasticidade da pele do que o placebo*
- Arte (pequeno): "Pu et al., Nutrients, 2023 · PMID 37432180"
- Título do card: "The bigger picture"

  *O quadro geral*
- Descrição do card: "Pu et al., 2023"

**Card 4**

- Arte: "Athletes · 10 g/day of collagen hydrolysate · 24 weeks → less activity-related joint pain vs. placebo"

  *Atletas · 10 g/dia de colágeno hidrolisado · 24 semanas → menos dor articular ligada à atividade do que o placebo*
- Arte (pequeno): "Clark et al., Curr Med Res Opin, 2008 · DOI 10.1185/030079908X291967"
- Título do card: "Joint comfort"

  *Conforto nas articulações*
- Descrição do card: "Clark et al., 2008"

**Card 5** — Produto e chamada.

- Arte: "The fine print, up front: these studies tested specific formulas. Results may not apply to every product, including ours."

  *As letras miúdas, logo de cara: esses estudos testaram fórmulas específicas. Os resultados podem não valer para todo produto, inclusive o nosso.*
- Arte: "RENOVA CELL · daily collagen + peptides · Take the quick quiz"

  *RENOVA CELL · colágeno + peptídeos todo dia · Faça o quiz rápido*
- Arte (pequeno): [+ Rodapé obrigatório]
- Título do card: "Get a plan matched to your answers"

  *Receba um plano de acordo com as suas respostas*
- Descrição do card: "30-day money-back guarantee"

  *Garantia de 30 dias ou seu dinheiro de volta*

**Texto principal**

> "We only cite research we can link to, and we show its limits."
>
> *Só citamos pesquisas com link, e mostramos os limites delas.*
>
> "Swipe for three published studies on collagen, skin and joints. They tested specific formulas, so results may not apply to every product, including RENOVA CELL."
>
> *Arraste para ver três estudos publicados sobre colágeno, pele e articulações. Eles testaram fórmulas específicas, então os resultados podem não valer para todo produto, inclusive o RENOVA CELL.*
>
> "Want a daily collagen + peptide plan matched to your answers? Take the quick quiz (8 questions, about 60 seconds). 30-day money-back guarantee."
>
> *Quer um plano diário de colágeno + peptídeos de acordo com as suas respostas? Faça o quiz rápido (8 perguntas, cerca de 60 segundos). Garantia de 30 dias ou seu dinheiro de volta.*
>
> [+ Rodapé obrigatório]

**Título:** o título de cada card, acima (o do card 1 é "What research says").

**Descrição:** a descrição de cada card, acima.

**Botão (CTA):** Learn More (*Saiba mais*)

**URL de destino:** `https://SEU_DOMINIO/quiz?utm_source=meta&utm_medium=paid&utm_campaign=rc-us-meio-ciencia&utm_content=ad07`

**Compliance:** usa as mesmas frases dos cards de ciência da landing, com fonte e ressalva; não há pessoa, jaleco nem "especialista"; nenhuma promessa a quem vê.

---

### AD08 — Meta Feed (imagem única) · 50+ unissex · Articulações e movimento

| Campo | |
|---|---|
| Plataforma / posicionamento | Meta — Feed do Instagram e do Facebook |
| Formato | Imagem única 4:5 (1080×1350) |
| Persona | 50+ unissex |
| Ângulo | 4. Articulações e movimento (meio) |

**Direção da imagem**

Casal de ~60 anos caminhando numa trilha arborizada, rindo, em movimento. Produto em primeiro plano no canto inferior, sobre uma mureta. Pele real, sem retoque pesado. Selo pequeno no canto: "Paid models" (*Modelos pagos*). Rodapé obrigatório em letra pequena na base da arte.

- Arte (fonte grande): "Keep moving. Keep the ritual."

  *Continue se mexendo. Mantenha o ritual.*
- Arte (menor): "Daily collagen + peptides"

  *Colágeno + peptídeos todo dia*

**Gancho (primeira linha)**

> "Movement is a daily habit. So is RENOVA CELL."
>
> *Se mexer é um hábito diário. O RENOVA CELL também.*

**Texto principal**

> "Movement is a daily habit. So is RENOVA CELL."
>
> *Se mexer é um hábito diário. O RENOVA CELL também.*
>
> "Collagen is the protein that gives structure to cartilage, tendons and skin. RENOVA CELL is a daily collagen + peptide formula: one serving in coffee, tea or water. No stimulants, no hormones."
>
> *O colágeno é a proteína que dá estrutura à cartilagem, aos tendões e à pele. O RENOVA CELL é uma fórmula diária de colágeno + peptídeos: uma dose no café, no chá ou na água. Sem estimulantes, sem hormônios.*
>
> "Kit 6 is delivered every month ($140/month), so the routine never breaks. Cancel anytime."
>
> *O Kit 6 é entregue todo mês (US$ 140/mês), para a rotina nunca parar. Cancele quando quiser.*
>
> "Take the quick quiz to see the plan matched to your answers. 30-day money-back guarantee."
>
> *Faça o quiz rápido para ver o plano de acordo com as suas respostas. Garantia de 30 dias ou seu dinheiro de volta.*
>
> "Anyone taking medication or managing a health condition should check with a doctor before starting a supplement."
>
> *Quem toma remédios ou cuida de alguma condição de saúde deve consultar um médico antes de começar um suplemento.*
>
> [+ Rodapé obrigatório]

**Título:** "Keep moving. Keep the ritual."

*Continue se mexendo. Mantenha o ritual.*

**Descrição:** "Kit 6: $140/month, cancel anytime"

*Kit 6: US$ 140/mês, cancele quando quiser*

**Botão (CTA):** Learn More (*Saiba mais*)

**URL de destino:** `https://SEU_DOMINIO/quiz?utm_source=meta&utm_medium=paid&utm_campaign=rc-us-meio-articulacoes&utm_content=ad08`

**Compliance:** imagem positiva e realista, sem dor, close ou antes/depois; os modelos são sinalizados como pagos; nenhuma alegação de alívio ou tratamento; o preço recorrente e o cancelamento estão claros.

---

### AD09 — Meta Feed (imagem única) · Homem 35–55 · Garantia de 30 dias

| Campo | |
|---|---|
| Plataforma / posicionamento | Meta — Feed do Instagram e do Facebook |
| Formato | Imagem única 4:5 (1080×1350) |
| Persona | Homem 35–55 (remarketing: quem começou o quiz e não terminou; quem viu a oferta e não comprou) |
| Ângulo | 5. Garantia de 30 dias (fundo) |

**Direção da imagem**

Produto sobre uma bancada de cozinha escura, ao lado de uma caneca de café preto, chave do carro e bolsa de academia. Sem pessoas. Rodapé obrigatório em letra pequena na base.

- Arte (fonte grande): "30 days. Or your money back."

  *30 dias. Ou seu dinheiro de volta.*
- Faixa: "Code RENOVA10: 10% off your first payment"

  *Código RENOVA10: 10% de desconto no primeiro pagamento*

**Gancho (primeira linha)**

> "Collagen has a hype problem. So here's our deal:"
>
> *O colágeno tem um problema de exagero. Então a nossa proposta é esta:*

**Texto principal**

> "Collagen has a hype problem. So here's our deal:"
>
> *O colágeno tem um problema de exagero. Então a nossa proposta é esta:*
>
> "Try RENOVA CELL for 30 days. If you're not happy, email us and we'll refund your first order, no questions asked."
>
> *Experimente o RENOVA CELL por 30 dias. Se não gostar, mande um e-mail e devolvemos o valor do seu primeiro pedido, sem perguntas.*
>
> "Daily collagen + peptides for joints, skin and well-being. One serving in coffee, water or a shake. No stimulants, no hormones."
>
> *Colágeno + peptídeos todo dia para articulações, pele e bem-estar. Uma dose no café, na água ou no shake. Sem estimulantes, sem hormônios.*
>
> "Code RENOVA10: 10% off your first payment. Take the quick quiz to see your plan."
>
> *Código RENOVA10: 10% de desconto no primeiro pagamento. Faça o quiz rápido para ver o seu plano.*
>
> [+ Rodapé obrigatório]

**Título:** "30-day money-back guarantee"

*Garantia de 30 dias ou seu dinheiro de volta*

**Descrição:** "RENOVA10: 10% off your first payment"

*RENOVA10: 10% de desconto no primeiro pagamento*

**Botão (CTA):** Get Offer (*Obter oferta*). Alternativa para teste: Shop Now.

**URL de destino:** `https://SEU_DOMINIO/quiz?utm_source=meta&utm_medium=paid&utm_campaign=rc-us-fundo-garantia&utm_content=ad09`

**Compliance:** o gancho fala do mercado ("collagen has a hype problem"), não de quem vê; garantia e cupom exatamente como nos termos e no checkout; sem pessoas e sem "risk-free".

---

### AD10 — Meta Feed (carrossel) · 50+ unissex · Constância

| Campo | |
|---|---|
| Plataforma / posicionamento | Meta — Feed do Instagram e do Facebook |
| Formato | Carrossel 1:1 (1080×1080), 5 cards; letra grande, alto contraste |
| Persona | 50+ unissex |
| Ângulo | 2. Constância (meio): o plano mensal como forma de não interromper a rotina |

**Gancho (primeira linha + card 1)**

> "The hardest part of any supplement routine is keeping it going."
>
> *A parte mais difícil de qualquer rotina de suplemento é manter.*

**Direção dos cards**

**Card 1** — Calendário de parede na cozinha, produto ao lado. Sem pessoas.

- Arte: "The hardest part of any routine? Keeping it."

  *A parte mais difícil de qualquer rotina? Manter.*
- Título do card: "How the plans work"

  *Como funcionam os planos*
- Descrição do card: "Swipe to compare"

  *Arraste para comparar*

**Card 2**

- Arte: "1 unit · $29.90 · Try it for one month"

  *1 unidade · US$ 29,90 · Experimente por um mês*
- Título do card: "1 unit — $29.90"

  *1 unidade — US$ 29,90*
- Descrição do card: "Try it for one month"

  *Experimente por um mês*

**Card 3**

- Arte: "Kit 3 · $80 one-time · The 90-day cycle"

  *Kit 3 · US$ 80 em pagamento único · O ciclo de 90 dias*
- Título do card: "Kit 3 — $80"

  *Kit 3 — US$ 80*
- Descrição do card: "The 90-day cycle, one-time"

  *O ciclo de 90 dias, pagamento único*

**Card 4**

- Arte: "Kit 6 · $140/month · 6 units delivered every month · Cancel anytime"

  *Kit 6 · US$ 140/mês · 6 unidades entregues todo mês · Cancele quando quiser*
- Título do card: "Kit 6 — $140/month"

  *Kit 6 — US$ 140/mês*
- Descrição do card: "Cancel anytime"

  *Cancele quando quiser*

**Card 5**

- Arte: "30-day money-back guarantee · Code RENOVA10 = 10% off your first payment"

  *Garantia de 30 dias ou seu dinheiro de volta · Código RENOVA10 = 10% de desconto no primeiro pagamento*
- Arte (pequeno): [+ Rodapé obrigatório]
- Título do card: "Take the quick quiz"

  *Faça o quiz rápido*
- Descrição do card: "See which plan fits your answers"

  *Veja qual plano combina com as suas respostas*

**Texto principal**

> "The hardest part of any supplement routine is keeping it going."
>
> *A parte mais difícil de qualquer rotina de suplemento é manter.*
>
> "That's why RENOVA CELL has a monthly plan: Kit 6 is delivered every month for $140/month, and you can cancel anytime from your email receipt."
>
> *Por isso o RENOVA CELL tem um plano mensal: o Kit 6 é entregue todo mês por US$ 140/mês, e dá para cancelar quando quiser pelo recibo que chega no e-mail.*
>
> "Prefer to pay once? Kit 3 is the 90-day cycle for $80. Or try 1 unit for $29.90."
>
> *Prefere pagar uma vez só? O Kit 3 é o ciclo de 90 dias por US$ 80. Ou experimente 1 unidade por US$ 29,90.*
>
> "Take the quick quiz to see the plan matched to your answers. 30-day money-back guarantee. Code RENOVA10: 10% off your first payment."
>
> *Faça o quiz rápido para ver o plano de acordo com as suas respostas. Garantia de 30 dias ou seu dinheiro de volta. Código RENOVA10: 10% de desconto no primeiro pagamento.*
>
> [+ Rodapé obrigatório]

**Título:** o título de cada card, acima (o do card 1 é "How the plans work").

**Descrição:** a descrição de cada card, acima.

**Botão (CTA):** Learn More (*Saiba mais*)

**URL de destino:** `https://SEU_DOMINIO/quiz?utm_source=meta&utm_medium=paid&utm_campaign=rc-us-meio-constancia&utm_content=ad10`

**Compliance:** os três planos aparecem com preço e condição idênticos à landing; a cobrança recorrente e o cancelamento estão explícitos, como pede a lei americana de assinaturas online (ROSCA); sem pessoas e sem alegação de resultado.

---

### AD11 — TikTok In-Feed (Spark Ad de criadora) · Mulher 35–50 · Espelho

| Campo | |
|---|---|
| Plataforma / posicionamento | TikTok — In-Feed, como Spark Ad a partir do post da criadora |
| Formato / duração | Vídeo 9:16, fala para a câmera, legendas queimadas · 25–30 s |
| Persona | Mulher 35–50 |
| Ângulo | 1. Espelho (topo), na voz honesta de uma criadora paga |
| Divulgação | Rótulo "Paid partnership" ligado no post; "#ad" no texto; parceria dita em voz e na tela no primeiro segundo |

**Gancho (0–3 s)**

Cena: criadora real de ~40 anos no espelho do banheiro, prendendo o cabelo, fala direto para a câmera.

> "RENOVA CELL paid me to make this, so I'm keeping it honest."
>
> *A RENOVA CELL me pagou para fazer este vídeo, então vou ser sincera.*

Texto na tela: "Paid partnership with RENOVA CELL"

*Parceria paga com a RENOVA CELL*

**Roteiro**

**0–3 s** — Cena e fala do gancho.

**3–9 s** — Ainda no espelho, plano médio.

- Fala: "I'm not going to tell you this makes anyone look 25. Skin changes with time. Everyone's does."

  *Não vou dizer que isso faz alguém parecer ter 25 anos. A pele muda com o tempo. A de todo mundo muda.*
- Texto na tela: "No 'look 25' promises here."

  *Aqui não tem promessa de "parecer 25".*

**9–16 s** — Cozinha. Ela mistura uma dose no café.

- Fala: "What it is: a daily collagen and peptide formula. One serving in coffee, water or a smoothie. No hormones, no stimulants."

  *O que é: uma fórmula diária de colágeno e peptídeos. Uma dose no café, na água ou na vitamina. Sem hormônios, sem estimulantes.*
- Texto na tela: "1 serving a day · no hormones · no stimulants"

  *1 dose por dia · sem hormônios · sem estimulantes*

**16–23 s** — Ela mostra no celular a página do estudo (DOI aberto).

- Fala: "What research says: in one study, women taking specific collagen peptides every day for eight weeks had better skin elasticity than placebo. Different formula, so no promises."

  *O que a pesquisa diz: em um estudo, mulheres que tomaram peptídeos de colágeno específicos todos os dias por oito semanas tiveram mais elasticidade na pele do que o grupo placebo. Fórmula diferente, então nada de promessa.*
- Texto na tela: "Proksch et al., 2014 · specific formula · results vary"

  *Proksch et al., 2014 · fórmula específica · os resultados variam*

**23–30 s** — Cartão final.

- Fala: "If you're curious, there's a quick quiz that matches a plan to your answers, and a 30-day money-back guarantee."

  *Se ficou curiosa, tem um quiz rápido que monta um plano de acordo com as suas respostas, e garantia de 30 dias ou seu dinheiro de volta.*
- Texto na tela: "Take the quick quiz · 30-day money-back guarantee"

  *Faça o quiz rápido · Garantia de 30 dias ou seu dinheiro de volta*
- [+ Rodapé obrigatório]

**Regra para a criadora:** o roteiro diz "in coffee", não "in my coffee", de propósito. Ela só pode falar em primeira pessoa sobre o uso ("I take it every morning") se isso for verdade, e nunca fala de resultado no próprio corpo. Contrato com cláusula de opinião honesta e obrigação de divulgação.

**Texto principal (texto do anúncio, até 100 caracteres)**

> "Paid partnership #ad. Daily collagen + peptides, no hype. Take the quick quiz."
>
> *Parceria paga #publi. Colágeno + peptídeos todo dia, sem exagero. Faça o quiz rápido.*

**Título (cartão final):** "No hype. Just a daily ritual."

*Sem exagero. Só um ritual diário.*

**Descrição (cartão final):** "30-day money-back guarantee"

*Garantia de 30 dias ou seu dinheiro de volta*

**Botão (CTA):** Learn More (*Saiba mais*)

**URL de destino:** `https://SEU_DOMINIO/quiz?utm_source=tiktok&utm_medium=paid&utm_campaign=rc-us-topo-espelho&utm_content=ad11`

**Compliance:** a parceria paga é dita em voz, na tela, no rótulo da plataforma e no texto; a criadora não relata resultado; a pele é tratada como mudança normal de todo mundo; o estudo vem com a ressalva de fórmula específica.

---

### AD12 — TikTok In-Feed · Homem 35–55 · Espelho

| Campo | |
|---|---|
| Plataforma / posicionamento | TikTok — In-Feed (conta da marca) |
| Formato / duração | Vídeo 9:16, ator + locução da marca, legendas queimadas · 25 s |
| Persona | Homem 35–55 |
| Ângulo | 1. Espelho (topo), versão masculina: cuidar da pele também é coisa de homem |

**Gancho (0–3 s)**

Cena: homem de ~45 anos se barbeando no espelho, rindo de algo fora de quadro (a filha bate na porta). Plano médio, sem close na pele. Selo fixo: "Dramatization".

> "Skin care isn't just a women's thing."
>
> *Cuidar da pele não é só coisa de mulher.*

**Roteiro**

**0–3 s** — Cena do gancho. Texto na tela e locução (voz masculina da marca): mesma frase do gancho.

**3–8 s** — Ele termina de se barbear e sai do banheiro.

- Texto na tela e locução: "Collagen gives structure to skin, joints and tendons, in everyone."

  *O colágeno dá estrutura à pele, às articulações e aos tendões, em todo mundo.*

**8–13 s** — Cozinha.

- Texto na tela e locução: "With age, the body makes less of it."

  *Com a idade, o corpo produz menos dele.*

**13–20 s** — Ele mistura uma dose de RENOVA CELL no shake e sai para correr com o cachorro.

- Texto na tela: "RENOVA CELL · 1 serving a day · coffee, water or a shake · no stimulants, no hormones"

  *RENOVA CELL · 1 dose por dia · café, água ou shake · sem estimulantes, sem hormônios*
- Locução: "RENOVA CELL is one serving a day of collagen and peptides. In coffee, water or a shake."

  *O RENOVA CELL é uma dose por dia de colágeno e peptídeos. No café, na água ou no shake.*

**20–25 s** — Cartão final.

- Texto na tela: "Take the quick quiz · 30-day money-back guarantee"

  *Faça o quiz rápido · Garantia de 30 dias ou seu dinheiro de volta*
- Locução: "Take the quick quiz and get a plan matched to your answers."

  *Faça o quiz rápido e receba um plano de acordo com as suas respostas.*
- [+ Rodapé obrigatório]

**Texto principal (texto do anúncio, até 100 caracteres)**

> "Skin care isn't just a women's thing. Daily collagen + peptides. Take the quick quiz."
>
> *Cuidar da pele não é só coisa de mulher. Colágeno + peptídeos todo dia. Faça o quiz rápido.*

**Título (cartão final):** "Collagen is in everyone"

*Todo mundo tem colágeno*

**Descrição (cartão final):** "30-day money-back guarantee"

*Garantia de 30 dias ou seu dinheiro de volta*

**Botão (CTA):** Learn More (*Saiba mais*)

**URL de destino:** `https://SEU_DOMINIO/quiz?utm_source=tiktok&utm_medium=paid&utm_campaign=rc-us-topo-espelho&utm_content=ad12`

**Compliance:** frase geral sobre homens e pele, sem atribuir idade ou condição a quem assiste; sem close nem antes/depois; nenhuma alegação de hormônio ou desempenho; ator sinalizado.

---

### AD13 — TikTok In-Feed · 50+ unissex · Ciência honesta

| Campo | |
|---|---|
| Plataforma / posicionamento | TikTok — In-Feed (conta da marca) |
| Formato / duração | Vídeo 9:16, apresentadora fala para a câmera, legendas queimadas · 30–35 s |
| Persona | 50+ unissex |
| Ângulo | 3. Ciência honesta (meio) |

**Gancho (0–3 s)**

Cena: apresentadora de ~60 anos, roupa do dia a dia, na cozinha de casa (não em consultório). Texto fixo durante todo o vídeo: "Paid presenter · not a doctor" (*Apresentadora paga · não é médica*).

> "Collagen and getting older: 3 honest facts, sources on screen."
>
> *Colágeno e envelhecimento: 3 fatos honestos, com as fontes na tela.*

**Roteiro**

**0–3 s** — Cena e fala do gancho.

**3–9 s** — Fato 1.

- Fala e texto na tela: "Fact 1: the body makes less collagen with age. That's normal biology."

  *Fato 1: o corpo produz menos colágeno com a idade. É biologia normal.*

**9–17 s** — Fato 2, com as fontes sobrepostas.

- Fala: "Fact 2: in a 24-week study, athletes taking 10 grams a day of collagen hydrolysate reported less activity-related joint pain than placebo. And a 2023 review of 26 trials found better skin hydration and elasticity."

  *Fato 2: em um estudo de 24 semanas, atletas que tomaram 10 gramas por dia de colágeno hidrolisado relataram menos dor articular ligada à atividade do que o grupo placebo. E uma revisão de 2023 com 26 estudos encontrou mais hidratação e elasticidade da pele.*
- Texto na tela: "Clark et al., 2008 · Pu et al., 2023"

**17–23 s** — Fato 3.

- Fala e texto na tela: "Fact 3: those studies tested specific formulas. Results may not apply to every product, and nothing works overnight."

  *Fato 3: esses estudos testaram fórmulas específicas. Os resultados podem não valer para todo produto, e nada funciona da noite para o dia.*

**23–28 s** — Ela mexe uma dose no chá.

- Fala: "RENOVA CELL is a daily collagen and peptide formula. One serving in coffee, tea or water."

  *O RENOVA CELL é uma fórmula diária de colágeno e peptídeos. Uma dose no café, no chá ou na água.*
- Texto na tela: "Anyone taking medication or managing a health condition should check with a doctor first."

  *Quem toma remédios ou cuida de alguma condição de saúde deve consultar um médico antes.*

**28–33 s** — Cartão final.

- Fala: "There's a quick quiz that matches a plan to your answers."

  *Tem um quiz rápido que monta um plano de acordo com as suas respostas.*
- Texto na tela: "Take the quick quiz · 30-day money-back guarantee"

  *Faça o quiz rápido · Garantia de 30 dias ou seu dinheiro de volta*
- [+ Rodapé obrigatório]

**Texto principal (texto do anúncio, até 100 caracteres)**

> "Collagen and getting older: 3 honest facts, sources on screen. Paid presenter."
>
> *Colágeno e envelhecimento: 3 fatos honestos, com fontes na tela. Apresentadora paga.*

**Título (cartão final):** "3 honest facts about collagen"

*3 fatos honestos sobre colágeno*

**Descrição (cartão final):** "Sources: Clark 2008 · Pu 2023"

*Fontes: Clark 2008 · Pu 2023*

**Botão (CTA):** Learn More (*Saiba mais*)

**URL de destino:** `https://SEU_DOMINIO/quiz?utm_source=tiktok&utm_medium=paid&utm_campaign=rc-us-meio-ciencia&utm_content=ad13`

**Compliance:** a apresentadora aparece como paga e "not a doctor", em cenário doméstico; fala sobre envelhecimento em geral, não sobre quem assiste; estudos citados com ressalva; inclui o aviso de medicação.

---

### AD14 — TikTok In-Feed · Homem 35–55 · Articulações e movimento

| Campo | |
|---|---|
| Plataforma / posicionamento | TikTok — In-Feed (conta da marca) |
| Formato / duração | Vídeo 9:16, ação + locução da marca, legendas queimadas · 25–28 s |
| Persona | Homem 35–55 |
| Ângulo | 4. Articulações e movimento (meio), na versão de quem pratica esporte |

**Gancho (0–3 s)**

Cena: basquete de rua no fim de semana, homens de 40 a 50 anos, cortes rápidos com o som do tênis na quadra. Selo fixo: "Dramatization".

> "The protein behind every jump, sprint and lift."
>
> *A proteína por trás de cada salto, arrancada e levantamento.*

**Roteiro**

**0–3 s** — Cena do gancho. Texto na tela e locução (voz masculina da marca): mesma frase do gancho.

**3–8 s** — Jogo continua.

- Texto na tela e locução: "Tendons and cartilage are made largely of collagen."

  *Tendões e cartilagem são feitos, em grande parte, de colágeno.*

**8–16 s** — Intervalo, garrafa d'água, conversa no banco. Fonte sobreposta.

- Locução: "In a 24-week study, athletes taking 10 grams a day of collagen hydrolysate reported less activity-related joint pain than placebo."

  *Em um estudo de 24 semanas, atletas que tomaram 10 gramas por dia de colágeno hidrolisado relataram menos dor articular ligada à atividade do que o grupo placebo.*
- Texto na tela: "Clark et al., 2008 · specific formula · results vary"

  *Clark et al., 2008 · fórmula específica · os resultados variam*

**16–22 s** — Depois do jogo, um deles mistura RENOVA CELL no shaker; risadas no banco.

- Texto na tela: "RENOVA CELL · daily collagen + peptides · no stimulants, no hormones"

  *RENOVA CELL · colágeno + peptídeos todo dia · sem estimulantes, sem hormônios*
- Locução: "RENOVA CELL: daily collagen and peptides. One serving a day."

  *RENOVA CELL: colágeno e peptídeos todo dia. Uma dose por dia.*

**22–27 s** — Cartão final.

- Texto na tela: "Take the quick quiz · 30-day money-back guarantee"

  *Faça o quiz rápido · Garantia de 30 dias ou seu dinheiro de volta*
- Locução: "Take the quick quiz to see the plan matched to your answers."

  *Faça o quiz rápido para ver o plano de acordo com as suas respostas.*
- [+ Rodapé obrigatório]

**Texto principal (texto do anúncio, até 100 caracteres)**

> "Tendons and cartilage are made largely of collagen. Take the quick quiz."
>
> *Tendões e cartilagem são feitos, em grande parte, de colágeno. Faça o quiz rápido.*

**Título (cartão final):** "Daily collagen for active weeks"

*Colágeno diário para semanas ativas*

**Descrição (cartão final):** "30-day money-back guarantee"

*Garantia de 30 dias ou seu dinheiro de volta*

**Botão (CTA):** Learn More (*Saiba mais*)

**URL de destino:** `https://SEU_DOMINIO/quiz?utm_source=tiktok&utm_medium=paid&utm_campaign=rc-us-meio-articulacoes&utm_content=ad14`

**Compliance:** ninguém encena dor nem segura articulação; o gancho descreve o colágeno no corpo, não promete desempenho ("jump higher" é proibido); o estudo vem com a ressalva; ator sinalizado.

---

### AD15 — TikTok In-Feed · Mulher 35–50 · Garantia de 30 dias

| Campo | |
|---|---|
| Plataforma / posicionamento | TikTok — In-Feed (conta da marca) |
| Formato / duração | Vídeo 9:16, só mãos e produto (sem rosto), legendas queimadas · 20–22 s |
| Persona | Mulher 35–50 (remarketing: quem começou o quiz e não terminou; quem viu a oferta e não comprou) |
| Ângulo | 5. Garantia de 30 dias (fundo) |

**Gancho (0–3 s)**

Cena: mãos abrem a caixa do RENOVA CELL numa bancada clara; som de unboxing. Selo fixo: "Dramatization".

> "The 30-day rule."
>
> *A regra dos 30 dias.*

**Roteiro**

**0–3 s** — Cena do gancho. Texto na tela: mesma frase do gancho.

**3–9 s** — Mãos tiram o produto da caixa.

- Texto na tela e locução (voz feminina da marca): "Try RENOVA CELL for 30 days. Not happy? Email us and we'll refund your first order, no questions asked."

  *Experimente o RENOVA CELL por 30 dias. Não gostou? Mande um e-mail e devolvemos o valor do seu primeiro pedido, sem perguntas.*

**9–14 s** — Mãos misturam uma dose na vitamina.

- Texto na tela e locução: "One serving a day: collagen + peptides, in coffee, water or a smoothie."

  *Uma dose por dia: colágeno + peptídeos, no café, na água ou na vitamina.*

**14–19 s** — Produto sobre a bancada, preços na tela.

- Texto na tela: "1 unit — $29.90 · Kit 3, the 90-day cycle — $80 · Code RENOVA10 = 10% off your first payment"

  *1 unidade — US$ 29,90 · Kit 3, o ciclo de 90 dias — US$ 80 · Código RENOVA10 = 10% de desconto no primeiro pagamento*
- Locução: "Use code RENOVA10 for 10% off your first payment."

  *Use o código RENOVA10 para ter 10% de desconto no primeiro pagamento.*

**19–22 s** — Cartão final.

- Texto na tela: "Take the quick quiz to see your plan"

  *Faça o quiz rápido para ver o seu plano*
- [+ Rodapé obrigatório]

**Texto principal (texto do anúncio, até 100 caracteres)**

> "The 30-day rule: try it or get your money back. RENOVA10 = 10% off your first payment."
>
> *A regra dos 30 dias: experimente ou receba seu dinheiro de volta. RENOVA10 = 10% de desconto no primeiro pagamento.*

**Título (cartão final):** "30-day money-back guarantee"

*Garantia de 30 dias ou seu dinheiro de volta*

**Descrição (cartão final):** "RENOVA10: 10% off your first payment"

*RENOVA10: 10% de desconto no primeiro pagamento*

**Botão (CTA):** Shop Now (*Comprar agora*)

**URL de destino:** `https://SEU_DOMINIO/quiz?utm_source=tiktok&utm_medium=paid&utm_campaign=rc-us-fundo-garantia&utm_content=ad15`

**Compliance:** garantia ("first order"), preços e cupom idênticos aos termos e ao checkout; sem rosto, sem depoimento e sem alegação de resultado; a pessoa que aparece (só as mãos) é sinalizada como dramatização.

---

## Plano de teste (primeiras 72 horas)

> **Isto é um plano, não um resultado.** Não há nenhum número de referência (benchmark) aqui de propósito: o briefing ainda não tem verba nem CPA aceitável, e o projeto não tem histórico. As metas saem dos dados deste primeiro teste e do CPA que o cliente definir.

### Checklist antes de subir

1. Trocar `SEU_DOMINIO` em todas as URLs e abrir cada link para conferir que cai no `/quiz`.
2. Confirmar com o cliente o formato físico do produto, a embalagem e o rótulo (as cenas supõem uma dose misturada na bebida) e se o reembolso cobre o frete.
3. **Kit 6:** a landing diz "6 units delivered every month" e a unidade avulsa é "try it for one month". Confirmar com o cliente se são mesmo 6 unidades por mês antes de rodar AD05, AD08 e AD10 (o AD10 cita as 6 unidades).
4. **Pixel do TikTok:** o site só tem GA4, Meta Pixel e PostHog (`components/Analytics.tsx`). Sem instalar o pixel do TikTok (ou a Events API), não dá para medir custo por quiz nem por compra no TikTok. Os criativos AD11–AD15 só entram depois disso.
5. **UTMs no banco:** hoje o site não grava as UTMs junto com a resposta do quiz. GA4 e PostHog leem a URL, mas só depois do aceite de cookies. Recomendo salvar `utm_content` em `quiz_responses` para ter uma leitura por criativo que não dependa do pixel.
6. **Consentimento:** o Meta Pixel só carrega depois que a pessoa aceita os cookies, então a Meta vai mostrar menos quizzes e compras do que os reais. Compare o total de Leads da Meta com o total de linhas em `quiz_responses` e de pedidos na Stripe no mesmo período para estimar essa perda (no geral, não por anúncio).
7. **Meta, saúde e bem-estar:** conferir no Gerenciador de Eventos se o domínio foi classificado como saúde e bem-estar. Isso pode bloquear parâmetros (o evento `quiz_complete` envia idade e gênero) e limitar a otimização para eventos de fundo de funil. A decisão sobre o evento de otimização depende disso.
8. Testar o funil inteiro com a ferramenta de eventos de teste (Lead em `quiz_complete` e Purchase na página de obrigado) antes de ligar a verba.
9. Remarketing: AD05, AD09 e AD15 apontam para `/quiz`, como pedido. Para quem já completou o quiz, avaliar depois se vale mandar direto para a oferta.
10. Reconferir as políticas atuais (ver a nota no topo) e subir tudo **pausado** para revisão final.

### Quais criativos entram primeiro (5)

| Ordem | Criativo | Por que entra no primeiro lote |
|---|---|---|
| 1 | **AD01** — Meta Reels, mulher 35–50, Espelho | Gancho de topo para a persona que, por hipótese, tem mais volume; mede se o tom positivo faz parar de rolar |
| 2 | **AD02** — Meta Reels, homem 35–55, Ciência honesta | Testa se transparência com fontes funciona para o público masculino |
| 3 | **AD03** — Meta Reels, 50+, Articulações e movimento | Cobre a terceira persona e o ângulo de articulações |
| 4 | **AD07** — Meta Feed carrossel, mulher 35–50, Ciência honesta | Compara estático com vídeo (é mais barato de produzir e de iterar) |
| 5 | **AD11** — TikTok, criadora paga, mulher 35–50, Espelho | Primeira leitura do TikTok, **só depois do item 4 do checklist** |

Os criativos de garantia (AD05, AD09, AD15) ficam para o remarketing, que no lançamento ainda não tem público. Eles entram quando houver gente que começou o quiz ou viu a oferta.

**Como montar:**

- **Meta:** uma campanha de conversão no site, com orçamento por conjunto de anúncios. Um conjunto por criativo, com a mesma verba diária (a definir pelo cliente) e o mesmo evento de otimização. Segmentação por persona no conjunto (idade e gênero); posicionamentos Reels + Stories para os vídeos e Feed para o carrossel.
- **Evento de otimização:** começar com Lead (`quiz_complete`), que acontece com mais frequência que a compra e dá sinal mais rápido sobre o criativo. Passar para Purchase quando houver volume de compras, se a classificação de saúde e bem-estar permitir (item 7).
- **TikTok:** campanha separada, com a mesma lógica. Não some os números das duas plataformas na mesma leitura.
- **Limite da leitura:** neste lote, persona e ângulo mudam juntos. O vencedor indica a **combinação** (por exemplo, "mulher + Espelho"), não o ângulo isolado. No lote 2, teste o ângulo vencedor nas outras personas.

### Métricas

| Métrica | Conta | Onde ver na Meta | Onde ver no TikTok | O que ela mostra |
|---|---|---|---|---|
| Thumb-stop (taxa de 3 s) | Visualizações de 3 s ÷ impressões | "3-second video plays" | O TikTok não tem 3 s: usar "2-second video views" ÷ impressões | Se o gancho faz parar de rolar |
| Hold rate (retenção) | ThruPlays ÷ visualizações de 3 s | "ThruPlays" | "6-second video views" ÷ visualizações de 2 s, mais o tempo médio de reprodução | Se o corpo do vídeo segura a atenção |
| CTR | Cliques no link ÷ impressões | "CTR (link click-through rate)", não o "CTR (all)" | CTR de cliques para o destino | Se a promessa e o CTA dão vontade de clicar |
| Custo por quiz completo | Gasto ÷ quizzes completos | Custo por Lead (`quiz_complete` → Lead) | Depende do pixel do TikTok | Se o clique vira interesse real |
| Custo por compra | Gasto ÷ compras | Custo por Purchase | Depende do pixel do TikTok | Se o criativo traz comprador |

Thumb-stop e hold rate valem só para vídeo. No carrossel AD07, olhe CTR e custo por quiz completo.

### Como ler as 72 horas

**0–24 h — só conferir, não mexer.**

- Os anúncios foram aprovados? Se algum for reprovado, leia o motivo, ajuste só o trecho citado e suba de novo.
- Todos estão entregando? Os eventos Lead e Purchase estão chegando?
- Não edite anúncios ativos: cada edição reinicia a fase de aprendizado e zera a comparação.

**24–48 h — primeira leitura das métricas rápidas.**

- Olhe thumb-stop e CTR, que estabilizam primeiro.
- Compare cada anúncio com a **mediana do próprio lote**, não com números de fora.
- Antes de comparar, garanta que todos passaram do mesmo mínimo de impressões ou de gasto. Defina esse mínimo **antes** do lançamento e não mude depois.
- Ainda não pause nada por desempenho, só por reprovação ou se não houver entrega.

**48–72 h — leitura completa e decisão.**

| O que aparece | Leitura provável | Ação |
|---|---|---|
| Thumb-stop abaixo da mediana do lote | O gancho não para quem está rolando | Manter o corpo do vídeo e testar 2 ganchos novos (primeiros 3 s) |
| Thumb-stop bom, hold rate abaixo da mediana | Gancho bom, corpo fraco | Encurtar, trazer produto e oferta para mais cedo |
| Hold rate bom, CTR abaixo da mediana | Assistem, mas não clicam | Testar outro cartão final, título e botão (Learn More × Shop Now) |
| CTR bom, custo por quiz completo alto | Clique sem intenção, ou atrito no quiz | Comparar `quiz_start` × `quiz_complete` por `utm_content` no GA4/PostHog; revisar se a promessa do anúncio bate com a primeira tela do quiz |
| Custo por quiz completo bom, sem compras | Problema depois do quiz (oferta, preço, checkout) | Olhar `view_offer` → `begin_checkout` → `purchase` por persona; isso não se resolve trocando criativo |

**Compras:** nas primeiras 72 horas pode haver poucas compras. Nesse caso, a decisão sobre os criativos se apoia no custo por quiz completo, e as compras confirmam (ou não) a escolha ao longo dos 7 dias seguintes. Um anúncio só é pausado por compra quando o gasto dele passar do CPA aceitável que o cliente definir sem nenhuma venda.

**Na hora 72:**

1. Pausar os anúncios que ficaram abaixo da mediana em custo por quiz completo **e** em pelo menos uma das métricas de atenção (thumb-stop ou CTR).
2. Do melhor anúncio, fazer 2 ou 3 variações de gancho mantendo o resto.
3. Abrir o lote 2 com o ângulo vencedor nas outras personas (por exemplo, se AD02 vencer, testar Ciência honesta para 50+ com o AD13 e para mulher com o AD07 em vídeo) e, quando houver público, ligar o remarketing com AD05, AD09 e AD15.
4. Registrar hipótese, variantes, métrica e resultado em `07-experimentos/`.
