/**
 * VSL scripts (≈2–3 min spoken each) for the three personas.
 * English and Portuguese are written by hand; es/fr/de are produced by
 * `npm run vsl:generate -- --translate` with Claude and saved to scripts/vsl/ for review
 * before any video is generated.
 *
 * Compliance: structure/function language only. No hormone, libido-treatment or
 * disease claims, no promised timelines, no invented numbers.
 */
import type { Persona } from './quiz';

type Scripts = Record<Persona, string>;

export const VSL_SCRIPTS_EN: Scripts = {
  woman: `If your skin, your energy and the way you feel in your own body aren't what they used to be… the next two minutes are for you.

Hi. I'm here to explain what your quiz answers mean — and what you can actually do about it.

From around age twenty-five, your body starts making a little less collagen every year. Roughly one percent a year. You don't notice it at first. Then one day the mirror looks a little different. Your skin feels less firm. Getting through the afternoon takes more effort than it should. And feeling good in your own skin — the thing that makes you feel confident, attractive, like yourself — gets harder.

Collagen is the protein that gives structure to your skin, your joints and the connective tissue that holds you together. And here's what the research says. In a placebo-controlled study published in 2014, women who took specific collagen peptides every day for eight weeks had better skin elasticity than the placebo group. A 2023 review of twenty-six trials found improvements in skin hydration and elasticity too.

That's why we created RENOVA CELL: a daily collagen and peptide formula. One serving a day, in your water, your coffee or your smoothie. No hormones. No stimulants. Just a simple ritual that fits into the life you already have.

Now, I'll be honest with you. Collagen is not magic, and it's not overnight. The studies ran for eight to twelve weeks. That's why for your profile we recommend Kit 3 — the full ninety-day cycle. Results vary from person to person, and that's exactly why you're covered by a thirty-day money-back guarantee. If you're not happy, you get your money back.

Your plan is ready, just below this video. Take the first step today.

Get my Kit 3 now.`,

  man: `If you wake up tired, your joints complain more than they used to, and you just don't feel as sharp or as driven as before… the next two minutes are for you.

Hi. Let's talk about what your quiz answers mean.

Most men think this is just age. Part of it is. From around twenty-five, your body makes roughly one percent less collagen every year. Collagen is the protein that gives structure to your joints, tendons, skin and the connective tissue you use every single day — when you train, when you lift, when you play with your kids.

Here's what research shows. In a twenty-four-week study, athletes who took ten grams of collagen hydrolysate a day reported less activity-related joint pain than those on placebo. And placebo-controlled studies have linked collagen peptides to better skin elasticity.

That's why we built RENOVA CELL: a daily collagen and peptide formula. One serving a day — in water, coffee or your shake. No stimulants. No hormones. Nothing that promises to change your testosterone, because that's not what collagen does, and we won't pretend it is.

What it does is give your body a steady daily supply of the building blocks it uses to support joints and skin. Combine that with sleep, training and real food, and you're giving yourself a real shot at feeling ready for the day again.

The studies ran eight to twenty-four weeks, so consistency matters. That's why we recommend Kit 3, the ninety-day cycle. Results vary, and you're covered by a thirty-day money-back guarantee. If it's not for you, you get your money back.

Your plan is right below this video.

Get my Kit 3 now.`,

  senior: `After fifty, your body keeps making less collagen than it did when you were younger. You may feel it in your joints when you get up in the morning, see it in your skin, or notice that your energy doesn't last the way it used to. There's something simple you can do about it.

Hi. Let me explain what your quiz answers mean.

From around age twenty-five, collagen production drops by roughly one percent a year. By your age, that adds up. Collagen is the protein that gives structure to your skin, your joints and the connective tissue that keeps you moving.

Research has looked at what daily collagen can do. A twenty-four-week study found people taking collagen hydrolysate reported less activity-related joint pain than those on placebo. And a 2023 review of twenty-six trials found improvements in skin hydration and elasticity.

RENOVA CELL is a daily collagen and peptide formula. One serving a day, stirred into water, coffee, tea or a smoothie. No stimulants and no hormones. It's easy to take, and easy to keep taking — which matters, because the studies ran for months, not days.

A word of care: if you take medication or have a medical condition, check with your doctor before starting any supplement.

For your profile we recommend Kit 6, delivered every month, so you never run out and your routine never breaks. You can cancel anytime. Results vary from person to person, and you're covered by a thirty-day money-back guarantee.

Your plan is ready below this video. Your future self will thank you for starting today.

Get my Kit 6 now.`,
};

