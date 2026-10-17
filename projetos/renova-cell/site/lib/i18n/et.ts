import type { Dictionary } from './en';

export const et: Dictionary = {
  common: {
    brand: 'RENOVA CELL',
    back: 'Tagasi',
    next: 'Edasi',
    continue: 'Jätka',
    skip: 'Jäta vahele',
    loading: 'Laadimine…',
    language: 'Keel',
    resultsVary: 'Tulemused on inimestel erinevad.',
    fdaDisclaimer:
      'Neid väiteid ei ole hinnanud USA Toidu- ja Ravimiamet (FDA). See toode ei ole mõeldud ühegi haiguse diagnoosimiseks, raviks, ravimiseks ega ennetamiseks.',
    euDisclaimer:
      'Toidulisand ei asenda mitmekülgset ja tasakaalustatud toitumist ega tervislikku eluviisi. Soovitatavat päevast annust mitte ületada. Hoida väikelastele kättesaamatus kohas.',
  },
  consent: {
    text: 'Kasutame küpsiseid analüüsiks ja reklaamide mõõtmiseks.',
    accept: 'Nõustun',
    decline: 'Keeldun',
  },
  quiz: {
    progress: '{pct}% tehtud',
    intro: 'Vasta 8 lühikesele küsimusele (umbes 60 sekundit) ja saa oma plaan noorema välimusega naha, suurema iha ja igapäevase energia jaoks.',
    questions: {
      gender: {
        title: 'Kuidas sa ennast määratled?',
        options: { male: 'Mees', female: 'Naine', other: 'Ei soovi öelda' },
      },
      age: {
        title: 'Kui vana sa oled?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: 'Mis sind praegu kõige rohkem häirib?',
        options: {
          skin: 'Nahk kaotab pinguldust',
          energy: 'Vähe energiat',
          libido: 'Vähe iha / elujõudu',
          joints: 'Jäigad või valutavad liigesed',
          all: 'Natuke kõike',
        },
      },
      duration: {
        title: 'Kui kaua see on sind häirinud?',
        options: { lt6m: 'Alla 6 kuu', '6m-2y': '6 kuud – 2 aastat', '2y+': 'Üle 2 aasta' },
      },
      history: {
        title: 'Kas oled varem kollageeni võtnud?',
        options: { never: 'Mitte kunagi', tried: 'Jah, aga tulemuseta', using: 'Võtan praegu' },
      },
      energy: { title: 'Milline on sinu igapäevane energia?', min: 'Kurnatud', max: 'Energiat täis' },
      confidence: { title: 'Kui hästi sa end oma kehas tunned?', min: 'Üldse mitte', max: 'Täiesti' },
      goal: {
        title: 'Mida tahaksid järgmise 15 päeva jooksul kõige rohkem tunda?',
        options: {
          skin: 'Pinguldunuma välimusega nahk',
          energy: 'Rohkem energiat',
          libido: 'Rohkem elujõudu',
          joints: 'Kergem liikumine',
          all: 'Kõike seda',
        },
      },
    },
    contact: {
      title: 'Kuhu su plaan saata?',
      subtitle: 'Valikuline: tulemust näed kohe ka ilma selleta.',
      name: 'Eesnimi',
      email: 'E-post',
      phone: 'Mobiil (valikuline, SMS-ide jaoks)',
      marketing: 'Saatke mulle nõuandeid ja pakkumisi e-postiga. Saan igal ajal loobuda.',
      sms: 'Saatke mulle pakkumisi SMS-iga sellele numbrile. Kehtida võivad operaatori tasud. Loobumiseks vasta STOP.',
      submit: 'Näita mu tulemust',
      skip: 'Jäta vahele ja näita tulemust',
      privacy: 'Me ei müü kunagi sinu andmeid.',
    },
  },
  analyzing: {
    title: 'Koostame sinu plaani',
    steps: ['Loeme su 8 vastust…', 'Hindame su kollageeniprofiili…', 'Kirjutame su isiklikku soovitust…'],
  },
  offer: {
    trust: 'Analüüs valmis: {name} • Põhineb su 8 vastusel',
    trustAnon: 'Analüüs valmis • Põhineb su 8 vastusel',
    hero: {
      fallback: {
        woman: 'Pinguldunuma välimusega nahk ja ühtlane energia algavad sellest, mida oma kehale iga päev annad',
        man: 'Tunne end taas päevaks valmis: igapäevane kollageen liigestele, nahale ja ühtlasele energiale',
        senior: 'Pärast 50. eluaastat toodab keha vähem kollageeni. Sinu igapäevane rutiin saab seda tasakaalustada',
      },
      sub: 'Sinu igapäevane nooruserituaal: kollageeni ja peptiididega koostis neile, kes soovivad noorema välimusega nahka, rohkem iha ja rohkem energiat, sinu vastustele kohandatud.',
      cta: 'Näita soovitatud plaani',
    },
    vsl: {
      title: 'Vaata: mida su vastused tähendavad',
      unavailable: 'Video pole praegu saadaval. Kõik vajalik on allpool.',
      cta: 'Tahan oma plaani',
      resume: 'Jätkame sealt, kus pooleli jäid',
    },
    diagnosis: {
      title: 'Sinu kollageeni hinnang',
      body: 'Umbes 25. eluaastast alates toodab keha igal aastal ligikaudu 1% vähem kollageeni. Sinu vanuses teeb see umbes {pct}% vähem kui 25-aastaselt.',
      note: 'Illustreeriv hinnang, mis põhineb sageli viidatud keskmisel. See ei ole meditsiiniline mõõtmine.',
    },
    bullets: {
      title: 'Mida see sinu jaoks tähendab',
      items: {
        skin: [
          'Kollageenpeptiide seostati platseeboga kontrollitud uuringutes parema naha elastsusega',
          'Lihtne igapäevane annus, mis sobib su hommikusse',
          'Mõeldud nahale, mis hakkab pinguldust kaotama',
        ],
        energy: [
          'Valgurikas igapäevane annus su rutiini toetamiseks',
          'Ilma stimulantideta, seega hiljem ei tule langust',
          'Sobib kokku une, vee ja liikumisega ühtlasemate päevade jaoks',
        ],
        libido: [
          'Hea enesetunne oma nahas on osa ihast',
          'Igapäevane enesehoolduse rituaal, mis toetab enesekindlust',
          'Ilma hormoonide ja stimulantideta',
        ],
        joints: [
          'Kollageeni hüdrolüsaati uuriti liikumisega seotud liigesevaevuste puhul',
          'Tugi kõhrele ja sidekoele, mida kasutad iga päev',
          'Lihtne iga päev võtta ja just see loebki',
        ],
        all: [
          'Üks igapäevane annus nahale, liigestele ja üldisele heaolule',
          'Kollageenpeptiidid ja peptiidisegu',
          'Loodud sinu olemasoleva rutiini jaoks',
        ],
      },
    },
    pillars: {
      title: 'Üks igapäevane rituaal, kolm eesmärki',
      items: [
        { title: 'Noorema välimusega nahk', body: 'Kollageenpeptiide seostati platseeboga kontrollitud uuringutes naha parema elastsuse ja niiskusega.' },
        { title: 'Iha ja elujõud', body: 'Hea enesetunne oma kehas on osa ihast. Igapäevane enesehoolduse rituaal meestele ja naistele, ilma hormoonide ja stimulantideta.' },
        { title: 'Energiat päevaks', body: 'Valgurikas igapäevane annus, mis sobib su hommikusse, ilma stimulantide ja langusteta.' },
      ],
      note: 'Tulemused on erinevad. RENOVA CELL on toidulisand, mitte ravim.',
    },
    science: {
      title: 'Mida uuringud ütlevad',
      flip: 'Puuduta, et näha allikat',
      cards: [
        {
          title: 'Naha elastsus',
          finding:
            '69 naist võtsid 8 nädala jooksul 2,5 g või 5 g kindlaid kollageenpeptiide või platseebot. Naha elastsus paranes võrreldes platseeboga.',
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Liigeste mugavus',
          finding:
            '24 nädala jooksul teatasid sportlased, kes võtsid päevas 10 g kollageeni hüdrolüsaati, vähemast liikumisega seotud liigesevalust kui platseeborühm.',
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'Suurem pilt',
          finding:
            'Metaanalüüs 26 randomiseeritud uuringust (1721 osalejat) leidis naha niiskuse ja elastsuse paranemist võrreldes platseeboga.',
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'Uuringutes testiti kindlaid kollageenikoostisi; tulemused ei pruugi kehtida iga toote, sealhulgas selle kohta.',
    },
    timeline: {
      title: 'Mida oodata',
      steps: [
        { day: '1. päev', title: 'Alusta rituaali', body: 'Üks annus päevas. Loeb järjepidevus.' },
        { day: '5. päev', title: 'Tee sellest harjumus', body: 'Sama aeg, sama koht. Harjumus kinnistub.' },
        { day: '15. päev', title: 'Peatu hetkeks', body: 'Pane tähele, kuidas end tunned, ja hoia harjumusest kinni.' },
        { day: '30. päev', title: 'Üks kuu', body: 'Jätka. Uuringud mõõtsid nahamuutusi 4–12 nädala järel.' },
        { day: '90. päev', title: 'Täistsükkel', body: 'Periood, mida enamik uuringuid vaatles. Aeg võrrelda.' },
      ],
    },
    beforeAfter: {
      title: 'Päris kliendid',
      before: 'Enne',
      after: 'Pärast',
      note: 'Töötlemata fotod, jagatud loaga. Tulemused on erinevad.',
    },
    testimonials: {
      title: 'Sinusugused inimesed',
      note: 'Päris kliendid, jagatud loaga. Tulemused on erinevad.',
    },
    simulator: {
      title: 'Sinu kollageenikõver',
      label: 'Sinu vanus',
      yAxis: 'Hinnanguline kollageen vs. 25-aastaselt (%)',
      you: 'Sina',
      note: 'Sageli viidatud ~1% aastase languse illustratsioon pärast 25. eluaastat. See ei ole toote tulemuste prognoos.',
    },
    comparison: {
      title: 'RENOVA CELL vs. tavaline kollageen',
      us: 'RENOVA CELL',
      them: 'Tavaline kollageen',
      rows: [
        { label: 'Hüdrolüüsitud kollageenpeptiidid', us: 'yes', them: 'yes' },
        { label: 'Lisatud peptiidisegu', us: 'yes', them: 'no' },
        { label: 'Su testile kohandatud plaan', us: 'yes', them: 'no' },
        { label: '30-päevane raha tagasi garantii', us: 'yes', them: 'varies' },
      ],
      varies: 'Erineb',
    },
    pricing: {
      perMonth: '/kuu',
      once: 'Ühekordne ost',
      subscribe: 'Tellimus: uus saadetis, kui otsa saab',
      interval: { m1: 'iga kuu', m3: 'iga 3 kuu järel', m6: 'iga 6 kuu järel' },
      title: 'Vali oma plaan',
      recommended: 'Sulle soovitatud',
      perUnit: '{price} tükk',
      save: 'Säästad {pct}%',
      plans: {
        single: { name: '1 tk', desc: 'Proovi üks kuu' },
        kit3: { name: 'Kit 3', desc: 'Enamiku uuringute 90-päevane tsükkel' },
        kit6: { name: 'Kit 6', desc: 'Varu 6 kuuks' },
      },
      recurring: 'Võtame {price} {interval}, kuni tühistad. Tühista igal ajal e-postiga saadud kviitungi kaudu.',
      cta: 'Vali see plaan',
    },
    shipping: { free: 'Tasuta saatmine', fast: 'Kiire jälgitav tarne', discreet: 'Diskreetne pakend' },
    bonus: {
      title: 'Kit 3 ja Kit 6 juurde kuulub',
      items: ['E-raamat: kollageenirutiin', '15 päeva toidukava', 'VIP-kliendigrupp'],
    },
    guarantee: {
      title: '30-päevane raha tagasi garantii',
      body: 'Proovi 30 päeva. Kui sa pole rahul, kirjuta meile ja tagastame tellimuse eest makstud raha ilma küsimusteta.',
    },
    faq: {
      title: 'Küsimused',
      items: {
        different: {
          q: 'Proovisin varem kollageeni ega märganud midagi. Miks peaks nüüd teisiti olema?',
          a: 'Paljud lõpetavad mõne nädala järel. Enamik uuringuid kestis igapäevase annusega 8–12 nädalat, seepärast soovitame 90-päevast Kit 3. Ja kui see sulle ei sobi, kehtib 30-päevane garantii.',
        },
        time: {
          q: 'Kui kiiresti ma tulemusi näen?',
          a: 'Kõik on erinevad. Uuringud mõõtsid nahamuutusi pärast 4–12 nädalat igapäevast kasutamist. Anna sellele vähemalt üks täistsükkel.',
        },
        safe: {
          q: 'Kas see on mulle ohutu?',
          a: 'Kollageen on toiduvalk, mis sobib tavaliselt hästi. Kui oled rase, imetad, võtad ravimeid või sul on mõni terviseprobleem, räägi enne arstiga.',
        },
        men: {
          q: 'Kas see sobib ka meestele?',
          a: 'Jah. Kollageen toetab kõigi nahka ja liigeseid. Me ei väida, et see muudaks hormoone.',
        },
        how: {
          q: 'Kuidas seda võtta?',
          a: 'Üks annus päevas, segatuna vette, kohvi või smuutisse. Kõige parem on võtta iga päev samal ajal.',
        },
        cancel: {
          q: 'Kuidas tellimust tühistada?',
          a: 'Kasuta ükskõik millise kviitungi e-kirja linki või kirjuta meile. Saad tühistada igal ajal ilma tasudeta.',
        },
        shipping: {
          q: 'Kuidas saatmine toimib?',
          a: 'Saatmine on tasuta kõikidesse riikidesse, kuhu me tarnime. Tellimused saadetakse kiiresti ja jälgitavalt neutraalses, diskreetses pakendis, millel pole väljast toote nime. Jälgimislink saadetakse e-postiga kohe, kui tellimus on teele pandud.',
        },
      },
    },
    sticky: { cta: 'Tahan oma plaani' },
    exit: {
      title: 'Oota: 10% soodsamalt enne lahkumist',
      body: 'Kasuta kassas seda koodi:',
      code: 'RENOVA10',
      cta: 'Kasuta mu 10% soodustust',
      dismiss: 'Ei, aitäh',
    },
    chat: {
      title: 'Küsi Elenalt',
      subtitle: 'Tehisintellekti assistent · mitte arst',
      greeting: 'Tere! Olen Elena, RENOVA CELLi tehisintellekti assistent. Küsi minult kõike toote või oma plaani kohta.',
      placeholder: 'Kirjuta oma küsimus…',
      send: 'Saada',
      error: 'Vabandust, midagi läks valesti. Proovi uuesti.',
      open: 'Ava vestlus',
      close: 'Sulge vestlus',
    },
    social: { ordered: 'Viimase 24 tunni jooksul tellis {count} inimest' },
    footer: {
      privacy: 'Privaatsus',
      terms: 'Tingimused',
      contact: 'Kontakt',
      rights: 'Kõik õigused kaitstud.',
    },
  },
  checkout: {
    steps: ['Ostukorv', 'Sinu andmed', 'Makse'],
    cart: {
      title: 'Sinu tellimus',
      bumpTitle: '+1 lisapakk hinnaga {price}',
      bumpBody: 'Ainult sellel lehel: lisa veel üks pakk soodsama hinnaga.',
      coupon: 'Sooduskood',
      couponPlaceholder: 'Sisesta kood',
      apply: 'Rakenda',
      hint: 'Psst… proovi RENOVA10',
      valid: 'Kood rakendatud: {pct}% soodsamalt',
      invalid: 'See kood ei kehti.',
      total: 'Kokku',
      discountNote: 'Soodustus arvestatakse maksmisel',
      shipping: 'Saatmine',
      free: 'Tasuta',
    },
    info: {
      title: 'Sinu andmed',
      name: 'Täisnimi',
      email: 'E-post',
      newsletter: 'Saatke mulle e-postiga vananemisvastaseid nõuandeid',
      addressNote: 'Tarneaadressi sisestad turvalisel makselehel (automaatse täitmisega).',
    },
    payment: {
      title: 'Makse',
      body: 'Lõpetad ostu Stripe’i turvalisel lehel. Kaart, Apple Pay, Google Pay ja muud viisid ilmuvad seal, kui need on sinu riigis saadaval.',
      installments: 'Järelmaksu võimalused ilmuvad maksmisel, kui need on saadaval.',
      pay: 'Maksa turvaliselt',
      redirecting: 'Avame turvalise makse…',
      error: 'Makset ei õnnestunud alustada. Proovi uuesti.',
      ssl: 'SSL-krüpteeritud',
      guarantee: '30 päeva garantii',
      stripe: 'Maksed Stripe’i kaudu',
    },
  },
  upsell1: {
    title: 'Su tellimus on kinnitatud. Veel üks asi…',
    body: 'Lisa Kit 6 (ühekordne ost) 45% soodsamalt, 6-kuuliseks rutiiniks. Pakkumine ainult sellel lehel.',
    accept: 'Jah, lisa Kit 6 hinnaga {price}',
    decline: 'Ei, aitäh',
    charge: 'Sinu salvestatud kaardilt võetakse üks kord {price}. See ei ole tellimus.',
  },
  upsell2: {
    title: 'Ära jää kunagi ilma ja maksa 30% vähem',
    body: 'Saa Kit 3 iga 3 kuu järel hinnaga {price} hinna {full} asemel. Soodustus kehtib seni, kuni oled tellija.',
    accept: 'Jah, tellin hinnaga {price} iga 3 kuu järel',
    decline: 'Ei, aitäh',
    charge: 'Sinu salvestatud kaardilt võetakse {price} täna ja seejärel iga 3 kuu järel, kuni tühistad. Tühistada saab igal ajal.',
  },
  upsell: {
    processing: 'Töötleme…',
    error: 'See ei õnnestunud. Sinult ei võetud raha.',
    action: 'Sinu pank peab selle makse kinnitama. Jätka turvalisel lehel.',
  },
  thankYou: {
    title: 'Aitäh{name}!',
    body: 'Sinu tellimus on kinnitatud. Kviitung on teel sinu e-postkasti.',
    howTo: 'Kuidas alustada',
    steps: ['Võta iga hommik üks annus.', 'Sega vette, kohvi või smuutisse.', 'Jätka kuni tsükli lõpuni.'],
    vip: { title: 'VIP-grupp', body: 'Nõuanded, retseptid ja tugi teistelt klientidelt.', cta: 'Liitu grupiga' },
    referral: {
      title: 'Jaga sõbraga',
      body: 'Saada oma link. Kes seda kasutab, saab koodiga RENOVA10 10% soodustust.',
      copy: 'Kopeeri link',
      copied: 'Kopeeritud!',
    },
    order: 'Tellimuse kokkuvõte',
  },
  emails: {
    footer: 'Saad selle kirja, sest täitsid RENOVA CELLi testi.',
    unsubscribe: 'Loobu tellimusest',
    diagnosis: {
      subject: '{name}, sinu RENOVA CELLi plaan',
      body: 'Siin on sinu tulemus: {diagnosis}\n\nSulle soovitatud plaan on {plan}. Vaata seda siin: {link}',
    },
    vsl: {
      subject: 'Sinu profiilile tehtud 2-minutiline video',
      body: 'Tegime lühikese video sellest, mida su vastused tähendavad. Vaata seda siin: {link}',
    },
    sms: { body: 'RENOVA CELL: 10% soodsamalt sinu plaanist koodiga RENOVA10 → {link} Loobumiseks vasta STOP.' },
    socialProof: {
      subject: 'Miks inimesed jätkavad',
      body: 'Enamik kollageeniuuringuid kestis 8–12 nädalat. Seepärast on 90-päevane Kit 3 meie kõige valitum plaan. Sinu plaan: {link}',
    },
    lastChance: {
      subject: 'Sinu 10% sooduskood ootab endiselt',
      body: 'Sinu kood RENOVA10 ootab sind endiselt. Kasuta seda siin: {link}',
    },
    story: {
      subject: 'Väikesed harjumused, suur vahe',
      body: 'Parim rutiin on see, millest kinni pead. Üks annus päevas, iga päev. Kui oled valmis: {link}',
    },
  },
};
