import { describe, expect, it } from 'vitest';
import { CHANNEL_NAMES, ipcInputs } from './ipc';
import { BriefData, CampaignInput } from './domain';
import { formatCurrency, isoDay } from './format';

describe('contrato IPC', () => {
  it('a lista de canais do preload é idêntica aos schemas do processo principal', () => {
    expect([...CHANNEL_NAMES].sort()).toEqual(Object.keys(ipcInputs).sort());
  });

  it('rejeita payloads inválidos', () => {
    expect(() => ipcInputs['project.get'].parse({ organizationId: 'x', id: 'y' })).toThrow();
    expect(() => ipcInputs['app.openExternal'].parse({ url: 'http://example.com' })).toThrow();
    expect(() => ipcInputs['integration.google.save'].parse({ organizationId: crypto.randomUUID(), loginCustomerId: '123-456-7890', apiVersion: 'v25' })).toThrow();
  });
});

describe('schemas de domínio', () => {
  it('aplica padrões ao briefing', () => {
    expect(BriefData.parse({ productOrService: 'Curso online' })).toMatchObject({ language: 'pt-BR', websiteUrl: '' });
  });

  it('valida moeda ISO e orçamento positivo', () => {
    expect(() => CampaignInput.parse({ platform: 'meta', name: 'Teste', objective: 'X', currency: 'real' })).toThrow();
    expect(() => CampaignInput.parse({ platform: 'meta', name: 'Teste', objective: 'X', dailyBudget: -1 })).toThrow();
  });
});

describe('formatação', () => {
  it('formata moeda em pt-BR e datas locais', () => {
    expect(formatCurrency(1234.5, 'BRL').replace(/\s/g, ' ')).toBe('R$ 1.234,50');
    expect(formatCurrency(null, 'BRL')).toBe('—');
    expect(isoDay(-1, new Date(2026, 0, 1))).toBe('2025-12-31');
  });
});
