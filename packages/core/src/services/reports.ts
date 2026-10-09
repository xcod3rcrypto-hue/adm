import {
  AppError,
  ReportInput,
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatPercent,
  type Platform,
  type Report,
  type ReportContent,
  type ReportSummary,
} from '@advertex/shared';
import { deriveMetrics, groupBy, relativeChange, sumRows } from '@advertex/advertising-core';
import type { AppContext } from '../context';
import { bool, parseJson, requireOrg, requireOwned } from '../util';
import { recordAudit } from './audit';
import { loadSnapshots, previousPeriod, type SnapshotRow } from './dashboard';
import { listRecommendations } from './intelligence';

/**
 * Relatórios são fotografias: o conteúdo é calculado na geração e gravado,
 * para que o histórico não mude quando novas métricas forem sincronizadas.
 */

const PLATFORM_LABEL: Record<Platform, string> = { meta: 'Meta Ads', google: 'Google Ads' };

function filterRows(ctx: AppContext, rows: SnapshotRow[], projectId: string | null, organizationId: string): SnapshotRow[] {
  if (!projectId) return rows;
  const ids = new Set(ctx.db.all<{ id: string }>('SELECT id FROM campaigns WHERE organization_id = ? AND project_id = ?', [organizationId, projectId]).map((r) => r.id));
  return rows.filter((r) => ids.has(r.campaign_id));
}

function pctChange(cur: number | null, prev: number | null): string | null {
  const c = relativeChange(cur, prev);
  if (c === null) return null;
  return `${c >= 0 ? '+' : ''}${(c * 100).toFixed(1).replace('.', ',')}%`;
}

