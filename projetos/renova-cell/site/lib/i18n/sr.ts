import type { Dictionary } from './en';

/** Serbian in Latin script (latinica), also served to Montenegro. */
export const sr: Dictionary = {
  common: {
    brand: 'RENOVA CELL',
    back: 'Nazad',
    next: 'Dalje',
    continue: 'Nastavi',
    skip: 'Preskoči',
    loading: 'Učitavanje…',
    language: 'Jezik',
    resultsVary: 'Rezultati se razlikuju od osobe do osobe.',
    fdaDisclaimer:
      'Ove tvrdnje nije procenila američka Agencija za hranu i lekove (FDA). Proizvod nije namenjen dijagnostikovanju, lečenju, izlečenju ili sprečavanju bilo koje bolesti.',
    euDisclaimer:
      'Dodatak ishrani nije zamena za raznovrsnu i uravnoteženu ishranu i zdrav način života. Ne prekoračiti preporučenu dnevnu dozu. Čuvati van domašaja male dece.',
  },
  consent: {
    text: 'Koristimo kolačiće za analitiku i merenje oglasa.',
    accept: 'Prihvatam',
    decline: 'Odbijam',
  },
  quiz: {
    progress: 'Završeno {pct}%',
    intro: 'Odgovori na 8 kratkih pitanja (oko 60 sekundi) i dobij svoj plan za mlađi izgled kože, više želje i energije svakog dana.',
    questions: {
      gender: {
        title: 'Kako se identifikuješ?',
        options: { male: 'Muškarac', female: 'Žena', other: 'Ne želim da kažem' },
      },
      age: {
        title: 'Koliko imaš godina?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: 'Šta te trenutno najviše muči?',
        options: {
          skin: 'Koža gubi čvrstinu',
          energy: 'Malo energije',
          libido: 'Manje želje / vitalnosti',
          joints: 'Ukočeni ili bolni zglobovi',
          all: 'Pomalo od svega',
        },
      },
      duration: {
        title: 'Koliko dugo te to muči?',
        options: { lt6m: 'Manje od 6 meseci', '6m-2y': '6 meseci – 2 godine', '2y+': 'Više od 2 godine' },
      },
      history: {
        title: 'Da li si već uzimao/la kolagen?',
        options: { never: 'Nikad', tried: 'Da, ali bez rezultata', using: 'Uzimam ga sada' },
      },
      energy: { title: 'Kakva ti je energija tokom dana?', min: 'Iscrpljenost', max: 'Puna energije' },
      confidence: { title: 'Koliko se dobro osećaš u svom telu?', min: 'Nimalo', max: 'Potpuno' },
      goal: {
        title: 'Šta bi najviše voleo/la da osetiš u narednih 15 dana?',
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
      title: 'Gde da ti pošaljemo plan?',
      subtitle: 'Nije obavezno: rezultat možeš odmah da vidiš i bez toga.',
      name: 'Ime',
      email: 'Imejl',
      phone: 'Mobilni (nije obavezno, za SMS)',
      marketing: 'Šaljite mi savete i ponude imejlom. Mogu da se odjavim bilo kada.',
      sms: 'Šaljite mi ponude SMS-om na ovaj broj. Mogu se naplatiti troškovi operatera. Za odjavu odgovori STOP.',
      submit: 'Prikaži moj rezultat',
      skip: 'Preskoči i prikaži rezultat',
      privacy: 'Nikada ne prodajemo tvoje podatke.',
    },
  },
  analyzing: {
    title: 'Pravimo tvoj plan',
    steps: ['Čitamo tvojih 8 odgovora…', 'Procenjujemo tvoj kolagenski profil…', 'Pišemo tvoju ličnu preporuku…'],
  },
  offer: {
    trust: 'Analiza je gotova za: {name} • Na osnovu tvojih 8 odgovora',
    trustAnon: 'Analiza je gotova • Na osnovu tvojih 8 odgovora',
    hero: {
      fallback: {
        woman: 'Čvršći izgled kože i stabilna energija počinju onim što svakog dana daješ svom telu',
        man: 'Ponovo se osećaj spremnim za dan: svakodnevni kolagen za zglobove, kožu i stabilnu energiju',
        senior: 'Posle 50. godine telo proizvodi manje kolagena. Tvoja dnevna rutina to može da nadoknadi',
      },
      sub: 'Tvoj svakodnevni ritual mladosti: formula sa kolagenom + peptidima za one koji žele mlađi izgled kože, više želje i više energije, prilagođena tvojim odgovorima.',
      cta: 'Prikaži preporučeni plan',
    },
    vsl: {
      title: 'Pogledaj: šta znače tvoji odgovori',
      unavailable: 'Video trenutno nije dostupan. Sve što ti treba nalazi se ispod.',
      cta: 'Želim svoj plan',
      resume: 'Nastavljamo gde si stao/la',
    },
    diagnosis: {
      title: 'Tvoja procena kolagena',
      body: 'Otprilike od 25. godine telo svake godine proizvede oko 1% manje kolagena. U tvojim godinama to je otprilike {pct}% manje nego sa 25.',
      note: 'Ilustrativna procena na osnovu često navođenog proseka, a ne lekarsko merenje.',
    },
    bullets: {
      title: 'Šta to znači za tebe',
      items: {
        skin: [
          'Kolagenski peptidi su u studijama sa placebom povezani sa boljom elastičnošću kože',
          'Jednostavna dnevna doza koja se uklapa u tvoje jutro',
          'Za kožu koja počinje da gubi čvrstinu',
        ],
        energy: [
          'Dnevna doza bogata proteinima kao podrška tvojoj rutini',
          'Bez stimulansa, pa nema kasnijeg pada',
          'Uz san, vodu i kretanje za ujednačenije dane',
        ],
        libido: [
          'Osećati se dobro u sopstvenoj koži deo je želje',
          'Svakodnevni ritual brige o sebi koji podržava samopouzdanje',
          'Bez hormona i bez stimulansa',
        ],
        joints: [
          'Hidrolizovani kolagen je proučavan kod tegoba sa zglobovima povezanih sa aktivnošću',
          'Podrška hrskavici i vezivnom tkivu koje koristiš svakog dana',
          'Lako se uzima svakog dana, a to je ono što je važno',
        ],
        all: [
          'Jedna dnevna doza za kožu, zglobove i opšte dobro stanje',
          'Kolagenski peptidi i mešavina peptida',
          'Stvoreno za rutinu koju već imaš',
        ],
      },
    },
    pillars: {
      title: 'Jedan dnevni ritual, tri cilja',
      items: [
        { title: 'Mlađi izgled kože', body: 'Kolagenski peptidi su u studijama sa placebom povezani sa boljom elastičnošću i hidratacijom kože.' },
        { title: 'Želja i vitalnost', body: 'Osećati se dobro u svom telu deo je želje. Svakodnevni ritual brige o sebi za muškarce i žene, bez hormona i bez stimulansa.' },
        { title: 'Energija za tvoj dan', body: 'Dnevna doza bogata proteinima koja se uklapa u tvoje jutro, bez stimulansa i bez padova.' },
      ],
      note: 'Rezultati se razlikuju. RENOVA CELL je dodatak ishrani, a ne lek.',
    },
    science: {
      title: 'Šta kažu istraživanja',
      flip: 'Dodirni za izvor',
      cards: [
        {
          title: 'Elastičnost kože',
          finding:
            '69 žena je 8 nedelja uzimalo 2,5 g ili 5 g određenih kolagenskih peptida ili placebo. Elastičnost kože se poboljšala u odnosu na placebo.',
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Udobnost zglobova',
          finding:
            'Tokom 24 nedelje sportisti koji su uzimali 10 g hidrolizovanog kolagena dnevno prijavili su manje bolova u zglobovima pri aktivnosti nego grupa sa placebom.',
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'Šira slika',
          finding:
            'Metaanaliza 26 randomizovanih studija (1.721 učesnik) pokazala je poboljšanje hidratacije i elastičnosti kože u odnosu na placebo.',
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'Studije su testirale određene kolagenske formule; rezultati ne moraju da važe za svaki proizvod, pa ni za ovaj.',
    },
    timeline: {
      title: 'Šta da očekuješ',
      steps: [
        { day: '1. dan', title: 'Započni ritual', body: 'Jedna doza dnevno. Važna je redovnost.' },
        { day: '5. dan', title: 'Pretvori to u naviku', body: 'Isto vreme, isto mesto. Navika se učvršćuje.' },
        { day: '15. dan', title: 'Zastani na trenutak', body: 'Obrati pažnju kako se osećaš i drži se navike.' },
        { day: '30. dan', title: 'Jedan mesec', body: 'Nastavi. Studije su merile promene kože posle 4 do 12 nedelja.' },
        { day: '90. dan', title: 'Pun ciklus', body: 'Period koji je posmatrala većina istraživanja. Vreme je za poređenje.' },
      ],
    },
    beforeAfter: {
      title: 'Stvarni kupci',
      before: 'Pre',
      after: 'Posle',
      note: 'Neobrađene fotografije, podeljene uz dozvolu. Rezultati se razlikuju.',
    },
    testimonials: {
      title: 'Ljudi poput tebe',
      note: 'Stvarni kupci, podeljeno uz dozvolu. Rezultati se razlikuju.',
    },
    simulator: {
      title: 'Tvoja kolagenska kriva',
      label: 'Tvoje godine',
      yAxis: 'Procenjeni kolagen u odnosu na 25. godinu (%)',
      you: 'Ti',
      note: 'Prikaz često navođenog pada od ~1% godišnje posle 25. godine. Nije predviđanje rezultata proizvoda.',
    },
    comparison: {
      title: 'RENOVA CELL u odnosu na običan kolagen',
      us: 'RENOVA CELL',
      them: 'Običan kolagen',
      rows: [
        { label: 'Hidrolizovani kolagenski peptidi', us: 'yes', them: 'yes' },
        { label: 'Dodata mešavina peptida', us: 'yes', them: 'no' },
        { label: 'Plan prema tvom kvizu', us: 'yes', them: 'no' },
        { label: 'Garancija povraćaja novca 30 dana', us: 'yes', them: 'varies' },
      ],
      varies: 'Zavisi',
    },
    pricing: {
      perMonth: '/mes.',
      once: 'Jednokratna kupovina',
      subscribe: 'Pretplata: ponovo stiže kad ponestane',
      interval: { m1: 'svakog meseca', m3: 'svaka 3 meseca', m6: 'svakih 6 meseci' },
      title: 'Izaberi svoj plan',
      recommended: 'Preporučeno za tebe',
      perUnit: '{price} po komadu',
      save: 'Uštedi {pct}%',
      plans: {
        single: { name: '1 komad', desc: 'Isprobaj mesec dana' },
        kit3: { name: 'Kit 3', desc: 'Ciklus od 90 dana iz većine studija' },
        kit6: { name: 'Kit 6', desc: 'Zaliha za 6 meseci' },
      },
      recurring: 'Naplaćujemo {price} {interval} dok ne otkažeš. Otkaži bilo kada preko računa u imejlu.',
      cta: 'Izaberi ovaj plan',
    },
    shipping: { free: 'Besplatna dostava', fast: 'Dostava za najviše 2 radna dana', discreet: 'Diskretno pakovanje', tracked: 'Dostava sa praćenjem' },
    bonus: {
      title: 'Uključeno uz Kit 3 i Kit 6',
      items: ['E-knjiga: Kolagenska rutina', 'Plan ishrane za 15 dana', 'VIP grupa za kupce'],
    },
    guarantee: {
      title: 'Garancija povraćaja novca 30 dana',
      body: 'Isprobaj 30 dana. Ako nisi zadovoljan/na, piši nam i vratićemo ti novac za porudžbinu bez pitanja.',
    },
    faq: {
      title: 'Pitanja',
      items: {
        different: {
          q: 'Već sam probao/la kolagen i nisam ništa primetio/la. Zašto bi sada bilo drugačije?',
          a: 'Mnogi odustanu posle nekoliko nedelja. Većina studija trajala je 8 do 12 nedelja uz dnevnu dozu, zato preporučujemo Kit 3 od 90 dana. A ako ti ne odgovara, važi garancija od 30 dana.',
        },
        time: {
          q: 'Koliko brzo ću videti rezultate?',
          a: 'Svako je drugačiji. Istraživanja su merila promene kože posle 4 do 12 nedelja svakodnevne upotrebe. Daj mu bar jedan pun ciklus.',
        },
        safe: {
          q: 'Da li je bezbedno za mene?',
          a: 'Kolagen je prehrambeni protein koji se obično dobro podnosi. Ako si trudna, dojiš, uzimaš lekove ili imaš zdravstveno stanje, prvo se posavetuj sa lekarom.',
        },
        men: {
          q: 'Da li je i za muškarce?',
          a: 'Da. Kolagen podržava kožu i zglobove kod svih. Ne tvrdimo da utiče na hormone.',
        },
        how: {
          q: 'Kako se uzima?',
          a: 'Jedna doza dnevno, umešana u vodu, kafu ili smuti. Najbolje svakog dana u isto vreme.',
        },
        cancel: {
          q: 'Kako da otkažem pretplatu?',
          a: 'Iskoristi link u bilo kom imejlu sa računom ili nam piši. Možeš da otkažeš bilo kada, bez naknada.',
        },
        shipping: {
          q: 'Kako funkcioniše dostava?',
          a: 'Dostava je besplatna u sve zemlje u koje dostavljamo. Dostava traje najviše 2 radna dana, sa praćenjem, u običnom, diskretnom pakovanju bez naziva proizvoda spolja. Link za praćenje stiže imejlom čim porudžbina bude poslata.',
          aStandard: 'Dostava je besplatna u sve zemlje u koje dostavljamo. Porudžbine šaljemo sa praćenjem, u običnom, diskretnom pakovanju bez naziva proizvoda spolja. Procenjeni rok za tvoju zemlju vidi se pri plaćanju, a link za praćenje stiže imejlom čim porudžbina bude poslata.',
        },
      },
    },
    sticky: { cta: 'Želim svoj plan' },
    exit: {
      title: 'Čekaj: 10% popusta pre odlaska',
      body: 'Iskoristi ovaj kod pri plaćanju:',
      code: 'RENOVA10',
      cta: 'Iskoristi 10% popusta',
      dismiss: 'Ne, hvala',
    },
    chat: {
      title: 'Pitaj Elenu',
      subtitle: 'AI asistentkinja · nije lekar',
      greeting: 'Zdravo! Ja sam Elena, AI asistentkinja kompanije RENOVA CELL. Pitaj me bilo šta o proizvodu ili svom planu.',
      placeholder: 'Upiši svoje pitanje…',
      send: 'Pošalji',
      error: 'Izvini, nešto je pošlo naopako. Pokušaj ponovo.',
      open: 'Otvori ćaskanje',
      close: 'Zatvori ćaskanje',
    },
    social: { ordered: 'Porudžbine u poslednja 24 sata: {count}' },
    footer: {
      privacy: 'Privatnost',
      terms: 'Uslovi',
      contact: 'Kontakt',
      rights: 'Sva prava zadržana.',
    },
  },
  checkout: {
    steps: ['Korpa', 'Tvoji podaci', 'Plaćanje'],
    cart: {
      title: 'Tvoja porudžbina',
      bumpTitle: '+1 dodatni komad za {price}',
      bumpBody: 'Samo na ovoj stranici: dodaj još jedan komad po nižoj ceni.',
      coupon: 'Kod za popust',
      couponPlaceholder: 'Upiši kod',
      apply: 'Primeni',
      hint: 'Pst… probaj RENOVA10',
      valid: 'Kod primenjen: {pct}% popusta',
      invalid: 'Ovaj kod nije važeći.',
      total: 'Ukupno',
      discountNote: 'Popust se primenjuje pri plaćanju',
      shipping: 'Dostava',
      free: 'Besplatno',
    },
    info: {
      title: 'Tvoji podaci',
      name: 'Ime i prezime',
      email: 'Imejl',
      newsletter: 'Šaljite mi savete protiv starenja imejlom',
      addressNote: 'Adresu za isporuku upisaćeš na bezbednoj stranici za plaćanje (sa automatskim popunjavanjem).',
    },
    payment: {
      title: 'Plaćanje',
      body: 'Kupovinu ćeš završiti na bezbednoj stranici kompanije Stripe. Kartica, Apple Pay, Google Pay i drugi načini prikazaće se tamo ako su dostupni u tvojoj zemlji.',
      installments: 'Mogućnosti plaćanja na rate prikazuju se pri plaćanju ako su dostupne.',
      pay: 'Plati bezbedno',
      redirecting: 'Otvaramo bezbedno plaćanje…',
      error: 'Plaćanje nije moglo da se pokrene. Pokušaj ponovo.',
      ssl: 'SSL enkripcija',
      guarantee: 'Garancija 30 dana',
      stripe: 'Plaćanja preko Stripe',
    },
  },
  upsell1: {
    title: 'Porudžbina je potvrđena. Još nešto…',
    body: 'Dodaj Kit 6 (jednokratno) uz 45% popusta za rutinu od 6 meseci. Ponuda važi samo na ovoj stranici.',
    accept: 'Da, dodaj Kit 6 za {price}',
    decline: 'Ne, hvala',
    charge: 'Tvoja sačuvana kartica biće jednokratno zadužena za {price}. Nije pretplata.',
  },
  upsell2: {
    title: 'Nikad bez zalihe, i 30% jeftinije',
    body: 'Primaj Kit 3 svaka 3 meseca za {price} umesto {full}. Popust važi dok god si pretplaćen/a.',
    accept: 'Da, pretplata za {price} svaka 3 meseca',
    decline: 'Ne, hvala',
    charge: 'Tvoja sačuvana kartica biće zadužena za {price} danas i svaka 3 meseca dok ne otkažeš. Otkaži bilo kada.',
  },
  upsell: {
    processing: 'Obrada…',
    error: 'Nije uspelo. Ništa ti nije naplaćeno.',
    action: 'Tvoja banka mora da potvrdi ovo plaćanje. Nastavi na bezbednoj stranici.',
  },
  thankYou: {
    title: 'Hvala{name}!',
    body: 'Tvoja porudžbina je potvrđena. Račun stiže na tvoj imejl.',
    howTo: 'Kako da počneš',
    steps: ['Uzmi jednu dozu svako jutro.', 'Umešaj u vodu, kafu ili smuti.', 'Nastavi do kraja ciklusa.'],
    vip: { title: 'VIP grupa', body: 'Saveti, recepti i podrška drugih kupaca.', cta: 'Pridruži se grupi' },
    referral: {
      title: 'Podeli sa prijateljem',
      body: 'Pošalji svoj link. Ko ga iskoristi, dobija 10% popusta uz kod RENOVA10.',
      copy: 'Kopiraj link',
      copied: 'Kopirano!',
    },
    order: 'Pregled porudžbine',
  },
  neutral: {
    intro: 'Odgovori na 8 kratkih pitanja (oko 60 sekundi) i dobij svoj plan za mlađi izgled kože i energiju svakog dana.',
    painLibido: 'Manje vitalnosti',
    heroSub: 'Tvoj svakodnevni ritual: formula sa kolagenom + peptidima za one koji žele mlađi izgled kože i više energije, prilagođena tvojim odgovorima.',
    bullet: 'Osećati se dobro u svom telu počinje svakodnevnom brigom o sebi',
    pillar: { title: 'Vitalnost i samopouzdanje', body: 'Osećati se dobro u svom telu deo je samopouzdanja. Svakodnevni ritual brige o sebi za muškarce i žene, bez hormona i bez stimulansa.' },
  },
  emails: {
    footer: 'Ovu poruku primaš jer si popunio/la kviz RENOVA CELL.',
    unsubscribe: 'Odjava',
    diagnosis: {
      subject: '{name}, tvoj RENOVA CELL plan',
      body: 'Ovo je tvoj rezultat: {diagnosis}\n\nTvoj preporučeni plan je {plan}. Pogledaj ga ovde: {link}',
    },
    vsl: {
      subject: 'Video od 2 minuta za tvoj profil',
      body: 'Pripremili smo kratak video o tome šta znače tvoji odgovori. Pogledaj ga ovde: {link}',
    },
    sms: { body: 'RENOVA CELL: 10% popusta na tvoj plan uz kod RENOVA10 → {link} Za odjavu odgovori STOP.' },
    socialProof: {
      subject: 'Zašto ljudi istrajavaju',
      body: 'Većina studija o kolagenu trajala je 8 do 12 nedelja. Zato je Kit 3 od 90 dana naš najčešće biran plan. Tvoj plan: {link}',
    },
    lastChance: {
      subject: 'Tvoj kod za 10% popusta te još čeka',
      body: 'Tvoj kod RENOVA10 te još uvek čeka. Iskoristi ga ovde: {link}',
    },
    story: {
      subject: 'Male navike, velika razlika',
      body: 'Najbolja rutina je ona koje se držiš. Jedna doza dnevno, svakog dana. Kad budeš spreman/na: {link}',
    },
  },
};
