import type { Dictionary } from './en';

export const nb: Dictionary = {
  common: {
    brand: 'RENOVA CELL',
    back: 'Tilbake',
    next: 'Neste',
    continue: 'Fortsett',
    skip: 'Hopp over',
    loading: 'Laster…',
    language: 'Språk',
    resultsVary: 'Resultatene varierer fra person til person.',
    fdaDisclaimer:
      'Disse påstandene er ikke vurdert av amerikanske Food and Drug Administration (FDA). Dette produktet er ikke ment å diagnostisere, behandle, kurere eller forebygge noen sykdom.',
    euDisclaimer:
      'Kosttilskudd skal ikke erstatte et variert og balansert kosthold og en sunn livsstil. Anbefalt daglig dose må ikke overskrides. Oppbevares utilgjengelig for små barn.',
  },
  consent: {
    text: 'Vi bruker informasjonskapsler til analyse og annonsemåling.',
    accept: 'Godta',
    decline: 'Avslå',
  },
  quiz: {
    progress: '{pct} % fullført',
    intro: "Svar på 8 raske spørsmål (ca. 60 sekunder) og få planen din for yngre utseende hud, mer lyst og energi i hverdagen.",
    questions: {
      gender: {
        title: 'Hvordan identifiserer du deg?',
        options: { male: 'Mann', female: 'Kvinne', other: 'Vil helst ikke si' },
      },
      age: {
        title: 'Hvor gammel er du?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: 'Hva plager deg mest akkurat nå?',
        options: {
          skin: 'Huden mister fasthet',
          energy: 'Lite energi',
          libido: 'Lite lyst / vitalitet',
          joints: 'Stive eller ømme ledd',
          all: 'Litt av alt',
        },
      },
      duration: {
        title: 'Hvor lenge har det plaget deg?',
        options: { lt6m: 'Under 6 måneder', '6m-2y': '6 måneder – 2 år', '2y+': 'Over 2 år' },
      },
      history: {
        title: 'Har du tatt kollagen før?',
        options: { never: 'Aldri', tried: 'Ja, men så ingen resultater', using: 'Jeg tar kollagen nå' },
      },
      energy: { title: 'Hvordan er energien din i hverdagen?', min: 'Helt utslitt', max: 'Full av energi' },
      confidence: { title: 'Hvor trygg føler du deg i kroppen din?', min: 'Ikke i det hele tatt', max: 'Helt og holdent' },
      goal: {
        title: 'Hva vil du helst kjenne de neste 15 dagene?',
        options: {
          skin: 'Hud som ser fastere ut',
          energy: 'Mer energi',
          libido: 'Mer vitalitet',
          joints: 'Bevege meg lettere',
          all: 'Alt sammen',
        },
      },
    },
    contact: {
      title: 'Hvor skal vi sende planen din?',
      subtitle: 'Valgfritt – du kan se resultatet ditt med en gang uten å fylle ut dette.',
      name: 'Fornavn',
      email: 'E-post',
      phone: 'Mobil (valgfritt, for SMS)',
      marketing: 'Send meg tips og tilbud på e-post. Jeg kan melde meg av når som helst.',
      sms: 'Send meg tilbud på SMS til dette nummeret. Vanlige kostnader for SMS og data kan påløpe. Svar STOP for å avslutte.',
      submit: 'Se resultatet mitt',
      skip: 'Hopp over og se resultatet',
      privacy: 'Vi selger aldri opplysningene dine.',
    },
  },
  analyzing: {
    title: 'Vi lager planen din',
    steps: ['Leser de 8 svarene dine…', 'Anslår kollagenprofilen din…', 'Skriver din personlige anbefaling…'],
  },
  offer: {
    trust: 'Analysen er klar for {name} • Basert på de 8 svarene dine',
    trustAnon: 'Analysen er klar • Basert på de 8 svarene dine',
    hero: {
      fallback: {
        woman: 'Hud som ser fastere ut og jevn energi starter med det du gir kroppen din hver dag',
        man: 'Føl deg klar for dagen igjen: daglig kollagen for ledd, hud og jevn energi',
        senior: 'Etter 50 lager kroppen mindre kollagen. Den daglige rutinen din kan veie opp for det',
      },
      sub: "Ditt daglige ungdomsritual: en formel med kollagen + peptider for deg som vil ha yngre utseende hud, mer lyst og mer energi, tilpasset svarene dine.",
      cta: 'Se min anbefalte plan',
    },
    vsl: {
      title: 'Se: hva svarene dine betyr',
      unavailable: 'Videoen er ikke tilgjengelig akkurat nå. Alt du trenger, finner du nedenfor.',
      cta: 'Få planen min nå',
      resume: 'Fortsetter der du slapp',
    },
    diagnosis: {
      title: 'Ditt kollagenanslag',
      body: 'Fra rundt 25-årsalderen lager kroppen omtrent 1 % mindre kollagen hvert år. I din alder blir det rundt {pct} % mindre enn da du var 25.',
      note: 'Illustrerende anslag basert på et ofte sitert gjennomsnitt, ikke en medisinsk måling.',
    },
    bullets: {
      title: 'Hva dette betyr for deg',
      items: {
        skin: [
          'Kollagenpeptider har i placebokontrollerte studier blitt knyttet til bedre hudelastisitet',
          'En enkel daglig porsjon som passer inn i morgenen din',
          'Laget for hud som begynner å miste fasthet',
        ],
        energy: [
          'Proteinrik daglig porsjon som støtter rutinen din',
          'Ingen stimulanter – ingenting som får deg til å kollapse senere',
          'Passer sammen med søvn, vann og bevegelse for jevnere dager',
        ],
        libido: [
          'Å trives i egen kropp er en del av å kjenne lyst',
          'Et daglig egenomsorgsritual som støtter selvtilliten',
          'Ingen hormoner og ingen stimulanter',
        ],
        joints: [
          'Kollagenhydrolysat er studert ved aktivitetsrelatert ubehag i leddene',
          'Støtte til brusken og bindevevet du bruker hver dag',
          'Lett å ta hver dag – og det er det som teller',
        ],
        all: [
          'Én daglig porsjon for hud, ledd og generelt velvære',
          'Kollagenpeptider pluss en peptidblanding',
          'Bygget rundt rutinen du allerede har',
        ],
      },
    },
    pillars: {
      title: "Ett daglig ritual, tre mål",
      items: [
        { title: "Yngre utseende hud", body: "Kollagenpeptider har blitt knyttet til bedre hudelastisitet og fuktighet i placebokontrollerte studier." },
        { title: "Lyst og vitalitet", body: "Å ha det godt i kroppen er en del av å kjenne lyst. Et daglig ritual for egenomsorg for menn og kvinner, uten hormoner og uten sentralstimulerende stoffer." },
        { title: "Energi til dagen", body: "En proteinrik daglig porsjon som passer inn i morgenen din, uten sentralstimulerende stoffer og uten dupp." },
      ],
      note: "Resultatene varierer. RENOVA CELL er et kosttilskudd, ikke et legemiddel.",
    },
    science: {
      title: 'Hva forskningen sier',
      flip: 'Trykk for å se kilden',
      cards: [
        {
          title: 'Hudens elastisitet',
          finding:
            '69 kvinner tok 2,5 g eller 5 g spesifikke kollagenpeptider eller placebo i 8 uker. Hudens elastisitet ble bedre sammenlignet med placebo.',
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Komfort i leddene',
          finding:
            'Over 24 uker rapporterte idrettsutøvere som tok 10 g/dag kollagenhydrolysat, mindre aktivitetsrelaterte leddsmerter enn placebogruppen.',
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'Det store bildet',
          finding:
            'En metaanalyse av 26 randomiserte studier (1 721 deltakere) fant forbedringer i hudens fuktighet og elastisitet sammenlignet med placebo.',
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'Studiene testet spesifikke kollagenformler; resultatene gjelder ikke nødvendigvis for alle produkter, heller ikke dette.',
    },
    timeline: {
      title: 'Hva du kan forvente',
      steps: [
        { day: 'Dag 1', title: 'Start ritualet ditt', body: 'Én porsjon om dagen. Det er regelmessigheten som teller.' },
        { day: 'Dag 5', title: 'Gjør det til en vane', body: 'Samme tid, samme sted. Vanen setter seg.' },
        { day: 'Dag 15', title: 'Kjenn etter', body: "Kjenn etter hvordan du har det, og hold fast ved vanen." },
        { day: 'Dag 30', title: 'En måned inne', body: 'Fortsett. Studier målte endringer i huden etter 4 til 12 uker.' },
        { day: 'Dag 90', title: 'En hel syklus', body: 'Perioden de fleste studiene så på. Tid for å sammenligne.' },
      ],
    },
    beforeAfter: {
      title: 'Ekte kunder',
      before: 'Før',
      after: 'Etter',
      note: 'Uredigerte bilder delt med tillatelse. Resultatene varierer.',
    },
    testimonials: {
      title: 'Folk som deg',
      note: 'Ekte kunder, delt med tillatelse. Resultatene varierer.',
    },
    simulator: {
      title: 'Kollagenkurven din',
      label: 'Alderen din',
      yAxis: 'Anslått kollagennivå sammenlignet med 25-årsalderen (%)',
      you: 'Deg',
      note: 'Illustrasjon av den ofte siterte nedgangen på ~1 %/år etter 25. Ikke en forutsigelse av produktets resultater.',
    },
    comparison: {
      title: 'RENOVA CELL vs. et vanlig kollagen',
      us: 'RENOVA CELL',
      them: 'Vanlig kollagen',
      rows: [
        { label: 'Hydrolyserte kollagenpeptider', us: 'yes', them: 'yes' },
        { label: 'Tilsatt peptidblanding', us: 'yes', them: 'no' },
        { label: 'Plan tilpasset quizsvarene dine', us: 'yes', them: 'no' },
        { label: '30 dagers pengene-tilbake-garanti', us: 'yes', them: 'varies' },
      ],
      varies: 'Varierer',
    },
    pricing: {
      perMonth: '/mnd',
      once: "Engangskjøp",
      subscribe: "Abonnement: få det igjen når det tar slutt",
      interval: { m1: "hver måned", m3: "hver 3. måned", m6: "hver 6. måned" },
      title: 'Velg planen din',
      recommended: 'Anbefalt for deg',
      perUnit: '{price} per pakke',
      save: 'Spar {pct} %',
      plans: {
        single: { name: '1 pakke', desc: 'Prøv i én måned' },
        kit3: { name: 'Kit 3', desc: 'Syklusen på 90 dager som de fleste studier brukte' },
        kit6: { name: "Kit 6", desc: "Forsyning for 6 måneder" },
      },
      recurring: "Det trekkes {price} {interval} til du sier opp. Si opp når som helst via kvitteringen i e-posten din.",
      cta: 'Velg denne planen',
    },
    shipping: { free: 'Gratis frakt', fast: 'Levering innen 2 virkedager', discreet: 'Diskret emballasje' },
    bonus: {
      title: 'Inkludert i Kit 3 og Kit 6',
      items: ['E-bok: Kollagenrutinen', 'Måltidsplan for 15 dager', 'VIP-kundegruppe'],
    },
    guarantee: {
      title: '30 dagers pengene-tilbake-garanti',
      body: 'Prøv i 30 dager. Er du ikke fornøyd, sender du oss en e-post, så refunderer vi bestillingen din – uten spørsmål.',
    },
    faq: {
      title: 'Spørsmål og svar',
      items: {
        different: {
          q: 'Jeg har prøvd kollagen før uten å merke noe. Hvorfor skulle dette være annerledes?',
          a: 'Mange slutter etter noen få uker. De fleste studier varte i 8 til 12 uker med en daglig dose, og derfor anbefaler vi 90-dagers Kit 3. Og hvis det ikke fungerer for deg, gjelder 30-dagersgarantien.',
        },
        time: {
          q: 'Hvor raskt ser jeg resultater?',
          a: 'Alle er forskjellige. Forskningen målte endringer i huden etter 4 til 12 ukers daglig bruk. Gi det minst én hel syklus.',
        },
        safe: {
          q: 'Er det trygt for meg?',
          a: 'Kollagen er et matprotein som generelt tåles godt. Hvis du er gravid, ammer, bruker medisiner eller har en sykdom, snakk med legen din først.',
        },
        men: {
          q: 'Er det for menn også?',
          a: 'Ja. Kollagen støtter hud og ledd hos alle. Vi påstår ikke at det endrer hormoner.',
        },
        how: {
          q: 'Hvordan tar jeg det?',
          a: 'Én porsjon om dagen, rørt ut i vann, kaffe eller en smoothie. Samme tid hver dag fungerer best.',
        },
        cancel: {
          q: "Hvordan sier jeg opp et abonnement?",
          a: 'Bruk lenken i en hvilken som helst kvitteringsmail, eller skriv til oss. Du kan si opp når som helst, uten gebyrer.',
        },
        shipping: {
          q: 'Hvordan fungerer frakten?',
          a: 'Frakten er gratis til alle land vi leverer til. Leveringen tar maks 2 virkedager, med sporing, i nøytral, diskret emballasje uten produktnavn utenpå. Sporingslenken sendes på e-post så snart bestillingen er sendt.',
        },
      },
    },
    sticky: { cta: 'Få planen min' },
    exit: {
      title: 'Vent – 10 % rabatt før du går',
      body: 'Bruk denne koden i kassen:',
      code: 'RENOVA10',
      cta: 'Bruk rabatten på 10 %',
      dismiss: 'Nei takk',
    },
    chat: {
      title: 'Spør Elena',
      subtitle: 'AI-assistent · ikke lege',
      greeting: 'Hei! Jeg er Elena, AI-assistenten til RENOVA CELL. Spør meg om hva som helst om produktet eller planen din.',
      placeholder: 'Skriv spørsmålet ditt…',
      send: 'Send',
      error: 'Beklager, noe gikk galt. Prøv igjen.',
      open: 'Åpne chatten',
      close: 'Lukk chatten',
    },
    social: { ordered: '{count} personer har bestilt de siste 24 timene' },
    footer: {
      privacy: 'Personvern',
      terms: 'Vilkår',
      contact: 'Kontakt',
      rights: 'Alle rettigheter forbeholdt.',
    },
  },
  checkout: {
    steps: ['Handlekurv', 'Dine opplysninger', 'Betaling'],
    cart: {
      title: 'Bestillingen din',
      bumpTitle: '+1 ekstra pakke for {price}',
      bumpBody: 'Tilbys bare på denne siden: legg til én pakke ekstra til lavere pris.',
      coupon: 'Rabattkode',
      couponPlaceholder: 'Skriv inn kode',
      apply: 'Bruk',
      hint: 'Psst… prøv RENOVA10',
      valid: 'Koden er brukt: {pct} % rabatt',
      invalid: 'Denne koden er ikke gyldig.',
      total: 'Totalt',
      discountNote: 'Rabatten trekkes fra ved betaling',
      shipping: 'Frakt',
      free: 'Gratis',
    },
    info: {
      title: 'Dine opplysninger',
      name: 'Fullt navn',
      email: 'E-post',
      newsletter: 'Send meg anti-aging-tips på e-post',
      addressNote: 'Du fyller inn leveringsadressen på den sikre betalingssiden (med autoutfylling).',
    },
    payment: {
      title: 'Betaling',
      body: 'Du fullfører på Stripes sikre side. Kort, Apple Pay, Google Pay og andre betalingsmåter vises der når de er tilgjengelige i landet ditt.',
      installments: 'Mulighet for delbetaling vises ved betaling når det er tilgjengelig.',
      pay: 'Betal trygt',
      redirecting: 'Åpner sikker betaling…',
      error: 'Vi kunne ikke starte betalingen. Prøv igjen.',
      ssl: 'SSL-kryptert',
      guarantee: '30 dagers garanti',
      stripe: 'Betaling via Stripe',
    },
  },
  upsell1: {
    title: 'Bestillingen din er bekreftet. Én ting til…',
    body: 'Legg til et Kit 6 (engangskjøp) med 45 % rabatt – for 6-månedersrutinen. Tilbudet finnes bare på denne siden.',
    accept: 'Ja, legg til Kit 6 for {price}',
    decline: 'Nei takk',
    charge: 'Det lagrede kortet ditt belastes {price} én gang. Ingen abonnement.',
  },
  upsell2: {
    title: 'Gå aldri tom – og betal 30 % mindre',
    body: "Få Kit 3 levert hver 3. måned for {price} i stedet for {full}. Rabatten gjelder så lenge du abonnerer.",
    accept: "Ja, abonner for {price} hver 3. måned",
    decline: 'Nei takk',
    charge: "Det lagrede kortet ditt trekkes {price} i dag og hver 3. måned til du sier opp. Si opp når som helst.",
  },
  upsell: {
    processing: 'Behandler…',
    error: 'Vi kunne ikke fullføre dette. Du har ikke blitt belastet.',
    action: 'Banken din må bekrefte denne betalingen. Fortsett på den sikre siden.',
  },
  thankYou: {
    title: 'Takk{name}!',
    body: 'Bestillingen din er bekreftet. En kvittering er på vei til e-posten din.',
    howTo: 'Slik kommer du i gang',
    steps: ['Ta én porsjon hver morgen.', 'Rør den ut i vann, kaffe eller en smoothie.', 'Fortsett hele syklusen ut.'],
    vip: { title: 'VIP-gruppe', body: 'Tips, oppskrifter og støtte fra andre kunder.', cta: 'Bli med i gruppen' },
    referral: {
      title: 'Del med en venn',
      body: 'Send lenken din. Vennen din får 10 % rabatt med koden RENOVA10.',
      copy: 'Kopier lenke',
      copied: 'Kopiert!',
    },
    order: 'Ordresammendrag',
  },
  emails: {
    footer: 'Du får denne e-posten fordi du tok RENOVA CELL-quizen.',
    unsubscribe: 'Meld deg av',
    diagnosis: {
      subject: '{name}, din RENOVA CELL-plan',
      body: 'Her er resultatet ditt: {diagnosis}\n\nDin anbefalte plan er {plan}. Se den her: {link}',
    },
    vsl: {
      subject: 'Videoen på 2 minutter laget for profilen din',
      body: 'Vi har laget en kort video om hva svarene dine betyr. Se den her: {link}',
    },
    sms: { body: 'RENOVA CELL: 10 % rabatt på planen din med koden RENOVA10 → {link} Svar STOP for å melde deg av.' },
    socialProof: {
      subject: 'Derfor fortsetter folk',
      body: 'De fleste studier på kollagen varte i 8 til 12 uker. Derfor er 90-dagers Kit 3 vår mest valgte plan. Planen din: {link}',
    },
    lastChance: {
      subject: 'Rabattkoden din på 10 % venter fortsatt',
      body: 'Koden din RENOVA10 venter fortsatt. Bruk den her: {link}',
    },
    story: {
      subject: 'Små vaner, stor forskjell',
      body: 'Den beste rutinen er den du holder fast ved. Én porsjon om dagen, hver dag. Når du er klar: {link}',
    },
  },
};
