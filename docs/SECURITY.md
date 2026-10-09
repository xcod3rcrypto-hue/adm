# Segurança e privacidade

## Electron

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, `webSecurity: true`.
- O preload expõe uma única função, `invoke(canal, payload)`, restrita à lista de canais permitidos.
- O processo principal aceita IPC **somente** da janela principal, carregada da URL do app.
- Navegação e novas janelas bloqueadas; links externos só abrem no navegador se o domínio estiver na lista de permitidos (consoles e documentação oficiais).
- Permissões do navegador (câmera, microfone, localização, notificações etc.) negadas; exceção: escrita na área de transferência (botão *Copiar*).
- **Content-Security-Policy** em produção: somente recursos locais, sem scripts inline, `object-src 'none'`, `frame-ancestors 'none'`.
- Menu da aplicação removido; instância única.
- Ativos servidos por protocolo interno (`advertex-asset://`) com `X-Content-Type-Options: nosniff`, sem expor caminhos do disco.

## Segredos

- Chaves de IA, tokens da Meta, Client Secret, developer token e refresh token do Google são cifrados com `safeStorage` (**DPAPI** no Windows) e guardados na tabela `secrets`.
- Segredos **nunca** voltam para a interface (ela só sabe *quais* campos estão configurados) e nunca vão para o repositório nem para o bundle.
- Se o armazenamento seguro estiver indisponível, a credencial **não** é salva.
- Logs e auditoria passam por redação automática (`redact`): chaves como `token`, `secret`, `apiKey` e padrões como `sk-ant-…` e `EAA…` são mascarados. Um teste E2E confere o log.
- O access token do Google fica só em memória.

## Entradas e rede

- Todo payload de IPC é validado com **Zod** antes da lógica de negócio.
- **SSRF:** a leitura de páginas públicas (briefing e concorrentes) aceita apenas `http(s)`, portas 80/443, sem credenciais na URL; bloqueia `localhost`, `.local`, `.internal` e IPs privados/reservados (IPv4 e IPv6, incluindo IPv4 mapeado e NAT64); valida **todos** os IPs resolvidos e fixa a conexão no IP validado (sem DNS rebinding); revalida cada redirecionamento; limita tamanho e tempo; não contorna autenticação (401/403 encerram).
- Arquivos importados: até 50 MB, tipo verificado pela **assinatura do conteúdo** (não pela extensão), gravados com nome gerado pelo app (o nome original nunca vira caminho no disco), hash SHA-256 contra duplicatas.
- CSV exportado neutraliza fórmulas (`=`, `+`, `-`, `@`).
- PDF renderizado em janela oculta **sem JavaScript** e com CSP `default-src 'none'`.
- Conteúdo de usuário enviado à IA vai delimitado por tags e é tratado como dado, não como instrução.

## Isolamento por organização

Todo serviço recebe o `organizationId` explicitamente e filtra por ele **no SQL**; vínculos entre entidades (projeto, campanha, criativo, conta) são verificados como pertencentes à mesma organização. Acesso a dados de outra organização retorna "não encontrado", sem revelar existência. Há testes de isolamento em cada serviço. A organização de demonstração é separada e não pode se conectar a contas reais.

## Ações críticas

- Publicação e alterações de orçamento/status exigem confirmação explícita (`confirm: true` no contrato IPC).
- Limites de orçamento por organização valem para usuário e automações.
- Escritas são idempotentes, sem retentativa automática, com verificação do estado remoto.
- Automações: modos com aprovação humana, teto obrigatório para aumento de orçamento, expiração e **botão de emergência**.
- **Auditoria** (`audit_logs`) de criação, edição, exclusão, conexões, sincronizações, gerações de IA, publicações, automações, aprovações e exportações. A trilha sobrevive à exclusão de projetos.

## Retenção

Os dados ficam apenas no computador do usuário. Logs giram em 3 arquivos de 5 MB. Excluir a organização de demonstração apaga todos os dados dela. Desinstalar preserva os dados; apague `%APPDATA%\ADVERTEX AI Studio` para removê-los.

## Checklist antes de produção

- [ ] Credenciais reais configuradas e testadas (Meta, Google, IA)
- [ ] Limites de publicação definidos
- [ ] Logs revisados (sem segredos)
- [ ] Instalador verificado em Windows limpo (`npm run verify:install`)
- [ ] Executável assinado (recomendado)

## Reportar vulnerabilidades

Não abra issue pública. Entre em contato diretamente com os mantenedores do repositório.
