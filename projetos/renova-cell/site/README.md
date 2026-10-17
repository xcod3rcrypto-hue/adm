# RENOVA CELL — funil (Next.js 14)

Quiz → análise → landing personalizada → checkout Stripe → upsells 1-clique → obrigado.
Multilíngue (28 idiomas, EUA + toda a Europa) com idioma do celular primeiro e moeda local pelo país, headline gerada pelo Claude, VSL por persona gerada na HeyGen e follow-up automático por e-mail/SMS.

```bash
cd projetos/renova-cell/site
cp .env.example .env.local     # preencha as chaves (veja abaixo)
npm install
npm run dev                    # http://localhost:3000
```

Sem nenhuma chave o site já roda: o quiz, a landing e o checkout aparecem, a headline usa o texto fixo da persona, o vídeo some com uma mensagem, o chat avisa que não está configurado e o pagamento retorna "não configurado".

## Fluxo e rotas

| Rota | O que faz |
|---|---|
| `/` | Redireciona para `/quiz` |
| `/quiz` | 8 perguntas, uma por tela, barra de progresso, voltar sempre visível + passo opcional de contato (nome, e-mail, consentimentos) |
| `/analyzing` | Salva as respostas e gera a headline **de verdade** enquanto mostra os 3 passos (mín. 3,5 s, máx. 9 s) |
| `/offer` | Landing com 20 seções personalizadas pelo quiz |
| `/checkout` | Carrinho (plano + compra única ou assinatura + order bump + cupom + frete grátis) → dados → pagamento no Stripe Checkout |
| `/upsell-1` | Kit 6 avulso com 45% off, cobrança 1-clique no cartão salvo |
| `/upsell-2` | Assinatura do Kit 3 com 30% off enquanto durar |
| `/thank-you` | Resumo, como tomar, grupo VIP, link de indicação |

| API | Função |
|---|---|
| `POST /api/quiz` · `GET /api/quiz?id=` | Salva respostas, gera headline (variante A), envia o diagnóstico por e-mail · restaura respostas para quem volta por link de e-mail |
| `POST /api/headline` | Headline personalizada (Claude) sem salvar |
| `POST /api/chat` | Chat "Elena" em streaming (Claude) |
| `POST /api/checkout` | Cria a Checkout Session (order bump, cupom, cartão salvo para upsell) |
| `POST /api/coupon` | Valida código promocional no Stripe |
| `POST /api/upsell` | Upsell 1-clique off-session, idempotente; cai para página segura se o banco pedir 3-D Secure |
| `GET /api/heygen` | VSL hospedada da persona/idioma (só leitura — gerar custa créditos, então é via script) |
| `GET /api/geo` | País e idioma pelo IP |
| `GET /api/order` | Resumo do pedido para upsell/obrigado |
| `GET /api/social-proof` | Nº **real** de pedidos pagos nas últimas 24 h |
| `POST /api/webhooks/stripe` | Registra pedidos (`checkout.session.completed`) |
| `GET /api/cron/followups` | Sequência pós-quiz (Vercel Cron a cada 10 min) |
| `GET/POST /api/unsubscribe` | Descadastro com link assinado (HMAC) e one-click (RFC 8058) |

## Configuração passo a passo

1. **Supabase** — crie um projeto, rode `supabase/schema.sql` no SQL Editor (cria as tabelas, RLS e o bucket público `vsl`). Copie `SUPABASE_URL` e a **service role key**. Todo acesso ao banco acontece no servidor.
2. **Stripe** — coloque `STRIPE_SECRET_KEY` em `.env.local` e rode `npm run stripe:setup`. O script cria os 6 preços (1 un. $29,90 · Kit 3 $80 · Kit 6 $140/mês · bump $19,90 · upsell Kit 6 $77 · assinatura $56/mês) e o cupom **RENOVA10** (10% na primeira cobrança). Ele imprime as linhas `STRIPE_PRICE_*` para colar no `.env.local`. Rodar duas vezes não duplica nada.
   - Webhook: aponte para `https://SEU_DOMINIO/api/webhooks/stripe` com os eventos `checkout.session.completed` e `checkout.session.async_payment_succeeded`. Em dev: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
   - Apple Pay, Google Pay, PayPal e parcelamento (Klarna/Afterpay/Affirm) aparecem sozinhos no Checkout quando ativados no Dashboard (Settings → Payment methods). Para Apple Pay, verifique o domínio no Stripe.
