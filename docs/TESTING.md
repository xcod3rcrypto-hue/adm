# Testes

## Visão geral

| Camada | Ferramenta | Comando |
|---|---|---|
| Unitários e de serviço | Vitest | `npm test` |
| Tipos | TypeScript | `npm run typecheck` |
| Estilo/erros | ESLint | `npm run lint` |
| Ponta a ponta (app real) | Playwright + Electron | `npm run test:e2e` |
| Instalação no Windows | PowerShell | `npm run verify:install` |

Tudo roda no CI (`.github/workflows/ci.yml`) a cada envio.

## Unitários e de serviço

Os serviços de `packages/core` rodam com banco em memória (`makeTestContext`), cifra falsa, relógio e IDs determinísticos. APIs externas são simuladas com `fetch` falso (testes de contrato com mocks) e a IA com `fakeProvider`.

Cobertura principal:

- **Domínio:** organizações, projetos, briefing e versões, criativos e versões, campanhas, onboarding, **isolamento entre organizações**.
- **Banco:** migrações, gravação atômica, rollback de transação.
- **Rede:** SSRF (IPs privados, IPv6, redirecionamentos), leitura de páginas, redação de segredos.
- **Integrações:** fluxo Meta completo (token → contas → campanhas → métricas), Google (PKCE, GAQL, paginação, erros), escritas (criação pausada, sem retentativa, orçamento em centavos/micros, remoção de orçamento órfão, escape GAQL).
- **Publicação:** checklist, criação idempotente, **resultado incerto com verificação remota**, recusa definitiva, limites de orçamento, demonstração bloqueada.
- **Inteligência:** cada diagnóstico, ordenação, confiança, preservação de decisões.
- **Experimentos:** estatística (z, Poisson, Bonferroni), volume mínimo, encerramento inconclusivo, importação de métricas.
- **Automações:** simulação sem efeitos, idempotência por janela, aprovação/rejeição, teto e limites, botão de emergência, agendador, demonstração simulada.
- **Relatórios:** fotografia, filtro por projeto, CSV (BOM, `;`, injeção de fórmulas), HTML sem scripts.
- **Calendário e concorrentes:** itens derivados, validações, IA simulada, isolamento.

## Ponta a ponta

`tests/e2e/app.spec.ts` compila o app e o abre com uma pasta de dados temporária (`ADVERTEX_USER_DATA`):

1. Primeira execução: organização, projeto, briefing com validação, IA não configurada explicada.
2. Reinicia e confere persistência; criativo com limite de caracteres e aprovação; rascunho de campanha; **checklist de publicação** bloqueando sem conta; experimento até o resultado significativo; evento no calendário; concorrente com **bloqueio de SSRF**; integrações sem conexão simulada; configurações e auditoria.
3. Modo demonstração: dashboard, **Inteligência**, **Automações** (simulação, execução simulada, botão de emergência), **Relatórios** com exportação real de PDF e CSV; volta à organização real sem dados demo.
4. Log de diagnóstico existe e não contém segredos.

Capturas de tela ficam em `test-results/screens/` (e como artefato no CI).

No Linux sem tela: `xvfb-run -a npm run test:e2e`.

## Verificação de instalação (Windows)

`infra/scripts/verify-install.ps1`:

1. instala em modo silencioso;
2. confere executável, atalhos da **Área de Trabalho** e do **menu Iniciar** (apontando para o executável instalado) e registro de desinstalação;
3. abre o app **pelo atalho**, fora do repositório, e confere no log `app.start` e `db.open`;
4. com `-Uninstall`, desinstala e confere a remoção.

Roda no job `windows-installer` do CI.

## Checklist manual antes de uma versão

- [ ] Instalação limpa em Windows 10/11, abrir pelo atalho, reiniciar o computador e abrir de novo
- [ ] Atualizar instalando a versão nova por cima: dados preservados
- [ ] Desinstalar e reinstalar: dados preservados
- [ ] IA real: gerar análise do briefing e variações no estúdio
- [ ] Meta real (conta de teste): sincronizar, publicar pausada, pausar/ativar, orçamento
- [ ] Google real (conta de teste): autorizar, sincronizar, publicar campanha de Pesquisa pausada
- [ ] Exportar relatório PDF e abrir CSV no Excel
