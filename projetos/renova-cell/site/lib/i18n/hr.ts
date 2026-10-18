import type { Dictionary } from './en';

export const hr: Dictionary = {
  common: {
    brand: 'VitalRise',
    back: 'Natrag',
    next: 'Dalje',
    continue: 'Nastavi',
    skip: 'Preskoči',
    loading: 'Učitavanje…',
    language: 'Jezik',
    resultsVary: 'Rezultati se razlikuju od osobe do osobe.',
    fdaDisclaimer:
      'Ove tvrdnje nije ocijenila američka Agencija za hranu i lijekove (FDA). Proizvod nije namijenjen dijagnosticiranju, liječenju, izlječenju ili sprječavanju bilo koje bolesti.',
    euDisclaimer:
      'Dodatak prehrani nije zamjena za raznoliku i uravnoteženu prehranu i zdrav način života. Ne preporučuje se prekoračiti preporučenu dnevnu dozu. Čuvati izvan dohvata male djece.',
  },
  consent: {
    text: 'Koristimo kolačiće za analitiku i mjerenje oglasa.',
    accept: 'Prihvaćam',
    decline: 'Odbijam',
  },
  quiz: {
    progress: 'Dovršeno {pct} %',
    intro: 'Odgovori na 8 kratkih pitanja (oko 60 sekundi) i dobij svoj plan za mlađi izgled kože, više želje i energije svaki dan.',
    questions: {
      gender: {
        title: 'Kako se identificiraš?',
        options: { male: 'Muškarac', female: 'Žena', other: 'Ne želim reći' },
      },
      age: {
        title: 'Koliko imaš godina?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: 'Što te trenutačno najviše muči?',
        options: {
          skin: 'Koža gubi čvrstoću',
          energy: 'Malo energije',
          libido: 'Manje želje / vitalnosti',
          joints: 'Ukočeni ili bolni zglobovi',
          all: 'Pomalo od svega',
        },
      },
      duration: {
        title: 'Koliko dugo te to muči?',
        options: { lt6m: 'Manje od 6 mjeseci', '6m-2y': '6 mjeseci – 2 godine', '2y+': 'Više od 2 godine' },
      },
      history: {
        title: 'Jesi li već uzimao/la kolagen?',
        options: { never: 'Nikad', tried: 'Da, ali bez rezultata', using: 'Uzimam ga sada' },
      },
      energy: { title: 'Kakva ti je energija tijekom dana?', min: 'Iscrpljenost', max: 'Puna energije' },
      confidence: { title: 'Koliko se dobro osjećaš u svom tijelu?', min: 'Nimalo', max: 'Potpuno' },
      goal: {
        title: 'Što bi najviše želio/la osjetiti u sljedećih 15 dana?',
        options: {
          skin: 'Čvršći izgled kože',
          energy: 'Više energije',
          libido: 'Više vitalnosti',
          joints: 'Lakše kretanje',
          all: 'Sve to',
        },
      },
    },
    contact: {
      title: 'Kamo da ti pošaljemo plan?',
      subtitle: 'Nije obavezno: rezultat možeš odmah vidjeti i bez toga.',
      name: 'Ime',
      email: 'E-pošta',
      phone: 'Mobitel (nije obavezno, za SMS)',
      marketing: 'Šaljite mi savjete i ponude e-poštom. Mogu se odjaviti bilo kada.',
      sms: 'Šaljite mi ponude SMS-om na ovaj broj. Mogu se naplatiti troškovi operatera. Za odjavu odgovori STOP.',
      submit: 'Prikaži moj rezultat',
      skip: 'Preskoči i prikaži rezultat',
      privacy: 'Nikada ne prodajemo tvoje podatke.',
    },
  },
  analyzing: {
    title: 'Izrađujemo tvoj plan',
    steps: ['Čitamo tvojih 8 odgovora…', 'Procjenjujemo tvoj kolagenski profil…', 'Pišemo tvoju osobnu preporuku…'],
  },
  offer: {
    trust: 'Analiza je gotova za: {name} • Na temelju tvojih 8 odgovora',
    trustAnon: 'Analiza je gotova • Na temelju tvojih 8 odgovora',
    hero: {
      fallback: {
        woman: 'Čvršći izgled kože i stabilna energija počinju s onim što svaki dan daješ svom tijelu',
        man: 'Ponovno se osjećaj spremnim za dan: svakodnevni kolagen za zglobove, kožu i stabilnu energiju',
        senior: 'Nakon 50. godine tijelo proizvodi manje kolagena. Tvoja dnevna rutina to može nadoknaditi',
      },
      sub: 'Tvoj svakodnevni ritual mladosti: formula s kolagenom + peptidima za one koji žele mlađi izgled kože, više želje i više energije, prilagođena tvojim odgovorima.',
      cta: 'Prikaži preporučeni plan',
    },
    vsl: {
      title: 'Pogledaj: što znače tvoji odgovori',
      unavailable: 'Videozapis trenutačno nije dostupan. Sve što ti treba nalazi se u nastavku.',
      cta: 'Želim svoj plan',
      resume: 'Nastavljamo gdje si stao/la',
    },
    diagnosis: {
      title: 'Tvoja procjena kolagena',
      body: 'Otprilike od 25. godine tijelo svake godine proizvodi oko 1 % manje kolagena. U tvojoj dobi to je otprilike {pct} % manje nego s 25 godina.',
      note: 'Ilustrativna procjena na temelju često navođenog prosjeka, a ne liječničko mjerenje.',
    },
    bullets: {
      title: 'Što to znači za tebe',
      items: {
        skin: [
          'Kolagenski peptidi u studijama s placebom povezani su s boljom elastičnošću kože',
          'Jednostavna dnevna doza koja se uklapa u tvoje jutro',
          'Za kožu koja počinje gubiti čvrstoću',
        ],
        energy: [
          'Dnevna doza bogata proteinima kao podrška tvojoj rutini',
          'Bez stimulansa, pa nema kasnijeg pada',
          'Uz san, vodu i kretanje za ujednačenije dane',
        ],
        libido: [
          'Osjećati se dobro u vlastitoj koži dio je želje',
          'Svakodnevni ritual brige o sebi koji podržava samopouzdanje',
          'Bez hormona i bez stimulansa',
        ],
        joints: [
          'Hidrolizirani kolagen istraživan je kod tegoba zglobova povezanih s aktivnošću',
          'Podrška hrskavici i vezivnom tkivu koje koristiš svaki dan',
          'Lako se uzima svaki dan, a to je ono što je važno',
        ],
        all: [
          'Jedna dnevna doza za kožu, zglobove i opće blagostanje',
          'Kolagenski peptidi i mješavina peptida',
          'Stvoreno za rutinu koju već imaš',
        ],
      },
    },
    pillars: {
      title: 'Jedan dnevni ritual, tri cilja',
      items: [
        { title: 'Mlađi izgled kože', body: 'Kolagenski peptidi u studijama s placebom povezani su s boljom elastičnošću i hidratacijom kože.' },
        { title: 'Želja i vitalnost', body: 'Osjećati se dobro u svom tijelu dio je želje. Svakodnevni ritual brige o sebi za muškarce i žene, bez hormona i bez stimulansa.' },
        { title: 'Energija za tvoj dan', body: 'Dnevna doza bogata proteinima koja se uklapa u tvoje jutro, bez stimulansa i bez padova.' },
      ],
      note: 'Rezultati se razlikuju. VitalRise je dodatak prehrani, a ne lijek.',
    },
    science: {
      title: 'Što kažu istraživanja',
      flip: 'Dodirni za izvor',
      cards: [
        {
          title: 'Elastičnost kože',
          finding:
            '69 žena uzimalo je 8 tjedana 2,5 g ili 5 g određenih kolagenskih peptida ili placebo. Elastičnost kože poboljšala se u usporedbi s placebom.',
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Udobnost zglobova',
          finding:
            'Tijekom 24 tjedna sportaši koji su uzimali 10 g hidroliziranog kolagena dnevno prijavili su manje boli u zglobovima pri aktivnosti nego skupina s placebom.',
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'Šira slika',
          finding:
            'Metaanaliza 26 randomiziranih studija (1721 sudionik) utvrdila je poboljšanje hidratacije i elastičnosti kože u usporedbi s placebom.',
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'Studije su testirale određene kolagenske formule; rezultati ne moraju vrijediti za svaki proizvod, pa ni za ovaj.',
    },
    timeline: {
      title: 'Što očekivati',
      steps: [
        { day: '1. dan', title: 'Započni ritual', body: 'Jedna doza dnevno. Važna je redovitost.' },
        { day: '5. dan', title: 'Pretvori to u naviku', body: 'Isto vrijeme, isto mjesto. Navika se učvršćuje.' },
        { day: '15. dan', title: 'Zastani na trenutak', body: 'Obrati pažnju kako se osjećaš i drži se navike.' },
        { day: '30. dan', title: 'Jedan mjesec', body: 'Nastavi. Studije su mjerile promjene kože nakon 4 do 12 tjedana.' },
        { day: '90. dan', title: 'Puni ciklus', body: 'Razdoblje koje je promatrala većina istraživanja. Vrijeme je za usporedbu.' },
      ],
    },
    beforeAfter: {
      title: 'Stvarni kupci',
      before: 'Prije',
      after: 'Poslije',
      note: 'Neobrađene fotografije, podijeljene uz dopuštenje. Rezultati se razlikuju.',
    },
    testimonials: {
      title: 'Ljudi poput tebe',
      note: 'Stvarni kupci, podijeljeno uz dopuštenje. Rezultati se razlikuju.',
    },
    simulator: {
      title: 'Tvoja kolagenska krivulja',
      label: 'Tvoja dob',
      yAxis: 'Procijenjeni kolagen u odnosu na 25. godinu (%)',
      you: 'Ti',
      note: 'Prikaz često navođenog pada od ~1 % godišnje nakon 25. godine. Nije predviđanje rezultata proizvoda.',
    },
    comparison: {
      title: 'VitalRise u odnosu na običan kolagen',
      us: 'VitalRise',
      them: 'Običan kolagen',
      rows: [
        { label: 'Hidrolizirani kolagenski peptidi', us: 'yes', them: 'yes' },
        { label: 'Dodana mješavina peptida', us: 'yes', them: 'no' },
        { label: 'Plan prema tvom kvizu', us: 'yes', them: 'no' },
        { label: 'Jamstvo povrata novca 30 dana', us: 'yes', them: 'varies' },
      ],
      varies: 'Ovisi',
    },
    pricing: {
      perMonth: '/mj.',
      once: 'Jednokratna kupnja',
      subscribe: 'Pretplata: ponovna dostava kad ponestane',
      interval: { m1: 'svaki mjesec', m3: 'svaka 3 mjeseca', m6: 'svakih 6 mjeseci' },
      title: 'Odaberi svoj plan',
      recommended: 'Preporučeno za tebe',
      perUnit: '{price} po komadu',
      save: 'Uštedi {pct} %',
      plans: {
        single: { name: '1 komad', desc: 'Isprobaj mjesec dana' },
        kit3: { name: 'Kit 3', desc: 'Ciklus od 90 dana iz većine studija' },
        kit6: { name: 'Kit 6', desc: 'Zaliha za 6 mjeseci' },
      },
      recurring: 'Naplaćujemo {price} {interval} dok ne otkažeš. Otkaži bilo kada putem računa u e-pošti.',
      cta: 'Odaberi ovaj plan',
    },
    shipping: { free: 'Besplatna dostava', fast: 'Dostava u najviše 2 radna dana', discreet: 'Diskretno pakiranje', tracked: 'Dostava s praćenjem' },
    bonus: {
      title: 'Uključeno uz Kit 3 i Kit 6',
      items: ['E-knjiga: Kolagenska rutina', 'Plan prehrane za 15 dana', 'VIP grupa za kupce'],
    },
    guarantee: {
      title: 'Jamstvo povrata novca 30 dana',
      body: 'Isprobaj 30 dana. Ako nisi zadovoljan/na, piši nam i vratit ćemo ti novac za narudžbu bez pitanja.',
    },
    faq: {
      title: 'Pitanja',
      items: {
        different: {
          q: 'Već sam probao/la kolagen i nisam ništa primijetio/la. Zašto bi sada bilo drukčije?',
          a: 'Mnogi odustanu nakon nekoliko tjedana. Većina studija trajala je 8 do 12 tjedana uz dnevnu dozu, zato preporučujemo Kit 3 od 90 dana. A ako ti ne odgovara, vrijedi jamstvo od 30 dana.',
        },
        time: {
          q: 'Koliko brzo ću vidjeti rezultate?',
          a: 'Svatko je drukčiji. Istraživanja su mjerila promjene kože nakon 4 do 12 tjedana svakodnevne upotrebe. Daj mu barem jedan puni ciklus.',
        },
        safe: {
          q: 'Je li sigurno za mene?',
          a: 'Kolagen je prehrambeni protein koji se obično dobro podnosi. Ako si trudna, dojiš, uzimaš lijekove ili imaš zdravstveno stanje, najprije se posavjetuj s liječnikom.',
        },
        men: {
          q: 'Je li i za muškarce?',
          a: 'Da. Kolagen podržava kožu i zglobove kod svih. Ne tvrdimo da utječe na hormone.',
        },
        how: {
          q: 'Kako se uzima?',
          a: 'Jedna doza dnevno, umiješana u vodu, kavu ili smoothie. Najbolje svaki dan u isto vrijeme.',
        },
        cancel: {
          q: 'Kako otkazati pretplatu?',
          a: 'Upotrijebi poveznicu u bilo kojoj e-poruci s računom ili nam piši. Možeš otkazati bilo kada, bez naknada.',
        },
        shipping: {
          q: 'Kako funkcionira dostava?',
          a: 'Dostava je besplatna u sve zemlje u koje dostavljamo. Dostava traje najviše 2 radna dana, s praćenjem, u običnom, diskretnom pakiranju bez naziva proizvoda izvana. Poveznica za praćenje šalje se e-poštom čim narudžba bude poslana.',
          aStandard: 'Dostava je besplatna u sve zemlje u koje dostavljamo. Narudžbe šaljemo s praćenjem, u običnom, diskretnom pakiranju bez naziva proizvoda izvana. Procijenjeni rok za tvoju zemlju vidi se pri plaćanju, a poveznica za praćenje šalje se e-poštom čim narudžba bude poslana.',
        },
      },
    },
    sticky: { cta: 'Želim svoj plan' },
    exit: {
      title: 'Čekaj: 10 % popusta prije odlaska',
      body: 'Upotrijebi ovaj kod pri plaćanju:',
      code: 'VITAL10',
      cta: 'Iskoristi 10 % popusta',
      dismiss: 'Ne, hvala',
    },
    chat: {
      title: 'Pitaj Elenu',
      subtitle: 'AI asistentica · nije liječnica',
      greeting: 'Bok! Ja sam Elena, AI asistentica VitalRisea. Pitaj me bilo što o proizvodu ili svom planu.',
      placeholder: 'Upiši svoje pitanje…',
      send: 'Pošalji',
      error: 'Oprosti, nešto je pošlo po zlu. Pokušaj ponovno.',
      open: 'Otvori chat',
      close: 'Zatvori chat',
    },
    social: { ordered: 'Narudžbe u posljednja 24 sata: {count}' },
    footer: {
      privacy: 'Privatnost',
      terms: 'Uvjeti',
      contact: 'Kontakt',
      rights: 'Sva prava pridržana.',
    },
  },
  checkout: {
    steps: ['Košarica', 'Tvoji podaci', 'Plaćanje'],
    cart: {
      title: 'Tvoja narudžba',
      bumpTitle: '+1 dodatni komad za {price}',
      bumpBody: 'Samo na ovoj stranici: dodaj još jedan komad po nižoj cijeni.',
      coupon: 'Kod za popust',
      couponPlaceholder: 'Upiši kod',
      apply: 'Primijeni',
      hint: 'Pst… probaj VITAL10',
      valid: 'Kod primijenjen: {pct} % popusta',
      invalid: 'Ovaj kod nije valjan.',
      total: 'Ukupno',
      discountNote: 'Popust se primjenjuje pri plaćanju',
      shipping: 'Dostava',
      free: 'Besplatno',
    },
    info: {
      title: 'Tvoji podaci',
      name: 'Ime i prezime',
      email: 'E-pošta',
      newsletter: 'Šaljite mi savjete protiv starenja e-poštom',
      addressNote: 'Adresu za dostavu upisat ćeš na sigurnoj stranici za plaćanje (s automatskim dovršavanjem).',
    },
    payment: {
      title: 'Plaćanje',
      body: 'Kupnju ćeš dovršiti na sigurnoj stranici Stripea. Kartica, Apple Pay, Google Pay i drugi načini prikazat će se ondje ako su dostupni u tvojoj zemlji.',
      installments: 'Mogućnosti plaćanja na rate prikazuju se pri plaćanju ako su dostupne.',
      pay: 'Plati sigurno',
      redirecting: 'Otvaramo sigurno plaćanje…',
      error: 'Plaćanje nije moguće pokrenuti. Pokušaj ponovno.',
      ssl: 'SSL enkripcija',
      guarantee: 'Jamstvo 30 dana',
      stripe: 'Plaćanja putem Stripea',
    },
  },
  upsell1: {
    title: 'Narudžba je potvrđena. Još nešto…',
    body: 'Dodaj Kit 6 (jednokratno) uz 45 % popusta za rutinu od 6 mjeseci. Ponuda vrijedi samo na ovoj stranici.',
    accept: 'Da, dodaj Kit 6 za {price}',
    decline: 'Ne, hvala',
    charge: 'Tvoja spremljena kartica jednokratno će biti terećena za {price}. Nije pretplata.',
  },
  upsell2: {
    title: 'Nikad bez zalihe, i 30 % jeftinije',
    body: 'Primaj Kit 3 svaka 3 mjeseca za {price} umjesto {full}. Popust vrijedi dok god si pretplaćen/a.',
    accept: 'Da, pretplata za {price} svaka 3 mjeseca',
    decline: 'Ne, hvala',
    charge: 'Tvoja spremljena kartica bit će terećena za {price} danas i svaka 3 mjeseca dok ne otkažeš. Otkaži bilo kada.',
  },
  upsell: {
    processing: 'Obrada…',
    error: 'Nije uspjelo. Ništa ti nije naplaćeno.',
    action: 'Tvoja banka mora potvrditi ovo plaćanje. Nastavi na sigurnoj stranici.',
  },
  thankYou: {
    title: 'Hvala{name}!',
    body: 'Tvoja narudžba je potvrđena. Račun stiže na tvoju e-poštu.',
    howTo: 'Kako započeti',
    steps: ['Uzmi jednu dozu svako jutro.', 'Umiješaj u vodu, kavu ili smoothie.', 'Nastavi do kraja ciklusa.'],
    vip: { title: 'VIP grupa', body: 'Savjeti, recepti i podrška drugih kupaca.', cta: 'Pridruži se grupi' },
    referral: {
      title: 'Podijeli s prijateljem',
      body: 'Pošalji svoju poveznicu. Tko je iskoristi, dobiva 10 % popusta uz kod VITAL10.',
      copy: 'Kopiraj poveznicu',
      copied: 'Kopirano!',
    },
    order: 'Sažetak narudžbe',
  },
  neutral: {
    intro: 'Odgovori na 8 kratkih pitanja (oko 60 sekundi) i dobij svoj plan za mlađi izgled kože i energiju svaki dan.',
    painLibido: 'Manje vitalnosti',
    heroSub: 'Tvoj svakodnevni ritual: formula s kolagenom + peptidima za one koji žele mlađi izgled kože i više energije, prilagođena tvojim odgovorima.',
    bullet: 'Osjećati se dobro u svom tijelu počinje svakodnevnom brigom o sebi',
    pillar: { title: 'Vitalnost i samopouzdanje', body: 'Osjećati se dobro u svom tijelu dio je samopouzdanja. Svakodnevni ritual brige o sebi za muškarce i žene, bez hormona i bez stimulansa.' },
  },
  emails: {
    footer: 'Ovu poruku primaš jer si ispunio/la kviz VitalRise.',
    unsubscribe: 'Odjava',
    diagnosis: {
      subject: '{name}, tvoj VitalRise plan',
      body: 'Ovo je tvoj rezultat: {diagnosis}\n\nTvoj preporučeni plan je {plan}. Pogledaj ga ovdje: {link}',
    },
    vsl: {
      subject: 'Video od 2 minute za tvoj profil',
      body: 'Pripremili smo kratak video o tome što znače tvoji odgovori. Pogledaj ga ovdje: {link}',
    },
    sms: { body: 'VitalRise: 10 % popusta na tvoj plan uz kod VITAL10 → {link} Za odjavu odgovori STOP.' },
    socialProof: {
      subject: 'Zašto ljudi ustraju',
      body: 'Većina studija o kolagenu trajala je 8 do 12 tjedana. Zato je Kit 3 od 90 dana naš najčešće biran plan. Tvoj plan: {link}',
    },
    lastChance: {
      subject: 'Tvoj kod za 10 % popusta još te čeka',
      body: 'Tvoj kod VITAL10 još te čeka. Iskoristi ga ovdje: {link}',
    },
    story: {
      subject: 'Male navike, velika razlika',
      body: 'Najbolja rutina je ona koje se držiš. Jedna doza dnevno, svaki dan. Kad budeš spreman/na: {link}',
    },
  },
};
