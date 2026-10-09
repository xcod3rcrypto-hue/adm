import { describe, expect, it, vi } from 'vitest';
import { AiProviderError } from '@advertex/ai-core';
import { fakeCipher, fakeProvider, makeTestContext } from '../testing';
import { createOrganization } from './organizations';
import { createProject } from './projects';
import { saveBrief } from './briefs';
import { clearAiKey, generateBriefInsights, generateVariations, getAiConfig, saveAiConfig, testAi } from './ai';

async function setup(provider = fakeProvider({})) {
  const factory = vi.fn(() => provider);
  const ctx = await makeTestContext({ createTextProvider: factory });
  const org = createOrganization(ctx, { name: 'Org' });
  const project = createProject(ctx, org.id, { name: 'Projeto' });
  return { ctx, org, project, factory };
}

describe('configuração de IA', () => {
  it('guarda a chave cifrada, nunca em texto puro, e não a devolve', async () => {
    const { ctx } = await setup();
    const view = saveAiConfig(ctx, { model: 'claude-opus-5-5', apiKey: 'sk-ant-api03-SEGREDO-123456' });
    expect(view).toEqual({ provider: 'anthropic', model: 'claude-opus-5-5', hasApiKey: true, secureStorageAvailable: true });
    expect(JSON.stringify(view)).not.toContain('SEGREDO');
    const raw = ctx.db.get<{ ciphertext: Uint8Array }>('SELECT ciphertext FROM secrets')!;
    expect(Buffer.from(raw.ciphertext).toString()).not.toContain('SEGREDO');
    const audit = ctx.db.all<{ details: string }>('SELECT details FROM audit_logs');
    expect(audit.map((a) => a.details).join()).not.toContain('SEGREDO');
    expect(clearAiKey(ctx).hasApiKey).toBe(false);
  });

  it('recusa salvar segredo quando o armazenamento seguro está indisponível', async () => {
    const ctx = await makeTestContext({ cipher: fakeCipher(false) });
    expect(() => saveAiConfig(ctx, { model: 'm', apiKey: 'sk-ant-1234567890' })).toThrow(/indisponível/);
    expect(getAiConfig(ctx).hasApiKey).toBe(false);
  });

  it('explica a falta de configuração em vez de simular', async () => {
    const { ctx } = await setup();
    await expect(testAi(ctx)).rejects.toThrow(/Nenhum provedor de IA configurado/);
  });

  it('passa a chave e o modelo salvos ao provedor', async () => {
    const { ctx, factory } = await setup();
    saveAiConfig(ctx, { model: 'claude-opus-5-5', apiKey: 'sk-ant-xyz-1234567890' });
    await expect(testAi(ctx)).resolves.toEqual({ model: 'fake-model', reply: 'conectado' });
    expect(factory).toHaveBeenCalledWith({ provider: 'anthropic', model: 'claude-opus-5-5', apiKey: 'sk-ant-xyz-1234567890' });
  });
});

describe('estúdio de criação', () => {
  it('exige briefing salvo', async () => {
    const { ctx, org, project } = await setup();
    saveAiConfig(ctx, { model: 'm', apiKey: 'sk-ant-xyz-1234567890' });
    await expect(generateVariations(ctx, org.id, { projectId: project.id, kind: 'meta_headline', funnelStage: 'awareness' })).rejects.toThrow(/briefing/);
  });

  it('gera variações, valida limites da plataforma e registra o job', async () => {
    const generateStructured = vi.fn(async () => ({
      data: { variations: [{ text: 'Consultoria que gera resultado', rationale: 'benefício' }, { text: 'X'.repeat(31), rationale: 'longo' }] },
      model: 'claude-opus-5-5',
      usage: { inputTokens: 100, outputTokens: 50 },
    }));
    const { ctx, org, project } = await setup(fakeProvider({ generateStructured: generateStructured as never }));
    saveAiConfig(ctx, { model: 'm', apiKey: 'sk-ant-xyz-1234567890' });
    saveBrief(ctx, org.id, project.id, { productOrService: 'Consultoria' });

    const r = await generateVariations(ctx, org.id, { projectId: project.id, kind: 'google_rsa_headline', funnelStage: 'conversion', count: 2 });
    expect(r.variations[0]).toMatchObject({ withinLimit: true, limit: 30 });
    expect(r.variations[1]).toMatchObject({ withinLimit: false, characterCount: 31 });

    const call = generateStructured.mock.calls[0] as unknown as [{ prompt: string }];
    expect(call[0].prompt).toContain('<briefing');
    expect(call[0].prompt).toContain('LIMITE RÍGIDO: no máximo 30');

    const job = ctx.db.get<{ status: string; input_tokens: number }>('SELECT status, input_tokens FROM ai_jobs WHERE id = ?', [r.jobId])!;
    expect(job).toEqual({ status: 'succeeded', input_tokens: 100 });
  });

  it('registra falha do provedor no job sem esconder o erro', async () => {
    const { ctx, org, project } = await setup(
      fakeProvider({
        generateStructured: async () => {
          throw new AiProviderError('refusal', 'O modelo recusou esta solicitação.');
        },
      }),
    );
    saveAiConfig(ctx, { model: 'm', apiKey: 'sk-ant-xyz-1234567890' });
    saveBrief(ctx, org.id, project.id, { productOrService: 'Consultoria' });
    await expect(generateBriefInsights(ctx, org.id, project.id, null)).rejects.toThrow(/recusou/);
    expect(ctx.db.get<{ status: string }>('SELECT status FROM ai_jobs')!.status).toBe('failed');
  });
});
