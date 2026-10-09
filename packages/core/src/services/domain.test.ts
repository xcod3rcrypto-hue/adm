import { describe, expect, it, beforeEach } from 'vitest';
import { AppError } from '@advertex/shared';
import type { AppContext } from '../context';
import { makeTestContext } from '../testing';
import { createOrganization, getActiveOrganization, listOrganizations } from './organizations';
import { createClient, createProject, deleteProject, getProject, listProjects, updateProject } from './projects';
import { getBrief, listBriefVersions, restoreBriefVersion, saveBrief } from './briefs';
import { createCreative, listCreativeVersions, listCreatives, setCreativeStatus, updateCreative } from './creatives';
import { createCampaignDraft, deleteCampaignDraft, listCampaigns, updateCampaignDraft } from './campaigns';
import { listAudit } from './audit';
import { onboardingState } from './onboarding';

let ctx: AppContext;
beforeEach(async () => {
  ctx = await makeTestContext();
});

const brief = { productOrService: 'Consultoria de marketing', segment: 'Serviços B2B' };

describe('organizações e projetos', () => {
  it('cria organização, define como ativa e registra auditoria', () => {
    const org = createOrganization(ctx, { name: 'Agência X' });
    expect(getActiveOrganization(ctx)?.id).toBe(org.id);
    expect(listOrganizations(ctx)).toHaveLength(1);
    expect(listAudit(ctx, org.id, 10).map((a) => a.action)).toContain('organization.create');
  });

  it('CRUD de projetos com cliente', () => {
    const org = createOrganization(ctx, { name: 'Org' });
    const client = createClient(ctx, org.id, { name: 'Cliente A' });
    const p = createProject(ctx, org.id, { name: 'Projeto 1', clientId: client.id, objective: 'Leads' });
    expect(p.clientName).toBe('Cliente A');
    const u = updateProject(ctx, org.id, p.id, { name: 'Projeto 1b', status: 'archived' });
    expect(u.name).toBe('Projeto 1b');
    expect(listProjects(ctx, org.id)).toHaveLength(0);
    expect(listProjects(ctx, org.id, true)).toHaveLength(1);
    deleteProject(ctx, org.id, p.id);
    expect(() => getProject(ctx, org.id, p.id)).toThrow(AppError);
  });

  it('valida entradas com mensagens em português', () => {
    const org = createOrganization(ctx, { name: 'Org' });
    expect(() => createProject(ctx, org.id, { name: 'x' })).toThrow(/2 caracteres/);
  });
});

describe('isolamento entre organizações', () => {
  it('não permite acessar nem vincular dados de outra organização', () => {
    const a = createOrganization(ctx, { name: 'Org A' });
    const b = createOrganization(ctx, { name: 'Org B' });
    const pa = createProject(ctx, a.id, { name: 'Projeto A' });
    const clientA = createClient(ctx, a.id, { name: 'Cliente A' });

    expect(() => getProject(ctx, b.id, pa.id)).toThrow(/não encontrado/);
    expect(() => updateProject(ctx, b.id, pa.id, { name: 'invasão' })).toThrow(/não encontrado/);
    expect(() => deleteProject(ctx, b.id, pa.id)).toThrow(/não encontrado/);
    expect(() => saveBrief(ctx, b.id, pa.id, brief)).toThrow(/não encontrado/);
    expect(() => createProject(ctx, b.id, { name: 'Projeto B', clientId: clientA.id })).toThrow(/Cliente não encontrado/);
    expect(() => createCreative(ctx, b.id, { title: 'T', kind: 'generic', body: 'x', projectId: pa.id })).toThrow(/Projeto não encontrado/);

    createCreative(ctx, a.id, { title: 'Criativo A', kind: 'generic', body: 'texto' });
    expect(listCreatives(ctx, b.id)).toHaveLength(0);
    expect(listProjects(ctx, b.id)).toHaveLength(0);
    expect(listAudit(ctx, b.id, 100).some((x) => x.entityId === pa.id)).toBe(false);
  });
});

describe('briefing versionado', () => {
  it('cria versões a cada alteração, ignora gravações idênticas e restaura', () => {
    const org = createOrganization(ctx, { name: 'Org' });
    const p = createProject(ctx, org.id, { name: 'Projeto' });
    expect(getBrief(ctx, org.id, p.id)).toBeNull();

    const v1 = saveBrief(ctx, org.id, p.id, brief);
    expect(v1.currentVersion).toBe(1);
    expect(v1.data.language).toBe('pt-BR');
    saveBrief(ctx, org.id, p.id, brief);
    expect(listBriefVersions(ctx, org.id, p.id)).toHaveLength(1);

    const v2 = saveBrief(ctx, org.id, p.id, { ...brief, offer: '10% off' }, 'oferta');
    expect(v2.currentVersion).toBe(2);
    const versions = listBriefVersions(ctx, org.id, p.id);
    expect(versions.map((v) => v.version)).toEqual([2, 1]);

    const restored = restoreBriefVersion(ctx, org.id, p.id, versions[1]!.id);
    expect(restored.currentVersion).toBe(3);
    expect(restored.data.offer).toBe('');
  });

  it('rejeita URL de site que não seja http(s)', () => {
    const org = createOrganization(ctx, { name: 'Org' });
    const p = createProject(ctx, org.id, { name: 'Projeto' });
    expect(() => saveBrief(ctx, org.id, p.id, { ...brief, websiteUrl: 'javascript:alert(1)' })).toThrow();
  });
});

