import type { Organization } from '@advertex/shared';
import { isoDay } from '@advertex/shared';
import type { AppContext } from '../context';
import { recordAudit } from './audit';
import { seedDemoBrain } from './demoBrain';
import { createOrganization, getOrganization, setActiveOrganization } from './organizations';
import { setSetting, getSetting } from './settings';

export const DEMO_ORG_NAME = 'Demonstração (dados fictícios)';
const DEMO_NOTE = '[DEMONSTRAÇÃO] Dados fictícios gerados localmente — não representam resultados reais.';

/** PRNG determinístico para dados de demonstração reproduzíveis. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function findDemoOrganization(ctx: AppContext): Organization | null {
  const row = ctx.db.get<{ id: string }>('SELECT id FROM organizations WHERE is_demo = 1 LIMIT 1');
  return row ? getOrganization(ctx, row.id) : null;
}

/**
 * Cria uma organização SEPARADA, marcada como demonstração, com dados fictícios.
 * Dados demo nunca se misturam com organizações reais.
 */
export function enableDemo(ctx: AppContext, today: Date = new Date()): Organization {
  const existing = findDemoOrganization(ctx);
  if (existing) return setActiveOrganization(ctx, existing.id);

  return ctx.db.transaction(() => {
    const previousActive = getSetting<string | null>(ctx, 'activeOrganizationId', null);
    const org = createOrganization(ctx, { name: DEMO_ORG_NAME }, { isDemo: true });
    const now = ctx.now();
    const rand = mulberry32(20261008);

    const clientId = ctx.newId();
    ctx.db.run('INSERT INTO clients (id, organization_id, name, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)', [
      clientId,
      org.id,
      'Café Aurora (fictício)',
      DEMO_NOTE,
      now,
      now,
    ]);

    const projects = [
      { name: 'Lançamento linha de cafés especiais', objective: 'Vendas no e-commerce', product: 'Cafés especiais em grãos e moídos, assinatura mensal' },
      { name: 'Captação para cafeterias parceiras', objective: 'Leads B2B', product: 'Fornecimento de café para cafeterias e escritórios' },
    ].map((p) => {
      const id = ctx.newId();
      ctx.db.run(
        "INSERT INTO projects (id, organization_id, client_id, name, description, objective, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)",
        [id, org.id, clientId, p.name, DEMO_NOTE, p.objective, now, now],
      );
      const briefId = ctx.newId();
      const data = JSON.stringify({
        segment: 'Alimentos e bebidas',
        productOrService: p.product,
        offer: 'Frete grátis na primeira compra',
        region: 'Brasil — capitais do Sudeste',
        language: 'pt-BR',
        targetAudience: 'Adultos 25–45 anos que apreciam café de qualidade',
        differentiators: 'Torra semanal, rastreabilidade do produtor',
        objections: 'Preço acima do café de supermercado',
        toneOfVoice: 'Acolhedor, especialista, sem pedantismo',
        objectives: p.objective,
        kpis: 'CPA, ROAS, taxa de conversão',
        budget: 'R$ 15.000/mês (fictício)',
        competitors: '',
        restrictions: '',
        websiteUrl: '',
        additionalNotes: DEMO_NOTE,
      });
      ctx.db.run('INSERT INTO briefs (id, organization_id, project_id, current_version, data, created_at, updated_at) VALUES (?, ?, ?, 1, ?, ?, ?)', [
        briefId,
        org.id,
        id,
        data,
        now,
        now,
      ]);
      ctx.db.run("INSERT INTO brief_versions (id, brief_id, version, data, note, created_at) VALUES (?, ?, 1, ?, 'Demonstração', ?)", [ctx.newId(), briefId, data, now]);
      return id;
    });

    const campaigns = [
      { platform: 'meta', name: 'Demo · Prospecção · Cafés especiais', objective: 'OUTCOME_SALES', budget: 180, project: 0, base: 1.0, pattern: null },
      // Padrões fictícios para demonstrar a Inteligência: queda de CTR (fadiga) e conversões zeradas (rastreamento).
      { platform: 'meta', name: 'Demo · Remarketing · Carrinho', objective: 'OUTCOME_SALES', budget: 90, project: 0, base: 0.6, pattern: 'fatigue' },
      { platform: 'meta', name: 'Demo · Leads · Cafeterias', objective: 'OUTCOME_LEADS', budget: 70, project: 1, base: 0.5, pattern: 'tracking' },
      { platform: 'google', name: 'Demo · Pesquisa · Marca', objective: 'SEARCH', budget: 60, project: 0, base: 0.4, pattern: null },
      { platform: 'google', name: 'Demo · Performance Max', objective: 'PERFORMANCE_MAX', budget: 150, project: 0, base: 0.9, pattern: null },
    ] as const;

    const campaignIds: string[] = [];
    for (const c of campaigns) {
      const campaignId = ctx.newId();
      campaignIds.push(campaignId);
      ctx.db.run(
        `INSERT INTO campaigns (id, organization_id, project_id, platform, name, objective, status, daily_budget, currency, notes, sync_state, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'active', ?, 'BRL', ?, 'local_only', ?, ?)`,
        [campaignId, org.id, projects[c.project]!, c.platform, c.name, c.objective, c.budget, DEMO_NOTE, now, now],
      );
      for (let d = 89; d >= 0; d -= 1) {
        const date = isoDay(-d, today);
        const weekday = new Date(`${date}T12:00:00`).getDay();
        const season = weekday === 0 || weekday === 6 ? 0.85 : 1.05;
        const spend = Math.round(c.budget * season * (0.75 + rand() * 0.4) * 100) / 100;
        const cpm = c.platform === 'meta' ? 18 + rand() * 10 : 30 + rand() * 25;
        const impressions = Math.round((spend / cpm) * 1000);
        const fatigue = c.pattern === 'fatigue' && d < 14 ? 0.55 : 1;
        const ctr = (c.platform === 'meta' ? 0.009 + rand() * 0.008 : 0.03 + rand() * 0.04) * fatigue;
        const clicks = Math.round(impressions * ctr);
        const cvr = 0.015 + rand() * 0.025 * c.base;
        const conversions = c.pattern === 'tracking' && d <= 2 ? 0 : Math.round(clicks * cvr);
        const revenue = c.objective === 'OUTCOME_LEADS' ? null : Math.round(conversions * (85 + rand() * 60) * 100) / 100;
        ctx.db.run(
          `INSERT INTO metric_snapshots (id, organization_id, campaign_id, platform, date, currency, spend, impressions, reach, clicks, conversions, revenue, source, definition, fetched_at)
           VALUES (?, ?, ?, ?, ?, 'BRL', ?, ?, ?, ?, ?, ?, 'demo', ?, ?)`,
          [
            ctx.newId(),
            org.id,
            campaignId,
            c.platform,
            date,
            spend,
            impressions,
            c.platform === 'meta' ? Math.round(impressions * 0.7) : null,
            clicks,
            conversions,
            revenue,
            'Fictício: gerado pelo modo de demonstração',
            now,
          ],
        );
      }
    }

    seedDemoBrain(ctx, org.id, { metaProspect: campaignIds[0]!, metaRemarketing: campaignIds[1]!, googleSearch: campaignIds[3]! }, rand, today);

    const creatives: Array<[string, string, string, string]> = [
      ['Demo · Texto principal — origem', 'meta_primary_text', 'meta', 'Do pé de café à sua xícara em 7 dias. Torra semanal e frete grátis na primeira compra.'],
      ['Demo · Título — assinatura', 'meta_headline', 'meta', 'Café fresco todo mês'],
      ['Demo · Título RSA — marca', 'google_rsa_headline', 'google', 'Cafés Especiais Aurora'],
      ['Demo · Descrição RSA', 'google_rsa_description', 'google', 'Torra semanal, grãos rastreáveis e frete grátis na 1ª compra. Peça já o seu.'],
    ];
    for (const [title, kind, platform, body] of creatives) {
      const id = ctx.newId();
      ctx.db.run(
        `INSERT INTO creatives (id, organization_id, project_id, title, kind, platform, body, tags, status, source, version, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, '["demo"]', 'draft', 'manual', 1, ?, ?)`,
        [id, org.id, projects[0]!, title, kind, platform, body, now, now],
      );
      ctx.db.run("INSERT INTO creative_versions (id, creative_id, version, title, body, cta, note, created_at) VALUES (?, ?, 1, ?, ?, '', 'Demonstração', ?)", [
        ctx.newId(),
        id,
        title,
        body,
        now,
      ]);
    }

    setSetting(ctx, 'organizationBeforeDemo', previousActive);
    recordAudit(ctx, { organizationId: org.id, action: 'demo.enable', entityType: 'organization', entityId: org.id });
    return setActiveOrganization(ctx, org.id);
  });
}

export function disableDemo(ctx: AppContext): void {
  const demo = findDemoOrganization(ctx);
  if (!demo) return;
  ctx.db.transaction(() => {
    ctx.db.run('DELETE FROM organizations WHERE id = ? AND is_demo = 1', [demo.id]);
    recordAudit(ctx, { organizationId: null, action: 'demo.disable', entityType: 'organization', entityId: demo.id });
    const before = getSetting<string | null>(ctx, 'organizationBeforeDemo', null);
    const active = getSetting<string | null>(ctx, 'activeOrganizationId', null);
    if (active === demo.id) setSetting(ctx, 'activeOrganizationId', before);
  });
}