export function buildReportContent(ctx: AppContext, organizationId: string, input: { projectId: string | null; platform: Platform | null; from: string; to: string }): ReportContent {
  const org = requireOrg(ctx, organizationId);
  const project = input.projectId
    ? ctx.db.get<{ name: string }>('SELECT name FROM projects WHERE id = ? AND organization_id = ?', [input.projectId, organizationId])
    : undefined;
  if (input.projectId && !project) throw new AppError('NOT_FOUND', 'Projeto não encontrado.');
  const prev = previousPeriod(input.from, input.to);
  const rows = filterRows(ctx, loadSnapshots(ctx, organizationId, input.from, input.to, input.platform), input.projectId, organizationId);
  const prevRows = filterRows(ctx, loadSnapshots(ctx, organizationId, prev.from, prev.to, input.platform), input.projectId, organizationId);

  const prevByCurrency = new Map([...groupBy(prevRows, (r) => r.currency)].map(([cur, list]) => [cur, sumRows(list)]));
  const byCurrency = [...groupBy(rows, (r) => r.currency)].map(([currency, list]) => {
    const totals = sumRows(list);
    const p = prevByCurrency.get(currency);
    return { currency, totals, derived: deriveMetrics(totals), previous: p ? { totals: p, derived: deriveMetrics(p) } : null };
  });
  const byPlatform = [...groupBy(rows, (r) => `${r.platform}|${r.currency}`)].map(([key, list]) => {
    const [platform, currency] = key.split('|') as [Platform, string];
    const totals = sumRows(list);
    return { platform, currency, totals, derived: deriveMetrics(totals) };
  });
  const campaigns = [...groupBy(rows, (r) => r.campaign_id)]
    .map(([campaignId, list]) => {
      const totals = sumRows(list);
      return { campaignId, name: list[0]!.campaign_name, platform: list[0]!.platform, currency: list[0]!.currency, totals, derived: deriveMetrics(totals) };
    })
    .sort((a, b) => b.totals.spend - a.totals.spend);
  const series = [...groupBy(rows, (r) => r.currency)].map(([currency, list]) => ({
    currency,
    points: [...groupBy(list, (r) => r.date)].map(([date, day]) => {
      const t = sumRows(day);
      return { date, spend: t.spend, clicks: t.clicks, conversions: t.conversions, impressions: t.impressions };
    }),
  }));

  const summary: string[] = [];
  if (rows.length === 0) summary.push('Não há métricas registradas para os filtros e o período selecionados.');
  for (const c of byCurrency) {
    const parts = [
      `Investimento de ${formatCurrency(c.totals.spend, c.currency)}`,
      `${formatNumber(c.totals.conversions, 0)} conversões`,
      c.derived.cpa !== null ? `CPA de ${formatCurrency(c.derived.cpa, c.currency)}` : null,
      c.derived.roas !== null ? `ROAS de ${formatNumber(c.derived.roas, 2)}` : null,
    ].filter(Boolean);
    let line = `${parts.join(', ')} (${c.currency}).`;
    if (c.previous) {
      const changes = [
        pctChange(c.totals.spend, c.previous.totals.spend) && `investimento ${pctChange(c.totals.spend, c.previous.totals.spend)}`,
        pctChange(c.totals.conversions, c.previous.totals.conversions) && `conversões ${pctChange(c.totals.conversions, c.previous.totals.conversions)}`,
        pctChange(c.derived.cpa, c.previous.derived.cpa) && `CPA ${pctChange(c.derived.cpa, c.previous.derived.cpa)}`,
      ].filter(Boolean);
      if (changes.length) line += ` Em relação ao período anterior: ${changes.join(', ')}.`;
    }
    summary.push(line);
  }
  if (campaigns[0]) summary.push(`Maior investimento: "${campaigns[0].name}" (${PLATFORM_LABEL[campaigns[0].platform]}), ${formatCurrency(campaigns[0].totals.spend, campaigns[0].currency)}.`);
  const best = campaigns.filter((c) => c.derived.cpa !== null && c.totals.conversions >= 5).sort((a, b) => a.derived.cpa! - b.derived.cpa!)[0];
  if (best) summary.push(`Menor CPA com volume relevante: "${best.name}" (${formatCurrency(best.derived.cpa, best.currency)}).`);

  const alerts = ctx.db
    .all<{ title: string; campaign_id: string | null }>("SELECT title, campaign_id FROM insights WHERE organization_id = ? AND severity IN ('critical', 'warning') ORDER BY created_at DESC", [organizationId])
    .filter((i) => !input.projectId || campaigns.some((c) => c.campaignId === i.campaign_id))
    .map((i) => i.title);
  const campaignIds = new Set(campaigns.map((c) => c.campaignId));
  const recommendations = listRecommendations(ctx, organizationId)
    .filter((r) => r.status === 'open' || r.status === 'accepted')
    .filter((r) => !r.campaignId || campaignIds.has(r.campaignId))
    .slice(0, 15)
    .map((r) => ({ title: r.title, campaignName: r.campaignName, rationale: r.rationale, status: r.status }));

  const sources = [...new Set(rows.map((r) => r.source))];
  const limitations = [
    'Métricas conforme reportadas por cada plataforma, na janela de atribuição padrão da conta; podem ser revisadas após a geração deste relatório.',
    'Valores em moedas diferentes são apresentados separadamente, sem conversão.',
    'Alcance não é somado entre dias ou campanhas (pessoas se repetem).',
    'Alertas e recomendações refletem a última análise de Inteligência executada antes da geração.',
  ];
  if (bool(org.is_demo)) limitations.unshift('RELATÓRIO DE DEMONSTRAÇÃO: todos os números são fictícios.');
  if (sources.length === 0) limitations.push('Nenhuma fonte de dados no período.');

  return {
    isDemo: bool(org.is_demo),
    organizationName: org.name,
    projectName: project?.name ?? null,
    platform: input.platform,
    period: { from: input.from, to: input.to },
    previousPeriod: prev,
    sources,
    executiveSummary: summary,
    byCurrency,
    byPlatform,
    campaigns,
    series,
    alerts: [...new Set(alerts)].slice(0, 15),
    recommendations,
    limitations,
  };
}

interface ReportRow {
  id: string;
  title: string;
  project_id: string | null;
  period_from: string;
  period_to: string;
  filters: string;
  content: string;
  created_at: string;
}

