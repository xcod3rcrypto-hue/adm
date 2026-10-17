import type { Dictionary } from './en';

export const lv: Dictionary = {
  common: {
    brand: 'RENOVA CELL',
    back: 'Atpakaļ',
    next: 'Tālāk',
    continue: 'Turpināt',
    skip: 'Izlaist',
    loading: 'Ielādē…',
    language: 'Valoda',
    resultsVary: 'Rezultāti katram ir atšķirīgi.',
    fdaDisclaimer:
      'Šos apgalvojumus nav izvērtējusi ASV Pārtikas un zāļu pārvalde (FDA). Šis produkts nav paredzēts nevienas slimības diagnosticēšanai, ārstēšanai, izārstēšanai vai profilaksei.',
    euDisclaimer:
      'Uztura bagātinātājs nav uzskatāms par daudzveidīga un sabalansēta uztura un veselīga dzīvesveida aizstājēju. Nepārsniegt ieteicamo dienas devu. Uzglabāt maziem bērniem nepieejamā vietā.',
  },
  consent: {
    text: 'Mēs izmantojam sīkdatnes analītikai un reklāmu mērīšanai.',
    accept: 'Piekrītu',
    decline: 'Noraidīt',
  },
  quiz: {
    progress: 'Paveikti {pct}%',
    intro: 'Atbildiet uz 8 īsiem jautājumiem (apmēram 60 sekundes) un saņemiet savu plānu jaunāka izskata ādai, lielākai vēlmei un ikdienas enerģijai.',
    questions: {
      gender: {
        title: 'Kā jūs sevi identificējat?',
        options: { male: 'Vīrietis', female: 'Sieviete', other: 'Negribu teikt' },
      },
      age: {
        title: 'Cik jums ir gadu?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: 'Kas jūs šobrīd traucē visvairāk?',
        options: {
          skin: 'Āda zaudē stingrību',
          energy: 'Maz enerģijas',
          libido: 'Mazāka vēlme / dzīvesspars',
          joints: 'Stīvas vai sāpīgas locītavas',
          all: 'Pa druskai no visa',
        },
      },
      duration: {
        title: 'Cik ilgi tas jūs traucē?',
        options: { lt6m: 'Mazāk nekā 6 mēnešus', '6m-2y': '6 mēneši – 2 gadi', '2y+': 'Vairāk nekā 2 gadus' },
      },
      history: {
        title: 'Vai iepriekš esat lietojuši kolagēnu?',
        options: { never: 'Nekad', tried: 'Jā, bet bez rezultāta', using: 'Lietoju tagad' },
      },
      energy: { title: 'Kāda ir jūsu enerģija dienas laikā?', min: 'Izsīkums', max: 'Enerģijas pilna' },
      confidence: { title: 'Cik labi jūtaties savā ķermenī?', min: 'Nemaz', max: 'Pilnīgi' },
      goal: {
        title: 'Ko jūs visvairāk vēlētos sajust nākamajās 15 dienās?',
        options: {
          skin: 'Stingrāka izskata āda',
          energy: 'Vairāk enerģijas',
          libido: 'Vairāk dzīvesspara',
          joints: 'Vieglāka kustība',
          all: 'Visu',
        },
      },
    },
    contact: {
      title: 'Kur nosūtīt jūsu plānu?',
      subtitle: 'Nav obligāti: rezultātu redzēsiet uzreiz arī bez tā.',
      name: 'Vārds',
      email: 'E-pasts',
      phone: 'Mobilais (nav obligāti, SMS ziņām)',
      marketing: 'Sūtiet man padomus un piedāvājumus e-pastā. Atteikties varu jebkurā laikā.',
      sms: 'Sūtiet man piedāvājumus SMS uz šo numuru. Var tikt piemērota operatora maksa. Lai atteiktos, atbildiet STOP.',
      submit: 'Rādīt manu rezultātu',
      skip: 'Izlaist un rādīt rezultātu',
      privacy: 'Mēs nekad nepārdodam jūsu datus.',
    },
  },
  analyzing: {
    title: 'Gatavojam jūsu plānu',
    steps: ['Lasām jūsu 8 atbildes…', 'Novērtējam jūsu kolagēna profilu…', 'Rakstām jūsu personīgo ieteikumu…'],
  },
  offer: {
    trust: 'Analīze pabeigta: {name} • Pēc jūsu 8 atbildēm',
    trustAnon: 'Analīze pabeigta • Pēc jūsu 8 atbildēm',
    hero: {
      fallback: {
        woman: 'Stingrāka izskata āda un vienmērīga enerģija sākas ar to, ko katru dienu dodat savam ķermenim',
        man: 'Atkal jūtieties gatavs dienai: ikdienas kolagēns locītavām, ādai un vienmērīgai enerģijai',
        senior: 'Pēc 50 gadiem organisms ražo mazāk kolagēna. Jūsu ikdienas rutīna to var kompensēt',
      },
      sub: 'Jūsu ikdienas jaunības rituāls: kolagēna + peptīdu formula tiem, kas vēlas jaunāka izskata ādu, lielāku vēlmi un vairāk enerģijas, pielāgota jūsu atbildēm.',
      cta: 'Rādīt ieteikto plānu',
    },
    vsl: {
      title: 'Noskatieties: ko nozīmē jūsu atbildes',
      unavailable: 'Video šobrīd nav pieejams. Viss nepieciešamais ir zemāk.',
      cta: 'Gribu savu plānu',
      resume: 'Turpinām no vietas, kur apstājāties',
    },
    diagnosis: {
      title: 'Jūsu kolagēna novērtējums',
      body: 'Aptuveni no 25 gadu vecuma organisms katru gadu saražo apmēram par 1% mazāk kolagēna. Jūsu vecumā tas ir aptuveni par {pct}% mazāk nekā 25 gados.',
      note: 'Ilustratīvs novērtējums, kura pamatā ir bieži minēts vidējais rādītājs, nevis medicīnisks mērījums.',
    },
    bullets: {
      title: 'Ko tas nozīmē jums',
      items: {
        skin: [
          'Kolagēna peptīdi placebo kontrolētos pētījumos tika saistīti ar labāku ādas elastību',
          'Vienkārša ikdienas deva, kas iederas jūsu rītā',
          'Ādai, kas sāk zaudēt stingrību',
        ],
        energy: [
          'Olbaltumvielām bagāta ikdienas deva jūsu rutīnas atbalstam',
          'Bez stimulantiem, tāpēc vēlāk nav krituma',
          'Saskan ar miegu, ūdeni un kustībām vienmērīgākām dienām',
        ],
        libido: [
          'Laba pašsajūta savā ādā ir daļa no vēlmes',
          'Ikdienas rūpju par sevi rituāls, kas atbalsta pašpārliecību',
          'Bez hormoniem un bez stimulantiem',
        ],
        joints: [
          'Kolagēna hidrolizāts tika pētīts ar aktivitāti saistītā locītavu diskomforta gadījumā',
          'Atbalsts skrimšļiem un saistaudiem, ko lietojat katru dienu',
          'Viegli lietot katru dienu, un tas ir galvenais',
        ],
        all: [
          'Viena ikdienas deva ādai, locītavām un vispārējai labsajūtai',
          'Kolagēna peptīdi un peptīdu maisījums',
          'Radīts jūsu jau esošajai rutīnai',
        ],
      },
    },
    pillars: {
      title: 'Viens ikdienas rituāls, trīs mērķi',
      items: [
        { title: 'Jaunāka izskata āda', body: 'Kolagēna peptīdi placebo kontrolētos pētījumos tika saistīti ar labāku ādas elastību un mitrumu.' },
        { title: 'Vēlme un dzīvesspars', body: 'Laba pašsajūta savā ķermenī ir daļa no vēlmes. Ikdienas rūpju par sevi rituāls vīriešiem un sievietēm, bez hormoniem un bez stimulantiem.' },
        { title: 'Enerģija jūsu dienai', body: 'Olbaltumvielām bagāta ikdienas deva, kas iederas jūsu rītā, bez stimulantiem un bez kritumiem.' },
      ],
      note: 'Rezultāti atšķiras. RENOVA CELL ir uztura bagātinātājs, nevis zāles.',
    },
    science: {
      title: 'Ko saka pētījumi',
      flip: 'Pieskarieties, lai redzētu avotu',
      cards: [
        {
          title: 'Ādas elastība',
          finding:
            '69 sievietes 8 nedēļas lietoja 2,5 g vai 5 g specifisku kolagēna peptīdu vai placebo. Ādas elastība uzlabojās salīdzinājumā ar placebo.',
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Locītavu komforts',
          finding:
            '24 nedēļu laikā sportisti, kas lietoja 10 g kolagēna hidrolizāta dienā, ziņoja par mazākām ar aktivitāti saistītām locītavu sāpēm nekā placebo grupa.',
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'Plašāks skatījums',
          finding:
            '26 randomizētu pētījumu (1721 dalībnieks) metaanalīze konstatēja ādas mitruma un elastības uzlabošanos salīdzinājumā ar placebo.',
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'Pētījumos tika testētas konkrētas kolagēna formulas; rezultāti var neattiekties uz katru produktu, arī uz šo.',
    },
    timeline: {
      title: 'Ko sagaidīt',
      steps: [
        { day: '1. diena', title: 'Sāciet rituālu', body: 'Viena deva dienā. Svarīga ir regularitāte.' },
        { day: '5. diena', title: 'Padariet to par ieradumu', body: 'Tas pats laiks, tā pati vieta. Ieradums nostiprinās.' },
        { day: '15. diena', title: 'Apstājieties uz brīdi', body: 'Pievērsiet uzmanību pašsajūtai un turieties pie ieraduma.' },
        { day: '30. diena', title: 'Viens mēnesis', body: 'Turpiniet. Pētījumi mērīja ādas izmaiņas pēc 4–12 nedēļām.' },
        { day: '90. diena', title: 'Pilns cikls', body: 'Periods, ko aplūkoja vairums pētījumu. Laiks salīdzināt.' },
      ],
    },
    beforeAfter: {
      title: 'Īsti klienti',
      before: 'Pirms',
      after: 'Pēc',
      note: 'Nerediģēti foto, publicēti ar atļauju. Rezultāti atšķiras.',
    },
    testimonials: {
      title: 'Cilvēki kā jūs',
      note: 'Īsti klienti, publicēts ar atļauju. Rezultāti atšķiras.',
    },
    simulator: {
      title: 'Jūsu kolagēna līkne',
      label: 'Jūsu vecums',
      yAxis: 'Aptuvenais kolagēns pret 25 gadiem (%)',
      you: 'Jūs',
      note: 'Bieži minētā ~1% gada krituma pēc 25 gadiem ilustrācija. Tā nav produkta rezultātu prognoze.',
    },
    comparison: {
      title: 'RENOVA CELL pret parastu kolagēnu',
      us: 'RENOVA CELL',
      them: 'Parasts kolagēns',
      rows: [
        { label: 'Hidrolizēti kolagēna peptīdi', us: 'yes', them: 'yes' },
        { label: 'Pievienots peptīdu maisījums', us: 'yes', them: 'no' },
        { label: 'Plāns pēc jūsu testa', us: 'yes', them: 'no' },
        { label: '30 dienu naudas atmaksas garantija', us: 'yes', them: 'varies' },
      ],
      varies: 'Atšķiras',
    },
    pricing: {
      perMonth: '/mēn.',
      once: 'Vienreizējs pirkums',
      subscribe: 'Abonements: piegādāsim atkal, kad beigsies',
      interval: { m1: 'katru mēnesi', m3: 'ik pēc 3 mēnešiem', m6: 'ik pēc 6 mēnešiem' },
      title: 'Izvēlieties plānu',
      recommended: 'Ieteikts jums',
      perUnit: '{price} par gabalu',
      save: 'Ietaupiet {pct}%',
      plans: {
        single: { name: '1 gab.', desc: 'Izmēģiniet mēnesi' },
        kit3: { name: 'Kit 3', desc: 'Vairuma pētījumu 90 dienu cikls' },
        kit6: { name: 'Kit 6', desc: 'Krājums 6 mēnešiem' },
      },
      recurring: 'Ieturam {price} {interval}, līdz atceļat. Atcelt varat jebkurā laikā, izmantojot e-pasta kvīti.',
      cta: 'Izvēlēties šo plānu',
    },
    shipping: { free: 'Bezmaksas piegāde', fast: 'Piegāde līdz 2 darba dienām', discreet: 'Diskrēts iepakojums', tracked: 'Piegāde ar izsekošanu' },
    bonus: {
      title: 'Iekļauts Kit 3 un Kit 6',
      items: ['E-grāmata: Kolagēna rutīna', '15 dienu ēdienkarte', 'VIP klientu grupa'],
    },
    guarantee: {
      title: '30 dienu naudas atmaksas garantija',
      body: 'Izmēģiniet 30 dienas. Ja neesat apmierināti, uzrakstiet mums, un mēs bez jautājumiem atmaksāsim pasūtījuma summu.',
    },
    faq: {
      title: 'Jautājumi',
      items: {
        different: {
          q: 'Esmu jau mēģinājis(-usi) kolagēnu un neko nepamanīju. Kāpēc tagad būtu citādi?',
          a: 'Daudzi pārtrauc pēc dažām nedēļām. Vairums pētījumu ilga 8–12 nedēļas ar ikdienas devu, tāpēc iesakām 90 dienu Kit 3. Un, ja jums tas neder, ir spēkā 30 dienu garantija.',
        },
        time: {
          q: 'Cik ātri redzēšu rezultātus?',
          a: 'Visi ir atšķirīgi. Pētījumi mērīja ādas izmaiņas pēc 4–12 nedēļu ikdienas lietošanas. Dodiet tam vismaz vienu pilnu ciklu.',
        },
        safe: {
          q: 'Vai tas man ir drošs?',
          a: 'Kolagēns ir pārtikas olbaltumviela, ko parasti labi panes. Ja esat stāvoklī, barojat ar krūti, lietojat zāles vai jums ir veselības problēmas, vispirms konsultējieties ar ārstu.',
        },
        men: {
          q: 'Vai tas der arī vīriešiem?',
          a: 'Jā. Kolagēns atbalsta ikviena ādu un locītavas. Mēs neapgalvojam, ka tas maina hormonus.',
        },
        how: {
          q: 'Kā to lietot?',
          a: 'Viena deva dienā, izmaisīta ūdenī, kafijā vai smūtijā. Vislabāk katru dienu vienā laikā.',
        },
        cancel: {
          q: 'Kā atcelt abonementu?',
          a: 'Izmantojiet saiti jebkurā kvīts e-pastā vai uzrakstiet mums. Atcelt varat jebkurā laikā bez maksas.',
        },
        shipping: {
          q: 'Kā notiek piegāde?',
          a: 'Piegāde ir bez maksas uz visām valstīm, kurās piegādājam. Piegāde aizņem ne vairāk kā 2 darba dienas, ar izsekošanu, vienkāršā, diskrētā iepakojumā bez produkta nosaukuma ārpusē. Izsekošanas saite tiek nosūtīta e-pastā, tiklīdz pasūtījums ir nosūtīts.',
          aStandard: 'Piegāde ir bez maksas uz visām valstīm, kurās piegādājam. Pasūtījumi tiek nosūtīti ar izsekošanu, vienkāršā, diskrētā iepakojumā bez produkta nosaukuma ārpusē. Paredzamais piegādes laiks jūsu valstij redzams maksājot, un izsekošanas saite tiek nosūtīta e-pastā, tiklīdz pasūtījums ir nosūtīts.',
        },
      },
    },
    sticky: { cta: 'Gribu savu plānu' },
    exit: {
      title: 'Pagaidiet: 10% atlaide pirms aiziešanas',
      body: 'Izmantojiet šo kodu, norēķinoties:',
      code: 'RENOVA10',
      cta: 'Izmantot 10% atlaidi',
      dismiss: 'Nē, paldies',
    },
    chat: {
      title: 'Pajautājiet Elenai',
      subtitle: 'MI asistente · nav ārste',
      greeting: 'Sveiki! Esmu Elena, RENOVA CELL MI asistente. Jautājiet man visu par produktu vai savu plānu.',
      placeholder: 'Ierakstiet savu jautājumu…',
      send: 'Sūtīt',
      error: 'Atvainojiet, kaut kas nogāja greizi. Mēģiniet vēlreiz.',
      open: 'Atvērt tērzēšanu',
      close: 'Aizvērt tērzēšanu',
    },
    social: { ordered: 'Pasūtījumi pēdējās 24 stundās: {count}' },
    footer: {
      privacy: 'Privātums',
      terms: 'Noteikumi',
      contact: 'Kontakti',
      rights: 'Visas tiesības aizsargātas.',
    },
  },
  checkout: {
    steps: ['Grozs', 'Jūsu dati', 'Maksājums'],
    cart: {
      title: 'Jūsu pasūtījums',
      bumpTitle: '+1 papildu gabals par {price}',
      bumpBody: 'Tikai šajā lapā: pievienojiet vēl vienu gabalu par zemāku cenu.',
      coupon: 'Atlaides kods',
      couponPlaceholder: 'Ievadiet kodu',
      apply: 'Piemērot',
      hint: 'Pst… pamēģiniet RENOVA10',
      valid: 'Kods piemērots: {pct}% atlaide',
      invalid: 'Šis kods nav derīgs.',
      total: 'Kopā',
      discountNote: 'Atlaide tiks piemērota maksājot',
      shipping: 'Piegāde',
      free: 'Bez maksas',
    },
    info: {
      title: 'Jūsu dati',
      name: 'Vārds un uzvārds',
      email: 'E-pasts',
      newsletter: 'Sūtiet man pretnovecošanās padomus e-pastā',
      addressNote: 'Piegādes adresi ievadīsiet drošajā maksājumu lapā (ar automātisko aizpildīšanu).',
    },
    payment: {
      title: 'Maksājums',
      body: 'Pirkumu pabeigsiet drošajā Stripe lapā. Karte, Apple Pay, Google Pay un citi veidi tur parādīsies, ja tie ir pieejami jūsu valstī.',
      installments: 'Nomaksas iespējas parādās maksājot, ja tās ir pieejamas.',
      pay: 'Maksāt droši',
      redirecting: 'Atveram drošo maksājumu…',
      error: 'Neizdevās sākt maksājumu. Mēģiniet vēlreiz.',
      ssl: 'SSL šifrēšana',
      guarantee: '30 dienu garantija',
      stripe: 'Maksājumi caur Stripe',
    },
  },
  upsell1: {
    title: 'Jūsu pasūtījums ir apstiprināts. Vēl viena lieta…',
    body: 'Pievienojiet Kit 6 (vienreizējs pirkums) ar 45% atlaidi 6 mēnešu rutīnai. Piedāvājums tikai šajā lapā.',
    accept: 'Jā, pievienot Kit 6 par {price}',
    decline: 'Nē, paldies',
    charge: 'No jūsu saglabātās kartes vienreiz tiks ieturēti {price}. Tas nav abonements.',
  },
  upsell2: {
    title: 'Nekad nepaliksiet bez krājumiem, un maksāsiet par 30% mazāk',
    body: 'Saņemiet Kit 3 ik pēc 3 mēnešiem par {price} {full} vietā. Atlaide ir spēkā, kamēr esat abonents.',
    accept: 'Jā, abonēt par {price} ik pēc 3 mēnešiem',
    decline: 'Nē, paldies',
    charge: 'No jūsu saglabātās kartes {price} tiks ieturēti šodien un ik pēc 3 mēnešiem, līdz atcelsiet. Atcelt varat jebkurā laikā.',
  },
  upsell: {
    processing: 'Apstrādā…',
    error: 'Neizdevās pabeigt. Nauda netika ieturēta.',
    action: 'Jūsu bankai jāapstiprina šis maksājums. Turpiniet drošajā lapā.',
  },
  thankYou: {
    title: 'Paldies{name}!',
    body: 'Jūsu pasūtījums ir apstiprināts. Kvīts jau ceļo uz jūsu e-pastu.',
    howTo: 'Kā sākt',
    steps: ['Katru rītu lietojiet vienu devu.', 'Izmaisiet ūdenī, kafijā vai smūtijā.', 'Turpiniet līdz cikla beigām.'],
    vip: { title: 'VIP grupa', body: 'Padomi, receptes un citu klientu atbalsts.', cta: 'Pievienoties grupai' },
    referral: {
      title: 'Dalieties ar draugu',
      body: 'Nosūtiet savu saiti. Kas to izmantos, saņems 10% atlaidi ar kodu RENOVA10.',
      copy: 'Kopēt saiti',
      copied: 'Nokopēts!',
    },
    order: 'Pasūtījuma kopsavilkums',
  },
  neutral: {
    intro: 'Atbildiet uz 8 īsiem jautājumiem (apmēram 60 sekundes) un saņemiet savu plānu jaunāka izskata ādai un ikdienas enerģijai.',
    painLibido: 'Mazāks dzīvesspars',
    heroSub: 'Jūsu ikdienas rituāls: kolagēna + peptīdu formula tiem, kas vēlas jaunāka izskata ādu un vairāk enerģijas, pielāgota jūsu atbildēm.',
    bullet: 'Laba pašsajūta savā ķermenī sākas ar ikdienas rūpēm par sevi',
    pillar: { title: 'Dzīvesspars un pašpārliecība', body: 'Laba pašsajūta savā ķermenī ir daļa no pašpārliecības. Ikdienas rūpju par sevi rituāls vīriešiem un sievietēm, bez hormoniem un bez stimulantiem.' },
  },
  emails: {
    footer: 'Jūs saņemat šo vēstuli, jo aizpildījāt RENOVA CELL testu.',
    unsubscribe: 'Atrakstīties',
    diagnosis: {
      subject: '{name}, jūsu RENOVA CELL plāns',
      body: 'Lūk, jūsu rezultāts: {diagnosis}\n\nJums ieteiktais plāns: {plan}. Apskatiet to šeit: {link}',
    },
    vsl: {
      subject: '2 minūšu video jūsu profilam',
      body: 'Sagatavojām īsu video par to, ko nozīmē jūsu atbildes. Skatieties šeit: {link}',
    },
    sms: { body: 'RENOVA CELL: 10% atlaide jūsu plānam ar kodu RENOVA10 → {link} Lai atteiktos, atbildiet STOP.' },
    socialProof: {
      subject: 'Kāpēc cilvēki turpina',
      body: 'Vairums kolagēna pētījumu ilga 8–12 nedēļas. Tāpēc 90 dienu Kit 3 ir mūsu visbiežāk izvēlētais plāns. Jūsu plāns: {link}',
    },
    lastChance: {
      subject: 'Jūsu 10% atlaides kods joprojām gaida',
      body: 'Jūsu kods RENOVA10 joprojām gaida. Izmantojiet to šeit: {link}',
    },
    story: {
      subject: 'Mazi ieradumi, liela atšķirība',
      body: 'Labākā rutīna ir tā, pie kuras turaties. Viena deva dienā, katru dienu. Kad būsiet gatavi: {link}',
    },
  },
};