export const VSL_SCRIPTS_PT: Scripts = {
  woman: `Se a sua pele, a sua energia e o jeito como você se sente no próprio corpo não são mais os mesmos… os próximos dois minutos são para você.

Oi. Eu vou explicar o que as suas respostas do quiz significam — e o que você pode fazer de verdade.

A partir dos vinte e cinco anos, o corpo começa a produzir um pouco menos de colágeno a cada ano. Mais ou menos um por cento ao ano. No começo você nem percebe. Até que um dia o espelho parece diferente. A pele parece menos firme. Chegar ao fim da tarde dá mais trabalho do que deveria. E se sentir bem na própria pele — aquilo que te deixa confiante, atraente, você mesma — fica mais difícil.

O colágeno é a proteína que dá estrutura à pele, às articulações e ao tecido que sustenta o seu corpo. E veja o que a pesquisa diz. Em um estudo com placebo publicado em 2014, mulheres que tomaram peptídeos de colágeno específicos todos os dias por oito semanas tiveram mais elasticidade na pele do que o grupo placebo. Uma revisão de 2023 com vinte e seis estudos também encontrou melhora na hidratação e na elasticidade da pele.

Por isso criamos o RENOVA CELL: uma fórmula diária de colágeno e peptídeos. Uma dose por dia, na água, no café ou na vitamina. Sem hormônios. Sem estimulantes. Só um ritual simples que cabe na vida que você já tem.

Vou ser sincera com você. Colágeno não é mágica e não funciona da noite para o dia. Os estudos duraram de oito a doze semanas. Por isso, para o seu perfil, recomendamos o Kit 3 — o ciclo completo de noventa dias. Os resultados variam de pessoa para pessoa, e é exatamente por isso que você tem a garantia de trinta dias. Se não gostar, recebe seu dinheiro de volta.

Seu plano está pronto, logo abaixo deste vídeo. Dê o primeiro passo hoje.

Quero meu Kit 3 agora.`,

  man: `Se você acorda cansado, as articulações reclamam mais do que antes e você não se sente tão disposto quanto já foi… os próximos dois minutos são para você.

Fala. Vamos conversar sobre o que as suas respostas do quiz significam.

A maioria dos homens acha que é só a idade. Em parte, é. A partir dos vinte e cinco anos, o corpo produz cerca de um por cento a menos de colágeno por ano. Colágeno é a proteína que dá estrutura às articulações, tendões, pele e ao tecido conjuntivo que você usa todo santo dia — no treino, no trabalho, brincando com os filhos.

Olha o que a pesquisa mostra. Em um estudo de vinte e quatro semanas, atletas que tomaram dez gramas de colágeno hidrolisado por dia relataram menos dor articular ligada à atividade do que o grupo placebo. E estudos com placebo associaram peptídeos de colágeno a mais elasticidade da pele.

Por isso criamos o RENOVA CELL: uma fórmula diária de colágeno e peptídeos. Uma dose por dia — na água, no café ou no shake. Sem estimulantes. Sem hormônios. Nada de prometer mexer na sua testosterona, porque não é isso que colágeno faz, e a gente não vai fingir que é.

O que ele faz é dar ao seu corpo, todo dia, os blocos que ele usa para sustentar articulações e pele. Junte isso com sono, treino e comida de verdade, e você tem uma chance real de voltar a se sentir pronto para o dia.

Os estudos duraram de oito a vinte e quatro semanas, então constância importa. Por isso recomendamos o Kit 3, o ciclo de noventa dias. Os resultados variam, e você tem a garantia de trinta dias. Se não for para você, recebe seu dinheiro de volta.

Seu plano está logo abaixo deste vídeo.

Quero meu Kit 3 agora.`,

  senior: `Depois dos cinquenta, o corpo continua produzindo menos colágeno do que quando você era mais jovem. Talvez você sinta isso nas articulações ao levantar de manhã, veja na pele ou perceba que a energia não dura como antes. Existe algo simples que você pode fazer.

Olá. Deixe-me explicar o que as suas respostas do quiz significam.

A partir dos vinte e cinco anos, a produção de colágeno cai cerca de um por cento ao ano. Na sua idade, isso soma bastante. O colágeno é a proteína que dá estrutura à pele, às articulações e ao tecido que mantém você em movimento.

As pesquisas já estudaram o que o colágeno diário pode fazer. Um estudo de vinte e quatro semanas mostrou que pessoas que tomaram colágeno hidrolisado relataram menos dor articular ligada à atividade do que o grupo placebo. E uma revisão de 2023 com vinte e seis estudos encontrou melhora na hidratação e na elasticidade da pele.

O RENOVA CELL é uma fórmula diária de colágeno e peptídeos. Uma dose por dia, misturada na água, no café, no chá ou na vitamina. Sem estimulantes e sem hormônios. Fácil de tomar e fácil de manter — o que importa, porque os estudos duraram meses, não dias.

Um cuidado: se você toma remédios ou tem alguma condição de saúde, fale com seu médico antes de começar qualquer suplemento.

Para o seu perfil, recomendamos o Kit 6, entregue todo mês, para você nunca ficar sem e sua rotina nunca parar. Você pode cancelar quando quiser. Os resultados variam de pessoa para pessoa, e você tem a garantia de trinta dias.

Seu plano está pronto logo abaixo deste vídeo. Comece hoje.

Quero meu Kit 6 agora.`,
};
