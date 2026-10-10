import { describe, expect, it, vi } from 'vitest';
import type { ChatTurnRequest, ChatTurnResult } from '@advertex/ai-core';
import { fakeProvider, jsonResponse, makeTestContext } from '../testing';
import { saveAiConfig } from './ai';
import { getCampaign, listCampaigns } from './campaigns';
import { deleteCopilotConversation, getCopilotConversation, listCopilotConversations, resolveCopilotProposal, sendCopilotMessage } from './copilot';
import { enableDemo } from './demo';
import { saveMeta, syncAccounts, syncCampaigns } from './integrations';
import { createOrganization } from './organizations';

type Script = (req: ChatTurnRequest, round: number) => Partial<ChatTurnResult>;

function scripted(script: Script) {
  const calls: ChatTurnRequest[] = [];
  const chatTurn = vi.fn(async (req: ChatTurnRequest): Promise<ChatTurnResult> => {
    calls.push(JSON.parse(JSON.stringify(req)));
    const r = script(req, calls.length);
    const toolCalls = r.toolCalls ?? [];
    return {
      content: [...(r.text ? [{ type: 'text', text: r.text }] : []), ...toolCalls.map((c) => ({ type: 'tool_use', id: c.id, name: c.name, input: c.input }))],
      stopReason: toolCalls.length ? 'tool_use' : 'end_turn',
      model: 'claude-opus-5-5',
      usage: { inputTokens: 1, outputTokens: 1 },
      text: r.text ?? '',
      toolCalls,
    };
  });
  return { calls, provider: () => fakeProvider({ chatTurn }) };
}

