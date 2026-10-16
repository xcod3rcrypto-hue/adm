# Renova Cell

Pasta do projeto **RENOVA CELL**, um suplemento diário de colágeno + peptídeos (mercado EUA primeiro, em 5 idiomas). Organiza todo o ciclo — do briefing ao relatório — na mesma ordem em que o trabalho acontece no ADVERTEX AI Studio.

O funil (quiz → oferta → checkout → upsells) está em [`site/`](site/README.md).

> Regra da casa: nenhum dado fictício entra aqui como real. Número sem fonte fica marcado como **hipótese**.

## Estrutura

| Pasta | O que guardar |
|---|---|
| `site/` | Funil em Next.js 14 — veja `site/README.md` |
| `01-briefing/` | Briefing do cliente (modelo em `briefing.md`) |
| `02-pesquisa/` | Público, dores, objeções, tendências; `concorrentes/` com prints e URLs datadas |
| `03-estrategia/` | Posicionamento, oferta, ângulos e funil (`estrategia.md`) |
| `04-copy/` | Textos de anúncio, ganchos, roteiros de vídeo |
| `05-criativos/` | `imagens/`, `videos/` e `aprovados/` (só o que o cliente aprovou) |
| `06-campanhas/` | Estrutura e histórico de `meta-ads/` e `google-ads/` |
| `07-experimentos/` | Testes A/B: hipótese, variantes, métrica, resultado |
| `08-relatorios/` | Relatórios periódicos (PDF/CSV exportados do app) |

## Convenção de nomes

`AAAA-MM-DD_tipo_descricao_vN.ext` — ex.: `2026-10-16_feed_pele-firme_v1.png`

## Status

- [ ] Briefing preenchido e validado com o cliente
- [ ] Pesquisa de público e concorrentes
- [ ] Estratégia e ângulos definidos
- [ ] Primeira bateria de copy e criativos
- [ ] Campanhas montadas (criadas pausadas) e revisadas
- [ ] Primeiro experimento A/B no ar
- [ ] Primeiro relatório entregue
