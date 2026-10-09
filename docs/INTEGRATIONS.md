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

## Garantias comuns

- **Leituras:** timeout de 30 s, até 3 retentativas com backoff e jitter (respeitando `Retry-After`), circuit breaker.
- **Escritas:** nenhuma retentativa automática; idempotência por chave; verificação remota após resultado incerto; tudo registrado em `platform_operations` e na auditoria.
- **Mensagens de erro** traduzidas (token expirado, permissão, limite de requisições, developer token sem acesso, MCC).
- **Sincronização** idempotente por (organização, plataforma, ID remoto). Reimportar um período substitui os valores do mesmo dia.

## Limitações atuais

- Conjuntos de anúncios / grupos de anúncios e anúncios ainda são configurados no gerenciador da plataforma (ver [ROADMAP](ROADMAP.md)).
- Métricas são por campanha e por dia.
- A Meta usa token (não há login pelo navegador nesta versão).
