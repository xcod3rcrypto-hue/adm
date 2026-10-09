import { isoDay } from '@advertex/shared';
import type { AppContext } from '../context';
import { contentHash } from './brain';

/**
 * Dados FICTÍCIOS para o Cérebro criativo e o Piloto automático na organização
 * de demonstração. Os números são gerados com multiplicadores fixos para que os
 * padrões apareçam — servem para conhecer a tela, não como referência real.
 */

interface DemoAd {
  headline: string;
  body: string;
  cta: string;
  ai: { angulo: string; emocao: string; tom: string; gancho: string };
}

const META_ADS: DemoAd[] = [
  { headline: 'Cansado de café amargo?', body: 'Você merece um café que tem gosto de fruta e chocolate. Torra semanal, direto do produtor.', cta: 'SHOP_NOW', ai: { angulo: 'dor', emocao: 'alivio', tom: 'direto', gancho: 'pergunta' } },
  { headline: 'Seu café ainda vem do supermercado?', body: 'Experimente grãos rastreáveis, torrados nesta semana. Frete grátis na primeira compra.', cta: 'SHOP_NOW', ai: { angulo: 'dor', emocao: 'curiosidade', tom: 'direto', gancho: 'pergunta' } },
  { headline: 'Qual é o café dos baristas?', body: 'Descubra os 3 grãos que mais vendem nas cafeterias de São Paulo. Torra fresca toda semana.', cta: 'LEARN_MORE', ai: { angulo: 'curiosidade', emocao: 'curiosidade', tom: 'informativo', gancho: 'pergunta' } },
  { headline: 'Já provou café de verdade?', body: 'Mais de 4.800 clientes trocaram o café comum pelo Aurora. Frete grátis na 1ª compra.', cta: 'SHOP_NOW', ai: { angulo: 'prova_social', emocao: 'confianca', tom: 'direto', gancho: 'pergunta' } },
  { headline: '4.800 clientes aprovam', body: 'Nota 4,9 de 5 em mais de 1.200 avaliações. Grãos especiais com torra semanal.', cta: 'SHOP_NOW', ai: { angulo: 'prova_social', emocao: 'confianca', tom: 'direto', gancho: 'numero_dado' } },
  { headline: '20% OFF na assinatura', body: 'Assine e receba café fresco todo mês com 20% de desconto. Cancele quando quiser.', cta: 'SUBSCRIBE', ai: { angulo: 'oferta', emocao: 'desejo', tom: 'direto', gancho: 'numero_dado' } },
  { headline: 'Frete grátis hoje ☕', body: 'Só hoje: frete grátis em qualquer pedido de cafés especiais. Corra! 🔥', cta: 'SHOP_NOW', ai: { angulo: 'urgencia', emocao: 'desejo', tom: 'emocional', gancho: 'comando' } },
  { headline: 'Últimas unidades ⚡', body: 'O lote do Cerrado Mineiro está acabando. Garanta o seu agora! 😍', cta: 'SHOP_NOW', ai: { angulo: 'urgencia', emocao: 'desejo', tom: 'emocional', gancho: 'afirmacao_ousada' } },
  { headline: 'Café que abraça ☕💛', body: 'Aquele momento só seu, com um café feito com carinho do pé à xícara. 🌱', cta: 'LEARN_MORE', ai: { angulo: 'identificacao', emocao: 'alegria', tom: 'emocional', gancho: 'beneficio_direto' } },
  { headline: 'Do pé à xícara', body: 'Conheça a história da família que cultiva nossos grãos há três gerações.', cta: 'LEARN_MORE', ai: { angulo: 'autoridade', emocao: 'orgulho', tom: 'inspirador', gancho: 'historia' } },
  { headline: 'Torra semanal, sabor real', body: 'Torramos toda segunda-feira e enviamos em até 48 h. Sinta a diferença do café fresco.', cta: 'SHOP_NOW', ai: { angulo: 'beneficio', emocao: 'desejo', tom: 'direto', gancho: 'beneficio_direto' } },
  { headline: 'Grãos 100% arábica', body: 'Notas de caramelo e frutas amarelas, pontuação acima de 84 SCA. Moído na hora ou em grãos.', cta: 'SHOP_NOW', ai: { angulo: 'autoridade', emocao: 'confianca', tom: 'tecnico', gancho: 'numero_dado' } },
  { headline: 'Novo: blend Aurora', body: 'Lançamento da temporada com grãos do Sul de Minas. R$ 49,90 o pacote de 250 g.', cta: 'SHOP_NOW', ai: { angulo: 'novidade', emocao: 'curiosidade', tom: 'informativo', gancho: 'afirmacao_ousada' } },
  { headline: 'Café especial em casa', body: 'Tenha a experiência de cafeteria todos os dias, com R$ 15 de desconto no primeiro pedido.', cta: 'SHOP_NOW', ai: { angulo: 'oferta', emocao: 'desejo', tom: 'direto', gancho: 'beneficio_direto' } },
];

const GOOGLE_ADS: DemoAd[] = [
  { headline: 'Cafés Especiais Aurora | Torra Semanal | Frete Grátis 1ª Compra', body: 'Grãos rastreáveis e torrados nesta semana. Peça já o seu.', cta: '', ai: { angulo: 'beneficio', emocao: 'desejo', tom: 'direto', gancho: 'beneficio_direto' } },
  { headline: 'Café Especial Online | Assinatura com 20% OFF | Receba Todo Mês', body: 'Assine e economize. Cancele quando quiser. Frete grátis.', cta: '', ai: { angulo: 'oferta', emocao: 'desejo', tom: 'direto', gancho: 'numero_dado' } },
  { headline: 'Procurando Café Especial? | Grãos 100% Arábica | Nota 4,9', body: 'Mais de 4.800 clientes satisfeitos. Compre online com segurança.', cta: '', ai: { angulo: 'prova_social', emocao: 'confianca', tom: 'direto', gancho: 'pergunta' } },
  { headline: 'Loja de Café em Grãos | Do Produtor Para Você | Aurora', body: 'Conheça nossos cafés de origem única.', cta: '', ai: { angulo: 'autoridade', emocao: 'neutra', tom: 'informativo', gancho: 'afirmacao_ousada' } },
];

