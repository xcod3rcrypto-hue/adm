import { beforeEach, describe, expect, it } from 'vitest';
import type { AppContext } from '../context';
import { makeTestContext } from '../testing';
import { createOrganization } from './organizations';
import { createProject } from './projects';
import { createCampaignDraft } from './campaigns';
import { createExperiment } from './experiments';
import { createCalendarEvent, deleteCalendarEvent, listCalendar, updateCalendarEvent } from './calendar';

let ctx: AppContext;
beforeEach(async () => {
  ctx = await makeTestContext();
});

describe('calendário', () => {
  it('combina eventos, campanhas e experimentos no intervalo', () => {
    const org = createOrganization(ctx, { name: 'Org' });
    const p = createProject(ctx, org.id, { name: 'Lançamento' });
    createCampaignDraft(ctx, org.id, { platform: 'meta', name: 'Black Friday', objective: 'OUTCOME_SALES', startDate: '2026-11-20', endDate: '2026-11-30', projectId: p.id });
    createExperiment(ctx, org.id, {
      hypothesis: 'Se usarmos vídeo, o CTR aumenta',
      variable: 'Formato',
      primaryMetric: 'ctr',
      periodFrom: '2026-11-01',
      periodTo: '2026-11-15',
      variants: [{ label: 'A' }, { label: 'B' }],
    });
    const id = createCalendarEvent(ctx, org.id, { title: 'Aprovar criativos', kind: 'approval', startDate: '2026-11-18', responsible: 'Ana', projectId: p.id });

    const items = listCalendar(ctx, org.id, '2026-11-01', '2026-11-30');
    expect(items.map((i) => i.source)).toEqual(['experiment', 'event', 'campaign']);
    const camp = items.find((i) => i.source === 'campaign')!;
    expect(camp.status).toMatch(/rascunho local/);
    expect(camp.notes).toMatch(/só está publicada quando a plataforma confirma/);
    expect(items.find((i) => i.source === 'event')).toMatchObject({ responsible: 'Ana', projectName: 'Lançamento', status: 'todo' });

    updateCalendarEvent(ctx, org.id, id, { title: 'Aprovar criativos', kind: 'approval', startDate: '2026-11-18', status: 'done' });
    expect(listCalendar(ctx, org.id, '2026-11-18', '2026-11-18').find((i) => i.id === id)?.status).toBe('done');
    expect(listCalendar(ctx, org.id, '2026-12-01', '2026-12-31')).toEqual([]);
    deleteCalendarEvent(ctx, org.id, id);
    expect(listCalendar(ctx, org.id, '2026-11-18', '2026-11-18').some((i) => i.id === id)).toBe(false);
  });

  it('valida datas e isola organizações', () => {
    const a = createOrganization(ctx, { name: 'A' });
    const b = createOrganization(ctx, { name: 'B' });
    expect(() => createCalendarEvent(ctx, a.id, { title: 'X evento', startDate: '2026-11-10', endDate: '2026-11-01' })).toThrow(/posterior/);
    const id = createCalendarEvent(ctx, a.id, { title: 'Evento A', startDate: '2026-11-10' });
    expect(() => deleteCalendarEvent(ctx, b.id, id)).toThrow(/não encontrado/);
    expect(listCalendar(ctx, b.id, '2026-11-01', '2026-11-30')).toEqual([]);
  });
});
