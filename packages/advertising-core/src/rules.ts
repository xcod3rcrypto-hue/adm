import type { CreativeKind, Platform } from '@advertex/shared';

/**
 * Limites de texto por formato. `hard` = a plataforma rejeita acima do limite;
 * `recommended` = a plataforma aceita, mas trunca a exibição.
 * Fontes (verificar periodicamente, as regras mudam):
 *  - Google Ads RSA: títulos 30, descrições 90 caracteres (largura dupla conta 2).
 *  - Meta Ads: texto principal ~125 e título ~40 caracteres antes do truncamento.
 */
export interface TextRule {
  kind: CreativeKind;
  platform: Platform | null;
  label: string;
  limit: number | null;
  enforcement: 'hard' | 'recommended' | 'none';
  doubleWidthCountsTwice: boolean;
}

export const TEXT_RULES: Record<CreativeKind, TextRule> = {
  google_rsa_headline: { kind: 'google_rsa_headline', platform: 'google', label: 'Google Ads — título RSA', limit: 30, enforcement: 'hard', doubleWidthCountsTwice: true },
  google_rsa_description: { kind: 'google_rsa_description', platform: 'google', label: 'Google Ads — descrição RSA', limit: 90, enforcement: 'hard', doubleWidthCountsTwice: true },
  meta_primary_text: { kind: 'meta_primary_text', platform: 'meta', label: 'Meta Ads — texto principal', limit: 125, enforcement: 'recommended', doubleWidthCountsTwice: false },
  meta_headline: { kind: 'meta_headline', platform: 'meta', label: 'Meta Ads — título', limit: 40, enforcement: 'recommended', doubleWidthCountsTwice: false },
  script: { kind: 'script', platform: null, label: 'Roteiro de vídeo', limit: null, enforcement: 'none', doubleWidthCountsTwice: false },
  generic: { kind: 'generic', platform: null, label: 'Texto livre', limit: null, enforcement: 'none', doubleWidthCountsTwice: false },
};

// Faixas de caracteres de largura dupla (CJK, Hangul, formas de largura total).
const DOUBLE_WIDTH = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/u;

export function countCharacters(text: string, doubleWidthCountsTwice = false): number {
  let n = 0;
  for (const ch of text) n += doubleWidthCountsTwice && DOUBLE_WIDTH.test(ch) ? 2 : 1;
  return n;
}

export interface TextValidation {
  count: number;
  limit: number | null;
  withinLimit: boolean;
  enforcement: TextRule['enforcement'];
  message: string | null;
}

export function validateText(kind: CreativeKind, text: string): TextValidation {
  const rule = TEXT_RULES[kind];
  const count = countCharacters(text.trim(), rule.doubleWidthCountsTwice);
  const withinLimit = rule.limit === null || count <= rule.limit;
  let message: string | null = null;
  if (!withinLimit) {
    message =
      rule.enforcement === 'hard'
        ? `${rule.label}: ${count}/${rule.limit} caracteres — a plataforma rejeitará este texto.`
        : `${rule.label}: ${count}/${rule.limit} caracteres — o texto pode ser truncado na exibição.`;
  }
  return { count, limit: rule.limit, withinLimit, enforcement: rule.enforcement, message };
}

export const OBJECTIVES: Record<Platform, Array<{ value: string; label: string }>> = {
  meta: [
    { value: 'OUTCOME_AWARENESS', label: 'Reconhecimento' },
    { value: 'OUTCOME_TRAFFIC', label: 'Tráfego' },
    { value: 'OUTCOME_ENGAGEMENT', label: 'Engajamento' },
    { value: 'OUTCOME_LEADS', label: 'Cadastros (leads)' },
    { value: 'OUTCOME_APP_PROMOTION', label: 'Promoção de app' },
    { value: 'OUTCOME_SALES', label: 'Vendas' },
  ],
  google: [
    { value: 'SEARCH', label: 'Pesquisa' },
    { value: 'PERFORMANCE_MAX', label: 'Performance Max' },
    { value: 'DISPLAY', label: 'Display' },
    { value: 'VIDEO', label: 'Vídeo (YouTube)' },
    { value: 'DEMAND_GEN', label: 'Geração de demanda' },
    { value: 'SHOPPING', label: 'Shopping' },
  ],
};

export function objectiveLabel(platform: Platform, value: string): string {
  return OBJECTIVES[platform].find((o) => o.value === value)?.label ?? value;
}
