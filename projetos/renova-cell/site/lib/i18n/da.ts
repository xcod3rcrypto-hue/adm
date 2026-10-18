import type { Dictionary } from './en';

export const da: Dictionary = {
  common: {
    brand: 'VitalRise',
    back: 'Tilbage',
    next: 'Næste',
    continue: 'Fortsæt',
    skip: 'Spring over',
    loading: 'Indlæser…',
    language: 'Sprog',
    resultsVary: 'Resultaterne varierer fra person til person.',
    fdaDisclaimer:
      'Disse udsagn er ikke blevet vurderet af den amerikanske Food and Drug Administration (FDA). Dette produkt er ikke beregnet til at diagnosticere, behandle, helbrede eller forebygge nogen sygdom.',
    euDisclaimer:
      'Kosttilskud bør ikke anvendes som erstatning for en varieret og afbalanceret kost og en sund livsstil. Den anbefalede daglige dosis må ikke overskrides. Opbevares utilgængeligt for små børn.',
  },
  consent: {
    text: 'Vi bruger cookies til statistik og måling af annoncer.',
    accept: 'Accepter',
    decline: 'Afvis',
  },
  quiz: {
    progress: '{pct} % færdig',
    intro: "Svar på 8 hurtige spørgsmål (ca. 60 sekunder) og få din plan for yngre udseende hud, mere lyst og energi i hverdagen.",
    questions: {
      gender: {
        title: 'Hvordan identificerer du dig?',
        options: { male: 'Mand', female: 'Kvinde', other: 'Vil helst ikke sige' },
      },
      age: {
        title: 'Hvor gammel er du?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: 'Hvad generer dig mest lige nu?',
        options: {
          skin: 'Huden mister fasthed',
          energy: 'Lav energi',
          libido: 'Lav lyst / vitalitet',
          joints: 'Stive eller ømme led',
          all: 'Lidt af det hele',
        },
      },
      duration: {
        title: 'Hvor længe har det generet dig?',
        options: { lt6m: 'Under 6 måneder', '6m-2y': '6 måneder – 2 år', '2y+': 'Over 2 år' },
      },
      history: {
        title: 'Har du taget kollagen før?',
        options: { never: 'Aldrig', tried: 'Ja, men så ingen resultater', using: 'Jeg tager kollagen nu' },
      },
      energy: { title: 'Hvordan er din energi i hverdagen?', min: 'Helt udkørt', max: 'Fuld af energi' },
      confidence: { title: 'Hvor godt tilpas føler du dig i din krop?', min: 'Slet ikke', max: 'Fuldstændig' },
      goal: {
        title: 'Hvad vil du helst mærke i løbet af de næste 15 dage?',
        options: {
          skin: 'Hud, der ser fastere ud',
          energy: 'Mere energi',
          libido: 'Mere vitalitet',
          joints: 'Bevæge mig lettere',
          all: 'Det hele',
        },
      },
    },
    contact: {
      title: 'Hvor skal vi sende din plan hen?',
      subtitle: 'Valgfrit – du kan se dit resultat med det samme uden at udfylde.',
      name: 'Fornavn',
      email: 'E-mail',
      phone: 'Mobil (valgfrit, til sms)',
      marketing: 'Send mig tips og tilbud på e-mail. Jeg kan til enhver tid afmelde mig.',
      sms: 'Send mig tilbud på sms til dette nummer. Der kan påløbe almindelige takster for sms og data. Svar STOP for at afmelde.',
      submit: 'Se mit resultat',
      skip: 'Spring over og se resultat',
      privacy: 'Vi sælger aldrig dine data.',
    },
  },
  analyzing: {
    title: 'Vi laver din plan',
    steps: ['Læser dine 8 svar…', 'Estimerer din kollagenprofil…', 'Skriver din personlige anbefaling…'],
  },
  offer: {
    trust: 'Analysen er færdig for {name} • Baseret på dine 8 svar',
    trustAnon: 'Analysen er færdig • Baseret på dine 8 svar',
    hero: {
      fallback: {
        woman: 'Hud, der ser fastere ud, og stabil energi starter med det, du giver din krop hver dag',
        man: 'Føl dig klar til dagen igen: dagligt kollagen til led, hud og stabil energi',
        senior: 'Efter 50 danner kroppen mindre kollagen. Din daglige rutine kan være med til at opveje det',
      },
      sub: "Dit daglige ungdomsritual: en formel med kollagen + peptider til dig, der vil have yngre udseende hud, mere lyst og mere energi, tilpasset dine svar.",
      cta: 'Se min anbefalede plan',
    },
    vsl: {
      title: 'Se: hvad dine svar betyder',
      unavailable: 'Videoen er ikke tilgængelig lige nu. Alt, hvad du har brug for, står nedenfor.',
      cta: 'Få min plan nu',
      resume: 'Fortsætter, hvor du slap',
    },
    diagnosis: {
      title: 'Dit kollagenestimat',
      body: 'Fra omkring 25-årsalderen danner kroppen ca. 1 % mindre kollagen hvert år. I din alder svarer det til omkring {pct} % mindre end ved 25.',
      note: 'Illustrativt estimat baseret på et ofte citeret gennemsnit – ikke en medicinsk måling.',
    },
    bullets: {
      title: 'Hvad det betyder for dig',
      items: {
        skin: [
          'Kollagenpeptider er i placebokontrollerede studier blevet forbundet med bedre hudelasticitet',
          'En enkel daglig portion, der passer ind i din morgen',
          'Udviklet til hud, der begynder at miste fasthed',
        ],
        energy: [
          'Proteinrig daglig portion, der støtter din rutine',
          'Ingen stimulanser – intet, der får dig til at gå ned senere',
          'Går hånd i hånd med søvn, vand og bevægelse for mere stabile dage',
        ],
        libido: [
          'At have det godt i sin egen krop er en del af at mærke lyst',
          'Et dagligt ritual for dig selv, der støtter selvtilliden',
          'Ingen hormoner og ingen stimulanser',
        ],
        joints: [
          'Kollagenhydrolysat er blevet undersøgt ved aktivitetsrelateret ubehag i leddene',
          'Støtte til den brusk og det bindevæv, du bruger hver dag',
          'Nemt at tage hver dag – og det er det, der tæller',
        ],
        all: [
          'Én daglig portion til hud, led og generelt velvære',
          'Kollagenpeptider plus en peptidblanding',
          'Bygget op omkring den rutine, du allerede har',
        ],
      },
    },
    pillars: {
      title: "Ét dagligt ritual, tre mål",
      items: [
        { title: "Yngre udseende hud", body: "Kollagenpeptider er blevet forbundet med bedre hudelasticitet og fugt i placebokontrollerede studier." },
        { title: "Lyst og vitalitet", body: "At have det godt i sin krop er en del af at føle lyst. Et dagligt ritual for egenomsorg for mænd og kvinder, uden hormoner og uden stimulanser." },
        { title: "Energi til din dag", body: "En proteinrig daglig portion, der passer ind i din morgen, uden stimulanser og uden dyk." },
      ],
      note: "Resultaterne varierer. VitalRise er et kosttilskud, ikke et lægemiddel.",
    },
    science: {
      title: 'Hvad forskningen siger',
      flip: 'Tryk for at se kilden',
      cards: [
        {
          title: 'Hudens elasticitet',
          finding:
            '69 kvinder tog 2,5 g eller 5 g specifikke kollagenpeptider eller placebo i 8 uger. Hudens elasticitet blev forbedret sammenlignet med placebo.',
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Komfort i leddene',
          finding:
            'Over 24 uger rapporterede idrætsudøvere, der tog 10 g/dag kollagenhydrolysat, færre aktivitetsrelaterede ledsmerter end placebogruppen.',
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'Det store billede',
          finding:
            'En metaanalyse af 26 randomiserede forsøg (1.721 deltagere) fandt forbedringer i hudens fugtighed og elasticitet sammenlignet med placebo.',
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'Studierne testede specifikke kollagenformler; resultaterne gælder ikke nødvendigvis for alle produkter, heller ikke dette.',
    },
    timeline: {
      title: 'Hvad du kan forvente',
      steps: [
        { day: 'Dag 1', title: 'Start dit ritual', body: 'Én portion om dagen. Det er regelmæssigheden, der tæller.' },
        { day: 'Dag 5', title: 'Gør det til en vane', body: 'Samme tid, samme sted. Vanen sætter sig.' },
        { day: 'Dag 15', title: 'Mærk efter', body: "Mærk efter, hvordan du har det, og hold fast i vanen." },
        { day: 'Dag 30', title: 'En måned inde', body: 'Bliv ved. Studierne målte ændringer i huden efter 4 til 12 uger.' },
        { day: 'Dag 90', title: 'En hel cyklus', body: 'Den periode, de fleste studier undersøgte. Tid til at sammenligne.' },
      ],
    },
    beforeAfter: {
      title: 'Rigtige kunder',
      before: 'Før',
      after: 'Efter',
      note: 'Uredigerede billeder delt med tilladelse. Resultaterne varierer.',
    },
    testimonials: {
      title: 'Folk som dig',
      note: 'Rigtige kunder, delt med tilladelse. Resultaterne varierer.',
    },
    simulator: {
      title: 'Din kollagenkurve',
      label: 'Din alder',
      yAxis: 'Estimeret kollagenniveau i forhold til 25-årsalderen (%)',
      you: 'Dig',
      note: 'Illustration af det ofte citerede fald på ca. 1 %/år efter 25. Ikke en forudsigelse af produktets resultater.',
    },
    comparison: {
      title: 'VitalRise vs. et typisk kollagen',
      us: 'VitalRise',
      them: 'Typisk kollagen',
      rows: [
        { label: 'Hydrolyserede kollagenpeptider', us: 'yes', them: 'yes' },
        { label: 'Tilsat peptidblanding', us: 'yes', them: 'no' },
        { label: 'Plan tilpasset dine quizsvar', us: 'yes', them: 'no' },
        { label: '30 dages pengene-tilbage-garanti', us: 'yes', them: 'varies' },
      ],
      varies: 'Varierer',
    },
    pricing: {
      perMonth: '/md.',
      once: "Engangskøb",
      subscribe: "Abonnement: få det igen, når det slipper op",
      interval: { m1: "hver måned", m3: "hver 3. måned", m6: "hver 6. måned" },
      title: 'Vælg din plan',
      recommended: 'Anbefalet til dig',
      perUnit: '{price} pr. pakke',
      save: 'Spar {pct} %',
      plans: {
        single: { name: '1 pakke', desc: 'Prøv det i en måned' },
        kit3: { name: 'Kit 3', desc: 'Den 90-dages cyklus, de fleste studier brugte' },
        kit6: { name: "Kit 6", desc: "Forsyning til 6 måneder" },
      },
      recurring: "Der trækkes {price} {interval}, indtil du opsiger. Opsig når som helst via kvitteringen i din e-mail.",
      cta: 'Vælg denne plan',
    },
    shipping: { free: 'Gratis fragt', fast: 'Levering inden for 2 hverdage', discreet: 'Diskret emballage', tracked: 'Levering med sporing' },
    bonus: {
      title: 'Følger med Kit 3 og Kit 6',
      items: ['E-bog: Kollagenrutinen', 'Madplan for 15 dage', 'VIP-kundegruppe'],
    },
    guarantee: {
      title: '30 dages pengene-tilbage-garanti',
      body: 'Prøv det i 30 dage. Er du ikke tilfreds, så skriv til os, og vi refunderer din ordre – uden spørgsmål.',
    },
    faq: {
      title: 'Spørgsmål og svar',
      items: {
        different: {
          q: 'Jeg har prøvet kollagen før uden at mærke noget. Hvorfor skulle det her være anderledes?',
          a: 'Mange stopper efter få uger. De fleste studier varede 8 til 12 uger med en daglig dosis, og derfor anbefaler vi 90-dages Kit 3. Og virker det ikke for dig, gælder 30-dages-garantien.',
        },
        time: {
          q: 'Hvor hurtigt ser jeg resultater?',
          a: 'Alle er forskellige. Forskningen målte ændringer i huden efter 4 til 12 ugers daglig brug. Giv det mindst én hel cyklus.',
        },
        safe: {
          q: 'Er det sikkert for mig?',
          a: 'Kollagen er et fødevareprotein, som generelt tåles godt. Hvis du er gravid, ammer, tager medicin eller har en sygdom, så tal med din læge først.',
        },
        men: {
          q: 'Er det også til mænd?',
          a: 'Ja. Kollagen støtter hud og led hos alle. Vi påstår ikke, at det ændrer hormonerne.',
        },
        how: {
          q: 'Hvordan tager jeg det?',
          a: 'Én portion om dagen, rørt ud i vand, kaffe eller en smoothie. Samme tidspunkt hver dag fungerer bedst.',
        },
        cancel: {
          q: "Hvordan opsiger jeg et abonnement?",
          a: 'Brug linket i en af dine kvitteringsmails, eller skriv til os. Du kan opsige når som helst, uden gebyrer.',
        },
        shipping: {
          q: 'Hvordan fungerer forsendelsen?',
          a: 'Fragten er gratis til alle lande, vi leverer til. Leveringen tager højst 2 hverdage, med sporing, i neutral, diskret emballage uden produktnavn udenpå. Sporingslinket sendes på e-mail, så snart ordren er afsendt.',
          aStandard: 'Fragten er gratis til alle lande, vi leverer til. Ordrer sendes med sporing, i neutral, diskret emballage uden produktnavn udenpå. Den forventede leveringstid til dit land vises ved betalingen, og sporingslinket sendes på e-mail, så snart ordren er afsendt.',
        },
      },
    },
    sticky: { cta: 'Få min plan' },
    exit: {
      title: 'Vent – 10 % rabat, før du går',
      body: 'Brug denne kode ved betalingen:',
      code: 'VITAL10',
      cta: 'Brug min rabat på 10 %',
      dismiss: 'Nej tak',
    },
    chat: {
      title: 'Spørg Elena',
      subtitle: 'AI-assistent · ikke læge',
      greeting: 'Hej! Jeg er Elena, AI-assistent hos VitalRise. Spørg mig om alt om produktet eller din plan.',
      placeholder: 'Skriv dit spørgsmål…',
      send: 'Send',
      error: 'Beklager, noget gik galt. Prøv igen.',
      open: 'Åbn chat',
      close: 'Luk chat',
    },
    social: { ordered: '{count} personer har bestilt inden for de sidste 24 timer' },
    footer: {
      privacy: 'Privatlivspolitik',
      terms: 'Vilkår',
      contact: 'Kontakt',
      rights: 'Alle rettigheder forbeholdes.',
    },
  },
  checkout: {
    steps: ['Kurv', 'Dine oplysninger', 'Betaling'],
    cart: {
      title: 'Din ordre',
      bumpTitle: '+1 ekstra pakke for {price}',
      bumpBody: 'Tilbydes kun på denne side: tilføj én pakke mere til en lavere pris.',
      coupon: 'Rabatkode',
      couponPlaceholder: 'Indtast kode',
      apply: 'Anvend',
      hint: 'Psst… prøv VITAL10',
      valid: 'Koden er anvendt: {pct} % rabat',
      invalid: 'Koden er ikke gyldig.',
      total: 'I alt',
      discountNote: 'Rabatten trækkes ved betalingen',
      shipping: 'Fragt',
      free: 'Gratis',
    },
    info: {
      title: 'Dine oplysninger',
      name: 'Fulde navn',
      email: 'E-mail',
      newsletter: 'Send mig anti-aging-tips på e-mail',
      addressNote: 'Du indtaster din leveringsadresse på den sikre betalingsside (med autoudfyldning).',
    },
    payment: {
      title: 'Betaling',
      body: 'Du gennemfører købet på Stripes sikre side. Kort, Apple Pay, Google Pay og andre betalingsmetoder vises der, når de er tilgængelige i dit land.',
      installments: 'Mulighed for afbetaling vises ved betalingen, når den er tilgængelig.',
      pay: 'Betal sikkert',
      redirecting: 'Åbner sikker betaling…',
      error: 'Vi kunne ikke starte betalingen. Prøv igen.',
      ssl: 'SSL-krypteret',
      guarantee: '30 dages garanti',
      stripe: 'Betaling via Stripe',
    },
  },
  upsell1: {
    title: 'Din ordre er bekræftet. Én ting mere…',
    body: 'Tilføj et Kit 6 (engangskøb) med 45 % rabat – til 6-måneders-rutinen. Tilbuddet findes kun på denne side.',
    accept: 'Ja, tilføj Kit 6 for {price}',
    decline: 'Nej tak',
    charge: 'Der trækkes {price} på dit gemte kort én gang. Intet abonnement.',
  },
  upsell2: {
    title: 'Løb aldrig tør – og betal 30 % mindre',
    body: "Få Kit 3 leveret hver 3. måned for {price} i stedet for {full}. Rabatten gælder, så længe du abonnerer.",
    accept: "Ja, abonnér for {price} hver 3. måned",
    decline: 'Nej tak',
    charge: "Dit gemte kort trækkes {price} i dag og hver 3. måned, indtil du opsiger. Opsig når som helst.",
  },
  upsell: {
    processing: 'Behandler…',
    error: 'Vi kunne ikke gennemføre det. Du er ikke blevet opkrævet.',
    action: 'Din bank skal bekræfte betalingen. Fortsæt på den sikre side.',
  },
  thankYou: {
    title: 'Tak{name}!',
    body: 'Din ordre er bekræftet. Der er en kvittering på vej til din e-mail.',
    howTo: 'Sådan kommer du i gang',
    steps: ['Tag én portion hver morgen.', 'Rør den ud i vand, kaffe eller en smoothie.', 'Fortsæt hele cyklussen ud.'],
    vip: { title: 'VIP-gruppe', body: 'Tips, opskrifter og støtte fra andre kunder.', cta: 'Bliv medlem af gruppen' },
    referral: {
      title: 'Del med en ven',
      body: 'Send dit link. Din ven får 10 % rabat med koden VITAL10.',
      copy: 'Kopiér link',
      copied: 'Kopieret!',
    },
    order: 'Ordreoversigt',
  },
  neutral: {
    intro: 'Svar på 8 hurtige spørgsmål (ca. 60 sekunder) og få din plan for yngre udseende hud og energi i hverdagen.',
    painLibido: 'Lav vitalitet',
    heroSub: 'Dit daglige ritual: en formel med kollagen + peptider til dig, der vil have yngre udseende hud og mere energi, tilpasset dine svar.',
    bullet: 'At have det godt i sin krop begynder med daglig egenomsorg',
    pillar: { title: 'Vitalitet og selvtillid', body: 'At have det godt i sin krop er en del af at føle selvtillid. Et dagligt ritual for egenomsorg for mænd og kvinder, uden hormoner og uden stimulanser.' },
  },
  emails: {
    footer: 'Du modtager denne mail, fordi du har taget VitalRise-quizzen.',
    unsubscribe: 'Afmeld',
    diagnosis: {
      subject: '{name}, din VitalRise-plan',
      body: 'Her er dit resultat: {diagnosis}\n\nDin anbefalede plan er {plan}. Se den her: {link}',
    },
    vsl: {
      subject: 'Videoen på 2 minutter, lavet til din profil',
      body: 'Vi har lavet en kort video om, hvad dine svar betyder. Se den her: {link}',
    },
    sms: { body: 'VitalRise: 10 % rabat på din plan med koden VITAL10 → {link} Svar STOP for at afmelde.' },
    socialProof: {
      subject: 'Derfor bliver folk ved',
      body: 'De fleste studier af kollagen varede 8 til 12 uger. Derfor er 90-dages Kit 3 vores mest valgte plan. Din plan: {link}',
    },
    lastChance: {
      subject: 'Din rabatkode på 10 % venter stadig',
      body: 'Din kode VITAL10 venter stadig. Brug den her: {link}',
    },
    story: {
      subject: 'Små vaner, stor forskel',
      body: 'Den bedste rutine er den, du holder fast i. Én portion om dagen, hver dag. Når du er klar: {link}',
    },
  },
};
