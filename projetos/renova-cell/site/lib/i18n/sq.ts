import type { Dictionary } from './en';

export const sq: Dictionary = {
  common: {
    brand: 'RENOVA CELL',
    back: 'Prapa',
    next: 'Tjetra',
    continue: 'Vazhdo',
    skip: 'Kapërce',
    loading: 'Po ngarkohet…',
    language: 'Gjuha',
    resultsVary: 'Rezultatet ndryshojnë nga personi në person.',
    fdaDisclaimer:
      'Këto deklarata nuk janë vlerësuar nga Administrata Amerikane e Ushqimeve dhe Barnave (FDA). Ky produkt nuk synon të diagnostikojë, trajtojë, shërojë ose parandalojë asnjë sëmundje.',
    euDisclaimer:
      'Shtesat ushqimore nuk zëvendësojnë një dietë të larmishme dhe të ekuilibruar dhe një mënyrë jetese të shëndetshme. Mos e tejkaloni dozën ditore të rekomanduar. Mbajeni larg fëmijëve të vegjël.',
  },
  consent: {
    text: 'Përdorim cookies për analitikë dhe matjen e reklamave.',
    accept: 'Pranoj',
    decline: 'Refuzoj',
  },
  quiz: {
    progress: '{pct}% e përfunduar',
    intro: 'Përgjigju 8 pyetjeve të shkurtra (rreth 60 sekonda) dhe merr planin tënd për lëkurë me pamje më të re, më shumë dëshirë dhe energji çdo ditë.',
    questions: {
      gender: {
        title: 'Si e identifikon veten?',
        options: { male: 'Burrë', female: 'Grua', other: 'Preferoj të mos e them' },
      },
      age: {
        title: 'Sa vjeç je?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: 'Çfarë të shqetëson më shumë tani?',
        options: {
          skin: 'Lëkura po humb fortësinë',
          energy: 'Pak energji',
          libido: 'Më pak dëshirë / vitalitet',
          joints: 'Nyje të ngurta ose me dhimbje',
          all: 'Pak nga të gjitha',
        },
      },
      duration: {
        title: 'Prej sa kohësh të shqetëson?',
        options: { lt6m: 'Më pak se 6 muaj', '6m-2y': '6 muaj – 2 vjet', '2y+': 'Më shumë se 2 vjet' },
      },
      history: {
        title: 'A ke marrë kolagjen më parë?',
        options: { never: 'Asnjëherë', tried: 'Po, por pa rezultat', using: 'E marr tani' },
      },
      energy: { title: 'Si është energjia jote gjatë ditës?', min: 'I/e rraskapitur', max: 'Plot energji' },
      confidence: { title: 'Sa mirë ndihesh në trupin tënd?', min: 'Aspak', max: 'Plotësisht' },
      goal: {
        title: 'Çfarë do të doje më shumë të ndjeje në 15 ditët e ardhshme?',
        options: {
          skin: 'Lëkurë me pamje më të fortë',
          energy: 'Më shumë energji',
          libido: 'Më shumë vitalitet',
          joints: 'Lëvizje më e lehtë',
          all: 'Të gjitha',
        },
      },
    },
    contact: {
      title: 'Ku ta dërgojmë planin tënd?',
      subtitle: 'Opsionale: rezultatin mund ta shohësh menjëherë edhe pa këtë.',
      name: 'Emri',
      email: 'Email',
      phone: 'Celulari (opsional, për SMS)',
      marketing: 'Më dërgoni këshilla dhe oferta me email. Mund të çregjistrohem kurdo.',
      sms: 'Më dërgoni oferta me SMS në këtë numër. Mund të aplikohen tarifa të operatorit. Përgjigju STOP për t’u çregjistruar.',
      submit: 'Shiko rezultatin tim',
      skip: 'Kapërce dhe shiko rezultatin',
      privacy: 'Nuk i shesim kurrë të dhënat e tua.',
    },
  },
  analyzing: {
    title: 'Po përgatisim planin tënd',
    steps: ['Po lexojmë 8 përgjigjet e tua…', 'Po vlerësojmë profilin tënd të kolagjenit…', 'Po shkruajmë rekomandimin tënd personal…'],
  },
  offer: {
    trust: 'Analiza përfundoi për {name} • Bazuar në 8 përgjigjet e tua',
    trustAnon: 'Analiza përfundoi • Bazuar në 8 përgjigjet e tua',
    hero: {
      fallback: {
        woman: 'Lëkura me pamje më të fortë dhe energjia e qëndrueshme fillojnë me atë që i jep trupit çdo ditë',
        man: 'Ndihu sërish gati për ditën: kolagjen i përditshëm për nyjet, lëkurën dhe energji të qëndrueshme',
        senior: 'Pas të 50-ave trupi prodhon më pak kolagjen. Rutina jote e përditshme mund ta kompensojë',
      },
      sub: 'Rituali yt i përditshëm i rinisë: një formulë me kolagjen + peptide për ata që duan lëkurë me pamje më të re, më shumë dëshirë dhe më shumë energji, e përshtatur sipas përgjigjeve të tua.',
      cta: 'Shiko planin e rekomanduar',
    },
    vsl: {
      title: 'Shiko: çfarë kuptimi kanë përgjigjet e tua',
      unavailable: 'Videoja nuk është e disponueshme tani. Gjithçka që të duhet është më poshtë.',
      cta: 'Dua planin tim',
      resume: 'Po vazhdojmë aty ku e le',
    },
    diagnosis: {
      title: 'Vlerësimi yt i kolagjenit',
      body: 'Që nga rreth mosha 25 vjeç, trupi prodhon afërsisht 1% më pak kolagjen çdo vit. Në moshën tënde kjo është rreth {pct}% më pak se në 25 vjeç.',
      note: 'Vlerësim ilustrues bazuar në një mesatare të cituar shpesh, jo matje mjekësore.',
    },
    bullets: {
      title: 'Çfarë do të thotë kjo për ty',
      items: {
        skin: [
          'Peptidet e kolagjenit u lidhën me elasticitet më të mirë të lëkurës në studime me placebo',
          'Një dozë e thjeshtë ditore që përshtatet me mëngjesin tënd',
          'Për lëkurën që ka nisur të humbasë fortësinë',
        ],
        energy: [
          'Dozë ditore e pasur me proteina për të mbështetur rutinën tënde',
          'Pa stimulues, pra pa rënie më vonë',
          'Shkon mirë me gjumin, ujin dhe lëvizjen për ditë më të qëndrueshme',
        ],
        libido: [
          'Të ndihesh mirë në lëkurën tënde është pjesë e dëshirës',
          'Një ritual i përditshëm kujdesi për veten që mbështet vetëbesimin',
          'Pa hormone dhe pa stimulues',
        ],
        joints: [
          'Kolagjeni i hidrolizuar u studiua për shqetësimet e nyjeve të lidhura me aktivitetin',
          'Mbështetje për kërcin dhe indin lidhor që përdor çdo ditë',
          'I lehtë për t’u marrë çdo ditë, dhe kjo ka rëndësi',
        ],
        all: [
          'Një dozë ditore për lëkurën, nyjet dhe mirëqenien e përgjithshme',
          'Peptide kolagjeni dhe një përzierje peptidesh',
          'Krijuar për rutinën që ke tashmë',
        ],
      },
    },
    pillars: {
      title: 'Një ritual i përditshëm, tri synime',
      items: [
        { title: 'Lëkurë me pamje më të re', body: 'Peptidet e kolagjenit u lidhën me elasticitet dhe hidratim më të mirë të lëkurës në studime me placebo.' },
        { title: 'Dëshirë dhe vitalitet', body: 'Të ndihesh mirë në trupin tënd është pjesë e dëshirës. Një ritual i përditshëm kujdesi për veten për burra dhe gra, pa hormone dhe pa stimulues.' },
        { title: 'Energji për ditën tënde', body: 'Një dozë ditore e pasur me proteina që përshtatet me mëngjesin tënd, pa stimulues dhe pa rënie.' },
      ],
      note: 'Rezultatet ndryshojnë. RENOVA CELL është shtesë ushqimore, jo ilaç.',
    },
    science: {
      title: 'Çfarë thonë kërkimet',
      flip: 'Prek për të parë burimin',
      cards: [
        {
          title: 'Elasticiteti i lëkurës',
          finding:
            '69 gra morën 2,5 g ose 5 g peptide specifike kolagjeni ose placebo për 8 javë. Elasticiteti i lëkurës u përmirësua krahasuar me placebon.',
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Rehatia e nyjeve',
          finding:
            'Gjatë 24 javëve, atletët që merrnin 10 g kolagjen të hidrolizuar në ditë raportuan më pak dhimbje nyjesh gjatë aktivitetit se grupi me placebo.',
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'Pamja e plotë',
          finding:
            'Një meta-analizë e 26 studimeve të rastësishme (1.721 pjesëmarrës) gjeti përmirësim të hidratimit dhe elasticitetit të lëkurës krahasuar me placebon.',
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'Studimet testuan formula specifike kolagjeni; rezultatet mund të mos vlejnë për çdo produkt, përfshirë këtë.',
    },
    timeline: {
      title: 'Çfarë të presësh',
      steps: [
        { day: 'Dita 1', title: 'Nis ritualin', body: 'Një dozë në ditë. Ajo që ka rëndësi është rregullsia.' },
        { day: 'Dita 5', title: 'Bëje zakon', body: 'E njëjta orë, i njëjti vend. Zakoni forcohet.' },
        { day: 'Dita 15', title: 'Ndalo për një çast', body: 'Vër re si ndihesh dhe mbaje zakonin.' },
        { day: 'Dita 30', title: 'Një muaj', body: 'Vazhdo. Studimet matën ndryshimet e lëkurës pas 4 deri në 12 javësh.' },
        { day: 'Dita 90', title: 'Cikël i plotë', body: 'Periudha që shqyrtuan shumica e kërkimeve. Koha për krahasim.' },
      ],
    },
    beforeAfter: {
      title: 'Klientë të vërtetë',
      before: 'Para',
      after: 'Pas',
      note: 'Foto të papërpunuara, të ndara me leje. Rezultatet ndryshojnë.',
    },
    testimonials: {
      title: 'Njerëz si ti',
      note: 'Klientë të vërtetë, ndarë me leje. Rezultatet ndryshojnë.',
    },
    simulator: {
      title: 'Kurba jote e kolagjenit',
      label: 'Mosha jote',
      yAxis: 'Kolagjeni i vlerësuar krahasuar me 25 vjeç (%)',
      you: 'Ti',
      note: 'Ilustrim i rënies së cituar shpesh prej ~1% në vit pas të 25-ave. Nuk është parashikim i rezultateve të produktit.',
    },
    comparison: {
      title: 'RENOVA CELL kundrejt një kolagjeni të zakonshëm',
      us: 'RENOVA CELL',
      them: 'Kolagjen i zakonshëm',
      rows: [
        { label: 'Peptide kolagjeni të hidrolizuara', us: 'yes', them: 'yes' },
        { label: 'Përzierje peptidesh e shtuar', us: 'yes', them: 'no' },
        { label: 'Plan sipas kuizit tënd', us: 'yes', them: 'no' },
        { label: 'Garanci kthimi parash 30 ditë', us: 'yes', them: 'varies' },
      ],
      varies: 'Ndryshon',
    },
    pricing: {
      perMonth: '/muaj',
      once: 'Blerje e njëhershme',
      subscribe: 'Abonim: vjen sërish kur mbaron',
      interval: { m1: 'çdo muaj', m3: 'çdo 3 muaj', m6: 'çdo 6 muaj' },
      title: 'Zgjidh planin tënd',
      recommended: 'I rekomanduar për ty',
      perUnit: '{price} për copë',
      save: 'Kurse {pct}%',
      plans: {
        single: { name: '1 copë', desc: 'Provoje për një muaj' },
        kit3: { name: 'Kit 3', desc: 'Cikli 90-ditor i shumicës së studimeve' },
        kit6: { name: 'Kit 6', desc: 'Furnizim për 6 muaj' },
      },
      recurring: 'Tarifojmë {price} {interval} derisa ta anulosh. Anuloje kurdo përmes faturës në email.',
      cta: 'Zgjidh këtë plan',
    },
    shipping: { free: 'Transport falas', fast: 'Dorëzim brenda 2 ditëve pune', discreet: 'Paketim diskret', tracked: 'Dorëzim me gjurmim' },
    bonus: {
      title: 'Përfshihet me Kit 3 dhe Kit 6',
      items: ['E-libër: Rutina e kolagjenit', 'Plan ushqimor 15-ditor', 'Grup VIP për klientët'],
    },
    guarantee: {
      title: 'Garanci kthimi parash 30 ditë',
      body: 'Provoje për 30 ditë. Nëse nuk je i/e kënaqur, na shkruaj dhe të kthejmë paratë e porosisë pa pyetje.',
    },
    faq: {
      title: 'Pyetje',
      items: {
        different: {
          q: 'E kam provuar kolagjenin dhe nuk vura re asgjë. Pse do të ishte ndryshe tani?',
          a: 'Shumë njerëz ndalojnë pas disa javësh. Shumica e studimeve zgjatën 8 deri në 12 javë me dozë ditore, ndaj rekomandojmë Kit 3 për 90 ditë. Dhe nëse nuk të përshtatet, vlen garancia 30-ditore.',
        },
        time: {
          q: 'Sa shpejt do të shoh rezultate?',
          a: 'Secili është ndryshe. Kërkimet matën ndryshimet e lëkurës pas 4 deri në 12 javësh përdorimi të përditshëm. Jepi të paktën një cikël të plotë.',
        },
        safe: {
          q: 'A është i sigurt për mua?',
          a: 'Kolagjeni është proteinë ushqimore që zakonisht tolerohet mirë. Nëse je shtatzënë, ushqen me gji, merr ilaçe ose ke ndonjë gjendje shëndetësore, fillimisht konsultohu me mjekun.',
        },
        men: {
          q: 'A është edhe për burra?',
          a: 'Po. Kolagjeni mbështet lëkurën dhe nyjet te të gjithë. Nuk pretendojmë se ndikon te hormonet.',
        },
        how: {
          q: 'Si merret?',
          a: 'Një dozë në ditë, e përzier në ujë, kafe ose smoothie. Më mirë çdo ditë në të njëjtën orë.',
        },
        cancel: {
          q: 'Si ta anuloj një abonim?',
          a: 'Përdor lidhjen në çdo email me faturë ose na shkruaj. Mund ta anulosh kurdo, pa tarifa.',
        },
        shipping: {
          q: 'Si funksionon transporti?',
          a: 'Transporti është falas për të gjitha vendet ku dërgojmë. Dorëzimi zgjat jo më shumë se 2 ditë pune, me gjurmim, në paketim të thjeshtë e diskret, pa emrin e produktit nga jashtë. Lidhja e gjurmimit dërgohet me email sapo porosia të niset.',
          aStandard: 'Transporti është falas për të gjitha vendet ku dërgojmë. Porositë nisen me gjurmim, në paketim të thjeshtë e diskret, pa emrin e produktit nga jashtë. Afati i parashikuar për vendin tënd shfaqet gjatë pagesës, dhe lidhja e gjurmimit dërgohet me email sapo porosia të niset.',
        },
      },
    },
    sticky: { cta: 'Dua planin tim' },
    exit: {
      title: 'Prit: 10% zbritje para se të ikësh',
      body: 'Përdor këtë kod gjatë pagesës:',
      code: 'RENOVA10',
      cta: 'Përdor zbritjen 10%',
      dismiss: 'Jo, faleminderit',
    },
    chat: {
      title: 'Pyet Elenën',
      subtitle: 'Asistente AI · jo mjeke',
      greeting: 'Përshëndetje! Jam Elena, asistentja AI e RENOVA CELL. Më pyet çdo gjë për produktin ose planin tënd.',
      placeholder: 'Shkruaj pyetjen tënde…',
      send: 'Dërgo',
      error: 'Na vjen keq, diçka shkoi keq. Provo përsëri.',
      open: 'Hap bisedën',
      close: 'Mbyll bisedën',
    },
    social: { ordered: 'Porosi në 24 orët e fundit: {count}' },
    footer: {
      privacy: 'Privatësia',
      terms: 'Kushtet',
      contact: 'Kontakt',
      rights: 'Të gjitha të drejtat të rezervuara.',
    },
  },
  checkout: {
    steps: ['Shporta', 'Të dhënat e tua', 'Pagesa'],
    cart: {
      title: 'Porosia jote',
      bumpTitle: '+1 copë shtesë për {price}',
      bumpBody: 'Vetëm në këtë faqe: shto edhe një copë me çmim më të ulët.',
      coupon: 'Kodi i zbritjes',
      couponPlaceholder: 'Shkruaj kodin',
      apply: 'Apliko',
      hint: 'Pst… provo RENOVA10',
      valid: 'Kodi u aplikua: {pct}% zbritje',
      invalid: 'Ky kod nuk është i vlefshëm.',
      total: 'Totali',
      discountNote: 'Zbritja aplikohet në pagesë',
      shipping: 'Transporti',
      free: 'Falas',
    },
    info: {
      title: 'Të dhënat e tua',
      name: 'Emri i plotë',
      email: 'Email',
      newsletter: 'Më dërgoni këshilla kundër plakjes me email',
      addressNote: 'Adresën e dërgesës do ta shkruash në faqen e sigurt të pagesës (me plotësim automatik).',
    },
    payment: {
      title: 'Pagesa',
      body: 'Do ta përfundosh në faqen e sigurt të Stripe. Karta, Apple Pay, Google Pay dhe mënyra të tjera shfaqen atje kur janë të disponueshme në vendin tënd.',
      installments: 'Opsionet e pagesës me këste shfaqen në pagesë kur janë të disponueshme.',
      pay: 'Paguaj në mënyrë të sigurt',
      redirecting: 'Po hapim pagesën e sigurt…',
      error: 'Nuk mundëm ta nisim pagesën. Provo përsëri.',
      ssl: 'Enkriptim SSL',
      guarantee: 'Garanci 30 ditë',
      stripe: 'Pagesa përmes Stripe',
    },
  },
  upsell1: {
    title: 'Porosia jote u konfirmua. Edhe një gjë…',
    body: 'Shto një Kit 6 (blerje e njëhershme) me 45% zbritje për rutinën 6-mujore. Oferta vlen vetëm në këtë faqe.',
    accept: 'Po, shto Kit 6 për {price}',
    decline: 'Jo, faleminderit',
    charge: 'Karta jote e ruajtur do të tarifohet një herë me {price}. Nuk është abonim.',
  },
  upsell2: {
    title: 'Mos mbetu kurrë pa, dhe paguaj 30% më pak',
    body: 'Merr Kit 3 çdo 3 muaj për {price} në vend të {full}. Zbritja vlen sa kohë je i/e abonuar.',
    accept: 'Po, abonohu për {price} çdo 3 muaj',
    decline: 'Jo, faleminderit',
    charge: 'Karta jote e ruajtur do të tarifohet {price} sot dhe çdo 3 muaj derisa ta anulosh. Anuloje kurdo.',
  },
  upsell: {
    processing: 'Po përpunohet…',
    error: 'Nuk u përfundua. Nuk u tarifove.',
    action: 'Banka jote duhet ta konfirmojë këtë pagesë. Vazhdo në faqen e sigurt.',
  },
  thankYou: {
    title: 'Faleminderit{name}!',
    body: 'Porosia jote u konfirmua. Fatura po vjen në emailin tënd.',
    howTo: 'Si të fillosh',
    steps: ['Merr një dozë çdo mëngjes.', 'Përzieje në ujë, kafe ose smoothie.', 'Vazhdo deri në fund të ciklit.'],
    vip: { title: 'Grupi VIP', body: 'Këshilla, receta dhe mbështetje nga klientë të tjerë.', cta: 'Bashkohu me grupin' },
    referral: {
      title: 'Ndaje me një mik',
      body: 'Dërgo lidhjen tënde. Kush e përdor merr 10% zbritje me kodin RENOVA10.',
      copy: 'Kopjo lidhjen',
      copied: 'U kopjua!',
    },
    order: 'Përmbledhja e porosisë',
  },
  neutral: {
    intro: 'Përgjigju 8 pyetjeve të shkurtra (rreth 60 sekonda) dhe merr planin tënd për lëkurë me pamje më të re dhe energji çdo ditë.',
    painLibido: 'Më pak vitalitet',
    heroSub: 'Rituali yt i përditshëm: një formulë me kolagjen + peptide për ata që duan lëkurë me pamje më të re dhe më shumë energji, e përshtatur sipas përgjigjeve të tua.',
    bullet: 'Të ndihesh mirë në trupin tënd fillon me kujdesin e përditshëm për veten',
    pillar: { title: 'Vitalitet dhe vetëbesim', body: 'Të ndihesh mirë në trupin tënd është pjesë e vetëbesimit. Një ritual i përditshëm kujdesi për veten për burra dhe gra, pa hormone dhe pa stimulues.' },
  },
  emails: {
    footer: 'E merr këtë mesazh sepse plotësove kuizin RENOVA CELL.',
    unsubscribe: 'Çregjistrohu',
    diagnosis: {
      subject: '{name}, plani yt RENOVA CELL',
      body: 'Ky është rezultati yt: {diagnosis}\n\nPlani yt i rekomanduar është {plan}. Shikoje këtu: {link}',
    },
    vsl: {
      subject: 'Videoja 2-minutëshe për profilin tënd',
      body: 'Përgatitëm një video të shkurtër për kuptimin e përgjigjeve të tua. Shikoje këtu: {link}',
    },
    sms: { body: 'RENOVA CELL: 10% zbritje për planin tënd me kodin RENOVA10 → {link} Përgjigju STOP për t’u çregjistruar.' },
    socialProof: {
      subject: 'Pse njerëzit vazhdojnë',
      body: 'Shumica e studimeve për kolagjenin zgjatën 8 deri në 12 javë. Prandaj Kit 3 për 90 ditë është plani ynë më i zgjedhur. Plani yt: {link}',
    },
    lastChance: {
      subject: 'Kodi yt i zbritjes 10% po të pret ende',
      body: 'Kodi yt RENOVA10 po të pret ende. Përdore këtu: {link}',
    },
    story: {
      subject: 'Zakone të vogla, ndryshim i madh',
      body: 'Rutina më e mirë është ajo që e mban. Një dozë në ditë, çdo ditë. Kur të jesh gati: {link}',
    },
  },
};
