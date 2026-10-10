# ADVERTEX AI Studio

Aplicativo desktop para Windows que reúne, em um só lugar, briefing estratégico, criação de anúncios com IA, biblioteca de criativos, campanhas Meta Ads e Google Ads, análise de desempenho, experimentos, automações auditáveis, relatórios e inteligência competitiva.

> **Princípio do produto:** criar, publicar e otimizar são etapas diferentes. O app nunca apresenta dados fictícios como reais e nunca marca uma publicação como concluída sem a confirmação da plataforma.

## Funcionalidades

| Área | O que faz |
|---|---|
| **Visão geral** | KPIs por moeda, gráfico diário, comparação com o período anterior, alertas e filtros por plataforma |
| **Projetos e briefing** | Clientes, projetos, briefing completo e versionado, leitura de página pública (com proteção SSRF) e análise estratégica por IA |
| **Estúdio de IA** | Variações de texto por formato, etapa do funil e público, com validação dos limites de caracteres de cada plataforma |
| **Criativos** | Biblioteca de textos e imagens/vídeos com versões, aprovação, tags, busca e envio de imagens para a conta de anúncios |
| **Campanhas** | Modelo unificado; rascunhos locais, **publicação controlada** (checklist, confirmação, criação pausada), pausar/ativar, orçamento e histórico de operações. Meta: **conjuntos e anúncios completos** (público, otimização, pixel, imagem, texto, título, botão e link). Google Pesquisa: grupos, palavras-chave e anúncios responsivos |
| **Copiloto** | Chat com a IA (Claude) que consulta os dados reais por ferramentas — desempenho, campanhas, diagnóstico, Cérebro criativo, termos de busca, Piloto e briefings — e executa tarefas locais (textos, criativos, rascunhos). Pausar, ativar ou mudar orçamento vira **proposta com botão de confirmação**; nada vai às plataformas sem você |
| **Cérebro criativo** | Importa o desempenho de cada anúncio (Meta e Google), descreve o criativo (características objetivas + ângulo, emoção, tom e gancho por IA) e descobre, por plataforma, o que eleva CTR e conversão — teste z de proporções + teste t de Welch entre anúncios. Gera o **playbook** da conta e injeta os aprendizados na geração de textos, anúncios de Pesquisa, imagens e Fábrica |
| **Piloto automático** | Lê termos de busca reais, anúncios e campanhas e propõe ações com evidência e economia estimada: negativar desperdício (inclusive buscas fora do negócio, via IA), adicionar buscas que vendem como palavra-chave exata, pausar anúncios perdedores (nunca o último do grupo) e escalar/reduzir orçamento pelo CPA alvo. Fila de aprovação, aplicação idempotente, rotina diária opcional e respeito ao botão de emergência |
| **Fábrica de criativos** | Bateria de teste em um clique: N ângulos (ou variações de um anúncio vencedor), textos, imagens Gemini em cada formato e o **experimento A/B** já montado |
| **Inteligência** | Diagnósticos com evidências, confiança, impacto, riscos e limitações: aumento de CPA, queda de conversões, gasto excessivo, rastreamento, possível fadiga criativa, anomalias, ROAS baixo e oportunidades de escala |
| **Concorrentes** | Captura de páginas públicas com URL e data, classificação (promessa, conceito, público, formato, posicionamento) e análise de padrões por IA |
| **Experimentos** | Hipótese, variantes, métrica primária, teste estatístico (z de proporções / Poisson, Bonferroni) e resultado inconclusivo explícito |
| **Automações** | Regras com condições, janela, frequência, ação, teto, expiração e 4 modos (alertas, recomendações, com aprovação, automática limitada), simulação, idempotência e **botão de emergência** |
| **Relatórios** | Resumo executivo, métricas, gráfico, campanhas, alertas, recomendações e limitações; exportação em **PDF** e **CSV** |
| **Calendário** | Tarefas, lançamentos, prazos, responsáveis e aprovações, junto com as datas de campanhas e experimentos |
| **Integrações** | Meta Marketing API (token) e Google Ads API (OAuth 2.0 com PKCE), sincronização de contas, campanhas e métricas |
| **Configurações** | Organização, provedor de IA (Anthropic), limites de publicação, modo demonstração, diagnóstico e auditoria |

## Requisitos

- **Para usar:** Windows 10 ou 11 (64 bits).
- **Para desenvolver:** Node.js **22.12 ou superior** e npm. Git opcional.

## Começando (desenvolvimento)

