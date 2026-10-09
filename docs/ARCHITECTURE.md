# Arquitetura

## Visão geral

```
┌──────────────────────── Electron ────────────────────────┐
│ Renderer (React, sandbox, sem Node)                      │
│   páginas → TanStack Query → window.advertex.invoke()    │
├──────────────── preload (contextBridge) ─────────────────┤
│   expõe apenas invoke(canal, payload) p/ canais listados │
├──────────────── processo principal ──────────────────────┤
│   ipc.ts: valida remetente + canal + payload (Zod)       │
│   handlers.ts: diálogos, PDF, abertura de links          │
│   @advertex/core: serviços de negócio + banco + auditoria│
│     ├─ platform-meta / platform-google (APIs oficiais)   │
│     ├─ ai-core (Anthropic)                               │
│     └─ advertising-core (métricas, diagnósticos, HTTP)   │
│   agendador de automações (5 min, com o app aberto)      │
└──────────────────────────────────────────────────────────┘
```

A lógica de negócio fica em `packages/core` e é testada sem Electron. O processo principal só faz a ponte com o sistema operacional (diálogos, `safeStorage`, `printToPDF`, `shell`).

## Decisões arquiteturais (ADR resumidas)

| # | Decisão | Motivo | Alternativa do briefing |
|---|---|---|---|
| 1 | **Electron + React + TypeScript + Vite** (`electron-vite`) | Requisito do produto; build rápido | — |
| 2 | **SQLite embarcado via sql.js (WebAssembly)** | Sem módulos nativos: empacotamento previsível no Windows, zero instalação de banco | PostgreSQL + Prisma, previsto para o backend hospedado (ver ROADMAP) |
| 3 | **Sem backend NestJS nesta versão** | Uso local de um usuário; o backend só agrega valor com multiusuário. Os serviços já recebem `organizationId` explicitamente e isolam no SQL, prontos para migrar para uma API | NestJS/REST/OpenAPI |
| 4 | **Sem Redis/BullMQ** | Tarefas assíncronas são poucas e curtas; o agendador no processo principal basta para uso local | Redis + BullMQ com backend |
| 5 | **Um canal IPC tipado** (`advertex:invoke`) com schemas Zod por canal | Superfície mínima, validação central, mesma tipagem no renderer e no main | — |
| 6 | **Diagnósticos determinísticos** (não IA) | Evidência numérica reproduzível e auditável; IA fica para texto e análise qualitativa | — |
| 7 | **Relatórios como fotografia** | Histórico não muda após novas sincronizações | — |
| 8 | **Criação de campanhas sempre pausada** | Ativação é uma decisão separada, após configurar conjuntos/anúncios | — |

## Monorepo

| Pacote | Responsabilidade |
|---|---|
| `packages/shared` | Tipos de domínio, schemas Zod de entrada, contrato IPC (`ipcInputs`/`ChannelOutputs`), lista de canais, formatação pt-BR |
| `packages/core` | Serviços (organizações, projetos, briefing, criativos, ativos, campanhas, publicação, integrações, inteligência, experimentos, automações, relatórios, calendário, concorrentes), banco, migrações, segredos, auditoria, SSRF |
| `packages/advertising-core` | Métricas e derivadas, diagnósticos, estatística de experimentos, regras de texto, HTTP com retentativa/circuit breaker, contratos `AdPlatformReader`/`AdPlatformWriter` |
| `packages/platform-meta` | Graph API (leitura e escrita) |
| `packages/platform-google` | Google Ads API REST (GAQL + mutate) e OAuth loopback com PKCE |
| `packages/ai-core` | Provedor Anthropic, prompts e schemas de saída estruturada |
| `apps/desktop` | Main, preload e renderer |

Os pacotes são código-fonte TypeScript resolvido por alias (sem build intermediário).

## Contrato IPC

`packages/shared/src/ipc.ts` define, para cada canal, o schema de entrada e o tipo de saída. O roteador (`apps/desktop/src/main/ipc.ts`):

1. confere se o remetente é a janela principal com a URL do app;
2. confere se o canal existe;
3. valida o payload com Zod;
4. chama o handler com um `AppContext` contendo um **ID de correlação**;
5. devolve `{ ok, data }` ou `{ ok: false, error: { code, message, correlationId, fieldErrors } }`, sem stack trace.

Um teste garante que a lista de canais do preload é idêntica às chaves do contrato.

## Banco de dados

`packages/core/src/db/migrations.ts` contém migrações versionadas e imutáveis:

- **v1** — usuários, organizações, memberships, clientes, projetos, perfis de marca, briefings e versões, conexões, segredos, contas de anúncios, campanhas, grupos, anúncios, criativos e versões, ativos, snapshots de métricas, insights, recomendações, experimentos, regras e execuções de automação, aprovações, auditoria, relatórios, notificações, jobs de IA, configurações.
- **v2** — rastreio de insights/recomendações por campanha, variantes de experimento, operações nas plataformas (idempotência), calendário, concorrentes e referências.