export function createReport(ctx: AppContext, organizationId: string, raw: unknown): Report {
  requireOrg(ctx, organizationId);
  const d = ReportInput.parse(raw);
  if (d.projectId) requireOwned(ctx, 'projects', d.projectId, organizationId, 'Projeto');
  const content = buildReportContent(ctx, organizationId, d);
  const id = ctx.newId();
  ctx.db.run('INSERT INTO reports (id, organization_id, project_id, title, period_from, period_to, filters, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
    id,
    organizationId,
    d.projectId,
    d.title,
    d.from,
    d.to,
    JSON.stringify({ platform: d.platform }),
    JSON.stringify(content),
    ctx.now(),
  ]);
  recordAudit(ctx, { organizationId, action: 'report.create', entityType: 'report', entityId: id, details: { from: d.from, to: d.to, platform: d.platform, projectId: d.projectId } });
  return getReport(ctx, organizationId, id);
}

export function getReport(ctx: AppContext, organizationId: string, id: string): Report {
  const r = ctx.db.get<ReportRow>('SELECT * FROM reports WHERE id = ? AND organization_id = ?', [id, organizationId]);
  if (!r) throw new AppError('NOT_FOUND', 'Relatório não encontrado.');
  return { id: r.id, title: r.title, projectId: r.project_id, periodFrom: r.period_from, periodTo: r.period_to, content: parseJson<ReportContent>(r.content, {} as ReportContent), createdAt: r.created_at };
}

export function listReports(ctx: AppContext, organizationId: string): ReportSummary[] {
  requireOrg(ctx, organizationId);
  return ctx.db.all<ReportRow>('SELECT * FROM reports WHERE organization_id = ? ORDER BY created_at DESC', [organizationId]).map((r) => {
    const content = parseJson<Partial<ReportContent>>(r.content, {});
    return {
      id: r.id,
      title: r.title,
      projectId: r.project_id,
      periodFrom: r.period_from,
      periodTo: r.period_to,
      createdAt: r.created_at,
      isDemo: content.isDemo ?? false,
      projectName: content.projectName ?? null,
      platform: content.platform ?? null,
    };
  });
}

export function deleteReport(ctx: AppContext, organizationId: string, id: string): void {
  getReport(ctx, organizationId, id);
  ctx.db.run('DELETE FROM reports WHERE id = ? AND organization_id = ?', [id, organizationId]);
  recordAudit(ctx, { organizationId, action: 'report.delete', entityType: 'report', entityId: id });
}

export function recordReportExport(ctx: AppContext, organizationId: string, id: string, format: 'csv' | 'pdf'): void {
  recordAudit(ctx, { organizationId, action: 'report.export', entityType: 'report', entityId: id, details: { format } });
}

// ---------------------------------------------------------------------------
// Exportação
// ---------------------------------------------------------------------------

/** Número no padrão do Excel pt-BR (vírgula decimal, sem separador de milhar). */
const csvNum = (v: number | null, digits = 2) => (v === null || Number.isNaN(v) ? '' : v.toFixed(digits).replace('.', ','));