3. **Claude** — `ANTHROPIC_API_KEY`. Modelo padrão `claude-opus-5-5` (troque com `ANTHROPIC_MODEL`). As chamadas usam `effort: low` e `fallbacks: "default"`, ou seja, se o modelo recusar um pedido a API tenta de novo no modelo reserva recomendado.
4. **HeyGen** — `HEYGEN_API_KEY`, IDs de avatar e de voz. Depois:
   ```bash
   npm run vsl:generate -- --translate    # Claude traduz os roteiros para ES/FR/DE em scripts/vsl/ — revise!
   npm run vsl:generate -- --dry-run      # mostra o que será gerado
   npm run vsl:generate                   # gera 3 personas × 5 idiomas e hospeda no Supabase Storage
   ```
   Os roteiros EN e PT estão em `lib/vsl-scripts.ts`. Os links da HeyGen expiram, por isso o script copia cada vídeo para o Storage.
5. **E-mail/SMS** — Resend (`RESEND_API_KEY`, `EMAIL_FROM` de domínio verificado) e Twilio. Defina `UNSUBSCRIBE_SECRET`, `CRON_SECRET` e `COMPANY_POSTAL_ADDRESS`. `MAKE_WEBHOOK_URL` é opcional e repassa cada lead ao Make.com.
6. **Analytics** — GA4, Meta Pixel, PostHog e Hotjar por variáveis `NEXT_PUBLIC_*`. Eles só carregam depois que a pessoa aceita os cookies. Eventos enviados: `quiz_start`, `quiz_complete` (Lead), `view_offer` (ViewContent), `begin_checkout` (InitiateCheckout), `upsell_accepted`, `purchase` (Purchase).
7. **Deploy na Vercel** — importe o repositório com *Root Directory* = `projetos/renova-cell/site`, cole as variáveis e publique. O `vercel.json` já agenda o cron (o plano Hobby só aceita cron diário; para rodar a cada 10 min é preciso o Pro).

## Mercados, idiomas, moedas, assinatura e frete

- **Idioma:** escolha manual (cookie `rc_locale_chosen`) > idioma do celular (`Accept-Language`) > país do IP. 28 idiomas em `lib/i18n/` (`npm run i18n:check` confere chaves, placeholders e marcas).
- **Moeda:** pelo país do IP — USD, EUR, GBP, CHF, SEK, NOK, DKK, ISK, PLN, CZK, HUF, RON (`lib/products.ts`). Os demais países europeus pagam em euro; o resto do mundo em dólar. `npm run stripe:setup` cria os preços com essas moedas.
- **Compra única ou assinatura:** todo plano tem as duas opções pelo mesmo preço. A assinatura renova quando o estoque acaba: 1 unidade todo mês, Kit 3 a cada 3 meses, Kit 6 a cada 6 meses. Quem assina vai direto para o obrigado (sem upsell 1-clique).
- **Frete grátis** para todos os países atendidos, com entrega em até 2 dias úteis, rastreada, e embalagem discreta (sem nome do produto por fora). No Stripe aparece como linha "Free shipping" em compra única; na assinatura (o Stripe não aceita tarifa de frete nesse modo) o aviso fica na etapa de endereço.  O prazo aparece no selo, na FAQ, nos termos, no chat e na Stripe (`delivery_estimate` de 1 a 2 dias úteis).
- **Países atendidos:** toda a Europa, EUA, Canadá, América Latina, Austrália, Nova Zelândia e Golfo (`lib/checkout.ts`, ou `SHIP_COUNTRIES`). **Ucrânia e Rússia ficam sempre de fora**: o checkout recusa visitantes desses países e o endereço de entrega não aceita esses destinos. O idioma ucraniano continua disponível para quem mora em outro país europeu.

## Sequência pós-quiz (quem não comprou)

| Quando | Canal | Condição |
|---|---|---|
| 0 min | E-mail com o diagnóstico | Deixou e-mail (foi a pessoa que pediu) |
| 30 min | E-mail com a VSL | Marcou o consentimento de e-mail |
| 2 h | SMS com cupom de 10% | Marcou o consentimento de SMS e informou o celular |
| 24 h | E-mail "por que as pessoas continuam" | Consentimento de e-mail |
| 72 h | E-mail "seu cupom continua valendo" | Consentimento de e-mail |
| 7 dias | E-mail sobre hábito | Consentimento de e-mail |

A sequência para quando a pessoa compra ou se descadastra.