Gravação atômica (arquivo temporário + rename) ao fim de cada transação; cópia `.bak` ao abrir. Exclusão de organização apaga seus dados em cascata; excluir projeto desvincula (SET NULL) campanhas e criativos; a auditoria não tem FK e sobrevive.

Métricas (`metric_snapshots`) guardam **origem** (`demo`/`meta`/`google`), **definição**, **moeda** e data de busca. Totais nunca somam moedas diferentes; alcance não é somado entre dias.

## Inteligência (diagnósticos)

`packages/advertising-core/src/diagnostics.ts` compara o período com o anterior de mesma duração. Limiares (`THRESHOLDS`):

| Diagnóstico | Regra |
|---|---|
| Aumento de CPA | CPA +30% com ≥ 10 conversões em cada período |
| Queda de conversões | −30% com ≥ 10 conversões no período anterior |
| Gasto excessivo | média diária > 1,2 × orçamento diário |
| Rastreamento | 3 últimos dias com gasto e zero conversões, tendo ≥ 3 antes |
| Possível fadiga criativa | CTR dos últimos 7 dias 25% menor que o dos 7 primeiros, com ≥ 5.000 impressões em cada janela |
| Anomalia de gasto | dia com gasto > 3 desvios-padrão da média (≥ 10 dias) |
| ROAS baixo | ROAS < 1 com ≥ 5 conversões |
| Oportunidade de escala | CPA ≥ 30% abaixo da média da moeda com ≥ 20 conversões |

**Confiança** = `0,35 + 0,6 × min(1, volume/alvo)`, limitada a 0,95. Cada achado traz evidências, impacto, riscos e limitações. Recomendações são identificadas por `tipo:campanha` e mantêm a decisão do usuário entre execuções.

## Experimentos

`packages/advertising-core/src/experiments.ts`:

- CTR e taxa de conversão: teste z de duas proporções; CPA: comparação de taxas de Poisson (conversões por unidade de gasto).
- Cada variante é comparada ao controle (primeira); com mais de 2 variantes, aplica-se a correção de Bonferroni (α = 0,05 / (k − 1)).
- Volume mínimo por variante: CTR 1.000 impressões e 30 cliques; conversão 100 cliques e 10 conversões; CPA 10 conversões.
- Sem volume ou sem significância → **inconclusivo** (e o experimento encerra com esse status).

## Publicação e operações nas plataformas

`packages/core/src/services/publishing.ts`:

1. **Checklist** sem chamadas externas (organização real, conta, moeda, orçamento, limite, tipo suportado).
2. **Confirmação** explícita (`confirm: true` no contrato IPC e caixa de confirmação na interface).
3. **Idempotência:** cada escrita grava `platform_operations` com chave única (`createCampaign:<id>` para criação).
4. **Escritas sem retentativa automática.** Se o resultado é incerto (rede, timeout, 5xx), a operação fica `unknown` e a campanha `pending`. Na nova tentativa, o app **consulta a plataforma** (busca por nome) antes de criar de novo.
5. Só após a resposta da API a campanha recebe o ID remoto e o estado `synced`.
6. **Limites por organização:** orçamento diário máximo e aumento percentual máximo por alteração (padrão 50%).

## Automações

`packages/core/src/services/automations.ts`: regras com escopo, até 5 condições (E), janela, frequência, ação, teto e expiração.

- **Idempotência:** uma execução por `regra:campanha:fim-da-janela`.
- **Verificação de estado:** não pausa o que já está pausado; recalcula orçamento e limites no momento da aprovação.
- **Aprovação** expira em 72 h.
- **Botão de emergência** por organização: desliga todas as regras e bloqueia execução e aprovações.
- **Demonstração:** ações são apenas simuladas.
- O agendador roda a cada 5 minutos **enquanto o app está aberto** (não há serviço em segundo plano).

## Relatórios

Conteúdo calculado na geração e gravado em `reports.content`. PDF renderizado em janela oculta **sem JavaScript**, com CSP `default-src 'none'`. CSV com BOM UTF-8, separador `;`, vírgula decimal e proteção contra injeção de fórmulas.

## Observabilidade

Logs JSON por linha em `%APPDATA%\ADVERTEX AI Studio\logs\main.log`, com rotação (5 MB × 3) e redação automática de segredos. Erros exibidos ao usuário trazem um **ID de diagnóstico** que aparece no log. Chamadas às APIs usam timeout, retentativas com backoff + jitter (somente leituras), respeitam `Retry-After` e um circuit breaker (5 falhas → pausa de 1 min).
