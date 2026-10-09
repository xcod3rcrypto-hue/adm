# Integrações

Ambas as integrações usam **somente APIs oficiais**. Nenhuma conexão é simulada: sem credenciais válidas, as ações ficam desabilitadas com explicação. A organização de demonstração não pode ser conectada a contas reais.

## Meta Ads (Marketing API / Graph API)

**Versão padrão:** `v26.0` (editável em Integrações). Consulte o [changelog](https://developers.facebook.com/docs/graph-api/changelog) e atualize quando a versão for descontinuada.

### Credenciais

1. Crie um app em <https://developers.facebook.com/> e adicione o produto **Marketing API**.
2. No **Business Manager**, crie um **usuário do sistema**, atribua as contas de anúncios e gere um token com:
   - `ads_read` — leitura de contas, campanhas e métricas;
   - `ads_management` — necessário para publicar, pausar/ativar, alterar orçamento e enviar imagens.
3. Fora do modo de desenvolvimento do app, permissões avançadas exigem **revisão do app** pela Meta.
4. No ADVERTEX: **Integrações → Meta Ads**, cole o token, salve e clique em **Testar conexão**.

O token vai somente no cabeçalho `Authorization` (nunca na URL), e URLs de paginação fora de `graph.facebook.com` são recusadas.

### Leitura

| Dado | Endpoint |
|---|---|
| Identidade | `GET /me` |
| Contas | `GET /me/adaccounts` |
| Campanhas | `GET /act_{id}/campaigns` |
| Métricas diárias | `GET /act_{id}/insights?level=campaign&time_increment=1` |

**Definições:** conversões = soma das ações `purchase`, `lead` e `complete_registration`; receita = `action_values` de `purchase`; janela de atribuição padrão da conta. Orçamentos chegam em unidade mínima da moeda (centavos), exceto moedas sem casas decimais.

### Escrita

| Operação | Chamada |
|---|---|
| Criar campanha | `POST /act_{id}/campaigns` — `status=PAUSED`, objetivo `OUTCOME_*`, `daily_budget` em centavos, `special_ad_categories=[]`, `bid_strategy=LOWEST_COST_WITHOUT_CAP` |
| Pausar/ativar | `POST /{campaign_id}` com `status` |
| Orçamento | `POST /{campaign_id}` com `daily_budget` |
| Enviar imagem | `POST /act_{id}/adimages` (retorna o *hash*) |
| Verificação | `GET /act_{id}/campaigns?filtering=[name EQUAL …]` |

Campanhas com **categoria especial** (crédito, emprego, moradia, política) precisam ser declaradas: crie-as no gerenciador da Meta.

## Google Ads API

**Versão padrão:** `v25` (editável). Verifique o [calendário de versões](https://developers.google.com/google-ads/api/docs/sunset-dates).

### Credenciais

1. No **Google Cloud Console**, crie um projeto, ative a **Google Ads API** e crie um ID do cliente OAuth do tipo **App para computador**.
2. No **Google Ads (conta de administrador)**, em *Ferramentas → Centro de API*, obtenha o **developer token**. Contas de produção exigem acesso **Básico** ou **Padrão**; com acesso de teste, use contas de teste.
3. No ADVERTEX: **Integrações → Google Ads**, informe Client ID, Client Secret, developer token e, para contas gerenciadas, o **login-customer-id** (10 dígitos, sem hífens). Clique em **Autorizar no navegador**.

A autorização usa **OAuth 2.0 com PKCE** e redirecionamento *loopback* (`http://127.0.0.1:<porta>`), com escopo `https://www.googleapis.com/auth/adwords`. O refresh token é cifrado localmente; o access token fica apenas em memória. Desconectar revoga o token no Google.

### Leitura

GAQL via `customers/{id}/googleAds:search` (paginado): contas acessíveis, campanhas e `metrics.cost_micros`, `impressions`, `clicks`, `conversions`, `conversions_value` por `segments.date`.

### Escrita

| Operação | Chamada |
|---|---|
| Criar campanha | `campaignBudgets:mutate` (orçamento não compartilhado) + `campaigns:mutate` — **somente Pesquisa**, `status=PAUSED`, CPC manual, rede de pesquisa; se a campanha falhar, o orçamento criado é removido |
| Pausar/ativar | `campaigns:mutate` com `updateMask=status` |
| Orçamento | consulta `campaign.campaign_budget` + `campaignBudgets:mutate` com `updateMask=amount_micros` |
| Enviar imagem | `assets:mutate` (ativo do tipo `IMAGE`) |
| Verificação | GAQL por `campaign.name` |

Os modelos de campanha do Google e da Meta **não são equivalentes**: o app guarda o objetivo/tipo de cada plataforma sem tentar convertê-los.

## Rede de Pesquisa do Google (palavras-chave e anúncios)

Em **Campanhas → Anúncios e palavras-chave** (campanhas Google de Pesquisa) você monta grupos de anúncios com palavras-chave (ampla, frase, exata), negativas e anúncio responsivo (3–15 títulos de até 30 caracteres, 2–4 descrições de até 90).

- **Gerar a partir do link**: o app lê a página pública (com proteção contra SSRF) e a IA propõe 15 títulos, 4 descrições, caminhos e 20–40 palavras-chave; textos acima do limite são descartados.
- **Ideias de palavras-chave**: pelo Planejador do Google Ads (`generateKeywordIdeas`, com volume e concorrência) ou pela IA.
- **Envio**: cria grupo, palavras-chave, negativas e anúncio em etapas idempotentes; se uma etapa falhar, o reenvio continua de onde parou. Tudo é criado pausado.

## Geração de imagens (Gemini — Nano Banana Pro)

Em **Configurações → Geração de imagens (Gemini)** cole a chave do Google AI Studio (https://aistudio.google.com/apikey). A chave fica cifrada pelo armazenamento seguro do Windows e é enviada somente no cabeçalho `x-goog-api-key`.

- Modelos: `gemini-3-pro-image-preview` (Nano Banana Pro, padrão, até 4K e texto legível) e `gemini-2.5-flash-image` (mais rápido e barato).
- Em **Criativos → Imagens e vídeos → Gerar imagem com IA**: descrição, formato (1:1, 4:5, 9:16, 16:9…), resolução, até 4 variações, briefing do projeto e até 3 imagens de referência da biblioteca.
- As imagens geradas vão para a biblioteca com a tag `#ia-gemini` e podem ser vinculadas a criativos ou enviadas às contas de anúncios.
- O Nano Banana Pro exige faturamento ativo no projeto do Google; o custo é cobrado pelo Google.

## Garantias comuns

- **Leituras:** timeout de 30 s, até 3 retentativas com backoff e jitter (respeitando `Retry-After`), circuit breaker.
- **Escritas:** nenhuma retentativa automática; idempotência por chave; verificação remota após resultado incerto; tudo registrado em `platform_operations` e na auditoria.
- **Mensagens de erro** traduzidas (token expirado, permissão, limite de requisições, developer token sem acesso, MCC).
- **Sincronização** idempotente por (organização, plataforma, ID remoto). Reimportar um período substitui os valores do mesmo dia.

## Limitações atuais

- Conjuntos de anúncios / grupos de anúncios e anúncios ainda são configurados no gerenciador da plataforma (ver [ROADMAP](ROADMAP.md)).
- Métricas são por campanha e por dia.
- A Meta usa token (não há login pelo navegador nesta versão).