function csvCell(v: string): string {
  // Neutraliza fórmulas (CSV injection) e escapa aspas.
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return /[";\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** CSV com BOM UTF-8 e separador ";" (abre corretamente no Excel em português). */
export function reportToCsv(report: Report): string {
  const c = report.content;
  const lines: string[][] = [
    ['Relatório', report.title],
    ['Organização', c.organizationName],
    ['Projeto', c.projectName ?? 'Todos'],
    ['Plataforma', c.platform ? PLATFORM_LABEL[c.platform] : 'Todas'],
    ['Período', `${c.period.from} a ${c.period.to}`],
    ['Gerado em', formatDateTime(report.createdAt)],
    ['Fontes', c.sources.join(', ') || 'nenhuma'],
  ];
  if (c.isDemo) lines.push(['Aviso', 'DADOS FICTÍCIOS (demonstração)']);
  lines.push([]);
  lines.push(['Campanha', 'Plataforma', 'Moeda', 'Investimento', 'Impressões', 'Cliques', 'CTR (%)', 'CPC', 'CPM', 'Conversões', 'CPA', 'Receita atribuída', 'ROAS']);
  for (const r of c.campaigns) {
    lines.push([
      r.name,
      PLATFORM_LABEL[r.platform],
      r.currency,
      csvNum(r.totals.spend),
      String(r.totals.impressions),
      String(r.totals.clicks),
      csvNum(r.derived.ctr === null ? null : r.derived.ctr * 100),
      csvNum(r.derived.cpc),
      csvNum(r.derived.cpm),
      csvNum(r.totals.conversions, 1),
      csvNum(r.derived.cpa),
      csvNum(r.totals.revenue),
      csvNum(r.derived.roas),
    ]);
  }
  lines.push([]);
  lines.push(['Limitações']);
  for (const l of c.limitations) lines.push([l]);
  return `\uFEFF${lines.map((l) => l.map(csvCell).join(';')).join('\r\n')}\r\n`;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function sparkline(points: Array<{ date: string; spend: number }>, currency: string): string {
  if (points.length < 2) return '';
  const w = 640;
  const h = 140;
  const max = Math.max(...points.map((p) => p.spend), 1);
  const step = w / (points.length - 1);
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(h - (p.spend / max) * (h - 10)).toFixed(1)}`).join(' ');
  return `<figure class="chart"><figcaption>Investimento diário (${esc(currency)})</figcaption>
<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img" aria-label="Investimento diário">
<path d="${path} L${w},${h} L0,${h} Z" fill="#7c5cff22" stroke="none"/>
<path d="${path}" fill="none" stroke="#6a46ff" stroke-width="2"/>
</svg><div class="axis"><span>${esc(points[0]!.date)}</span><span>máx. ${esc(formatCurrency(max, currency))}</span><span>${esc(points.at(-1)!.date)}</span></div></figure>`;
}

/** HTML autocontido (sem scripts nem recursos externos) para impressão em PDF A4. */
export function reportToHtml(report: Report): string {
  const c = report.content;
  const kpis = c.byCurrency
    .map(
      (b) => `<section class="kpis"><h3>Totais em ${esc(b.currency)}</h3><div class="grid">
${[
  ['Investimento', formatCurrency(b.totals.spend, b.currency), b.previous && pctChange(b.totals.spend, b.previous.totals.spend)],
  ['Impressões', formatNumber(b.totals.impressions), b.previous && pctChange(b.totals.impressions, b.previous.totals.impressions)],
  ['Cliques', formatNumber(b.totals.clicks), b.previous && pctChange(b.totals.clicks, b.previous.totals.clicks)],
  ['CTR', formatPercent(b.derived.ctr), null],
  ['CPC', formatCurrency(b.derived.cpc, b.currency), null],
  ['Conversões', formatNumber(b.totals.conversions, 1), b.previous && pctChange(b.totals.conversions, b.previous.totals.conversions)],
  ['CPA', formatCurrency(b.derived.cpa, b.currency), b.previous && pctChange(b.derived.cpa, b.previous.derived.cpa)],
  ['ROAS', b.derived.roas === null ? '—' : formatNumber(b.derived.roas, 2), null],
]
  .map(([l, v, ch]) => `<div class="kpi"><span>${esc(String(l))}</span><strong>${esc(String(v))}</strong>${ch ? `<em>${esc(String(ch))} vs. anterior</em>` : ''}</div>`)
  .join('')}
</div></section>`,
    )
    .join('');
  const rows = c.campaigns
    .map(
      (r) => `<tr><td>${esc(r.name)}</td><td>${PLATFORM_LABEL[r.platform]}</td><td class="n">${esc(formatCurrency(r.totals.spend, r.currency))}</td><td class="n">${esc(formatNumber(r.totals.impressions))}</td><td class="n">${esc(formatNumber(r.totals.clicks))}</td><td class="n">${esc(formatPercent(r.derived.ctr))}</td><td class="n">${esc(formatNumber(r.totals.conversions, 1))}</td><td class="n">${esc(formatCurrency(r.derived.cpa, r.currency))}</td><td class="n">${r.derived.roas === null ? '—' : esc(formatNumber(r.derived.roas, 2))}</td></tr>`,
    )
    .join('');
  const list = (items: string[]) => (items.length ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : '<p class="muted">Nenhum.</p>');

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:">
<title>${esc(report.title)}</title>
<style>
@page { size: A4; margin: 16mm 14mm 18mm; }
* { box-sizing: border-box; }
body { font-family: 'Segoe UI', Arial, sans-serif; color: #1b1e27; font-size: 10.5pt; line-height: 1.45; margin: 0; }
header { border-bottom: 3px solid #7c5cff; padding-bottom: 10px; margin-bottom: 14px; }
header .brand { font-weight: 700; letter-spacing: .08em; color: #6a46ff; font-size: 9pt; }
h1 { font-size: 18pt; margin: 4px 0; } h2 { font-size: 12.5pt; margin: 18px 0 8px; color: #2a2350; } h3 { font-size: 10.5pt; margin: 10px 0 6px; }
.meta { color: #5b6275; font-size: 9pt; }
.demo { background: #fff4d6; border: 1px solid #f0c24b; color: #7a5600; padding: 8px 10px; border-radius: 6px; font-weight: 600; margin: 10px 0; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.kpi { border: 1px solid #e3e5ec; border-radius: 6px; padding: 8px; } .kpi span { display: block; color: #5b6275; font-size: 8.5pt; text-transform: uppercase; }
.kpi strong { font-size: 13pt; } .kpi em { display: block; font-style: normal; color: #5b6275; font-size: 8pt; }
table { width: 100%; border-collapse: collapse; font-size: 9pt; } th, td { padding: 5px 6px; border-bottom: 1px solid #e3e5ec; text-align: left; }
th { background: #f3f1ff; color: #2a2350; } td.n, th.n { text-align: right; font-variant-numeric: tabular-nums; }
tr { page-break-inside: avoid; } section { page-break-inside: avoid; }
.chart figcaption { color: #5b6275; font-size: 9pt; margin-bottom: 4px; } .chart { margin: 8px 0; } .axis { display: flex; justify-content: space-between; color: #5b6275; font-size: 8pt; }
.muted { color: #5b6275; } ul { margin: 4px 0; padding-left: 18px; }
.rec { margin-bottom: 6px; } .rec small { color: #5b6275; }
</style></head><body>
<header><div class="brand">ADVERTEX AI STUDIO</div><h1>${esc(report.title)}</h1>
<div class="meta">${esc(c.organizationName)}${c.projectName ? ` · Projeto: ${esc(c.projectName)}` : ''} · ${c.platform ? PLATFORM_LABEL[c.platform] : 'Todas as plataformas'} · Período: ${esc(c.period.from)} a ${esc(c.period.to)} (comparado a ${esc(c.previousPeriod.from)} a ${esc(c.previousPeriod.to)}) · Gerado em ${esc(formatDateTime(report.createdAt))} · Fontes: ${esc(c.sources.join(', ') || 'nenhuma')}</div>
${c.isDemo ? '<div class="demo">DEMONSTRAÇÃO — todos os números deste relatório são fictícios.</div>' : ''}</header>
<h2>Resumo executivo</h2>${list(c.executiveSummary)}
<h2>Métricas</h2>${kpis || '<p class="muted">Sem métricas no período.</p>'}
${c.series.map((s) => sparkline(s.points, s.currency)).join('')}
<h2>Campanhas</h2>${
    rows
      ? `<table><thead><tr><th>Campanha</th><th>Plataforma</th><th class="n">Investimento</th><th class="n">Impressões</th><th class="n">Cliques</th><th class="n">CTR</th><th class="n">Conversões</th><th class="n">CPA</th><th class="n">ROAS</th></tr></thead><tbody>${rows}</tbody></table>`
      : '<p class="muted">Nenhuma campanha com métricas.</p>'
  }
<h2>Alertas</h2>${list(c.alerts)}
<h2>Recomendações</h2>${
    c.recommendations.length
      ? c.recommendations.map((r) => `<div class="rec"><strong>${esc(r.title)}</strong>${r.campaignName ? ` <small>— ${esc(r.campaignName)}</small>` : ''}<br><small>${esc(r.rationale)}</small></div>`).join('')
      : '<p class="muted">Nenhuma recomendação aberta.</p>'
  }
<h2>Limitações dos dados</h2>${list(c.limitations)}
</body></html>`;
}
