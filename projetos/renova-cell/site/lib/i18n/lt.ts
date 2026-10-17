import type { Dictionary } from './en';

export const lt: Dictionary = {
  common: {
    brand: 'RENOVA CELL',
    back: 'Atgal',
    next: 'Toliau',
    continue: 'Tęsti',
    skip: 'Praleisti',
    loading: 'Įkeliama…',
    language: 'Kalba',
    resultsVary: 'Rezultatai kiekvienam skiriasi.',
    fdaDisclaimer:
      'Šių teiginių neįvertino JAV maisto ir vaistų administracija (FDA). Šis produktas nėra skirtas jokiai ligai diagnozuoti, gydyti, išgydyti ar jos išvengti.',
    euDisclaimer:
      'Maisto papildai negali būti vartojami kaip įvairios ir subalansuotos mitybos ir sveikos gyvensenos pakaitalas. Neviršykite rekomenduojamos paros dozės. Laikykite mažiems vaikams nepasiekiamoje vietoje.',
  },
  consent: {
    text: 'Naudojame slapukus analitikai ir reklamos matavimui.',
    accept: 'Sutinku',
    decline: 'Nesutinku',
  },
  quiz: {
    progress: 'Atlikta {pct} %',
    intro: 'Atsakykite į 8 trumpus klausimus (apie 60 sekundžių) ir gaukite savo planą jaunesnės išvaizdos odai, didesniam norui ir kasdienei energijai.',
    questions: {
      gender: {
        title: 'Kaip save identifikuojate?',
        options: { male: 'Vyras', female: 'Moteris', other: 'Nenoriu sakyti' },
      },
      age: {
        title: 'Kiek jums metų?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: 'Kas jus dabar labiausiai vargina?',
        options: {
          skin: 'Oda praranda stangrumą',
          energy: 'Mažai energijos',
          libido: 'Mažiau noro / gyvybingumo',
          joints: 'Sustingę ar skaudantys sąnariai',
          all: 'Po truputį visko',
        },
      },
      duration: {
        title: 'Kiek laiko tai jus vargina?',
        options: { lt6m: 'Mažiau nei 6 mėnesius', '6m-2y': '6 mėnesius – 2 metus', '2y+': 'Daugiau nei 2 metus' },
      },
      history: {
        title: 'Ar anksčiau vartojote kolageną?',
        options: { never: 'Niekada', tried: 'Taip, bet be rezultatų', using: 'Vartoju dabar' },
      },
      energy: { title: 'Kokia jūsų energija per dieną?', min: 'Išsekimas', max: 'Pilna energijos' },
      confidence: { title: 'Kaip gerai jaučiatės savo kūne?', min: 'Visai ne', max: 'Visiškai' },
      goal: {
        title: 'Ką labiausiai norėtumėte pajusti per artimiausias 15 dienų?',
        options: {
          skin: 'Stangresnės išvaizdos oda',
          energy: 'Daugiau energijos',
          libido: 'Daugiau gyvybingumo',
          joints: 'Lengvesnis judėjimas',
          all: 'Viską',
        },
      },
    },
    contact: {
      title: 'Kur atsiųsti jūsų planą?',
      subtitle: 'Neprivaloma: rezultatą pamatysite iškart ir be to.',
      name: 'Vardas',
      email: 'El. paštas',
      phone: 'Mobilusis (neprivaloma, SMS žinutėms)',
      marketing: 'Siųskite man patarimus ir pasiūlymus el. paštu. Atsisakyti galiu bet kada.',
      sms: 'Siųskite man pasiūlymus SMS žinute šiuo numeriu. Gali būti taikomi operatoriaus mokesčiai. Norėdami atsisakyti, atsakykite STOP.',
      submit: 'Rodyti mano rezultatą',
      skip: 'Praleisti ir rodyti rezultatą',
      privacy: 'Niekada neparduodame jūsų duomenų.',
    },
  },
  analyzing: {
    title: 'Ruošiame jūsų planą',
    steps: ['Skaitome jūsų 8 atsakymus…', 'Vertiname jūsų kolageno profilį…', 'Rašome asmeninę rekomendaciją…'],
  },
  offer: {
    trust: 'Analizė baigta: {name} • Pagal jūsų 8 atsakymus',
    trustAnon: 'Analizė baigta • Pagal jūsų 8 atsakymus',
    hero: {
      fallback: {
        woman: 'Stangresnės išvaizdos oda ir stabili energija prasideda nuo to, ką kasdien duodate savo kūnui',
        man: 'Vėl jauskitės pasiruošę dienai: kasdienis kolagenas sąnariams, odai ir stabiliai energijai',
        senior: 'Po 50 metų organizmas gamina mažiau kolageno. Jūsų kasdienė rutina gali tai kompensuoti',
      },
      sub: 'Jūsų kasdienis jaunystės ritualas: kolageno + peptidų formulė tiems, kurie nori jaunesnės išvaizdos odos, daugiau noro ir daugiau energijos, pritaikyta pagal jūsų atsakymus.',
      cta: 'Rodyti rekomenduojamą planą',
    },
    vsl: {
      title: 'Pažiūrėkite: ką reiškia jūsų atsakymai',
      unavailable: 'Vaizdo įrašas šiuo metu nepasiekiamas. Viskas, ko reikia, yra žemiau.',
      cta: 'Noriu savo plano',
      resume: 'Tęsiame nuo ten, kur sustojote',
    },
    diagnosis: {
      title: 'Jūsų kolageno įvertis',
      body: 'Maždaug nuo 25 metų organizmas kasmet pagamina apie 1 % mažiau kolageno. Jūsų amžiuje tai sudaro apie {pct} % mažiau nei 25-erių.',
      note: 'Iliustracinis įvertis, pagrįstas dažnai minimu vidurkiu, o ne medicininis matavimas.',
    },
    bullets: {
      title: 'Ką tai reiškia jums',
      items: {
        skin: [
          'Kolageno peptidai placebu kontroliuojamuose tyrimuose buvo susieti su geresniu odos elastingumu',
          'Paprasta kasdienė porcija, tinkanti jūsų rytui',
          'Odai, kuri pradeda prarasti stangrumą',
        ],
        energy: [
          'Baltymų turtinga kasdienė porcija jūsų rutinai palaikyti',
          'Be stimuliatorių, todėl vėliau nėra nuosmukio',
          'Dera su miegu, vandeniu ir judėjimu tolygesnėms dienoms',
        ],
        libido: [
          'Gera savijauta savo kailyje yra noro dalis',
          'Kasdienis rūpinimosi savimi ritualas, palaikantis pasitikėjimą',
          'Be hormonų ir be stimuliatorių',
        ],
        joints: [
          'Kolageno hidrolizatas tirtas esant su fiziniu aktyvumu susijusiam sąnarių diskomfortui',
          'Parama kremzlei ir jungiamajam audiniui, kuriuos naudojate kasdien',
          'Lengva vartoti kasdien, o tai svarbiausia',
        ],
        all: [
          'Viena kasdienė porcija odai, sąnariams ir bendrai gerovei',
          'Kolageno peptidai ir peptidų mišinys',
          'Sukurta jūsų jau turimai rutinai',
        ],
      },
    },
    pillars: {
      title: 'Vienas kasdienis ritualas, trys tikslai',
      items: [
        { title: 'Jaunesnės išvaizdos oda', body: 'Kolageno peptidai placebu kontroliuojamuose tyrimuose buvo susieti su geresniu odos elastingumu ir drėgnumu.' },
        { title: 'Noras ir gyvybingumas', body: 'Gera savijauta savo kūne yra noro dalis. Kasdienis rūpinimosi savimi ritualas vyrams ir moterims, be hormonų ir be stimuliatorių.' },
        { title: 'Energija jūsų dienai', body: 'Baltymų turtinga kasdienė porcija, tinkanti jūsų rytui, be stimuliatorių ir be nuosmukių.' },
      ],
      note: 'Rezultatai skiriasi. RENOVA CELL yra maisto papildas, o ne vaistas.',
    },
    science: {
      title: 'Ką sako tyrimai',
      flip: 'Palieskite, kad pamatytumėte šaltinį',
      cards: [
        {
          title: 'Odos elastingumas',
          finding:
            '69 moterys 8 savaites vartojo 2,5 g arba 5 g specifinių kolageno peptidų arba placebą. Odos elastingumas pagerėjo, palyginti su placebu.',
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Sąnarių komfortas',
          finding:
            'Per 24 savaites sportininkai, vartoję 10 g kolageno hidrolizato per dieną, nurodė mažesnį su aktyvumu susijusį sąnarių skausmą nei placebo grupė.',
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'Platesnis vaizdas',
          finding:
            '26 atsitiktinių imčių tyrimų (1 721 dalyvis) metaanalizė nustatė geresnį odos drėgnumą ir elastingumą, palyginti su placebu.',
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'Tyrimuose buvo tirtos konkrečios kolageno formulės; rezultatai gali netikti kiekvienam produktui, įskaitant šį.',
    },
    timeline: {
      title: 'Ko tikėtis',
      steps: [
        { day: '1 diena', title: 'Pradėkite ritualą', body: 'Viena porcija per dieną. Svarbiausia – reguliarumas.' },
        { day: '5 diena', title: 'Paverskite įpročiu', body: 'Tas pats laikas, ta pati vieta. Įprotis įsitvirtina.' },
        { day: '15 diena', title: 'Stabtelėkite', body: 'Atkreipkite dėmesį, kaip jaučiatės, ir laikykitės įpročio.' },
        { day: '30 diena', title: 'Vienas mėnuo', body: 'Tęskite. Tyrimai matavo odos pokyčius po 4–12 savaičių.' },
        { day: '90 diena', title: 'Visas ciklas', body: 'Laikotarpis, kurį nagrinėjo dauguma tyrimų. Laikas palyginti.' },
      ],
    },
    beforeAfter: {
      title: 'Tikri klientai',
      before: 'Prieš',
      after: 'Po',
      note: 'Neredaguotos nuotraukos, paskelbtos gavus leidimą. Rezultatai skiriasi.',
    },
    testimonials: {
      title: 'Žmonės kaip jūs',
      note: 'Tikri klientai, paskelbta gavus leidimą. Rezultatai skiriasi.',
    },
    simulator: {
      title: 'Jūsų kolageno kreivė',
      label: 'Jūsų amžius',
      yAxis: 'Apskaičiuotas kolagenas, palyginti su 25 m. (%)',
      you: 'Jūs',
      note: 'Dažnai minimo ~1 % per metus sumažėjimo po 25 metų iliustracija. Tai nėra produkto rezultatų prognozė.',
    },
    comparison: {
      title: 'RENOVA CELL prieš įprastą kolageną',
      us: 'RENOVA CELL',
      them: 'Įprastas kolagenas',
      rows: [
        { label: 'Hidrolizuoti kolageno peptidai', us: 'yes', them: 'yes' },
        { label: 'Papildomas peptidų mišinys', us: 'yes', them: 'no' },
        { label: 'Planas pagal jūsų testą', us: 'yes', them: 'no' },
        { label: '30 dienų pinigų grąžinimo garantija', us: 'yes', them: 'varies' },
      ],
      varies: 'Skiriasi',
    },
    pricing: {
      perMonth: '/mėn.',
      once: 'Vienkartinis pirkimas',
      subscribe: 'Prenumerata: atsiųsime vėl, kai baigsis',
      interval: { m1: 'kas mėnesį', m3: 'kas 3 mėnesius', m6: 'kas 6 mėnesius' },
      title: 'Pasirinkite planą',
      recommended: 'Rekomenduojama jums',
      perUnit: '{price} už vienetą',
      save: 'Sutaupote {pct} %',
      plans: {
        single: { name: '1 vnt.', desc: 'Išbandykite mėnesį' },
        kit3: { name: 'Kit 3', desc: 'Daugumos tyrimų 90 dienų ciklas' },
        kit6: { name: 'Kit 6', desc: 'Atsarga 6 mėnesiams' },
      },
      recurring: 'Nuskaičiuojame {price} {interval}, kol atšauksite. Atšaukti galite bet kada per kvitą el. laiške.',
      cta: 'Rinktis šį planą',
    },
    shipping: { free: 'Nemokamas pristatymas', fast: 'Greitas pristatymas su sekimu', discreet: 'Diskreti pakuotė' },
    bonus: {
      title: 'Kartu su Kit 3 ir Kit 6',
      items: ['El. knyga: kolageno rutina', '15 dienų mitybos planas', 'VIP klientų grupė'],
    },
    guarantee: {
      title: '30 dienų pinigų grąžinimo garantija',
      body: 'Išbandykite 30 dienų. Jei nebūsite patenkinti, parašykite mums ir be klausimų grąžinsime pinigus už užsakymą.',
    },
    faq: {
      title: 'Klausimai',
      items: {
        different: {
          q: 'Jau bandžiau kolageną ir nieko nepastebėjau. Kodėl dabar turėtų būti kitaip?',
          a: 'Daugelis meta po kelių savaičių. Dauguma tyrimų truko 8–12 savaičių su kasdiene doze, todėl rekomenduojame 90 dienų Kit 3. O jei jums netiks, galioja 30 dienų garantija.',
        },
        time: {
          q: 'Kaip greitai pamatysiu rezultatus?',
          a: 'Visi skirtingi. Tyrimai matavo odos pokyčius po 4–12 savaičių kasdienio vartojimo. Skirkite jam bent vieną visą ciklą.',
        },
        safe: {
          q: 'Ar tai man saugu?',
          a: 'Kolagenas yra maisto baltymas, kuris paprastai gerai toleruojamas. Jei esate nėščia, maitinate krūtimi, vartojate vaistus ar turite sveikatos sutrikimų, pirmiausia pasitarkite su gydytoju.',
        },
        men: {
          q: 'Ar tai tinka ir vyrams?',
          a: 'Taip. Kolagenas palaiko visų odą ir sąnarius. Netvirtiname, kad jis keičia hormonus.',
        },
        how: {
          q: 'Kaip vartoti?',
          a: 'Viena porcija per dieną, ištirpinta vandenyje, kavoje ar kokteilyje. Geriausia kasdien tuo pačiu metu.',
        },
        cancel: {
          q: 'Kaip atšaukti prenumeratą?',
          a: 'Pasinaudokite nuoroda bet kuriame kvito el. laiške arba parašykite mums. Atšaukti galite bet kada be mokesčių.',
        },
        shipping: {
          q: 'Kaip vyksta pristatymas?',
          a: 'Pristatymas nemokamas į visas šalis, į kurias pristatome. Užsakymai išsiunčiami greitai, su sekimu, paprastoje, diskrečioje pakuotėje be produkto pavadinimo išorėje. Sekimo nuoroda išsiunčiama el. paštu, kai tik užsakymas išsiųstas.',
        },
      },
    },
    sticky: { cta: 'Noriu savo plano' },
    exit: {
      title: 'Palaukite: 10 % nuolaida prieš išeinant',
      body: 'Atsiskaitydami naudokite šį kodą:',
      code: 'RENOVA10',
      cta: 'Naudoti 10 % nuolaidą',
      dismiss: 'Ne, ačiū',
    },
    chat: {
      title: 'Paklauskite Elenos',
      subtitle: 'DI asistentė · ne gydytoja',
      greeting: 'Sveiki! Esu Elena, RENOVA CELL DI asistentė. Klauskite manęs bet ko apie produktą ar savo planą.',
      placeholder: 'Įrašykite klausimą…',
      send: 'Siųsti',
      error: 'Atsiprašome, kažkas nepavyko. Bandykite dar kartą.',
      open: 'Atidaryti pokalbį',
      close: 'Uždaryti pokalbį',
    },
    social: { ordered: 'Užsakymų per pastarąsias 24 valandas: {count}' },
    footer: {
      privacy: 'Privatumas',
      terms: 'Sąlygos',
      contact: 'Kontaktai',
      rights: 'Visos teisės saugomos.',
    },
  },
  checkout: {
    steps: ['Krepšelis', 'Jūsų duomenys', 'Mokėjimas'],
    cart: {
      title: 'Jūsų užsakymas',
      bumpTitle: '+1 papildomas vienetas už {price}',
      bumpBody: 'Tik šiame puslapyje: pridėkite dar vieną vienetą mažesne kaina.',
      coupon: 'Nuolaidos kodas',
      couponPlaceholder: 'Įveskite kodą',
      apply: 'Taikyti',
      hint: 'Ššš… išbandykite RENOVA10',
      valid: 'Kodas pritaikytas: {pct} % nuolaida',
      invalid: 'Šis kodas negalioja.',
      total: 'Iš viso',
      discountNote: 'Nuolaida bus pritaikyta mokant',
      shipping: 'Pristatymas',
      free: 'Nemokamai',
    },
    info: {
      title: 'Jūsų duomenys',
      name: 'Vardas ir pavardė',
      email: 'El. paštas',
      newsletter: 'Siųskite man senėjimą stabdančius patarimus el. paštu',
      addressNote: 'Pristatymo adresą įvesite saugiame mokėjimo puslapyje (su automatiniu užpildymu).',
    },
    payment: {
      title: 'Mokėjimas',
      body: 'Pirkimą užbaigsite saugiame Stripe puslapyje. Kortelė, Apple Pay, Google Pay ir kiti būdai ten bus rodomi, jei yra prieinami jūsų šalyje.',
      installments: 'Mokėjimo dalimis galimybės rodomos mokant, jei yra prieinamos.',
      pay: 'Mokėti saugiai',
      redirecting: 'Atidarome saugų mokėjimą…',
      error: 'Nepavyko pradėti mokėjimo. Bandykite dar kartą.',
      ssl: 'SSL šifravimas',
      guarantee: '30 dienų garantija',
      stripe: 'Mokėjimai per Stripe',
    },
  },
  upsell1: {
    title: 'Jūsų užsakymas patvirtintas. Dar vienas dalykas…',
    body: 'Pridėkite Kit 6 (vienkartinis pirkimas) su 45 % nuolaida 6 mėnesių rutinai. Pasiūlymas tik šiame puslapyje.',
    accept: 'Taip, pridėti Kit 6 už {price}',
    decline: 'Ne, ačiū',
    charge: 'Iš jūsų išsaugotos kortelės vieną kartą bus nuskaičiuota {price}. Tai ne prenumerata.',
  },
  upsell2: {
    title: 'Niekada neliksite be atsargų, o mokėsite 30 % mažiau',
    body: 'Gaukite Kit 3 kas 3 mėnesius už {price} vietoje {full}. Nuolaida galioja, kol esate prenumeratorius.',
    accept: 'Taip, prenumeruoti už {price} kas 3 mėnesius',
    decline: 'Ne, ačiū',
    charge: 'Iš jūsų išsaugotos kortelės {price} bus nuskaičiuota šiandien ir kas 3 mėnesius, kol atšauksite. Atšaukti galite bet kada.',
  },
  upsell: {
    processing: 'Apdorojama…',
    error: 'Nepavyko užbaigti. Pinigai nebuvo nuskaičiuoti.',
    action: 'Jūsų bankas turi patvirtinti šį mokėjimą. Tęskite saugiame puslapyje.',
  },
  thankYou: {
    title: 'Ačiū{name}!',
    body: 'Jūsų užsakymas patvirtintas. Kvitas jau keliauja į jūsų el. paštą.',
    howTo: 'Kaip pradėti',
    steps: ['Kiekvieną rytą išgerkite vieną porciją.', 'Ištirpinkite vandenyje, kavoje ar kokteilyje.', 'Tęskite iki ciklo pabaigos.'],
    vip: { title: 'VIP grupė', body: 'Patarimai, receptai ir kitų klientų palaikymas.', cta: 'Prisijungti prie grupės' },
    referral: {
      title: 'Pasidalykite su draugu',
      body: 'Nusiųskite savo nuorodą. Ją panaudojęs gaus 10 % nuolaidą su kodu RENOVA10.',
      copy: 'Kopijuoti nuorodą',
      copied: 'Nukopijuota!',
    },
    order: 'Užsakymo suvestinė',
  },
  emails: {
    footer: 'Gaunate šį laišką, nes atlikote RENOVA CELL testą.',
    unsubscribe: 'Atsisakyti',
    diagnosis: {
      subject: '{name}, jūsų RENOVA CELL planas',
      body: 'Štai jūsų rezultatas: {diagnosis}\n\nJums rekomenduojamas planas: {plan}. Peržiūrėkite jį čia: {link}',
    },
    vsl: {
      subject: '2 minučių vaizdo įrašas jūsų profiliui',
      body: 'Paruošėme trumpą vaizdo įrašą apie tai, ką reiškia jūsų atsakymai. Žiūrėkite čia: {link}',
    },
    sms: { body: 'RENOVA CELL: 10 % nuolaida jūsų planui su kodu RENOVA10 → {link} Norėdami atsisakyti, atsakykite STOP.' },
    socialProof: {
      subject: 'Kodėl žmonės tęsia',
      body: 'Dauguma kolageno tyrimų truko 8–12 savaičių. Todėl 90 dienų Kit 3 yra dažniausiai renkamas mūsų planas. Jūsų planas: {link}',
    },
    lastChance: {
      subject: 'Jūsų 10 % nuolaidos kodas vis dar laukia',
      body: 'Jūsų kodas RENOVA10 vis dar laukia. Naudokite jį čia: {link}',
    },
    story: {
      subject: 'Maži įpročiai, didelis skirtumas',
      body: 'Geriausia rutina yra ta, kurios laikotės. Viena porcija per dieną, kasdien. Kai būsite pasiruošę: {link}',
    },
  },
};
