/**
 * English dictionary — the source of truth for the shape of every other locale.
 * Copy rules (all locales): no disease or hormone claims, no guaranteed timelines,
 * and nothing presented as data unless it comes from a real source.
 */
export const en = {
  common: {
    brand: 'RENOVA CELL',
    back: 'Back',
    next: 'Next',
    continue: 'Continue',
    skip: 'Skip',
    loading: 'Loading…',
    language: 'Language',
    resultsVary: 'Individual results vary.',
    fdaDisclaimer:
      'These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.',
    euDisclaimer:
      'Food supplements are not a substitute for a varied and balanced diet and a healthy lifestyle. Do not exceed the recommended daily dose. Keep out of reach of young children.',
  },
  consent: {
    text: 'We use cookies for analytics and ad measurement.',
    accept: 'Accept',
    decline: 'Decline',
  },
  quiz: {
    progress: '{pct}% complete',
    intro: "Answer 8 quick questions (about 60 seconds) and get your plan for younger-looking skin, desire and everyday energy.",
    questions: {
      gender: {
        title: 'How do you identify?',
        options: { male: 'Man', female: 'Woman', other: 'Prefer not to say' },
      },
      age: {
        title: 'How old are you?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: 'What bothers you most right now?',
        options: {
          skin: 'Skin losing firmness',
          energy: 'Low energy',
          libido: 'Low desire / vitality',
          joints: 'Stiff or achy joints',
          all: 'A bit of everything',
        },
      },
      duration: {
        title: 'How long has this been bothering you?',
        options: { lt6m: 'Less than 6 months', '6m-2y': '6 months – 2 years', '2y+': 'More than 2 years' },
      },
      history: {
        title: 'Have you taken collagen before?',
        options: { never: 'Never', tried: 'Yes, but saw no results', using: "I'm taking one now" },
      },
      energy: { title: 'How is your daily energy?', min: 'Exhausted', max: 'Full of energy' },
      confidence: { title: 'How confident do you feel in your body?', min: 'Not at all', max: 'Totally' },
      goal: {
        title: 'What would you most like to feel in the next 15 days?',
        options: {
          skin: 'Firmer-looking skin',
          energy: 'More energy',
          libido: 'More vitality',
          joints: 'Easier movement',
          all: 'All of it',
        },
      },
    },
    contact: {
      title: 'Where should we send your plan?',
      subtitle: 'Optional — you can see your result right away without it.',
      name: 'First name',
      email: 'Email',
      phone: 'Mobile (optional, for SMS)',
      marketing: 'Send me tips and offers by email. I can unsubscribe anytime.',
      sms: 'Text me offers at this number. Msg & data rates may apply. Reply STOP to cancel.',
      submit: 'See my result',
      skip: 'Skip and see my result',
      privacy: 'We never sell your data.',
    },
  },
  analyzing: {
    title: 'Building your plan',
    steps: ['Reading your 8 answers…', 'Estimating your collagen profile…', 'Writing your personalized recommendation…'],
  },
  offer: {
    trust: 'Analysis complete for {name} • Based on your 8 answers',
    trustAnon: 'Analysis complete • Based on your 8 answers',
    hero: {
      fallback: {
        woman: 'Firmer-looking skin and steady energy start with what you give your body every day',
        man: 'Feel ready for the day again: daily collagen for joints, skin and steady energy',
        senior: 'After 50 your body makes less collagen. Your daily routine can make up for it',
      },
      sub: "Your daily youth ritual: a collagen + peptide formula for people who want younger-looking skin, more desire and more energy, matched to your answers.",
      cta: 'See my recommended plan',
    },
    vsl: {
      title: 'Watch: what your answers mean',
      unavailable: 'The video is not available right now. Everything you need is below.',
      cta: 'Get my plan now',
      resume: 'Resuming where you left off',
    },
    diagnosis: {
      title: 'Your collagen estimate',
      body: 'From around age 25, the body makes roughly 1% less collagen each year. At your age, that adds up to about {pct}% less than at 25.',
      note: 'Illustrative estimate based on a commonly cited average, not a medical measurement.',
    },
    bullets: {
      title: 'What this means for you',
      items: {
        skin: [
          'Collagen peptides were linked to better skin elasticity in placebo-controlled studies',
          'A simple daily serving that fits into your morning',
          'Designed for skin that is starting to lose firmness',
        ],
        energy: [
          'Protein-rich daily serving to support your routine',
          'No stimulants — nothing that makes you crash later',
          'Pairs with sleep, water and movement for steadier days',
        ],
        libido: [
          'Feeling good in your skin is part of feeling desire',
          'A daily self-care ritual that supports confidence',
          'No hormones and no stimulants',
        ],
        joints: [
          'Collagen hydrolysate was studied for activity-related joint discomfort',
          'Support for the cartilage and connective tissue you use every day',
          'Easy to take every day, which is what matters',
        ],
        all: [
          'One daily serving for skin, joints and overall well-being',
          'Collagen peptides plus a peptide blend',
          'Built around the routine you already have',
        ],
      },
    },
    pillars: {
      title: "One daily ritual, three goals",
      items: [
        { title: "Younger-looking skin", body: "Collagen peptides were linked to better skin elasticity and hydration in placebo-controlled studies." },
        { title: "Desire & vitality", body: "Feeling good in your body is part of feeling desire. A daily self-care ritual for men and women, with no hormones and no stimulants." },
        { title: "Energy for your day", body: "A protein-rich daily serving that fits into your morning, with no stimulants and no crash." },
      ],
      note: "Results vary. RENOVA CELL is a food supplement, not a medicine.",
    },
    science: {
      title: 'What research says',
      flip: 'Tap to see the source',
      cards: [
        {
          title: 'Skin elasticity',
          finding:
            '69 women took 2.5 g or 5 g of specific collagen peptides or placebo for 8 weeks. Skin elasticity improved versus placebo.',
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Joint comfort',
          finding:
            'Over 24 weeks, athletes taking 10 g/day of collagen hydrolysate reported less activity-related joint pain than placebo.',
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'The bigger picture',
          finding:
            'A meta-analysis of 26 randomized trials (1,721 participants) found improvements in skin hydration and elasticity versus placebo.',
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'Studies tested specific collagen formulas; results may not apply to every product, including this one.',
    },
    timeline: {
      title: 'What to expect',
      steps: [
        { day: 'Day 1', title: 'Start your ritual', body: 'One serving a day. Consistency is what counts.' },
        { day: 'Day 5', title: 'Make it automatic', body: 'Same time, same place. The habit takes hold.' },
        { day: 'Day 15', title: 'Check in', body: "Notice how you feel and keep the habit going." },
        { day: 'Day 30', title: 'One month in', body: 'Keep going. Studies measured skin changes from 4 to 12 weeks.' },
        { day: 'Day 90', title: 'Full cycle', body: 'The period most research looked at. Time to compare.' },
      ],
    },
    beforeAfter: {
      title: 'Real customers',
      before: 'Before',
      after: 'After',
      note: 'Unedited photos shared with permission. Results vary.',
    },
    testimonials: {
      title: 'People like you',
      note: 'Real customers, shared with permission. Results vary.',
    },
    simulator: {
      title: 'Your collagen curve',
      label: 'Your age',
      yAxis: 'Estimated collagen vs. age 25 (%)',
      you: 'You',
      note: 'Illustration of the commonly cited ~1%/year decline after 25. Not a prediction of product results.',
    },
    comparison: {
      title: 'RENOVA CELL vs. a typical collagen',
      us: 'RENOVA CELL',
      them: 'Typical collagen',
      rows: [
        { label: 'Hydrolyzed collagen peptides', us: 'yes', them: 'yes' },
        { label: 'Added peptide blend', us: 'yes', them: 'no' },
        { label: 'Plan matched to your quiz', us: 'yes', them: 'no' },
        { label: '30-day money-back guarantee', us: 'yes', them: 'varies' },
      ],
      varies: 'Varies',
    },
    pricing: {
      perMonth: '/mo',
      once: "One-time purchase",
      subscribe: "Subscribe: get it again when it runs out",
      interval: { m1: "every month", m3: "every 3 months", m6: "every 6 months" },
      title: 'Choose your plan',
      recommended: 'Recommended for you',
      perUnit: '{price} per unit',
      save: 'Save {pct}%',
      plans: {
        single: { name: '1 unit', desc: 'Try it for one month' },
        kit3: { name: 'Kit 3', desc: 'The 90-day cycle most studies used' },
        kit6: { name: "Kit 6", desc: "A 6-month supply" },
      },
      recurring: "Billed {price} {interval} until you cancel. Cancel anytime from your email receipt.",
      cta: 'Choose this plan',
    },
    shipping: { free: 'Free shipping', fast: 'Delivery in up to 2 business days', discreet: 'Discreet packaging' },
    bonus: {
      title: 'Included with Kit 3 and Kit 6',
      items: ['E-book: The Collagen Routine', '15-day meal plan', 'VIP customer group'],
    },
    guarantee: {
      title: '30-day money-back guarantee',
      body: "Try it for 30 days. If you're not happy, email us and we'll refund your order — no questions asked.",
    },
    faq: {
      title: 'Questions',
      items: {
        different: {
          q: 'I tried collagen before and saw nothing. Why would this be different?',
          a: 'Many people stop within a few weeks. Most studies ran 8 to 12 weeks with a daily dose, which is why we recommend the 90-day Kit 3. And if it does not work for you, the 30-day guarantee applies.',
        },
        time: {
          q: 'How fast will I see results?',
          a: 'Everyone is different. Research measured skin changes after 4 to 12 weeks of daily use. Give it at least one full cycle.',
        },
        safe: {
          q: 'Is it safe for me?',
          a: 'Collagen is a food protein that is generally well tolerated. If you are pregnant, nursing, taking medication or have a medical condition, talk to your doctor first.',
        },
        men: {
          q: 'Is it for men too?',
          a: 'Yes. Collagen supports skin and joints in everyone. We do not claim it changes hormones.',
        },
        how: {
          q: 'How do I take it?',
          a: 'One serving a day, mixed into water, coffee or a smoothie. Same time every day works best.',
        },
        cancel: {
          q: "How do I cancel a subscription?",
          a: 'Use the link in any receipt email or write to us. You can cancel anytime, with no fees.',
        },
        shipping: {
          q: 'How does shipping work?',
          a: 'Shipping is free to every country we deliver to. Delivery takes up to 2 business days, with tracking, in plain, discreet packaging with no product name on the outside. The tracking link is sent by email as soon as the order ships.',
        },
      },
    },
    sticky: { cta: 'Get my plan' },
    exit: {
      title: 'Wait — 10% off before you go',
      body: 'Use this code at checkout:',
      code: 'RENOVA10',
      cta: 'Use my 10% off',
      dismiss: 'No thanks',
    },
    chat: {
      title: 'Ask Elena',
      subtitle: 'AI assistant · not a doctor',
      greeting: "Hi! I'm Elena, RENOVA CELL's AI assistant. Ask me anything about the product or your plan.",
      placeholder: 'Type your question…',
      send: 'Send',
      error: 'Sorry, something went wrong. Please try again.',
      open: 'Open chat',
      close: 'Close chat',
    },
    social: { ordered: '{count} people ordered in the last 24 hours' },
    footer: {
      privacy: 'Privacy',
      terms: 'Terms',
      contact: 'Contact',
      rights: 'All rights reserved.',
    },
  },
  checkout: {
    steps: ['Cart', 'Your details', 'Payment'],
    cart: {
      title: 'Your order',
      bumpTitle: '+1 extra unit for {price}',
      bumpBody: 'Only offered on this page: add one more unit at a lower price.',
      coupon: 'Discount code',
      couponPlaceholder: 'Enter code',
      apply: 'Apply',
      hint: 'Psst… try RENOVA10',
      valid: 'Code applied: {pct}% off',
      invalid: 'This code is not valid.',
      total: 'Total',
      discountNote: 'Discount applied at payment',
      shipping: 'Shipping',
      free: 'Free',
    },
    info: {
      title: 'Your details',
      name: 'Full name',
      email: 'Email',
      newsletter: 'Send me anti-aging tips by email',
      addressNote: 'You will enter your shipping address on the secure payment page (with autocomplete).',
    },
    payment: {
      title: 'Payment',
      body: 'You will finish on Stripe’s secure page. Card, Apple Pay, Google Pay and other methods appear there when available in your country.',
      installments: 'Pay-in-installments options appear at payment when available.',
      pay: 'Pay securely',
      redirecting: 'Opening secure payment…',
      error: 'We could not start the payment. Please try again.',
      ssl: 'SSL encrypted',
      guarantee: '30-day guarantee',
      stripe: 'Payments by Stripe',
    },
  },
  upsell1: {
    title: 'Your order is confirmed. One more thing…',
    body: 'Add a Kit 6 (one-time) at 45% off — for the 6-month routine. This offer is only on this page.',
    accept: 'Yes, add Kit 6 for {price}',
    decline: 'No thanks',
    charge: 'Your saved card will be charged {price} once. No subscription.',
  },
  upsell2: {
    title: 'Never run out — and pay 30% less',
    body: "Get Kit 3 delivered every 3 months at {price} instead of {full}. The discount lasts as long as you stay subscribed.",
    accept: "Yes, subscribe for {price} every 3 months",
    decline: 'No thanks',
    charge: "Your saved card will be charged {price} today and every 3 months until you cancel. Cancel anytime.",
  },
  upsell: {
    processing: 'Processing…',
    error: 'We could not complete this. You were not charged.',
    action: 'Your bank needs to confirm this payment. Continue on the secure page.',
  },
  thankYou: {
    title: 'Thank you{name}!',
    body: 'Your order is confirmed. A receipt is on its way to your email.',
    howTo: 'How to start',
    steps: ['Take one serving every morning.', 'Mix in water, coffee or a smoothie.', 'Keep going for the full cycle.'],
    vip: { title: 'VIP group', body: 'Tips, recipes and support from other customers.', cta: 'Join the group' },
    referral: {
      title: 'Share with a friend',
      body: 'Send your link. Your friend gets 10% off with code RENOVA10.',
      copy: 'Copy link',
      copied: 'Copied!',
    },
    order: 'Order summary',
  },
  emails: {
    footer: 'You are receiving this because you took the RENOVA CELL quiz.',
    unsubscribe: 'Unsubscribe',
    diagnosis: {
      subject: '{name}, your RENOVA CELL plan',
      body: 'Here is your result: {diagnosis}\n\nYour recommended plan is {plan}. See it here: {link}',
    },
    vsl: {
      subject: 'The 2-minute video made for your profile',
      body: 'We put together a short video about what your answers mean. Watch it here: {link}',
    },
    sms: { body: 'RENOVA CELL: 10% off your plan with code RENOVA10 → {link} Reply STOP to opt out.' },
    socialProof: {
      subject: 'Why people stick with it',
      body: 'Most studies on collagen ran 8 to 12 weeks. That is why the 90-day Kit 3 is our most chosen plan. Your plan: {link}',
    },
    lastChance: {
      subject: 'Your 10% off code is still waiting',
      body: 'Your code RENOVA10 is still waiting. Use it here: {link}',
    },
    story: {
      subject: 'Small habits, big difference',
      body: 'The best routine is the one you keep. One serving a day, every day. When you are ready: {link}',
    },
  },
};

export type Dictionary = typeof en;
