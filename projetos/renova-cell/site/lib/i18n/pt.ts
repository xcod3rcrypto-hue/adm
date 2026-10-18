import type { Dictionary } from './en';

export const pt: Dictionary = {
  common: {
    brand: 'VitalRise',
    back: 'Voltar',
    next: 'Próxima',
    continue: 'Continuar',
    skip: 'Pular',
    loading: 'Carregando…',
    language: 'Idioma',
    resultsVary: 'Os resultados variam de pessoa para pessoa.',
    fdaDisclaimer:
      'Estas afirmações não foram avaliadas pela FDA nem pela ANVISA. Este produto não se destina a diagnosticar, tratar, curar ou prevenir qualquer doença.',
    euDisclaimer:
      'Os suplementos alimentares não substituem uma alimentação variada e equilibrada nem um estilo de vida saudável. Não exceda a dose diária recomendada. Mantenha fora do alcance das crianças.',
  },
  consent: {
    text: 'Usamos cookies para análise e medição de anúncios.',
    accept: 'Aceitar',
    decline: 'Recusar',
  },
  quiz: {
    progress: '{pct}% concluído',
    intro: "Responda 8 perguntas rápidas (cerca de 60 segundos) e receba seu plano para pele com aparência mais jovem, mais desejo e disposição no dia a dia.",
    questions: {
      gender: {
        title: 'Como você se identifica?',
        options: { male: 'Homem', female: 'Mulher', other: 'Prefiro não dizer' },
      },
      age: {
        title: 'Qual a sua idade?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: 'O que mais incomoda você hoje?',
        options: {
          skin: 'Pele perdendo firmeza',
          energy: 'Pouca energia',
          libido: 'Pouco desejo / vitalidade',
          joints: 'Articulações rígidas ou doloridas',
          all: 'Um pouco de tudo',
        },
      },
      duration: {
        title: 'Há quanto tempo isso incomoda?',
        options: { lt6m: 'Menos de 6 meses', '6m-2y': '6 meses a 2 anos', '2y+': 'Mais de 2 anos' },
      },
      history: {
        title: 'Você já tomou colágeno?',
        options: { never: 'Nunca', tried: 'Sim, mas não vi resultado', using: 'Estou tomando agora' },
      },
      energy: { title: 'Como está sua energia no dia a dia?', min: 'Esgotada', max: 'Cheia de energia' },
      confidence: { title: 'Quanto você se sente bem com seu corpo?', min: 'Nada', max: 'Totalmente' },
      goal: {
        title: 'O que você mais quer sentir nos próximos 15 dias?',
        options: {
          skin: 'Pele com aparência mais firme',
          energy: 'Mais energia',
          libido: 'Mais vitalidade',
          joints: 'Movimentos mais leves',
          all: 'Tudo isso',
        },
      },
    },
    contact: {
      title: 'Para onde enviamos seu plano?',
      subtitle: 'Opcional — você pode ver o resultado agora mesmo sem preencher.',
      name: 'Primeiro nome',
      email: 'E-mail',
      phone: 'Celular (opcional, para SMS)',
      marketing: 'Quero receber dicas e ofertas por e-mail. Posso cancelar quando quiser.',
      sms: 'Quero receber ofertas por SMS neste número. Responda SAIR para cancelar.',
      submit: 'Ver meu resultado',
      skip: 'Pular e ver meu resultado',
      privacy: 'Nunca vendemos seus dados.',
    },
  },
  analyzing: {
    title: 'Montando seu plano',
    steps: ['Lendo suas 8 respostas…', 'Estimando seu perfil de colágeno…', 'Escrevendo sua recomendação personalizada…'],
  },
  offer: {
    trust: 'Análise concluída para {name} • Com base nas suas 8 respostas',
    trustAnon: 'Análise concluída • Com base nas suas 8 respostas',
    hero: {
      fallback: {
        woman: 'Pele com aparência mais firme e energia estável começam no que você dá ao seu corpo todo dia',
        man: 'Volte a se sentir pronto para o dia: colágeno diário para articulações, pele e energia',
        senior: 'Depois dos 50 o corpo produz menos colágeno. Sua rotina diária pode compensar',
      },
      sub: "Seu ritual diário da juventude: uma fórmula de colágeno + peptídeos para quem quer pele com aparência mais jovem, mais desejo e mais disposição, ajustada às suas respostas.",
      cta: 'Ver meu plano recomendado',
    },
    vsl: {
      title: 'Assista: o que suas respostas significam',
      unavailable: 'O vídeo não está disponível agora. Tudo o que você precisa está abaixo.',
      cta: 'Quero meu plano agora',
      resume: 'Continuando de onde você parou',
    },
    diagnosis: {
      title: 'Sua estimativa de colágeno',
      body: 'A partir dos 25 anos, o corpo produz cerca de 1% menos colágeno por ano. Na sua idade, isso soma cerca de {pct}% a menos do que aos 25.',
      note: 'Estimativa ilustrativa baseada em uma média muito citada, não uma medição médica.',
    },
    bullets: {
      title: 'O que isso significa para você',
      items: {
        skin: [
          'Peptídeos de colágeno foram associados a mais elasticidade da pele em estudos com placebo',
          'Uma dose diária simples que cabe na sua manhã',
          'Pensado para a pele que começa a perder firmeza',
        ],
        energy: [
          'Dose diária rica em proteína para apoiar sua rotina',
          'Sem estimulantes — nada de queda de energia depois',
          'Combina com sono, água e movimento para dias mais estáveis',
        ],
        libido: [
          'Sentir-se bem na própria pele faz parte de sentir desejo',
          'Um ritual diário de autocuidado que fortalece a confiança',
          'Sem hormônios e sem estimulantes',
        ],
        joints: [
          'O colágeno hidrolisado foi estudado para desconforto articular ligado à atividade física',
          'Apoio à cartilagem e ao tecido conjuntivo que você usa todo dia',
          'Fácil de tomar todo dia — e é isso que importa',
        ],
        all: [
          'Uma dose diária para pele, articulações e bem-estar',
          'Peptídeos de colágeno + blend de peptídeos',
          'Feito para caber na rotina que você já tem',
        ],
      },
    },
    pillars: {
      title: "Um ritual diário, três objetivos",
      items: [
        { title: "Pele com aparência mais jovem", body: "Peptídeos de colágeno foram associados a mais elasticidade e hidratação da pele em estudos com placebo." },
        { title: "Desejo e vitalidade", body: "Sentir-se bem no próprio corpo faz parte de sentir desejo. Um ritual diário de autocuidado para homens e mulheres, sem hormônios e sem estimulantes." },
        { title: "Disposição no dia a dia", body: "Uma dose diária rica em proteína que cabe na sua manhã, sem estimulantes e sem queda de energia depois." },
      ],
      note: "Os resultados variam. VitalRise é um suplemento alimentar, não um medicamento.",
    },
    science: {
      title: 'O que a pesquisa diz',
      flip: 'Toque para ver a fonte',
      cards: [
        {
          title: 'Elasticidade da pele',
          finding:
            '69 mulheres tomaram 2,5 g ou 5 g de peptídeos de colágeno específicos ou placebo por 8 semanas. A elasticidade da pele melhorou em relação ao placebo.',
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Conforto articular',
          finding:
            'Em 24 semanas, atletas que tomaram 10 g/dia de colágeno hidrolisado relataram menos dor articular ligada à atividade do que o grupo placebo.',
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'O quadro geral',
          finding:
            'Uma meta-análise de 26 ensaios randomizados (1.721 participantes) encontrou melhora na hidratação e elasticidade da pele em relação ao placebo.',
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'Os estudos testaram fórmulas específicas de colágeno; os resultados podem não se aplicar a todos os produtos, incluindo este.',
    },
    timeline: {
      title: 'O que esperar',
      steps: [
        { day: 'Dia 1', title: 'Comece seu ritual', body: 'Uma dose por dia. O que conta é a constância.' },
        { day: 'Dia 5', title: 'Vire hábito', body: 'Mesmo horário, mesmo lugar. O hábito se firma.' },
        { day: 'Dia 15', title: 'Faça um check-in', body: "Repare em como você se sente e mantenha o hábito." },
        { day: 'Dia 30', title: 'Um mês', body: 'Continue. Os estudos mediram mudanças na pele entre 4 e 12 semanas.' },
        { day: 'Dia 90', title: 'Ciclo completo', body: 'O período que a maioria das pesquisas avaliou. Hora de comparar.' },
      ],
    },
    beforeAfter: {
      title: 'Clientes reais',
      before: 'Antes',
      after: 'Depois',
      note: 'Fotos sem edição, compartilhadas com autorização. Os resultados variam.',
    },
    testimonials: {
      title: 'Pessoas como você',
      note: 'Clientes reais, compartilhado com autorização. Os resultados variam.',
    },
    simulator: {
      title: 'Sua curva de colágeno',
      label: 'Sua idade',
      yAxis: 'Colágeno estimado vs. aos 25 anos (%)',
      you: 'Você',
      note: 'Ilustração da queda de ~1% ao ano após os 25, muito citada. Não é uma previsão de resultado do produto.',
    },
    comparison: {
      title: 'VitalRise vs. um colágeno comum',
      us: 'VitalRise',
      them: 'Colágeno comum',
      rows: [
        { label: 'Peptídeos de colágeno hidrolisado', us: 'yes', them: 'yes' },
        { label: 'Blend de peptídeos adicionado', us: 'yes', them: 'no' },
        { label: 'Plano ajustado ao seu quiz', us: 'yes', them: 'no' },
        { label: 'Garantia de 30 dias', us: 'yes', them: 'varies' },
      ],
      varies: 'Depende',
    },
    pricing: {
      perMonth: '/mês',
      once: "Compra única",
      subscribe: "Assinatura: receba de novo quando acabar",
      interval: { m1: "todo mês", m3: "a cada 3 meses", m6: "a cada 6 meses" },
      title: 'Escolha seu plano',
      recommended: 'Recomendado para você',
      perUnit: '{price} por unidade',
      save: 'Economize {pct}%',
      plans: {
        single: { name: '1 unidade', desc: 'Experimente por um mês' },
        kit3: { name: 'Kit 3', desc: 'O ciclo de 90 dias usado na maioria dos estudos' },
        kit6: { name: "Kit 6", desc: "Estoque para 6 meses" },
      },
      recurring: "Cobrança de {price} {interval} até você cancelar. Cancele quando quiser pelo link do recibo.",
      cta: 'Escolher este plano',
    },
    shipping: { free: 'Frete grátis', fast: 'Entrega em até 2 dias úteis', discreet: 'Embalagem discreta', tracked: 'Entrega com rastreio' },
    bonus: {
      title: 'Incluído no Kit 3 e no Kit 6',
      items: ['E-book: A Rotina do Colágeno', 'Plano alimentar de 15 dias', 'Grupo VIP de clientes'],
    },
    guarantee: {
      title: 'Garantia de 30 dias',
      body: 'Experimente por 30 dias. Se não gostar, mande um e-mail e devolvemos seu dinheiro — sem perguntas.',
    },
    faq: {
      title: 'Dúvidas',
      items: {
        different: {
          q: 'Já tomei colágeno e não vi nada. Por que seria diferente?',
          a: 'Muita gente para em poucas semanas. A maioria dos estudos durou de 8 a 12 semanas com dose diária — por isso recomendamos o Kit 3 de 90 dias. E se não funcionar para você, a garantia de 30 dias vale.',
        },
        time: {
          q: 'Em quanto tempo vejo resultado?',
          a: 'Cada pessoa é diferente. As pesquisas mediram mudanças na pele após 4 a 12 semanas de uso diário. Faça pelo menos um ciclo completo.',
        },
        safe: {
          q: 'É seguro para mim?',
          a: 'Colágeno é uma proteína alimentar geralmente bem tolerada. Se estiver grávida, amamentando, tomando remédios ou tiver alguma condição de saúde, fale com seu médico antes.',
        },
        men: {
          q: 'Serve para homens também?',
          a: 'Sim. O colágeno apoia pele e articulações em todo mundo. Não afirmamos que ele altera hormônios.',
        },
        how: {
          q: 'Como eu tomo?',
          a: 'Uma dose por dia, misturada em água, café ou vitamina. Tomar sempre no mesmo horário ajuda.',
        },
        cancel: {
          q: "Como cancelo uma assinatura?",
          a: 'Use o link em qualquer e-mail de recibo ou escreva para nós. Cancele quando quiser, sem multa.',
        },
        shipping: {
          q: 'Como funciona o envio?',
          a: 'O frete é grátis para todos os países que atendemos. A entrega leva no máximo 2 dias úteis, com rastreio, em embalagem simples e discreta, sem o nome do produto por fora. O link de rastreio é enviado por e-mail assim que o pedido sai.',
          aStandard: 'O frete é grátis para todos os países que atendemos. Os pedidos são enviados com rastreio, em embalagem simples e discreta, sem o nome do produto por fora. O prazo estimado para o seu país aparece no pagamento, e o link de rastreio é enviado por e-mail assim que o pedido sai.',
        },
      },
    },
    sticky: { cta: 'Quero meu plano' },
    exit: {
      title: 'Espere — 10% de desconto antes de sair',
      body: 'Use este código no checkout:',
      code: 'VITAL10',
      cta: 'Usar meus 10% de desconto',
      dismiss: 'Não, obrigado',
    },
    chat: {
      title: 'Pergunte à Elena',
      subtitle: 'Assistente de IA · não é médica',
      greeting: 'Oi! Sou a Elena, assistente de IA da VitalRise. Pergunte o que quiser sobre o produto ou seu plano.',
      placeholder: 'Digite sua pergunta…',
      send: 'Enviar',
      error: 'Desculpe, algo deu errado. Tente de novo.',
      open: 'Abrir chat',
      close: 'Fechar chat',
    },
    social: { ordered: '{count} pessoas fizeram pedido nas últimas 24 horas' },
    footer: {
      privacy: 'Privacidade',
      terms: 'Termos',
      contact: 'Contato',
      rights: 'Todos os direitos reservados.',
    },
  },
  checkout: {
    steps: ['Carrinho', 'Seus dados', 'Pagamento'],
    cart: {
      title: 'Seu pedido',
      bumpTitle: '+1 unidade extra por {price}',
      bumpBody: 'Só nesta página: adicione mais uma unidade por um preço menor.',
      coupon: 'Cupom de desconto',
      couponPlaceholder: 'Digite o cupom',
      apply: 'Aplicar',
      hint: 'Psiu… tente VITAL10',
      valid: 'Cupom aplicado: {pct}% de desconto',
      invalid: 'Este cupom não é válido.',
      total: 'Total',
      discountNote: 'Desconto aplicado no pagamento',
      shipping: 'Frete',
      free: 'Grátis',
    },
    info: {
      title: 'Seus dados',
      name: 'Nome completo',
      email: 'E-mail',
      newsletter: 'Quero receber dicas anti-idade por e-mail',
      addressNote: 'Você preenche o endereço de entrega na página segura de pagamento (com preenchimento automático).',
    },
    payment: {
      title: 'Pagamento',
      body: 'Você finaliza na página segura da Stripe. Cartão, Apple Pay, Google Pay e outros meios aparecem lá quando disponíveis no seu país.',
      installments: 'Opções de parcelamento aparecem no pagamento quando disponíveis.',
      pay: 'Pagar com segurança',
      redirecting: 'Abrindo o pagamento seguro…',
      error: 'Não conseguimos iniciar o pagamento. Tente de novo.',
      ssl: 'Criptografia SSL',
      guarantee: 'Garantia de 30 dias',
      stripe: 'Pagamentos via Stripe',
    },
  },
  upsell1: {
    title: 'Seu pedido está confirmado. Só mais uma coisa…',
    body: 'Adicione um Kit 6 (compra única) com 45% de desconto — para a rotina de 6 meses. Oferta só nesta página.',
    accept: 'Sim, adicionar o Kit 6 por {price}',
    decline: 'Não, obrigado',
    charge: 'Seu cartão salvo será cobrado {price} uma única vez. Não é assinatura.',
  },
  upsell2: {
    title: 'Nunca fique sem — e pague 30% menos',
    body: "Receba o Kit 3 a cada 3 meses por {price} em vez de {full}. O desconto vale enquanto você for assinante.",
    accept: "Sim, assinar por {price} a cada 3 meses",
    decline: 'Não, obrigado',
    charge: "Seu cartão salvo será cobrado {price} hoje e a cada 3 meses até você cancelar. Cancele quando quiser.",
  },
  upsell: {
    processing: 'Processando…',
    error: 'Não conseguimos concluir. Você não foi cobrado.',
    action: 'Seu banco precisa confirmar este pagamento. Continue na página segura.',
  },
  thankYou: {
    title: 'Obrigado{name}!',
    body: 'Seu pedido está confirmado. O recibo está a caminho do seu e-mail.',
    howTo: 'Como começar',
    steps: ['Tome uma dose toda manhã.', 'Misture em água, café ou vitamina.', 'Continue até completar o ciclo.'],
    vip: { title: 'Grupo VIP', body: 'Dicas, receitas e apoio de outros clientes.', cta: 'Entrar no grupo' },
    referral: {
      title: 'Indique para uma amiga ou amigo',
      body: 'Envie seu link. Quem você indicar ganha 10% com o cupom VITAL10.',
      copy: 'Copiar link',
      copied: 'Copiado!',
    },
    order: 'Resumo do pedido',
  },
  neutral: {
    intro: 'Responda 8 perguntas rápidas (cerca de 60 segundos) e receba seu plano para pele com aparência mais jovem e disposição no dia a dia.',
    painLibido: 'Pouca vitalidade',
    heroSub: 'Seu ritual diário: uma fórmula de colágeno + peptídeos para quem quer pele com aparência mais jovem e mais disposição, ajustada às suas respostas.',
    bullet: 'Sentir-se bem no próprio corpo começa com o autocuidado diário',
    pillar: { title: 'Vitalidade e confiança', body: 'Sentir-se bem no próprio corpo faz parte de sentir confiança. Um ritual diário de autocuidado para homens e mulheres, sem hormônios e sem estimulantes.' },
  },
  emails: {
    footer: 'Você está recebendo isto porque fez o quiz da VitalRise.',
    unsubscribe: 'Cancelar inscrição',
    diagnosis: {
      subject: '{name}, seu plano VitalRise',
      body: 'Este é o seu resultado: {diagnosis}\n\nSeu plano recomendado é {plan}. Veja aqui: {link}',
    },
    vsl: {
      subject: 'O vídeo de 2 minutos feito para o seu perfil',
      body: 'Preparamos um vídeo curto sobre o que suas respostas significam. Assista aqui: {link}',
    },
    sms: { body: 'VitalRise: 10% no seu plano com o cupom VITAL10 → {link} Responda SAIR para cancelar.' },
    socialProof: {
      subject: 'Por que as pessoas continuam',
      body: 'A maioria dos estudos sobre colágeno durou de 8 a 12 semanas. Por isso o Kit 3 de 90 dias é o plano mais escolhido. Seu plano: {link}',
    },
    lastChance: {
      subject: 'Seu cupom de 10% continua valendo',
      body: 'Seu cupom VITAL10 ainda está esperando por você. Use aqui: {link}',
    },
    story: {
      subject: 'Pequenos hábitos, grande diferença',
      body: 'A melhor rotina é a que você mantém. Uma dose por dia, todo dia. Quando quiser: {link}',
    },
  },
};
