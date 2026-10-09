# Roadmap e status

Status em relação ao Briefing Mestre (fases 0 a 8).

| Fase | Entrega | Status |
|---|---|---|
| 0 — Auditoria | Repositório inspecionado, riscos e backlog mapeados | ✅ |
| 1 — Fundação | Electron, React, TypeScript, navegação, design system, logs, testes, empacotamento | ✅ |
| 2 — Projetos | Organizações, clientes, projetos, briefing versionado, persistência | ✅ |
| 3 — Estúdio criativo | Geração de texto com IA, biblioteca de ativos, upload, editor, versões e aprovação | ✅ |
| 4 — Dashboard | Métricas, gráficos, filtros, relatórios (PDF/CSV), modo demonstração | ✅ |
| 5 — Integrações | Leitura e sincronização Meta/Google; publicação controlada (criar pausada, pausar/ativar, orçamento, envio de imagem) | ✅ |
| 6 — Inteligência | Diagnósticos, recomendações, inteligência competitiva, experimentos | ✅ |
| 7 — Automações | Regras, simulação, aprovação, auditoria, execução limitada, botão de emergência | ✅ |
| 8 — Produção | Segurança, regressão, documentação, verificação de instalação em CI Windows | ✅ (ver pendências) |

## Critérios de aceite (seção 16)

| # | Critério | Como é verificado |
|---|---|---|
| 1 | Inicia sem erros, navegação funcional | E2E (Playwright no app real) |
| 2 | Criar, editar e persistir projetos e briefings | E2E (reinicia o app e confere) + testes de serviço |
| 3 | Geração de conteúdo com provedor configurado | Testes com provedor simulado; uso real com chave da Anthropic |
| 4 | Arquivos enviados, organizados e recuperados | Testes de ativos (assinatura de arquivo, tags, exportação) |
| 5 | Métricas demo identificadas como fictícias | E2E + faixa "MODO DEMONSTRAÇÃO", avisos em relatórios e inteligência |
| 6 | Conectores explicam credenciais sem simular conexão | E2E (botões desabilitados sem credenciais) |
| 7 | Publicação com validação, confirmação e tratamento de falhas | Testes de publicação (resultado incerto, recusa, limites) + E2E do checklist |
| 8 | Sem botões fictícios | Revisão das telas; ações sem pré-requisito ficam desabilitadas com explicação |
| 9 | Testes automatizados passando | CI |
| 10 | Empacotável para Windows | CI `windows-installer` |
| 11 | Atalho na Área de Trabalho e menu Iniciar | `infra/scripts/verify-install.ps1` no CI Windows |
| 12 | Abre sem a pasta de desenvolvimento | Script abre pelo atalho, fora do repositório, e confere o log |
| 13 | Outra pessoa consegue configurar e executar | README + docs/SETUP.md |

## Pendências conhecidas e próximos passos

Itens que dependem de serviços externos, credenciais ou decisões de negócio:

1. **Assinatura de código (Authenticode).** Sem certificado, o SmartScreen avisa na instalação. Requer certificado de assinatura (idealmente EV).
2. **Atualização automática.** Requer servidor de publicação (ex.: GitHub Releases) e assinatura. A estrutura do electron-builder já comporta `electron-updater`.
3. **OAuth da Meta.** Hoje a Meta usa token (de preferência de usuário do sistema do Business Manager). Login pelo navegador exige app aprovado e redirecionamento configurado.
4. **Criação de conjuntos de anúncios, grupos e anúncios.** A publicação cria a campanha (pausada) e envia imagens. Conjuntos/grupos de anúncios e anúncios ainda são configurados no gerenciador da plataforma antes de ativar.
5. **Tipos de campanha Google além de Pesquisa** (Performance Max, Display, Vídeo, Demand Gen) exigem ativos e configurações adicionais.
6. **Métricas por anúncio/criativo** para comparação criativa e frequência (hoje os diagnósticos são por campanha).
7. **Backend hospedado multiusuário** (NestJS + PostgreSQL/Prisma + Redis/BullMQ): usuários, papéis, permissões, agendamento 24/7 independente do app aberto e compartilhamento de relatórios.
8. **Geração de imagens por IA** (conceitos visuais): depende da escolha de um provedor de imagem.
9. **Mais provedores de IA de texto**: o contrato `TextProvider` permite adicioná-los.
