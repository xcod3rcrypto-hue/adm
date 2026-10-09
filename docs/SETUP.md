# Instalação e configuração

## 1. Instalar (usuário final)

1. Baixe o instalador `ADVERTEX-AI-Studio-Setup-<versão>.exe` (GitHub → Actions → CI → Artifacts, ou gere localmente com `npm run dist:win`).
2. Execute. Se o Windows SmartScreen avisar, clique em **Mais informações → Executar assim mesmo** (o executável ainda não é assinado digitalmente).
3. Escolha a pasta (padrão: `%LOCALAPPDATA%\Programs\ADVERTEX AI Studio`) e conclua.
4. Abra pelo atalho **ADVERTEX AI Studio** na Área de Trabalho ou no menu Iniciar.

Desinstalar: *Configurações do Windows → Aplicativos → ADVERTEX AI Studio → Desinstalar*. Seus dados em `%APPDATA%\ADVERTEX AI Studio` são preservados (apague a pasta manualmente se quiser removê-los).

## 2. Primeira execução

1. Crie a organização (e, opcionalmente, o primeiro projeto).
2. Preencha o briefing do projeto.
3. Configure o provedor de IA (passo 3).
4. Conecte Meta Ads e/ou Google Ads (passo 4), se desejar. Sem integrações, o app funciona para planejamento, criação e organização.
5. Para conhecer as telas com dados, use **Configurações → Modo demonstração**. Ele cria uma organização separada, com números fictícios identificados em todas as telas, relatórios e exportações.

## 3. Provedor de IA (Anthropic)

1. Crie uma chave em <https://console.anthropic.com/> (menu *API Keys*).
2. No app: **Configurações → Provedor de IA**, cole a chave, escolha o modelo e clique em **Salvar**, depois em **Testar conexão**.

A chave é cifrada pelo Windows (DPAPI) e nunca é exibida de novo. O uso é cobrado pela Anthropic na sua conta.

## 4. Integrações

Veja o passo a passo detalhado em [INTEGRATIONS.md](INTEGRATIONS.md). Resumo:

- **Meta Ads:** token de acesso de usuário do sistema (Business Manager) com `ads_read`; para publicar, também `ads_management`.
- **Google Ads:** Client ID e Client Secret de um cliente OAuth do tipo **App para computador**, *developer token* e, para contas gerenciadas, o ID da conta de administrador (MCC).

Depois de conectar: **Sincronizar contas → Sincronizar campanhas → Importar métricas** (escolha o período).

## 5. Limites de publicação

**Configurações → Limites de publicação**:

- **Orçamento diário máximo por campanha** (vazio = sem limite);
- **Aumento máximo por alteração** (padrão 50%).

Os limites valem para ações manuais e para automações.

## 6. Backup e recuperação

Os dados ficam em `%APPDATA%\ADVERTEX AI Studio\`.

- **Backup:** feche o app e copie a pasta inteira (`data\`, `assets\`).
- **Restaurar:** feche o app, substitua a pasta e abra novamente.
- O app guarda automaticamente `data\advertex.sqlite.bak` (estado ao abrir). Se o banco estiver corrompido, feche o app, renomeie o `.bak` para `advertex.sqlite` e abra.

> As credenciais são cifradas com a sua conta do Windows. Em outro computador ou outro usuário do Windows, elas não podem ser lidas: informe-as novamente em Integrações e Configurações.

## 7. Ambiente de desenvolvimento

Pré-requisitos: Node.js ≥ 22.12, npm, Git.

```powershell
npm ci          # instala dependências (baixa o Electron)
npm run dev     # abre o app com recarga automática
```

Variáveis de ambiente (opcionais):

| Variável | Uso |
|---|---|
| `ADVERTEX_USER_DATA` | Usa outra pasta de dados (testes E2E e verificação de instalação) |

Não há arquivo `.env`: credenciais são informadas pela interface e guardadas cifradas.

## 8. Solução de problemas

| Sintoma | O que fazer |
|---|---|
| Mensagem de erro com "ID de diagnóstico" | **Configurações → Diagnóstico → Abrir pasta de logs** e procure o ID em `main.log` |
| "Armazenamento seguro do sistema indisponível" | O Windows não liberou a DPAPI para o seu usuário; reinicie a sessão do Windows |
| Meta: "Token de acesso inválido ou expirado" | Gere um novo token (de preferência de usuário do sistema) e salve novamente |
| Google: "developer token não tem acesso a contas de produção" | Solicite acesso básico no Centro de API do Google Ads ou use uma conta de teste |
| Publicação com "Resultado incerto" | Confira a conta na plataforma. Ao tentar de novo, o app verifica se a campanha já existe antes de criar |
| SmartScreen bloqueia o instalador | "Mais informações → Executar assim mesmo" (executável sem assinatura) |
