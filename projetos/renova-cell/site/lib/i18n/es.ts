import type { Dictionary } from './en';

export const es: Dictionary = {
  common: {
    brand: 'VitalRise',
    back: 'Atrás',
    next: 'Siguiente',
    continue: 'Continuar',
    skip: 'Omitir',
    loading: 'Cargando…',
    language: 'Idioma',
    resultsVary: 'Los resultados varían según la persona.',
    fdaDisclaimer:
      'Estas declaraciones no han sido evaluadas por la FDA. Este producto no está destinado a diagnosticar, tratar, curar ni prevenir ninguna enfermedad.',
    euDisclaimer:
      'Los complementos alimenticios no deben utilizarse como sustituto de una dieta variada y equilibrada y de un estilo de vida saludable. No superar la dosis diaria recomendada. Mantener fuera del alcance de los niños.',
  },
  consent: {
    text: 'Usamos cookies para analítica y medición de anuncios.',
    accept: 'Aceptar',
    decline: 'Rechazar',
  },
  quiz: {
    progress: '{pct}% completado',
    intro: "Responde 8 preguntas rápidas (unos 60 segundos) y recibe tu plan para una piel de aspecto más joven, más deseo y energía en tu día a día.",
    questions: {
      gender: {
        title: '¿Cómo te identificas?',
        options: { male: 'Hombre', female: 'Mujer', other: 'Prefiero no decirlo' },
      },
      age: {
        title: '¿Cuántos años tienes?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: '¿Qué es lo que más te molesta ahora?',
        options: {
          skin: 'Piel que pierde firmeza',
          energy: 'Poca energía',
          libido: 'Poco deseo / vitalidad',
          joints: 'Articulaciones rígidas o doloridas',
          all: 'Un poco de todo',
        },
      },
      duration: {
        title: '¿Desde hace cuánto te molesta?',
        options: { lt6m: 'Menos de 6 meses', '6m-2y': '6 meses a 2 años', '2y+': 'Más de 2 años' },
      },
      history: {
        title: '¿Has tomado colágeno antes?',
        options: { never: 'Nunca', tried: 'Sí, pero sin resultados', using: 'Lo estoy tomando ahora' },
      },
      energy: { title: '¿Cómo está tu energía diaria?', min: 'Agotada', max: 'Llena de energía' },
      confidence: { title: '¿Cuánta confianza sientes en tu cuerpo?', min: 'Nada', max: 'Totalmente' },
      goal: {
        title: '¿Qué te gustaría sentir en los próximos 15 días?',
        options: {
          skin: 'Piel de aspecto más firme',
          energy: 'Más energía',
          libido: 'Más vitalidad',
          joints: 'Moverme con más facilidad',
          all: 'Todo',
        },
      },
    },
    contact: {
      title: '¿Adónde te enviamos tu plan?',
      subtitle: 'Opcional: puedes ver tu resultado ahora mismo sin rellenarlo.',
      name: 'Nombre',
      email: 'Correo electrónico',
      phone: 'Móvil (opcional, para SMS)',
      marketing: 'Envíame consejos y ofertas por correo. Puedo darme de baja cuando quiera.',
      sms: 'Envíame ofertas por SMS a este número. Responde STOP para cancelar.',
      submit: 'Ver mi resultado',
      skip: 'Omitir y ver mi resultado',
      privacy: 'Nunca vendemos tus datos.',
    },
  },
  analyzing: {
    title: 'Preparando tu plan',
    steps: ['Leyendo tus 8 respuestas…', 'Estimando tu perfil de colágeno…', 'Escribiendo tu recomendación personalizada…'],
  },
  offer: {
    trust: 'Análisis completo para {name} • Basado en tus 8 respuestas',
    trustAnon: 'Análisis completo • Basado en tus 8 respuestas',
    hero: {
      fallback: {
        woman: 'Una piel de aspecto más firme y energía estable empiezan por lo que le das a tu cuerpo cada día',
        man: 'Vuelve a sentirte listo para el día: colágeno diario para articulaciones, piel y energía',
        senior: 'Después de los 50 el cuerpo produce menos colágeno. Tu rutina diaria puede compensarlo',
      },
      sub: "Tu ritual diario de juventud: una fórmula de colágeno + péptidos para quienes quieren una piel de aspecto más joven, más deseo y más energía, ajustada a tus respuestas.",
      cta: 'Ver mi plan recomendado',
    },
    vsl: {
      title: 'Mira: lo que significan tus respuestas',
      unavailable: 'El vídeo no está disponible ahora. Todo lo que necesitas está abajo.',
      cta: 'Quiero mi plan ahora',
      resume: 'Continuando donde lo dejaste',
    },
    diagnosis: {
      title: 'Tu estimación de colágeno',
      body: 'A partir de los 25 años, el cuerpo produce alrededor de un 1% menos de colágeno cada año. A tu edad, eso suma cerca de un {pct}% menos que a los 25.',
      note: 'Estimación ilustrativa basada en un promedio muy citado, no una medición médica.',
    },
    bullets: {
      title: 'Qué significa para ti',
      items: {
        skin: [
          'Los péptidos de colágeno se asociaron con más elasticidad de la piel en estudios con placebo',
          'Una dosis diaria sencilla que cabe en tu mañana',
          'Pensado para la piel que empieza a perder firmeza',
        ],
        energy: [
          'Dosis diaria rica en proteína para apoyar tu rutina',
          'Sin estimulantes: nada de bajones después',
          'Combina con sueño, agua y movimiento para días más estables',
        ],
        libido: [
          'Sentirte bien en tu piel es parte de sentir deseo',
          'Un ritual diario de autocuidado que refuerza la confianza',
          'Sin hormonas y sin estimulantes',
        ],
        joints: [
          'El colágeno hidrolizado se estudió para molestias articulares relacionadas con la actividad',
          'Apoyo para el cartílago y el tejido conectivo que usas cada día',
          'Fácil de tomar a diario, que es lo que importa',
        ],
        all: [
          'Una dosis diaria para piel, articulaciones y bienestar',
          'Péptidos de colágeno + mezcla de péptidos',
          'Pensado para la rutina que ya tienes',
        ],
      },
    },
    pillars: {
      title: "Un ritual diario, tres objetivos",
      items: [
        { title: "Piel de aspecto más joven", body: "Los péptidos de colágeno se asociaron con más elasticidad e hidratación de la piel en estudios con placebo." },
        { title: "Deseo y vitalidad", body: "Sentirte bien en tu cuerpo es parte de sentir deseo. Un ritual diario de autocuidado para hombres y mujeres, sin hormonas y sin estimulantes." },
        { title: "Energía para tu día", body: "Una dosis diaria rica en proteína que cabe en tu mañana, sin estimulantes y sin bajones." },
      ],
      note: "Los resultados varían. VitalRise es un complemento alimenticio, no un medicamento.",
    },
    science: {
      title: 'Lo que dice la investigación',
      flip: 'Toca para ver la fuente',
      cards: [
        {
          title: 'Elasticidad de la piel',
          finding:
            '69 mujeres tomaron 2,5 g o 5 g de péptidos de colágeno específicos o placebo durante 8 semanas. La elasticidad de la piel mejoró frente al placebo.',
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Comodidad articular',
          finding:
            'Durante 24 semanas, deportistas que tomaron 10 g/día de colágeno hidrolizado refirieron menos dolor articular relacionado con la actividad que con placebo.',
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'La visión general',
          finding:
            'Un metaanálisis de 26 ensayos aleatorizados (1.721 participantes) encontró mejoras en la hidratación y elasticidad de la piel frente al placebo.',
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'Los estudios probaron fórmulas de colágeno específicas; los resultados pueden no aplicarse a todos los productos, incluido este.',
    },
    timeline: {
      title: 'Qué esperar',
      steps: [
        { day: 'Día 1', title: 'Empieza tu ritual', body: 'Una dosis al día. Lo que cuenta es la constancia.' },
        { day: 'Día 5', title: 'Hazlo automático', body: 'Misma hora, mismo lugar. El hábito se afianza.' },
        { day: 'Día 15', title: 'Haz balance', body: "Observa cómo te sientes y mantén el hábito." },
        { day: 'Día 30', title: 'Un mes', body: 'Sigue. Los estudios midieron cambios en la piel entre 4 y 12 semanas.' },
        { day: 'Día 90', title: 'Ciclo completo', body: 'El periodo que analizó la mayoría de los estudios. Hora de comparar.' },
      ],
    },
    beforeAfter: {
      title: 'Clientes reales',
      before: 'Antes',
      after: 'Después',
      note: 'Fotos sin editar, compartidas con permiso. Los resultados varían.',
    },
    testimonials: {
      title: 'Personas como tú',
      note: 'Clientes reales, compartido con permiso. Los resultados varían.',
    },
    simulator: {
      title: 'Tu curva de colágeno',
      label: 'Tu edad',
      yAxis: 'Colágeno estimado vs. a los 25 (%)',
      you: 'Tú',
      note: 'Ilustración de la caída de ~1% al año después de los 25, muy citada. No es una predicción del resultado del producto.',
    },
    comparison: {
      title: 'VitalRise vs. un colágeno típico',
      us: 'VitalRise',
      them: 'Colágeno típico',
      rows: [
        { label: 'Péptidos de colágeno hidrolizado', us: 'yes', them: 'yes' },
        { label: 'Mezcla de péptidos añadida', us: 'yes', them: 'no' },
        { label: 'Plan ajustado a tu quiz', us: 'yes', them: 'no' },
        { label: 'Garantía de devolución de 30 días', us: 'yes', them: 'varies' },
      ],
      varies: 'Depende',
    },
    pricing: {
      perMonth: '/mes',
      once: "Compra única",
      subscribe: "Suscripción: recíbelo de nuevo cuando se acabe",
      interval: { m1: "cada mes", m3: "cada 3 meses", m6: "cada 6 meses" },
      title: 'Elige tu plan',
      recommended: 'Recomendado para ti',
      perUnit: '{price} por unidad',
      save: 'Ahorra {pct}%',
      plans: {
        single: { name: '1 unidad', desc: 'Pruébalo durante un mes' },
        kit3: { name: 'Kit 3', desc: 'El ciclo de 90 días de la mayoría de los estudios' },
        kit6: { name: "Kit 6", desc: "Para 6 meses" },
      },
      recurring: "Se cobra {price} {interval} hasta que canceles. Cancela cuando quieras desde el recibo por correo.",
      cta: 'Elegir este plan',
    },
    shipping: { free: 'Envío gratis', fast: 'Entrega en máximo 2 días hábiles', discreet: 'Embalaje discreto', tracked: 'Entrega con seguimiento' },
    bonus: {
      title: 'Incluido con el Kit 3 y el Kit 6',
      items: ['E-book: La rutina del colágeno', 'Plan de comidas de 15 días', 'Grupo VIP de clientes'],
    },
    guarantee: {
      title: 'Garantía de devolución de 30 días',
      body: 'Pruébalo 30 días. Si no estás conforme, escríbenos y te devolvemos el dinero, sin preguntas.',
    },
    faq: {
      title: 'Preguntas',
      items: {
        different: {
          q: 'Ya tomé colágeno y no noté nada. ¿Por qué sería distinto?',
          a: 'Mucha gente lo deja a las pocas semanas. La mayoría de los estudios duraron de 8 a 12 semanas con dosis diaria; por eso recomendamos el Kit 3 de 90 días. Y si no te funciona, tienes la garantía de 30 días.',
        },
        time: {
          q: '¿En cuánto tiempo veré resultados?',
          a: 'Cada persona es distinta. Las investigaciones midieron cambios en la piel tras 4 a 12 semanas de uso diario. Haz al menos un ciclo completo.',
        },
        safe: {
          q: '¿Es seguro para mí?',
          a: 'El colágeno es una proteína alimentaria que suele tolerarse bien. Si estás embarazada, en lactancia, tomas medicación o tienes alguna condición médica, consulta antes a tu médico.',
        },
        men: {
          q: '¿Es también para hombres?',
          a: 'Sí. El colágeno apoya la piel y las articulaciones de todas las personas. No afirmamos que cambie las hormonas.',
        },
        how: {
          q: '¿Cómo lo tomo?',
          a: 'Una dosis al día, mezclada con agua, café o un batido. Mejor siempre a la misma hora.',
        },
        cancel: {
          q: "¿Cómo cancelo una suscripción?",
          a: 'Usa el enlace de cualquier recibo por correo o escríbenos. Cancela cuando quieras, sin cargos.',
        },
        shipping: {
          q: '¿Cómo funciona el envío?',
          a: 'El envío es gratis a todos los países a los que enviamos. La entrega tarda como máximo 2 días hábiles, con seguimiento, en un embalaje sencillo y discreto, sin el nombre del producto por fuera. El enlace de seguimiento se envía por email en cuanto sale el pedido.',
          aStandard: 'El envío es gratis a todos los países a los que enviamos. Los pedidos salen con seguimiento, en un embalaje sencillo y discreto, sin el nombre del producto por fuera. El plazo estimado para tu país aparece en el pago, y el enlace de seguimiento se envía por email en cuanto sale el pedido.',
        },
      },
    },
    sticky: { cta: 'Quiero mi plan' },
    exit: {
      title: 'Espera: 10% de descuento antes de irte',
      body: 'Usa este código al pagar:',
      code: 'VITAL10',
      cta: 'Usar mi 10% de descuento',
      dismiss: 'No, gracias',
    },
    chat: {
      title: 'Pregunta a Elena',
      subtitle: 'Asistente de IA · no es médica',
      greeting: '¡Hola! Soy Elena, la asistente de IA de VitalRise. Pregúntame lo que quieras sobre el producto o tu plan.',
      placeholder: 'Escribe tu pregunta…',
      send: 'Enviar',
      error: 'Lo siento, algo salió mal. Inténtalo de nuevo.',
      open: 'Abrir chat',
      close: 'Cerrar chat',
    },
    social: { ordered: '{count} personas hicieron un pedido en las últimas 24 horas' },
    footer: {
      privacy: 'Privacidad',
      terms: 'Términos',
      contact: 'Contacto',
      rights: 'Todos los derechos reservados.',
    },
  },
  checkout: {
    steps: ['Carrito', 'Tus datos', 'Pago'],
    cart: {
      title: 'Tu pedido',
      bumpTitle: '+1 unidad extra por {price}',
      bumpBody: 'Solo en esta página: añade una unidad más a un precio menor.',
      coupon: 'Código de descuento',
      couponPlaceholder: 'Introduce el código',
      apply: 'Aplicar',
      hint: 'Psst… prueba VITAL10',
      valid: 'Código aplicado: {pct}% de descuento',
      invalid: 'Este código no es válido.',
      total: 'Total',
      discountNote: 'Descuento aplicado al pagar',
      shipping: 'Envío',
      free: 'Gratis',
    },
    info: {
      title: 'Tus datos',
      name: 'Nombre completo',
      email: 'Correo electrónico',
      newsletter: 'Envíame consejos antiedad por correo',
      addressNote: 'Introducirás tu dirección de envío en la página de pago segura (con autocompletado).',
    },
    payment: {
      title: 'Pago',
      body: 'Terminarás en la página segura de Stripe. Tarjeta, Apple Pay, Google Pay y otros métodos aparecen allí si están disponibles en tu país.',
      installments: 'Las opciones de pago a plazos aparecen al pagar cuando están disponibles.',
      pay: 'Pagar de forma segura',
      redirecting: 'Abriendo el pago seguro…',
      error: 'No pudimos iniciar el pago. Inténtalo de nuevo.',
      ssl: 'Cifrado SSL',
      guarantee: 'Garantía de 30 días',
      stripe: 'Pagos con Stripe',
    },
  },
  upsell1: {
    title: 'Tu pedido está confirmado. Una cosa más…',
    body: 'Añade un Kit 6 (pago único) con un 45% de descuento, para la rutina de 6 meses. Oferta solo en esta página.',
    accept: 'Sí, añadir el Kit 6 por {price}',
    decline: 'No, gracias',
    charge: 'Se cobrará {price} una sola vez a tu tarjeta guardada. No es una suscripción.',
  },
  upsell2: {
    title: 'Que nunca te falte, y paga un 30% menos',
    body: "Recibe el Kit 3 cada 3 meses por {price} en lugar de {full}. El descuento dura mientras sigas suscrito.",
    accept: "Sí, suscribirme por {price} cada 3 meses",
    decline: 'No, gracias',
    charge: "Se cobrará {price} hoy y cada 3 meses a tu tarjeta guardada hasta que canceles. Cancela cuando quieras.",
  },
  upsell: {
    processing: 'Procesando…',
    error: 'No pudimos completarlo. No se te ha cobrado.',
    action: 'Tu banco necesita confirmar este pago. Continúa en la página segura.',
  },
  thankYou: {
    title: '¡Gracias{name}!',
    body: 'Tu pedido está confirmado. El recibo va de camino a tu correo.',
    howTo: 'Cómo empezar',
    steps: ['Toma una dosis cada mañana.', 'Mézclala con agua, café o un batido.', 'Sigue hasta completar el ciclo.'],
    vip: { title: 'Grupo VIP', body: 'Consejos, recetas y apoyo de otros clientes.', cta: 'Unirme al grupo' },
    referral: {
      title: 'Compártelo',
      body: 'Envía tu enlace. Quien lo use obtiene un 10% con el código VITAL10.',
      copy: 'Copiar enlace',
      copied: '¡Copiado!',
    },
    order: 'Resumen del pedido',
  },
  neutral: {
    intro: 'Responde 8 preguntas rápidas (unos 60 segundos) y recibe tu plan para una piel de aspecto más joven y energía en tu día a día.',
    painLibido: 'Poca vitalidad',
    heroSub: 'Tu ritual diario: una fórmula de colágeno + péptidos para quienes quieren una piel de aspecto más joven y más energía, ajustada a tus respuestas.',
    bullet: 'Sentirte bien en tu cuerpo empieza con el autocuidado diario',
    pillar: { title: 'Vitalidad y confianza', body: 'Sentirte bien en tu cuerpo es parte de sentirte seguro. Un ritual diario de autocuidado para hombres y mujeres, sin hormonas y sin estimulantes.' },
  },
  emails: {
    footer: 'Recibes esto porque hiciste el quiz de VitalRise.',
    unsubscribe: 'Darme de baja',
    diagnosis: {
      subject: '{name}, tu plan VitalRise',
      body: 'Este es tu resultado: {diagnosis}\n\nTu plan recomendado es {plan}. Míralo aquí: {link}',
    },
    vsl: {
      subject: 'El vídeo de 2 minutos hecho para tu perfil',
      body: 'Preparamos un vídeo corto sobre lo que significan tus respuestas. Míralo aquí: {link}',
    },
    sms: { body: 'VitalRise: 10% en tu plan con el código VITAL10 → {link} Responde STOP para darte de baja.' },
    socialProof: {
      subject: 'Por qué la gente sigue',
      body: 'La mayoría de los estudios sobre colágeno duraron de 8 a 12 semanas. Por eso el Kit 3 de 90 días es el plan más elegido. Tu plan: {link}',
    },
    lastChance: {
      subject: 'Tu código del 10% sigue disponible',
      body: 'Tu código VITAL10 sigue esperándote. Úsalo aquí: {link}',
    },
    story: {
      subject: 'Pequeños hábitos, gran diferencia',
      body: 'La mejor rutina es la que mantienes. Una dosis al día, cada día. Cuando quieras: {link}',
    },
  },
};
