import { describe, expect, it } from 'vitest';
import { assertSafeUrl, isPublicIp } from './ssrf';
import { extractPage, fetchPublicPage } from './pageFetcher';
import { redact, redactString } from '../redact';

describe('proteção SSRF', () => {
  it.each([
    ['127.0.0.1', false],
    ['10.1.2.3', false],
    ['172.16.0.1', false],
    ['172.32.0.1', true],
    ['192.168.0.10', false],
    ['169.254.169.254', false],
    ['100.64.0.1', false],
    ['0.0.0.0', false],
    ['224.0.0.1', false],
    ['8.8.8.8', true],
    ['::1', false],
    ['::', false],
    ['fe80::1', false],
    ['fd00::1', false],
    ['::ffff:127.0.0.1', false],
    ['::ffff:8.8.8.8', true],
    ['2606:4700:4700::1111', true],
    ['não-é-ip', false],
  ])('isPublicIp(%s) = %s', (ip, expected) => {
    expect(isPublicIp(ip)).toBe(expected);
  });

  it('rejeita esquemas, portas, credenciais e hosts locais', () => {
    expect(() => assertSafeUrl('file:///etc/passwd')).toThrow();
    expect(() => assertSafeUrl('http://localhost/admin')).toThrow();
    expect(() => assertSafeUrl('http://127.0.0.1/')).toThrow();
    expect(() => assertSafeUrl('http://[::1]/')).toThrow();
    expect(() => assertSafeUrl('http://169.254.169.254/latest/meta-data')).toThrow();
    expect(() => assertSafeUrl('https://example.com:8443/')).toThrow(/portas/);
    expect(() => assertSafeUrl('https://user:pass@example.com/')).toThrow(/credenciais/);
    expect(assertSafeUrl('https://example.com/pagina').hostname).toBe('example.com');
  });

  it('bloqueia domínios que resolvem para IP privado (DNS rebinding)', async () => {
    await expect(fetchPublicPage('http://interno.exemplo.com/', { lookup: async () => [{ address: '10.0.0.5', family: 4 }] })).rejects.toThrow(/privado/);
  });
});

describe('extração de página', () => {
  it('extrai título, descrição, títulos e texto, ignorando scripts', () => {
    const html = `<!doctype html><html><head><title>Café &amp; Cia</title>
      <meta name="description" content="Os melhores cafés">
      <script>var segredo = "não deve aparecer";</script><style>h1{}</style></head>
      <body><h1>Torra <b>semanal</b></h1><h2>Assinatura</h2><p>Frete&nbsp;grátis</p></body></html>`;
    const r = extractPage(html);
    expect(r.title).toBe('Café & Cia');
    expect(r.description).toBe('Os melhores cafés');
    expect(r.headings).toEqual(['Torra semanal', 'Assinatura']);
    expect(r.textExcerpt).toContain('Frete grátis');
    expect(r.textExcerpt).not.toContain('segredo');
  });
});

describe('redação de segredos', () => {
  it('remove chaves sensíveis e padrões de tokens', () => {
    const out = redact({ accessToken: 'abc', nested: { client_secret: 'x', ok: 'valor' }, msg: 'falhou com sk-ant-api03-abcdefghijk' }) as Record<string, unknown>;
    expect(out.accessToken).toBe('[REDACTED]');
    expect((out.nested as Record<string, unknown>).client_secret).toBe('[REDACTED]');
    expect((out.nested as Record<string, unknown>).ok).toBe('valor');
    expect(out.msg).toBe('falhou com [REDACTED]');
    expect(redactString('https://x.com/a?access_token=EAAB123&b=1')).toBe('https://x.com/a?access_token=[REDACTED]&b=1');
    expect(redactString('Authorization: Bearer ya29.a0AfH6SMBxxxxxxxx')).not.toContain('ya29');
  });
});
