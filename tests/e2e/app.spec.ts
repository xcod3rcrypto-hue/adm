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
    await page.getByRole('link', { name: 'Criativos' }).click();
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

    // Rascunho de campanha
    await page.getByRole('link', { name: 'Campanhas' }).click();
    await page.getByRole('button', { name: 'Novo rascunho' }).first().click();
    await page.locator('#cp-name').fill('Leads — Verão');
    await page.getByLabel('Orçamento diário').fill('80');
    await page.getByRole('button', { name: 'Salvar rascunho' }).click();
    await expect(page.getByText('Rascunho salvo localmente.')).toBeVisible();
    await expect(page.getByRole('cell', { name: /^Leads — Verão Sem projeto/ })).toBeVisible();
    await page.screenshot({ path: join(shots, '05-campanhas.png') });

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

    // Integrações: sem credenciais não há conexão simulada
    await page.getByRole('link', { name: 'Integrações' }).click();
    await expect(page.getByText('Não configurado').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Testar conexão' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Autorizar no navegador' })).toBeDisabled();
    await page.screenshot({ path: join(shots, '06-integracoes.png'), fullPage: true });

    // Configurações e auditoria
    await page.getByRole('link', { name: 'Configurações' }).click();
    await expect(page.getByText('Sem chave')).toBeVisible();
    await expect(page.getByText('(desenvolvimento)').or(page.getByText('(instalado)'))).toBeVisible();
    await expect(page.getByText('project.create')).toBeVisible();
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
