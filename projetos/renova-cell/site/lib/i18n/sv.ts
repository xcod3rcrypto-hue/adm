import type { Dictionary } from './en';

export const sv: Dictionary = {
  common: {
    brand: 'VitalRise',
    back: 'Tillbaka',
    next: 'Nästa',
    continue: 'Fortsätt',
    skip: 'Hoppa över',
    loading: 'Laddar…',
    language: 'Språk',
    resultsVary: 'Resultaten varierar från person till person.',
    fdaDisclaimer:
      'Dessa påståenden har inte utvärderats av amerikanska Food and Drug Administration (FDA). Produkten är inte avsedd att diagnostisera, behandla, bota eller förebygga någon sjukdom.',
    euDisclaimer:
      'Kosttillskott ska inte användas som ersättning för en varierad och balanserad kost och en hälsosam livsstil. Överskrid inte rekommenderad daglig dos. Förvaras utom räckhåll för små barn.',
  },
  consent: {
    text: 'Vi använder cookies för analys och annonsmätning.',
    accept: 'Godkänn',
    decline: 'Avböj',
  },
  quiz: {
    progress: '{pct} % klart',
    intro: "Svara på 8 snabba frågor (ungefär 60 sekunder) och få din plan för yngre utseende hud, mer lust och energi i vardagen.",
    questions: {
      gender: {
        title: 'Hur identifierar du dig?',
        options: { male: 'Man', female: 'Kvinna', other: 'Vill helst inte säga' },
      },
      age: {
        title: 'Hur gammal är du?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: 'Vad besvärar dig mest just nu?',
        options: {
          skin: 'Huden tappar fasthet',
          energy: 'Låg energi',
          libido: 'Låg lust / vitalitet',
          joints: 'Stela eller ömma leder',
          all: 'Lite av varje',
        },
      },
      duration: {
        title: 'Hur länge har det besvärat dig?',
        options: { lt6m: 'Mindre än 6 månader', '6m-2y': '6 månader – 2 år', '2y+': 'Mer än 2 år' },
      },
      history: {
        title: 'Har du tagit kollagen tidigare?',
        options: { never: 'Aldrig', tried: 'Ja, men såg inget resultat', using: 'Jag tar kollagen nu' },
      },
      energy: { title: 'Hur är din energi i vardagen?', min: 'Helt slut', max: 'Full av energi' },
      confidence: { title: 'Hur trygg känner du dig i din kropp?', min: 'Inte alls', max: 'Helt och hållet' },
      goal: {
        title: 'Vad vill du helst känna de närmaste 15 dagarna?',
        options: {
          skin: 'Hud som ser fastare ut',
          energy: 'Mer energi',
          libido: 'Mer vitalitet',
          joints: 'Röra mig lättare',
          all: 'Allt det här',
        },
      },
    },
    contact: {
      title: 'Vart ska vi skicka din plan?',
      subtitle: 'Valfritt – du kan se ditt resultat direkt utan att fylla i.',
      name: 'Förnamn',
      email: 'E-post',
      phone: 'Mobil (valfritt, för sms)',
      marketing: 'Skicka tips och erbjudanden till min e-post. Jag kan avregistrera mig när som helst.',
      sms: 'Skicka erbjudanden via sms till det här numret. Vanliga avgifter för sms och data kan tillkomma. Svara STOP för att avsluta.',
      submit: 'Se mitt resultat',
      skip: 'Hoppa över och se resultatet',
      privacy: 'Vi säljer aldrig dina uppgifter.',
    },
  },
  analyzing: {
    title: 'Vi tar fram din plan',
    steps: ['Läser dina 8 svar…', 'Uppskattar din kollagenprofil…', 'Skriver din personliga rekommendation…'],
  },
  offer: {
    trust: 'Analys klar för {name} • Baserad på dina 8 svar',
    trustAnon: 'Analys klar • Baserad på dina 8 svar',
    hero: {
      fallback: {
        woman: 'Hud som ser fastare ut och jämn energi börjar med det du ger din kropp varje dag',
        man: 'Känn dig redo för dagen igen: dagligt kollagen för leder, hud och jämn energi',
        senior: 'Efter 50 bildar kroppen mindre kollagen. Din dagliga rutin kan väga upp för det',
      },
      sub: "Din dagliga ungdomsritual: en formula med kollagen + peptider för dig som vill ha yngre utseende hud, mer lust och mer energi, anpassad efter dina svar.",
      cta: 'Se min rekommenderade plan',
    },
    vsl: {
      title: 'Se: vad dina svar betyder',
      unavailable: 'Videon är inte tillgänglig just nu. Allt du behöver finns här nedanför.',
      cta: 'Få min plan nu',
      resume: 'Fortsätter där du slutade',
    },
    diagnosis: {
      title: 'Din kollagenuppskattning',
      body: 'Från ungefär 25 års ålder bildar kroppen cirka 1 % mindre kollagen per år. I din ålder blir det ungefär {pct} % mindre än vid 25.',
      note: 'Illustrativ uppskattning baserad på ett ofta citerat genomsnitt, inte en medicinsk mätning.',
    },
    bullets: {
      title: 'Vad det betyder för dig',
      items: {
        skin: [
          'Kollagenpeptider har kopplats till bättre hudelasticitet i placebokontrollerade studier',
          'En enkel daglig portion som passar in i din morgon',
          'Utformad för hud som börjar tappa fasthet',
        ],
        energy: [
          'Proteinrik daglig portion som stöttar din rutin',
          'Inga stimulantia – inget som får dig att krascha senare',
          'Fungerar ihop med sömn, vatten och rörelse för jämnare dagar',
        ],
        libido: [
          'Att trivas i sin kropp är en del av att känna lust',
          'En daglig egenvårdsritual som stöttar självförtroendet',
          'Inga hormoner och inga stimulantia',
        ],
        joints: [
          'Kollagenhydrolysat har studerats vid aktivitetsrelaterat obehag i lederna',
          'Stöd för brosket och bindväven du använder varje dag',
          'Lätt att ta varje dag – och det är det som räknas',
        ],
        all: [
          'En daglig portion för hud, leder och allmänt välbefinnande',
          'Kollagenpeptider plus en peptidblandning',
          'Byggd kring den rutin du redan har',
        ],
      },
    },
    pillars: {
      title: "En daglig ritual, tre mål",
      items: [
        { title: "Yngre utseende hud", body: "Kollagenpeptider har kopplats till bättre hudelasticitet och fuktighet i placebokontrollerade studier." },
        { title: "Lust och vitalitet", body: "Att må bra i sin kropp är en del av att känna lust. En daglig ritual för egenvård för män och kvinnor, utan hormoner och utan stimulantia." },
        { title: "Energi för dagen", body: "En proteinrik daglig portion som passar in i din morgon, utan stimulantia och utan dipp." },
      ],
      note: "Resultaten varierar. VitalRise är ett kosttillskott, inte ett läkemedel.",
    },
    science: {
      title: 'Vad forskningen säger',
      flip: 'Tryck för att se källan',
      cards: [
        {
          title: 'Hudens elasticitet',
          finding:
            '69 kvinnor tog 2,5 g eller 5 g av specifika kollagenpeptider eller placebo i 8 veckor. Hudens elasticitet förbättrades jämfört med placebo.',
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Ledkomfort',
          finding:
            'Under 24 veckor rapporterade idrottare som tog 10 g/dag kollagenhydrolysat mindre aktivitetsrelaterad ledsmärta än de som fick placebo.',
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'Helhetsbilden',
          finding:
            'En metaanalys av 26 randomiserade studier (1 721 deltagare) visade förbättrad fuktighet och elasticitet i huden jämfört med placebo.',
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'Studierna testade specifika kollagenformler; resultaten gäller inte nödvändigtvis alla produkter, inklusive den här.',
    },
    timeline: {
      title: 'Vad du kan förvänta dig',
      steps: [
        { day: 'Dag 1', title: 'Starta din ritual', body: 'En portion om dagen. Det är regelbundenheten som räknas.' },
        { day: 'Dag 5', title: 'Gör det till en vana', body: 'Samma tid, samma plats. Vanan sätter sig.' },
        { day: 'Dag 15', title: 'Stäm av', body: "Märk hur du mår och håll fast vid vanan." },
        { day: 'Dag 30', title: 'En månad avklarad', body: 'Fortsätt. Studier mätte hudförändringar efter 4 till 12 veckor.' },
        { day: 'Dag 90', title: 'En hel cykel', body: 'Perioden som de flesta studier undersökte. Dags att jämföra.' },
      ],
    },
    beforeAfter: {
      title: 'Riktiga kunder',
      before: 'Före',
      after: 'Efter',
      note: 'Oredigerade bilder som delats med tillstånd. Resultaten varierar.',
    },
    testimonials: {
      title: 'Människor som du',
      note: 'Riktiga kunder, delat med tillstånd. Resultaten varierar.',
    },
    simulator: {
      title: 'Din kollagenkurva',
      label: 'Din ålder',
      yAxis: 'Uppskattad kollagennivå jämfört med 25 års ålder (%)',
      you: 'Du',
      note: 'Illustration av den ofta citerade minskningen på ~1 %/år efter 25. Ingen förutsägelse av produktens resultat.',
    },
    comparison: {
      title: 'VitalRise jämfört med vanligt kollagen',
      us: 'VitalRise',
      them: 'Vanligt kollagen',
      rows: [
        { label: 'Hydrolyserade kollagenpeptider', us: 'yes', them: 'yes' },
        { label: 'Tillsatt peptidblandning', us: 'yes', them: 'no' },
        { label: 'Plan anpassad efter dina quizsvar', us: 'yes', them: 'no' },
        { label: '30 dagars pengarna tillbaka-garanti', us: 'yes', them: 'varies' },
      ],
      varies: 'Varierar',
    },
    pricing: {
      perMonth: '/mån',
      once: "Engångsköp",
      subscribe: "Prenumeration: få det igen när det tar slut",
      interval: { m1: "varje månad", m3: "var 3:e månad", m6: "var 6:e månad" },
      title: 'Välj din plan',
      recommended: 'Rekommenderas för dig',
      perUnit: '{price} per förpackning',
      save: 'Spara {pct} %',
      plans: {
        single: { name: '1 förpackning', desc: 'Testa i en månad' },
        kit3: { name: 'Kit 3', desc: 'Den 90-dagarscykel som de flesta studier använde' },
        kit6: { name: "Kit 6", desc: "Förråd för 6 månader" },
      },
      recurring: "Debiteras {price} {interval} tills du säger upp. Säg upp när som helst via kvittot i din e-post.",
      cta: 'Välj den här planen',
    },
    shipping: { free: 'Fri frakt', fast: 'Leverans inom 2 arbetsdagar', discreet: 'Diskret förpackning', tracked: 'Leverans med spårning' },
    bonus: {
      title: 'Ingår i Kit 3 och Kit 6',
      items: ['E-bok: Kollagenrutinen', 'Måltidsplan för 15 dagar', 'VIP-grupp för kunder'],
    },
    guarantee: {
      title: '30 dagars pengarna tillbaka-garanti',
      body: 'Testa i 30 dagar. Är du inte nöjd mejlar du oss, så återbetalar vi din beställning – inga frågor.',
    },
    faq: {
      title: 'Frågor och svar',
      items: {
        different: {
          q: 'Jag har testat kollagen förut utan att märka något. Varför skulle det här vara annorlunda?',
          a: 'Många slutar efter några veckor. De flesta studier pågick i 8 till 12 veckor med en daglig dos, och därför rekommenderar vi 90-dagars Kit 3. Och om det inte fungerar för dig gäller 30-dagarsgarantin.',
        },
        time: {
          q: 'Hur snabbt ser jag resultat?',
          a: 'Alla är olika. Forskningen mätte hudförändringar efter 4 till 12 veckors daglig användning. Ge det minst en hel cykel.',
        },
        safe: {
          q: 'Är det säkert för mig?',
          a: 'Kollagen är ett livsmedelsprotein som i regel tolereras väl. Om du är gravid, ammar, tar läkemedel eller har någon sjukdom, prata med din läkare först.',
        },
        men: {
          q: 'Passar det män också?',
          a: 'Ja. Kollagen stöttar hud och leder hos alla. Vi påstår inte att det påverkar hormonerna.',
        },
        how: {
          q: 'Hur tar jag det?',
          a: 'En portion om dagen, blandad i vatten, kaffe eller en smoothie. Samma tid varje dag fungerar bäst.',
        },
        cancel: {
          q: "Hur säger jag upp en prenumeration?",
          a: 'Använd länken i något av dina kvittomejl eller skriv till oss. Du kan säga upp när som helst, utan avgifter.',
        },
        shipping: {
          q: 'Hur fungerar frakten?',
          a: 'Frakten är gratis till alla länder vi levererar till. Leveransen tar högst 2 arbetsdagar, med spårning, i en neutral, diskret förpackning utan produktnamn på utsidan. Spårningslänken skickas via e-post så snart beställningen har skickats.',
          aStandard: 'Frakten är gratis till alla länder vi levererar till. Beställningar skickas med spårning, i en neutral, diskret förpackning utan produktnamn på utsidan. Beräknad leveranstid för ditt land visas i kassan, och spårningslänken skickas via e-post så snart beställningen har skickats.',
        },
      },
    },
    sticky: { cta: 'Få min plan' },
    exit: {
      title: 'Vänta – 10 % rabatt innan du går',
      body: 'Använd den här koden i kassan:',
      code: 'VITAL10',
      cta: 'Använd mina 10 % rabatt',
      dismiss: 'Nej tack',
    },
    chat: {
      title: 'Fråga Elena',
      subtitle: 'AI-assistent · inte läkare',
      greeting: 'Hej! Jag är Elena, AI-assistent hos VitalRise. Fråga mig vad du vill om produkten eller din plan.',
      placeholder: 'Skriv din fråga…',
      send: 'Skicka',
      error: 'Tyvärr, något gick fel. Försök igen.',
      open: 'Öppna chatten',
      close: 'Stäng chatten',
    },
    social: { ordered: '{count} personer har beställt de senaste 24 timmarna' },
    footer: {
      privacy: 'Integritetspolicy',
      terms: 'Villkor',
      contact: 'Kontakt',
      rights: 'Alla rättigheter förbehållna.',
    },
  },
  checkout: {
    steps: ['Varukorg', 'Dina uppgifter', 'Betalning'],
    cart: {
      title: 'Din beställning',
      bumpTitle: '+1 extra förpackning för {price}',
      bumpBody: 'Erbjuds bara på den här sidan: lägg till ytterligare en förpackning till ett lägre pris.',
      coupon: 'Rabattkod',
      couponPlaceholder: 'Ange kod',
      apply: 'Använd',
      hint: 'Psst… testa VITAL10',
      valid: 'Koden har lagts till: {pct} % rabatt',
      invalid: 'Koden är inte giltig.',
      total: 'Totalt',
      discountNote: 'Rabatten dras vid betalningen',
      shipping: 'Frakt',
      free: 'Gratis',
    },
    info: {
      title: 'Dina uppgifter',
      name: 'För- och efternamn',
      email: 'E-post',
      newsletter: 'Skicka mig anti-age-tips via e-post',
      addressNote: 'Du anger din leveransadress på den säkra betalsidan (med autofyll).',
    },
    payment: {
      title: 'Betalning',
      body: 'Du slutför köpet på Stripes säkra sida. Kort, Apple Pay, Google Pay och andra betalsätt visas där när de finns i ditt land.',
      installments: 'Alternativ för delbetalning visas vid betalningen när de finns.',
      pay: 'Betala säkert',
      redirecting: 'Öppnar säker betalning…',
      error: 'Vi kunde inte starta betalningen. Försök igen.',
      ssl: 'SSL-krypterad',
      guarantee: '30 dagars garanti',
      stripe: 'Betalning via Stripe',
    },
  },
  upsell1: {
    title: 'Din beställning är bekräftad. En sak till…',
    body: 'Lägg till ett Kit 6 (engångsköp) med 45 % rabatt – för 6-månadersrutinen. Erbjudandet finns bara på den här sidan.',
    accept: 'Ja, lägg till Kit 6 för {price}',
    decline: 'Nej tack',
    charge: 'Ditt sparade kort debiteras {price} en gång. Ingen prenumeration.',
  },
  upsell2: {
    title: 'Bli aldrig utan – och betala 30 % mindre',
    body: "Få Kit 3 levererat var 3:e månad för {price} i stället för {full}. Rabatten gäller så länge du prenumererar.",
    accept: "Ja, prenumerera för {price} var 3:e månad",
    decline: 'Nej tack',
    charge: "Ditt sparade kort debiteras {price} i dag och var 3:e månad tills du säger upp. Säg upp när som helst.",
  },
  upsell: {
    processing: 'Bearbetar…',
    error: 'Vi kunde inte slutföra detta. Du har inte debiterats.',
    action: 'Din bank behöver bekräfta betalningen. Fortsätt på den säkra sidan.',
  },
  thankYou: {
    title: 'Tack{name}!',
    body: 'Din beställning är bekräftad. Ett kvitto är på väg till din e-post.',
    howTo: 'Så kommer du igång',
    steps: ['Ta en portion varje morgon.', 'Blanda i vatten, kaffe eller en smoothie.', 'Fortsätt hela cykeln ut.'],
    vip: { title: 'VIP-grupp', body: 'Tips, recept och stöd från andra kunder.', cta: 'Gå med i gruppen' },
    referral: {
      title: 'Dela med en vän',
      body: 'Skicka din länk. Din vän får 10 % rabatt med koden VITAL10.',
      copy: 'Kopiera länk',
      copied: 'Kopierad!',
    },
    order: 'Ordersammanfattning',
  },
  neutral: {
    intro: 'Svara på 8 snabba frågor (ungefär 60 sekunder) och få din plan för yngre utseende hud och energi i vardagen.',
    painLibido: 'Låg vitalitet',
    heroSub: 'Din dagliga ritual: en formula med kollagen + peptider för dig som vill ha yngre utseende hud och mer energi, anpassad efter dina svar.',
    bullet: 'Att må bra i sin kropp börjar med daglig egenvård',
    pillar: { title: 'Vitalitet och självförtroende', body: 'Att må bra i sin kropp är en del av att känna självförtroende. En daglig ritual för egenvård för män och kvinnor, utan hormoner och utan stimulantia.' },
  },
  emails: {
    footer: 'Du får det här mejlet eftersom du gjorde VitalRise-quizen.',
    unsubscribe: 'Avsluta prenumeration',
    diagnosis: {
      subject: '{name}, din VitalRise-plan',
      body: 'Här är ditt resultat: {diagnosis}\n\nDin rekommenderade plan är {plan}. Se den här: {link}',
    },
    vsl: {
      subject: 'En 2-minutersvideo gjord för din profil',
      body: 'Vi har gjort en kort video om vad dina svar betyder. Se den här: {link}',
    },
    sms: { body: 'VitalRise: 10 % rabatt på din plan med koden VITAL10 → {link} Svara STOP för att avsluta.' },
    socialProof: {
      subject: 'Därför fortsätter folk',
      body: 'De flesta studier om kollagen pågick i 8 till 12 veckor. Därför är 90-dagars Kit 3 vår mest valda plan. Din plan: {link}',
    },
    lastChance: {
      subject: 'Din rabattkod på 10 % väntar fortfarande',
      body: 'Din kod VITAL10 väntar fortfarande. Använd den här: {link}',
    },
    story: {
      subject: 'Små vanor, stor skillnad',
      body: 'Den bästa rutinen är den du håller fast vid. En portion om dagen, varje dag. När du är redo: {link}',
    },
  },
};