```powershell
git clone https://github.com/xcod3rcrypto-hue/adm.git
cd adm
npm ci
npm run dev
```

O app abre em modo de desenvolvimento. Na primeira execução, crie sua organização ou explore o **modo demonstração** (dados fictícios, claramente identificados e separados).

## Comandos

| Comando | Descrição |
|---|---|
| `npm run dev` | Abre o app em modo desenvolvimento (recarga automática) |
| `npm run lint` | ESLint |
| `npm run typecheck` | Verificação de tipos (processo principal e interface) |
| `npm test` | Testes unitários e de integração (Vitest) |
| `npm run test:e2e` | Compila e roda os testes ponta a ponta no app Electron real (Playwright) |
| `npm run build` | Compila para `out/` |
| `npm run dist:win` | Gera o instalador `release/ADVERTEX-AI-Studio-Setup-<versão>.exe` |
| `npm run verify:install` | No Windows: instala, confere atalhos e abre o app pelo atalho |
| `npm run icons` | Regenera `build/icon.ico` e `build/icon.png` a partir do logo |

## Gerar o instalador `.exe`

### Opção A — pelo GitHub (sem instalar nada)

Cada envio para o GitHub dispara o workflow **CI** (`.github/workflows/ci.yml`), que:

1. roda lint, tipos, testes unitários e E2E;
2. em uma máquina **Windows**, gera o instalador, instala em modo silencioso, confere os atalhos da Área de Trabalho e do menu Iniciar, abre o app pelo atalho e desinstala;
3. publica o instalador como artefato.

Para baixar: **GitHub → aba Actions → execução mais recente do CI → seção Artifacts → `ADVERTEX-AI-Studio-Setup`**. Também é possível disparar manualmente em *Actions → CI → Run workflow*.

### Opção B — no seu computador

```powershell
npm ci
npm run dist:win
```

O instalador fica em `release\`. Para conferir a instalação: `npm run verify:install`.

O instalador cria atalhos na **Área de Trabalho** e no **menu Iniciar**, registra o desinstalador e preserva seus dados ao desinstalar. O executável **não é assinado digitalmente**: o Windows SmartScreen pode exibir um aviso ("Mais informações → Executar assim mesmo"). Veja [docs/ROADMAP.md](docs/ROADMAP.md).

## Onde ficam os dados

Tudo fica no seu computador, em `%APPDATA%\ADVERTEX AI Studio\`:

- `data\advertex.sqlite` — banco de dados (com cópia `advertex.sqlite.bak` do último estado aberto);
- `assets\` — imagens e vídeos da biblioteca;
- `logs\main.log` — log de diagnóstico, sem segredos.

Chaves de API e tokens ficam **criptografados** pelo Windows (DPAPI, via `safeStorage` do Electron) e nunca chegam à interface nem aos logs. Detalhes em [docs/SECURITY.md](docs/SECURITY.md).

## Configurar integrações

- **IA (Anthropic):** Configurações → Provedor de IA → chave de API.
- **Meta Ads:** Integrações → Meta Ads → token de acesso (`ads_read` para leitura; `ads_management` para publicar).
- **Google Ads:** Integrações → Google Ads → Client ID/Secret (app para computador), developer token e autorização no navegador.

Passo a passo completo em [docs/SETUP.md](docs/SETUP.md) e [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md).

## Estrutura

```
apps/desktop/          Electron: main (processo principal), preload, renderer (React)
packages/shared/       Tipos, schemas Zod, contrato IPC, formatação
packages/core/         Serviços de negócio, banco (sql.js), segurança de rede, auditoria
packages/ai-core/      Provedor de IA (Anthropic) e prompts
packages/advertising-core/  Métricas, diagnósticos, estatística, HTTP resiliente, contratos de plataforma
packages/platform-meta/     Adaptador Meta Marketing API
packages/platform-google/   Adaptador Google Ads API + OAuth
infra/scripts/         Ícones e verificação de instalação
tests/e2e/             Testes ponta a ponta (Playwright + Electron)
docs/                  Arquitetura, roadmap, setup, integrações, segurança e testes
```

## Documentação

- [Arquitetura](docs/ARCHITECTURE.md)
- [Roadmap e status](docs/ROADMAP.md)
- [Instalação e configuração](docs/SETUP.md)
- [Integrações Meta e Google](docs/INTEGRATIONS.md)
- [Segurança e privacidade](docs/SECURITY.md)
- [Testes](docs/TESTING.md)