const SEARCH_TERMS: Array<[string, number, number, number]> = [
  // termo, cliques, custo, conversões
  ['comprar café especial', 140, 238.4, 9],
  ['assinatura de café', 96, 181.2, 6],
  ['café especial em grãos', 88, 150.9, 4],
  ['café aurora', 61, 42.7, 5],
  ['melhor café especial do brasil', 54, 102.6, 2],
  ['café de graça', 31, 58.9, 0],
  ['como plantar café', 27, 44.1, 0],
  ['vaga de emprego cafeteria', 22, 39.6, 0],
  ['café solúvel barato', 19, 30.4, 0],
  ['receita de bolo de café', 15, 21.9, 0],
  ['cafeteria perto de mim', 14, 27.3, 0],
  ['café especial preço', 12, 19.2, 1],
];

export function seedDemoBrain(ctx: AppContext, organizationId: string, campaigns: { metaProspect: string; metaRemarketing: string; googleSearch: string }, rand: () => number, today: Date): void {
  const now = ctx.now();
  const from = isoDay(-90, today);
  const to = isoDay(-1, today);
  const insert = (platform: 'meta' | 'google', campaignId: string, adGroup: string, i: number, ad: DemoAd, imp: number, ctr: number, cvr: number, cpc: number) => {
    const clicks = Math.round(imp * ctr);
    const conversions = Math.round(clicks * cvr);
    const spend = Math.round(clicks * cpc * 100) / 100;
    const hash = contentHash(ad.headline, ad.body);
    ctx.db.run(
      `INSERT INTO ad_performance (id, organization_id, platform, advertising_account_id, campaign_id, remote_ad_id, remote_campaign_id, remote_ad_group_id, ad_name, status,
         headline, body, cta, image_url, content_hash, period_from, period_to, currency, spend, impressions, reach, clicks, conversions, revenue, source, fetched_at)
       VALUES (?, ?, ?, NULL, ?, ?, NULL, ?, ?, 'ACTIVE', ?, ?, ?, NULL, ?, ?, ?, 'BRL', ?, ?, ?, ?, ?, ?, 'demo', ?)`,
      [
        ctx.newId(),
        organizationId,
        platform,
        campaignId,
        `demo-${platform}-${i}`,
        adGroup,
        `Demo · ${ad.headline.split('|')[0]!.trim()}`,
        ad.headline,
        ad.body,
        ad.cta,
        hash,
        from,
        to,
        spend,
        imp,
        platform === 'meta' ? Math.round(imp * 0.72) : null,
        clicks,
        conversions,
        Math.round(conversions * (90 + rand() * 40) * 100) / 100,
        now,
      ],
    );
    ctx.db.run(
      `INSERT INTO creative_features (id, organization_id, content_hash, features, model, created_at) VALUES (?, ?, ?, ?, 'demonstração', ?)
       ON CONFLICT(organization_id, content_hash) DO NOTHING`,
      [ctx.newId(), organizationId, hash, JSON.stringify(ad.ai), now],
    );
  };

  META_ADS.forEach((ad, i) => {
    const text = `${ad.headline} ${ad.body}`;
    let ctr = 0.0095;
    if (text.includes('?')) ctr *= 1.75;
    if (/\p{Extended_Pictographic}/u.test(text)) ctr *= 0.78;
    if (ad.ai.angulo === 'prova_social') ctr *= 1.3;
    if (ad.ai.angulo === 'dor') ctr *= 1.2;
    let cvr = 0.028;
    if (/R\$|%|desconto|grátis|OFF/i.test(text)) cvr *= 1.6;
    if (ad.ai.angulo === 'urgencia') cvr *= 0.7;
    const imp = Math.round(18000 + rand() * 22000);
    insert('meta', i % 3 === 2 ? campaigns.metaRemarketing : campaigns.metaProspect, i % 3 === 2 ? 'demo-adset-rmk' : `demo-adset-${i % 2}`, i, ad, imp, ctr * (0.92 + rand() * 0.16), cvr * (0.9 + rand() * 0.2), 1.1 + rand() * 0.5);
  });
  GOOGLE_ADS.forEach((ad, i) => {
    let ctr = 0.045;
    if (ad.headline.includes('?')) ctr *= 1.35;
    if (i === 3) ctr *= 0.45;
    const imp = Math.round(6000 + rand() * 5000);
    insert('google', campaigns.googleSearch, 'demo-ag-1', 100 + i, ad, imp, ctr, 0.06 * (0.9 + rand() * 0.2), 1.6 + rand() * 0.6);
  });

  for (const [term, clicks, spend, conversions] of SEARCH_TERMS) {
    ctx.db.run(
      `INSERT INTO search_terms (id, organization_id, advertising_account_id, campaign_id, remote_campaign_id, remote_ad_group_id, term, status, period_from, period_to, currency,
         spend, impressions, clicks, conversions, revenue, fetched_at)
       VALUES (?, ?, NULL, ?, 'demo-search', 'demo-ag-1', ?, ?, ?, ?, 'BRL', ?, ?, ?, ?, NULL, ?)`,
      [ctx.newId(), organizationId, campaigns.googleSearch, term, term === 'café aurora' ? 'ADDED' : 'NONE', isoDay(-30, today), to, spend, clicks * 14, clicks, conversions, now],
    );
  }
}