describe('criativos', () => {
  it('versiona alterações de texto e volta aprovado para rascunho', () => {
    const org = createOrganization(ctx, { name: 'Org' });
    const c = createCreative(ctx, org.id, { title: 'Título', kind: 'meta_headline', platform: 'meta', body: 'Texto 1', tags: ['Promo', 'promo '] });
    expect(c.tags).toEqual(['promo']);
    const approved = setCreativeStatus(ctx, org.id, c.id, 'approved');
    expect(approved.status).toBe('approved');

    const sameText = updateCreative(ctx, org.id, c.id, { title: 'Título', kind: 'meta_headline', platform: 'meta', body: 'Texto 1', tags: ['nova'] });
    expect(sameText.version).toBe(1);
    expect(sameText.status).toBe('approved');

    const edited = updateCreative(ctx, org.id, c.id, { title: 'Título', kind: 'meta_headline', platform: 'meta', body: 'Texto 2' }, 'ajuste');
    expect(edited.version).toBe(2);
    expect(edited.status).toBe('draft');
    expect(listCreativeVersions(ctx, org.id, c.id).map((v) => v.body)).toEqual(['Texto 2', 'Texto 1']);
  });

  it('filtra por busca, tag e status (com escape de curingas)', () => {
    const org = createOrganization(ctx, { name: 'Org' });
    createCreative(ctx, org.id, { title: 'Black Friday', kind: 'generic', body: '50% off', tags: ['sazonal'] });
    createCreative(ctx, org.id, { title: 'Institucional', kind: 'generic', body: 'Somos referência' });
    expect(listCreatives(ctx, org.id, { search: 'friday' })).toHaveLength(1);
    expect(listCreatives(ctx, org.id, { search: '%' })).toHaveLength(1);
    expect(listCreatives(ctx, org.id, { tag: 'sazonal' })).toHaveLength(1);
    expect(listCreatives(ctx, org.id, { status: 'approved' })).toHaveLength(0);
  });
});

describe('campanhas (rascunhos locais)', () => {
  it('valida objetivo por plataforma e datas', () => {
    const org = createOrganization(ctx, { name: 'Org' });
    expect(() => createCampaignDraft(ctx, org.id, { platform: 'google', name: 'C1', objective: 'OUTCOME_SALES' })).toThrow(/incompatível/);
    expect(() =>
      createCampaignDraft(ctx, org.id, { platform: 'meta', name: 'C1', objective: 'OUTCOME_SALES', startDate: '2026-10-10', endDate: '2026-10-01' }),
    ).toThrow(/posterior/);
    const c = createCampaignDraft(ctx, org.id, { platform: 'meta', name: 'C1', objective: 'OUTCOME_SALES', dailyBudget: 50 });
    expect(c.status).toBe('draft');
    expect(c.syncState).toBe('local_only');
    expect(updateCampaignDraft(ctx, org.id, c.id, { platform: 'meta', name: 'C1b', objective: 'OUTCOME_LEADS' }).name).toBe('C1b');
    deleteCampaignDraft(ctx, org.id, c.id);
    expect(listCampaigns(ctx, org.id)).toHaveLength(0);
  });

  it('campanhas que existem na plataforma não são editadas localmente', () => {
    const org = createOrganization(ctx, { name: 'Org' });
    ctx.db.run(
      "INSERT INTO campaigns (id, organization_id, platform, remote_id, name, objective, status, currency, sync_state, created_at, updated_at) VALUES ('00000000-0000-4000-8000-0000000000aa', ?, 'meta', '123', 'Remota', 'OUTCOME_SALES', 'active', 'BRL', 'synced', 'n', 'n')",
      [org.id],
    );
    expect(() => deleteCampaignDraft(ctx, org.id, '00000000-0000-4000-8000-0000000000aa')).toThrow(/já existem na plataforma/);
  });
});

describe('onboarding', () => {
  it('reflete o progresso do checklist', () => {
    expect(onboardingState(ctx, null).hasOrganization).toBe(false);
    const org = createOrganization(ctx, { name: 'Org' });
    const p = createProject(ctx, org.id, { name: 'Projeto' });
    saveBrief(ctx, org.id, p.id, brief);
    const s = onboardingState(ctx, org.id);
    expect(s.checklist).toMatchObject({ organization: true, project: true, brief: true, ai: false, meta: false, google: false });
  });
});