describe('Copiloto', () => {
  it('consulta os dados por ferramentas, responde e mantém o histórico', async () => {
    const s = scripted((req, round) => {
      if (round === 1) {
        return {
          text: 'Vou olhar os números.',
          toolCalls: [
            { id: 't1', name: 'resumo_desempenho', input: { dias: 30 } },
            { id: 't2', name: 'listar_campanhas', input: {} },
          ],
        };
      }
      if (round === 2) return { text: 'Seu CPA está estável. **Escale a Prospecção.**' };
      return { text: 'Lembro da conversa anterior.' };
    });
    const ctx = await makeTestContext({ createTextProvider: s.provider });
    const org = enableDemo(ctx, new Date('2026-10-09T12:00:00Z'));
    saveAiConfig(ctx, { model: 'claude-opus-5-5', apiKey: 'sk-ant-xyz-1234567890' });

    const c = await sendCopilotMessage(ctx, org.id, null, 'Como estão minhas campanhas?');
    expect(c.title).toBe('Como estão minhas campanhas?');
    expect(c.messages.map((m) => m.role)).toEqual(['user', 'assistant']);
    const reply = c.messages[1]!;
    expect(reply.text).toContain('Escale a Prospecção');
    expect(reply.steps.map((x) => [x.name, x.ok])).toEqual([
      ['resumo_desempenho', true],
      ['listar_campanhas', true],
    ]);
    // Rodada 2 recebeu os dois resultados numa única mensagem do usuário, com dados reais.
    const second = s.calls[1]!.messages as Array<{ role: string; content: unknown }>;
    const results = second.at(-1)!.content as Array<{ type: string; tool_use_id: string; content: string }>;
    expect(results.map((r) => [r.type, r.tool_use_id])).toEqual([
      ['tool_result', 't1'],
      ['tool_result', 't2'],
    ]);
    expect(results[1]!.content).toContain('Demo · Prospecção · Cafés especiais');
    expect(s.calls[0]!.system).toContain('DEMONSTRAÇÃO');
    expect(s.calls[0]!.tools.map((t) => t.name)).toContain('propor_mudanca_campanha');

    // Segunda mensagem reenvia o histórico anterior sem alterações (só acrescenta).
    await sendCopilotMessage(ctx, org.id, c.id, 'E agora?');
    const third = s.calls[2]!.messages;
    expect(third.slice(0, second.length)).toEqual(second.slice(0, second.length));
    expect(getCopilotConversation(ctx, org.id, c.id).messages).toHaveLength(4);
    expect(listCopilotConversations(ctx, org.id)).toHaveLength(1);
    deleteCopilotConversation(ctx, org.id, c.id);
    expect(listCopilotConversations(ctx, org.id)).toHaveLength(0);
  });

  it('cria rascunho local e transforma erro de ferramenta em resultado de erro', async () => {
    const s = scripted((_req, round) =>
      round === 1
        ? {
            toolCalls: [
              { id: 'a', name: 'criar_rascunho_campanha', input: { plataforma: 'meta', nome: 'Dia dos Pais', objetivo: 'OUTCOME_SALES', orcamento_diario: 50 } },
              { id: 'b', name: 'propor_mudanca_campanha', input: { campaign_id: '00000000-0000-4000-8000-000000000000', acao: 'pause_campaign', motivo: 'x' } },
            ],
          }
        : { text: 'Rascunho criado.' },
    );
    const ctx = await makeTestContext({ createTextProvider: s.provider });
    const org = createOrganization(ctx, { name: 'Org' });
    saveAiConfig(ctx, { model: 'claude-opus-5-5', apiKey: 'sk-ant-xyz-1234567890' });
    const c = await sendCopilotMessage(ctx, org.id, null, 'Cria uma campanha de Dia dos Pais');
    expect(listCampaigns(ctx, org.id).map((x) => [x.name, x.syncState])).toEqual([['Dia dos Pais', 'local_only']]);
    expect(c.messages[1]!.steps.map((x) => x.ok)).toEqual([true, false]);
    const results = (s.calls[1]!.messages.at(-1) as { content: Array<{ is_error?: boolean }> }).content;
    expect(results[1]!.is_error).toBe(true);
  });

  it('mudança em campanha publicada só acontece quando o usuário confirma', async () => {
    const posts: string[] = [];
    const fetch = vi.fn(async (url: string, init?: RequestInit) => {
      const path = new URL(url).pathname.replace(/^\/v26\.0\//, '');
      if (init?.method === 'POST') {
        posts.push(`${path} ${String(init.body)}`);
        return jsonResponse({ success: true });
      }
      if (path === 'me/adaccounts') return jsonResponse({ data: [{ id: 'act_111', account_id: '111', name: 'Conta', currency: 'BRL', account_status: 1 }] });
      if (path === 'act_111/campaigns') return jsonResponse({ data: [{ id: '900', name: 'Vendas', objective: 'OUTCOME_SALES', status: 'ACTIVE', daily_budget: '5000' }] });
      return jsonResponse({ error: { message: path } }, 404);
    });
    let campaignId = '';
    const s = scripted((_req, round) =>
      round === 1
        ? { toolCalls: [{ id: 'p', name: 'propor_mudanca_campanha', input: { campaign_id: campaignId, acao: 'pause_campaign', motivo: 'CPA 3x acima da meta' } }] }
        : { text: 'Preparei a pausa; confirme no botão.' },
    );
    const ctx = await makeTestContext({ fetch: fetch as never, createTextProvider: s.provider });
    const org = createOrganization(ctx, { name: 'Org' });
    saveAiConfig(ctx, { model: 'claude-opus-5-5', apiKey: 'sk-ant-xyz-1234567890' });
    saveMeta(ctx, org.id, { accessToken: 'EAAB-token-de-teste-1234567890', apiVersion: 'v26.0' });
    const [account] = await syncAccounts(ctx, org.id, 'meta');
    await syncCampaigns(ctx, org.id, 'meta', account!.id);
    campaignId = listCampaigns(ctx, org.id)[0]!.id;

    let c = await sendCopilotMessage(ctx, org.id, null, 'Pausa a campanha de vendas');
    const prop = c.messages[1]!.proposals[0]!;
    expect(prop).toMatchObject({ kind: 'pause_campaign', campaignName: 'Vendas', status: 'pending', reason: 'CPA 3x acima da meta' });
    expect(posts).toEqual([]); // nada executado ainda
    c = await resolveCopilotProposal(ctx, org.id, c.id, prop.id, 'confirm');
    expect(c.messages[1]!.proposals[0]!.status).toBe('done');
    expect(posts).toEqual(['900 status=PAUSED']);
    expect(getCampaign(ctx, org.id, campaignId).status).toBe('paused');
    // Confirmar de novo não repete.
    await resolveCopilotProposal(ctx, org.id, c.id, prop.id, 'confirm');
    expect(posts).toHaveLength(1);
  });
});