## A/B test

O middleware sorteia `rc_ab` (A/B) e grava em cookie. **A** usa a headline do Claude e **B** usa a headline fixa da persona (controle). A proporção fica em `AB_SPLIT_B`, e a variante é salva em `quiz_responses.ab_variant` para comparar a conversão.

## O que é diferente do prompt original, e por quê

Algumas partes do briefing original fariam o funil enganar o comprador ou expor a marca a FTC, FDA, ANVISA, CONAR e GDPR/LGPD. Implementei a mesma função de um jeito honesto:

| Pedido original | Como ficou |
|---|---|
| "Ana de São Paulo acabou de comprar" com nomes inventados | Toast com o **número real** de pedidos pagos nas últimas 24 h, vindo do Supabase. Se não houver pedidos, não aparece nada. |
| "Cruzando 4.812 casos…" / "Baseado em 4.812 casos" | "Lendo suas 8 respostas…" / "Com base nas suas 8 respostas" (é o que o sistema realmente faz) |
| "Dr. Elena, especialista" | "Elena, assistente de IA · não é médica". O prompt proíbe afirmações médicas e hormonais. |
| Promessas de testosterona/libido e "resultado visível em 15 dias" | Textos de estrutura/função (pele, articulações, bem-estar), sem prazo garantido, com aviso da FDA e "resultados variam". A pergunta de libido continua no quiz e responde com confiança e autocuidado, sem prometer efeito hormonal. |
| Depoimentos e antes/depois | Componentes prontos, mas vazios: só renderizam com clientes reais e autorização (`content/proof.ts`). |
| Simulador "projeção de resultado" | Mostra a queda de colágeno com a idade (~1%/ano, média citada), sem linha "com RENOVA CELL", porque não há dados que a sustentem. |
| Estudos com DOI | 3 estudos reais e conferidos: Proksch 2014 (DOI 10.1159/000351376), Clark 2008 (DOI 10.1185/030079908X291967), Pu 2023 (PMID 37432180), com a ressalva de que testaram fórmulas específicas. |
| Upsell 1-clique | Valor exato (e recorrência, na assinatura) escrito acima do botão. Idempotente e sem cobrança dupla. |
| Bloquear o avanço da VSL | Opcional (`NEXT_PUBLIC_VSL_LOCK_SEEK`). Voltar, pausar e tela cheia sempre funcionam. |
| Analytics e SMS | Cookies só com consentimento, SMS só com opt-in (TCPA), descadastro em todo e-mail. |

## Antes de colocar no ar

- [ ] Confirmar a fórmula real e ajustar a tabela comparativa (`offer.comparison.rows` nos 28 idiomas).
- [ ] Garantir com a logística que a embalagem externa é neutra e que o prazo de até 2 dias úteis vale para **todos** os países atendidos (EUA: regra da FTC de vendas por correio; UE: prazo informado vira obrigação contratual).
- [ ] Substituir `/privacy` e `/terms` por textos revisados por advogado.
- [ ] Revisar as traduções geradas da VSL em `scripts/vsl/`.
- [ ] Criar um banco Upstash Redis (plano grátis serve) e preencher `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`: é o que limita de verdade `/api/chat`, `/api/quiz`, `/api/checkout` etc. Sem elas, o limite fica só na memória de cada instância.
- [ ] Testar o fluxo completo em modo teste da Stripe com o cartão `4000 0025 0000 3155` (3-D Secure) e confirmar que o upsell cai na página segura.

## Demo para revisar no celular

`npm run demo:build` gera `demo/dist/index.html`: uma página única com os mesmos componentes, um roteador em memória e um backend simulado (`demo/mock-api.ts`). Nada é salvo, cobrado ou enviado, e uma faixa no topo avisa que é demonstração. Serve para revisar o visual em qualquer celular antes de configurar as contas. O site de verdade continua sendo o app Next.js.

## Estrutura

```
app/            páginas e rotas de API
components/     quiz/, offer/ (20 seções), checkout/, ui/ (botão com brilho, card 3D, cursor dourado…)
content/        prova social real (vazio até ter autorização)
lib/            i18n/ (28 idiomas), claude, prompts, heygen, stripe, supabase, notify, followups, quiz, products, store
scripts/        stripe-setup.ts, heygen-generate.ts, vsl/ (roteiros traduzidos)
demo/           build de demonstração (roteador e backend simulados)
supabase/       schema.sql
```
