import { mkdtempSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test, expect, _electron as electron, type ElectronApplication, type Page } from '@playwright/test';

/**
 * E2E no app Electron compilado (out/). Usa um diretório de dados temporário
 * (ADVERTEX_USER_DATA), sem tocar no perfil real. Executáveis empacotados são
 * verificados separadamente por infra/scripts/verify-install.ps1.
 */
const root = resolve(__dirname, '../..');
const userData = mkdtempSync(join(tmpdir(), 'advertex-e2e-'));
const shots = join(root, 'test-results', 'screens');

async function launch(): Promise<{ app: ElectronApplication; page: Page }> {
  const app = await electron.launch({ args: [root], cwd: root, env: { ...process.env, ADVERTEX_USER_DATA: userData, NODE_ENV: 'production' } });
  const page = await app.firstWindow();
  await page.waitForLoadState('domcontentloaded');
  return { app, page };
}

test.describe.serial('ADVERTEX AI Studio', () => {
  test('primeira execução: cria organização, projeto e briefing', async () => {
    const { app, page } = await launch();
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await expect(page.getByRole('heading', { name: /Bem-vindo/ })).toBeVisible();
    await page.screenshot({ path: join(shots, '01-onboarding.png') });

    await page.getByLabel('Nome da organização').fill('Agência Horizonte');
    await page.getByLabel('Primeiro projeto (opcional)').fill('Lançamento Verão');
    await page.getByLabel('Objetivo do projeto').fill('Gerar 300 leads por mês');
    await page.getByRole('button', { name: 'Criar e continuar' }).click();

    await expect(page.getByRole('heading', { name: 'Lançamento Verão' })).toBeVisible();
    await page.getByLabel('Produto ou serviço').fill('Curso online de fotografia');
    await page.getByLabel('Público-alvo').fill('Iniciantes 25-40 anos');
    await page.getByLabel('Site ou página de destino').fill('notaurl');
    await page.getByRole('button', { name: 'Salvar nova versão' }).click();
    await expect(page.getByText(/http\(s\) válida/)).toBeVisible();
    await page.getByLabel('Site ou página de destino').fill('');
    await page.getByRole('button', { name: 'Salvar nova versão' }).click();
    await expect(page.getByText('Briefing salvo (versão 1).')).toBeVisible();
    await expect(page.getByText('Briefing v1')).toBeVisible();
    await page.screenshot({ path: join(shots, '02-briefing.png'), fullPage: true });

    // Análise estratégica sem provedor: explica a configuração, não simula.
    await page.getByRole('tab', { name: 'Análise estratégica' }).click();
    await expect(page.getByText('Provedor de IA não configurado')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Gerar análise com IA' })).toBeDisabled();

    expect(errors).toEqual([]);
    await app.close();
  });

  test('dados persistem após reiniciar; criativos, campanhas e integrações', async () => {
    const { app, page } = await launch();
    await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible();
    await expect(page.getByText('Ainda não há métricas para exibir')).toBeVisible();
    await page.screenshot({ path: join(shots, '03-dashboard-vazio.png') });

    await page.getByRole('link', { name: 'Projetos' }).click();
    await expect(page.getByRole('link', { name: 'Lançamento Verão' })).toBeVisible();

    // Criativo manual com validação de limite
    await page.getByRole('link', { name: 'Criativos', exact: true }).click();
    await page.getByRole('button', { name: 'Novo criativo' }).click();
    await page.getByLabel('Título interno').fill('Título RSA principal');
    await page.getByLabel('Formato').selectOption('google_rsa_headline');
    await page.locator('#cf-body').fill('Aprenda fotografia do zero hoje mesmo');
    await expect(page.getByText(/rejeitará este texto/)).toBeVisible();
    await page.locator('#cf-body').fill('Aprenda fotografia do zero');
    await page.getByRole('dialog').getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Criativo criado.')).toBeVisible();
    await page.getByRole('button', { name: 'Aprovar' }).click();
    await expect(page.getByText('Status: Aprovado.')).toBeVisible();
    await page.screenshot({ path: join(shots, '04-criativos.png') });

    // Geração de imagem com Gemini: sem chave, o botão orienta a configurar
    await page.getByRole('tab', { name: 'Imagens e vídeos' }).click();
    await page.getByRole('button', { name: 'Gerar imagem com IA' }).click();
    const genDialog = page.getByRole('dialog');
    await expect(genDialog.getByText('Configure a chave da API do Gemini para gerar imagens.')).toBeVisible();
    await genDialog.getByLabel('Descreva a imagem').fill('Foto realista de uma antena no telhado ao pôr do sol');
    await expect(genDialog.getByRole('button', { name: 'Gerar imagem', exact: true })).toBeDisabled();
    await page.screenshot({ path: join(shots, '04a-gerar-imagem.png') });
    await genDialog.getByRole('button', { name: 'Fechar', exact: true }).last().click();
    await page.getByRole('tab', { name: 'Textos' }).click();

    // Rascunho de campanha
    await page.getByRole('link', { name: 'Campanhas' }).click();
    await page.getByRole('button', { name: 'Novo rascunho' }).first().click();
    await page.locator('#cp-name').fill('Leads — Verão');
    await page.getByLabel('Orçamento diário').fill('80');
    await page.getByRole('button', { name: 'Salvar rascunho' }).click();
    await expect(page.getByText('Rascunho salvo localmente.')).toBeVisible();
    await expect(page.getByRole('cell', { name: /^Leads — Verão Sem projeto/ })).toBeVisible();
    await page.screenshot({ path: join(shots, '05-campanhas.png') });

    // Publicação: sem conta conectada, o checklist bloqueia e explica (nada é simulado)
    await page.getByRole('button', { name: 'Publicar' }).click();
    const checks = page.getByRole('list', { name: 'Verificações antes de publicar' });
    await expect(checks.getByText('Selecione uma conta sincronizada da plataforma.')).toBeVisible();
    await expect(checks.getByText(/criada PAUSADA/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Publicar pausada' })).toBeDisabled();
    await page.screenshot({ path: join(shots, '05a-publicar.png') });
    await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click();

    // Rede de Pesquisa: grupo de anúncios com palavras-chave e anúncio responsivo (rascunho local)
    await page.getByRole('button', { name: 'Novo rascunho' }).first().click();
    await page.locator('#cp-name').fill('Pesquisa — Fotografia');
    await page.locator('#cp-platform').selectOption('google');
    await page.locator('#cp-obj').selectOption('SEARCH');
    await page.getByLabel('Orçamento diário').fill('40');
    await page.getByRole('button', { name: 'Salvar rascunho' }).click();
    await expect(page.getByText('Rascunho salvo localmente.').first()).toBeVisible();
    await page.getByRole('button', { name: 'Anúncios e palavras-chave' }).click();
    await page.getByRole('button', { name: 'Novo grupo de anúncios' }).click();
    await page.getByLabel('Página de destino (URL final)').fill('https://exemplo.com.br/curso');
    await page.getByLabel('Nova palavra-chave').fill('curso de fotografia online');
    await page.getByRole('button', { name: 'Adicionar', exact: true }).click();
    await expect(page.getByRole('cell', { name: '"curso de fotografia online"' })).toBeVisible();
    await page.getByLabel('Título 1', { exact: true }).fill('Curso de Fotografia Online');
    await page.getByLabel('Título 2', { exact: true }).fill('Aprenda do Zero');
    await page.getByLabel('Título 3', { exact: true }).fill('Este título passa do limite de 30');
    await expect(page.getByText('33/30')).toBeVisible();
    await page.getByLabel('Título 3', { exact: true }).fill('Matrículas Abertas');
    await page.getByLabel('Descrição 1').fill('Aulas práticas para iniciantes. Garanta sua vaga hoje.');
    await page.getByLabel('Descrição 2').fill('Aprenda no seu ritmo, com suporte. Inscreva-se agora.');
    await expect(page.getByLabel('Prévia do anúncio')).toContainText('Curso de Fotografia Online | Aprenda do Zero | Matrículas Abertas');
    await page.screenshot({ path: join(shots, '05e-grupo-anuncios.png'), fullPage: true });
    await page.getByRole('button', { name: 'Salvar grupo' }).click();
    await expect(page.getByText('Grupo de anúncios salvo.')).toBeVisible();
    await expect(page.getByRole('dialog').getByText('Rascunho local', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');

    // Meta: conjunto de anúncios (rascunho) mostra o que falta antes do envio
    await page.getByRole('button', { name: 'Conjuntos e anúncios' }).click();
    await page.getByRole('button', { name: 'Novo conjunto de anúncios' }).click();
    await expect(page.getByLabel('Otimizar para')).toBeVisible();
    await page.getByLabel('Link de destino').fill('https://exemplo.com.br/verao');
    await page.screenshot({ path: join(shots, '05f-meta-conjunto.png'), fullPage: true });
    await page.getByRole('button', { name: 'Salvar rascunho local' }).click();
    await expect(page.getByText(/Rascunho salvo\. Falta: Página do Facebook/)).toBeVisible();
    await expect(page.getByRole('dialog').getByText(/Falta: Página do Facebook; Ao menos um anúncio/)).toBeVisible();
    await page.keyboard.press('Escape');

    // Experimento A/B com teste estatístico
    await page.getByRole('link', { name: 'Experimentos' }).click();
    await page.getByRole('button', { name: 'Novo experimento' }).first().click();
    await page.getByLabel('Hipótese').fill('Se destacarmos o frete grátis no título, o CTR aumenta');
    await page.getByLabel('Variável testada').fill('Título');
    await page.locator('#v-0-imp').fill('10000');
    await page.locator('#v-0-clk').fill('200');
    await page.locator('#v-1-imp').fill('10000');
    await page.locator('#v-1-clk').fill('300');
    await page.getByRole('button', { name: 'Salvar experimento' }).click();
    await expect(page.getByText('Experimento salvo.')).toBeVisible();
    await page.getByRole('button', { name: 'Calcular resultado' }).click();
    await expect(page.getByText('Resultado significativo')).toBeVisible();
    await page.getByRole('button', { name: 'Encerrar', exact: true }).click();
    await page.getByLabel('Aprendizado e próximos passos').fill('Frete grátis no título aumenta o CTR em 50%.');
    await page.getByRole('button', { name: 'Encerrar e registrar' }).click();
    await expect(page.getByText('Experimento concluído com vencedor.')).toBeVisible();
    await expect(page.getByText('Aprendizado registrado')).toBeVisible();
    await page.screenshot({ path: join(shots, '05b-experimentos.png'), fullPage: true });

    // Calendário: evento com responsável
    await page.getByRole('link', { name: 'Calendário' }).click();
    await page.getByRole('button', { name: 'Novo evento' }).click();
    await page.getByLabel('Título').fill('Revisar criativos do verão');
    await page.getByLabel('Responsável').fill('Marina');
    await page.getByRole('button', { name: 'Salvar', exact: true }).click();
    await expect(page.getByText('Evento salvo.')).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: 'Revisar criativos do verão' })).toContainText('Marina');
    await page.screenshot({ path: join(shots, '05c-calendario.png') });

    // Concorrentes: cadastro e bloqueio de endereços internos (SSRF)
    await page.getByRole('link', { name: 'Concorrentes' }).click();
    await page.getByRole('button', { name: 'Novo concorrente' }).first().click();
    await page.getByLabel('Nome').fill('Estúdio Rival');
    await page.getByRole('dialog').getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Concorrente salvo.')).toBeVisible();
    await page.getByLabel('URL pública para capturar').fill('http://127.0.0.1/admin');
    await page.getByRole('button', { name: 'Capturar página' }).click();
    await expect(page.getByText('Endereços IP privados ou reservados não são permitidos.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Analisar com IA' })).toBeDisabled();
    await page.screenshot({ path: join(shots, '05d-concorrentes.png') });

    // Integrações: sem credenciais não há conexão simulada
    await page.getByRole('link', { name: 'Integrações' }).click();
    await expect(page.getByText('Não configurado').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Testar conexão' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Autorizar no navegador' })).toBeDisabled();
    await page.screenshot({ path: join(shots, '06-integracoes.png'), fullPage: true });

    // Configurações e auditoria
    await page.getByRole('link', { name: 'Configurações' }).click();
    await expect(page.getByText('Sem chave')).toHaveCount(2);
    await expect(page.getByText('Geração de imagens (Gemini)')).toBeVisible();
    await expect(page.getByText('(desenvolvimento)').or(page.getByText('(instalado)'))).toBeVisible();
    await expect(page.getByText('project.create')).toBeVisible();
    await expect(page.getByText('Atualização automática disponível apenas no app instalado.')).toBeVisible();
    await page.screenshot({ path: join(shots, '07-configuracoes.png'), fullPage: true });

    await app.close();
  });

  test('modo demonstração é identificado e separado', async () => {
    const { app, page } = await launch();
    await page.getByRole('link', { name: 'Configurações' }).click();
    await page.getByRole('button', { name: 'Criar organização de demonstração' }).click();
    await expect(page.getByText(/MODO DEMONSTRAÇÃO/)).toBeVisible();
    await page.getByRole('link', { name: 'Visão geral' }).click();
    await expect(page.getByText('Demonstração (fictício)')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Métricas em BRL' }).getByText('Investimento', { exact: true })).toBeVisible();
    await page.screenshot({ path: join(shots, '08-demo-dashboard.png'), fullPage: true });

    // Inteligência: análise sobre dados demo, identificada como fictícia
    await page.getByRole('link', { name: 'Inteligência' }).click();
    await expect(page.getByText('Nenhuma análise executada')).toBeVisible();
    await page.getByRole('button', { name: 'Executar análise' }).first().click();
    await expect(page.getByRole('heading', { name: /^Diagnósticos \(\d+\)$/ })).toBeVisible();
    await expect(page.getByText('Dados de demonstração')).toBeVisible();
    await expect(page.getByText('Limitações da análise')).toBeVisible();
    await page.screenshot({ path: join(shots, '09-inteligencia.png'), fullPage: true });

    // Automações: simular, executar (demo apenas simula) e botão de emergência
    await page.getByRole('link', { name: 'Automações' }).click();
    await page.getByRole('button', { name: 'Nova regra' }).first().click();
    await page.getByLabel('Nome').fill('Pausar sem conversões');
    await page.getByLabel('Valor da condição 1').fill('100');
    await page.getByLabel('Janela de avaliação (dias)').fill('3');
    await page.getByRole('button', { name: 'Simular' }).click();
    await expect(page.getByText(/Simulação: 1 de 5 campanha\(s\)/)).toBeVisible();
    await expect(page.getByText('Demo · Leads · Cafeterias').last()).toBeVisible();
    await page.screenshot({ path: join(shots, '10-automacao-simulacao.png') });
    await page.getByRole('button', { name: 'Salvar regra' }).click();
    await expect(page.getByText('Regra salva.')).toBeVisible();
    await page.getByRole('button', { name: 'Executar agora' }).click();
    await expect(page.getByText(/1 campanha\(s\) atenderam/)).toBeVisible();
    await page.getByRole('tab', { name: /Execuções/ }).click();
    await expect(page.getByRole('cell', { name: 'Simulada', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Botão de emergência' }).click();
    await page.getByRole('button', { name: 'Parar todas as automações' }).click();
    await expect(page.getByText(/Botão de emergência ativo/)).toBeVisible();
    await page.screenshot({ path: join(shots, '11-automacoes.png'), fullPage: true });
    await page.getByRole('button', { name: 'Liberar automações' }).click();
    await expect(page.getByText(/Botão de emergência ativo/)).toBeHidden();

    // Cérebro criativo: padrões, vencedores e "Multiplicar" levando à Fábrica
    await page.getByRole('link', { name: 'Cérebro criativo' }).click();
    await expect(page.getByRole('heading', { name: 'O que prende a atenção e converte' })).toBeVisible();
    await expect(page.getByText(/Anúncios com pergunta têm CTR/).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Anúncios vencedores' })).toBeVisible();
    await page.screenshot({ path: join(shots, '11a-cerebro.png'), fullPage: true });
    await page.getByRole('button', { name: 'Multiplicar' }).first().click();
    await expect(page.getByText(/Multiplicando o vencedor/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Fabricar lote' })).toBeEnabled();
    await page.screenshot({ path: join(shots, '11c-fabrica.png'), fullPage: true });

    // Piloto automático: analisar, aplicar (simulado na demo) e histórico
    await page.getByRole('link', { name: 'Piloto automático' }).click();
    await page.getByRole('button', { name: 'Analisar agora' }).click();
    await expect(page.getByText(/Análise concluída: \d+ ação/)).toBeVisible();
    await expect(page.getByText('Negativar "café de graça"')).toBeVisible();
    await page.screenshot({ path: join(shots, '11b-piloto.png'), fullPage: true });
    await page.getByLabel('Selecionar: Negativar "café de graça"').check();
    await page.getByRole('button', { name: /Aplicar 1 selecionada/ }).click();
    await page.getByRole('button', { name: 'Aplicar nas plataformas' }).click();
    await expect(page.getByText('1 ação(ões) aplicada(s).')).toBeVisible();
    await page.getByRole('tab', { name: 'Histórico' }).click();
    await expect(page.getByText(/Simulado \(demonstração\)/)).toBeVisible();

    // Copiloto: sem chave de IA, orienta a configurar e não deixa enviar
    await page.getByRole('link', { name: 'Copiloto' }).click();
    await expect(page.getByText('Como posso ajudar com os seus anúncios?')).toBeVisible();
    await expect(page.getByText('Configure o provedor de IA')).toBeVisible();
    await expect(page.getByLabel('Mensagem para o Copiloto')).toBeDisabled();
    await page.screenshot({ path: join(shots, '11d-copiloto.png'), fullPage: true });

    // Relatórios: gerar, visualizar e exportar PDF/CSV de verdade
    await page.getByRole('link', { name: 'Relatórios' }).click();
    await page.getByRole('button', { name: 'Novo relatório' }).first().click();
    await page.getByLabel('Título').fill('Relatório mensal demo');
    await page.getByRole('button', { name: 'Gerar relatório' }).click();
    await expect(page.getByText('Relatório gerado.')).toBeVisible();
    await expect(page.getByRole('dialog').getByText('Relatório de demonstração', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Resumo executivo' })).toBeVisible();
    await page.screenshot({ path: join(shots, '12-relatorio.png') });
    await page.getByRole('button', { name: 'Fechar' }).click();
    const pdfPath = join(userData, 'relatorio.pdf');
    const csvPath = join(userData, 'relatorio.csv');
    for (const [format, target] of [['PDF', pdfPath], ['CSV', csvPath]] as const) {
      await app.evaluate(({ dialog }, file) => {
        dialog.showSaveDialog = (async () => ({ canceled: false, filePath: file })) as typeof dialog.showSaveDialog;
      }, target);
      await page.getByRole('button', { name: format, exact: true }).click();
      await expect(page.getByText(`Relatório salvo em ${target}`)).toBeVisible();
    }
    expect(readFileSync(pdfPath).subarray(0, 5).toString()).toBe('%PDF-');
    const csv = readFileSync(csvPath, 'utf8');
    expect(csv).toContain('Campanha;Plataforma;Moeda;Investimento');
    expect(csv).toContain('DADOS FICTÍCIOS');

    // Voltar para a organização real: nenhum dado demo aparece
    await page.getByLabel('Organização').selectOption({ label: 'Agência Horizonte' });
    await expect(page.getByText(/MODO DEMONSTRAÇÃO/)).toBeHidden();
    await expect(page.getByText('Ainda não há métricas para exibir')).toBeVisible();
    await app.close();
  });

  test('log de diagnóstico existe e não contém segredos', async () => {
    const log = join(userData, 'logs', 'main.log');
    expect(existsSync(log)).toBe(true);
    const text = readFileSync(log, 'utf8');
    expect(text).toContain('app.start');
    expect(text).not.toMatch(/sk-ant-|EAA[A-Za-z0-9]{20}/);
    writeFileSync(join(shots, 'userData.txt'), userData);
  });
});
