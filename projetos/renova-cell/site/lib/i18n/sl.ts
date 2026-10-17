import type { Dictionary } from './en';

export const sl: Dictionary = {
  common: {
    brand: 'RENOVA CELL',
    back: 'Nazaj',
    next: 'Naprej',
    continue: 'Nadaljuj',
    skip: 'Preskoči',
    loading: 'Nalaganje…',
    language: 'Jezik',
    resultsVary: 'Rezultati se od osebe do osebe razlikujejo.',
    fdaDisclaimer:
      'Teh trditev ni ocenila ameriška Agencija za hrano in zdravila (FDA). Izdelek ni namenjen diagnosticiranju, zdravljenju, ozdravitvi ali preprečevanju bolezni.',
    euDisclaimer:
      'Prehransko dopolnilo ni nadomestilo za uravnoteženo in raznovrstno prehrano ter zdrav način življenja. Priporočenega dnevnega odmerka ne smete preseči. Shranjujte nedosegljivo otrokom.',
  },
  consent: {
    text: 'Piškotke uporabljamo za analitiko in merjenje oglasov.',
    accept: 'Sprejmi',
    decline: 'Zavrni',
  },
  quiz: {
    progress: 'Opravljeno {pct} %',
    intro: 'Odgovori na 8 kratkih vprašanj (približno 60 sekund) in dobi svoj načrt za mlajši videz kože, več želje in energije vsak dan.',
    questions: {
      gender: {
        title: 'Kako se opredeljuješ?',
        options: { male: 'Moški', female: 'Ženska', other: 'Raje ne povem' },
      },
      age: {
        title: 'Koliko si star/a?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: 'Kaj te trenutno najbolj moti?',
        options: {
          skin: 'Koža izgublja čvrstost',
          energy: 'Malo energije',
          libido: 'Manj želje / vitalnosti',
          joints: 'Togi ali boleči sklepi',
          all: 'Malo vsega',
        },
      },
      duration: {
        title: 'Kako dolgo te to že moti?',
        options: { lt6m: 'Manj kot 6 mesecev', '6m-2y': '6 mesecev – 2 leti', '2y+': 'Več kot 2 leti' },
      },
      history: {
        title: 'Si že kdaj jemal/a kolagen?',
        options: { never: 'Nikoli', tried: 'Da, a brez rezultatov', using: 'Jemljem ga zdaj' },
      },
      energy: { title: 'Kakšna je tvoja energija čez dan?', min: 'Izčrpanost', max: 'Polna energije' },
      confidence: { title: 'Kako dobro se počutiš v svojem telesu?', min: 'Sploh ne', max: 'Popolnoma' },
      goal: {
        title: 'Kaj bi najraje občutil/a v naslednjih 15 dneh?',
        options: {
          skin: 'Čvrstejši videz kože',
          energy: 'Več energije',
          libido: 'Več vitalnosti',
          joints: 'Lažje gibanje',
          all: 'Vse to',
        },
      },
    },
    contact: {
      title: 'Kam naj pošljemo tvoj načrt?',
      subtitle: 'Neobvezno: rezultat lahko vidiš takoj tudi brez tega.',
      name: 'Ime',
      email: 'E-pošta',
      phone: 'Mobilni telefon (neobvezno, za SMS)',
      marketing: 'Pošiljajte mi nasvete in ponudbe po e-pošti. Odjavim se lahko kadar koli.',
      sms: 'Pošiljajte mi ponudbe po SMS na to številko. Lahko veljajo stroški operaterja. Za odjavo odgovori STOP.',
      submit: 'Pokaži moj rezultat',
      skip: 'Preskoči in pokaži rezultat',
      privacy: 'Tvojih podatkov nikoli ne prodajamo.',
    },
  },
  analyzing: {
    title: 'Pripravljamo tvoj načrt',
    steps: ['Beremo tvojih 8 odgovorov…', 'Ocenjujemo tvoj kolagenski profil…', 'Pišemo tvoje osebno priporočilo…'],
  },
  offer: {
    trust: 'Analiza je končana za: {name} • Na podlagi tvojih 8 odgovorov',
    trustAnon: 'Analiza je končana • Na podlagi tvojih 8 odgovorov',
    hero: {
      fallback: {
        woman: 'Čvrstejši videz kože in stabilna energija se začneta s tem, kar svojemu telesu daješ vsak dan',
        man: 'Spet se počuti pripravljenega na dan: vsakodnevni kolagen za sklepe, kožo in stabilno energijo',
        senior: 'Po 50. letu telo proizvaja manj kolagena. Tvoja dnevna rutina lahko to nadomesti',
      },
      sub: 'Tvoj vsakodnevni ritual mladosti: formula s kolagenom + peptidi za tiste, ki želijo mlajši videz kože, več želje in več energije, prilagojena tvojim odgovorom.',
      cta: 'Pokaži priporočeni načrt',
    },
    vsl: {
      title: 'Poglej: kaj pomenijo tvoji odgovori',
      unavailable: 'Video trenutno ni na voljo. Vse, kar potrebuješ, je spodaj.',
      cta: 'Želim svoj načrt',
      resume: 'Nadaljujemo tam, kjer si ostal/a',
    },
    diagnosis: {
      title: 'Tvoja ocena kolagena',
      body: 'Približno od 25. leta telo vsako leto proizvede približno 1 % manj kolagena. Pri tvojih letih je to približno {pct} % manj kot pri 25.',
      note: 'Ponazoritvena ocena na podlagi pogosto navedenega povprečja, ne zdravniška meritev.',
    },
    bullets: {
      title: 'Kaj to pomeni zate',
      items: {
        skin: [
          'Kolagenske peptide so v študijah s placebom povezali z boljšo prožnostjo kože',
          'Preprost dnevni odmerek, ki se umesti v tvoje jutro',
          'Za kožo, ki začenja izgubljati čvrstost',
        ],
        energy: [
          'Z beljakovinami bogat dnevni odmerek v podporo tvoji rutini',
          'Brez poživil, zato pozneje ni padca',
          'Dopolnjuje spanec, vodo in gibanje za bolj enakomerne dni',
        ],
        libido: [
          'Dobro počutje v lastni koži je del želje',
          'Vsakodnevni ritual skrbi zase, ki podpira samozavest',
          'Brez hormonov in brez poživil',
        ],
        joints: [
          'Hidrolizirani kolagen so preučevali pri težavah s sklepi, povezanih z dejavnostjo',
          'Podpora hrustancu in vezivnemu tkivu, ki ju uporabljaš vsak dan',
          'Enostavno ga je jemati vsak dan, in to je bistveno',
        ],
        all: [
          'En dnevni odmerek za kožo, sklepe in splošno dobro počutje',
          'Kolagenski peptidi in mešanica peptidov',
          'Ustvarjeno za rutino, ki jo že imaš',
        ],
      },
    },
    pillars: {
      title: 'En dnevni ritual, trije cilji',
      items: [
        { title: 'Mlajši videz kože', body: 'Kolagenske peptide so v študijah s placebom povezali z boljšo prožnostjo in vlažnostjo kože.' },
        { title: 'Želja in vitalnost', body: 'Dobro počutje v svojem telesu je del želje. Vsakodnevni ritual skrbi zase za moške in ženske, brez hormonov in brez poživil.' },
        { title: 'Energija za tvoj dan', body: 'Z beljakovinami bogat dnevni odmerek, ki se umesti v tvoje jutro, brez poživil in brez padcev.' },
      ],
      note: 'Rezultati se razlikujejo. RENOVA CELL je prehransko dopolnilo, ne zdravilo.',
    },
    science: {
      title: 'Kaj pravijo raziskave',
      flip: 'Tapni za vir',
      cards: [
        {
          title: 'Prožnost kože',
          finding:
            '69 žensk je 8 tednov jemalo 2,5 g ali 5 g določenih kolagenskih peptidov ali placebo. Prožnost kože se je v primerjavi s placebom izboljšala.',
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Udobje sklepov',
          finding:
            'V 24 tednih so športniki, ki so jemali 10 g hidroliziranega kolagena na dan, poročali o manj bolečinah v sklepih pri dejavnosti kot skupina s placebom.',
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'Širša slika',
          finding:
            'Metaanaliza 26 randomiziranih študij (1721 udeležencev) je pokazala izboljšanje vlažnosti in prožnosti kože v primerjavi s placebom.',
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'Študije so preizkušale določene kolagenske formule; rezultati morda ne veljajo za vsak izdelek, tudi za tega ne.',
    },
    timeline: {
      title: 'Kaj pričakovati',
      steps: [
        { day: '1. dan', title: 'Začni ritual', body: 'En odmerek na dan. Šteje rednost.' },
        { day: '5. dan', title: 'Naredi navado', body: 'Isti čas, isti kraj. Navada se utrdi.' },
        { day: '15. dan', title: 'Za hip postoj', body: 'Bodi pozoren/na na počutje in se drži navade.' },
        { day: '30. dan', title: 'En mesec', body: 'Nadaljuj. Študije so spremembe kože merile po 4 do 12 tednih.' },
        { day: '90. dan', title: 'Celoten cikel', body: 'Obdobje, ki ga je preučevala večina raziskav. Čas za primerjavo.' },
      ],
    },
    beforeAfter: {
      title: 'Resnične stranke',
      before: 'Prej',
      after: 'Potem',
      note: 'Neobdelane fotografije, objavljene z dovoljenjem. Rezultati se razlikujejo.',
    },
    testimonials: {
      title: 'Ljudje, kot si ti',
      note: 'Resnične stranke, objavljeno z dovoljenjem. Rezultati se razlikujejo.',
    },
    simulator: {
      title: 'Tvoja kolagenska krivulja',
      label: 'Tvoja starost',
      yAxis: 'Ocenjeni kolagen glede na 25 let (%)',
      you: 'Ti',
      note: 'Ponazoritev pogosto navedenega upada za ~1 % na leto po 25. letu. Ni napoved rezultatov izdelka.',
    },
    comparison: {
      title: 'RENOVA CELL v primerjavi z običajnim kolagenom',
      us: 'RENOVA CELL',
      them: 'Običajen kolagen',
      rows: [
        { label: 'Hidrolizirani kolagenski peptidi', us: 'yes', them: 'yes' },
        { label: 'Dodana mešanica peptidov', us: 'yes', them: 'no' },
        { label: 'Načrt po tvojem kvizu', us: 'yes', them: 'no' },
        { label: '30-dnevno vračilo denarja', us: 'yes', them: 'varies' },
      ],
      varies: 'Različno',
    },
    pricing: {
      perMonth: '/mes.',
      once: 'Enkratni nakup',
      subscribe: 'Naročnina: znova dostavimo, ko zmanjka',
      interval: { m1: 'vsak mesec', m3: 'vsake 3 mesece', m6: 'vsakih 6 mesecev' },
      title: 'Izberi svoj načrt',
      recommended: 'Priporočeno zate',
      perUnit: '{price} na kos',
      save: 'Prihrani {pct} %',
      plans: {
        single: { name: '1 kos', desc: 'Preizkusi en mesec' },
        kit3: { name: 'Kit 3', desc: '90-dnevni cikel iz večine študij' },
        kit6: { name: 'Kit 6', desc: 'Zaloga za 6 mesecev' },
      },
      recurring: 'Zaračunamo {price} {interval}, dokler ne prekličeš. Prekliči kadar koli prek računa v e-pošti.',
      cta: 'Izberi ta načrt',
    },
    shipping: { free: 'Brezplačna dostava', fast: 'Dostava v največ 2 delovnih dneh', discreet: 'Diskretna embalaža', tracked: 'Dostava s sledenjem' },
    bonus: {
      title: 'Vključeno v Kit 3 in Kit 6',
      items: ['E-knjiga: Kolagenska rutina', '15-dnevni jedilnik', 'VIP skupina za stranke'],
    },
    guarantee: {
      title: '30-dnevno vračilo denarja',
      body: 'Preizkusi 30 dni. Če nisi zadovoljen/na, nam piši in denar za naročilo ti vrnemo brez vprašanj.',
    },
    faq: {
      title: 'Vprašanja',
      items: {
        different: {
          q: 'Kolagen sem že poskusil/a in nisem opazil/a ničesar. Zakaj bi bilo zdaj drugače?',
          a: 'Mnogi odnehajo po nekaj tednih. Večina študij je trajala 8 do 12 tednov z dnevnim odmerkom, zato priporočamo 90-dnevni Kit 3. Če ti ne ustreza, velja 30-dnevno jamstvo.',
        },
        time: {
          q: 'Kako hitro bom videl/a rezultate?',
          a: 'Vsak je drugačen. Raziskave so spremembe kože merile po 4 do 12 tednih vsakodnevne uporabe. Daj mu vsaj en celoten cikel.',
        },
        safe: {
          q: 'Je varno zame?',
          a: 'Kolagen je beljakovina iz hrane, ki jo ljudje običajno dobro prenašajo. Če si noseča, dojiš, jemlješ zdravila ali imaš zdravstveno težavo, se najprej posvetuj z zdravnikom.',
        },
        men: {
          q: 'Je tudi za moške?',
          a: 'Da. Kolagen podpira kožo in sklepe pri vseh. Ne trdimo, da vpliva na hormone.',
        },
        how: {
          q: 'Kako ga jemljem?',
          a: 'En odmerek na dan, vmešan v vodo, kavo ali smuti. Najbolje vsak dan ob istem času.',
        },
        cancel: {
          q: 'Kako prekličem naročnino?',
          a: 'Uporabi povezavo v kateri koli e-pošti z računom ali nam piši. Prekličeš lahko kadar koli, brez stroškov.',
        },
        shipping: {
          q: 'Kako poteka dostava?',
          a: 'Dostava je brezplačna v vse države, kamor dostavljamo. Dostava traja največ 2 delovna dneva, s sledenjem, v navadni, diskretni embalaži brez imena izdelka na zunanji strani. Povezava za sledenje je poslana po e-pošti takoj, ko je naročilo odposlano.',
          aStandard: 'Dostava je brezplačna v vse države, kamor dostavljamo. Naročila odpošljemo s sledenjem, v navadni, diskretni embalaži brez imena izdelka na zunanji strani. Predviden čas dostave za tvojo državo je prikazan pri plačilu, povezava za sledenje pa je poslana po e-pošti takoj, ko je naročilo odposlano.',
        },
      },
    },
    sticky: { cta: 'Želim svoj načrt' },
    exit: {
      title: 'Počakaj: 10 % popusta, preden odideš',
      body: 'Ta koda velja pri plačilu:',
      code: 'RENOVA10',
      cta: 'Uporabi 10 % popusta',
      dismiss: 'Ne, hvala',
    },
    chat: {
      title: 'Vprašaj Eleno',
      subtitle: 'AI asistentka · ni zdravnica',
      greeting: 'Živjo! Sem Elena, AI asistentka RENOVA CELL. Vprašaj me karkoli o izdelku ali svojem načrtu.',
      placeholder: 'Vpiši svoje vprašanje…',
      send: 'Pošlji',
      error: 'Oprosti, nekaj je šlo narobe. Poskusi znova.',
      open: 'Odpri klepet',
      close: 'Zapri klepet',
    },
    social: { ordered: 'Naročila v zadnjih 24 urah: {count}' },
    footer: {
      privacy: 'Zasebnost',
      terms: 'Pogoji',
      contact: 'Kontakt',
      rights: 'Vse pravice pridržane.',
    },
  },
  checkout: {
    steps: ['Košarica', 'Tvoji podatki', 'Plačilo'],
    cart: {
      title: 'Tvoje naročilo',
      bumpTitle: '+1 dodaten kos za {price}',
      bumpBody: 'Samo na tej strani: dodaj še en kos po nižji ceni.',
      coupon: 'Koda za popust',
      couponPlaceholder: 'Vpiši kodo',
      apply: 'Uporabi',
      hint: 'Pst… poskusi RENOVA10',
      valid: 'Koda uporabljena: {pct} % popusta',
      invalid: 'Ta koda ni veljavna.',
      total: 'Skupaj',
      discountNote: 'Popust se upošteva pri plačilu',
      shipping: 'Dostava',
      free: 'Brezplačno',
    },
    info: {
      title: 'Tvoji podatki',
      name: 'Ime in priimek',
      email: 'E-pošta',
      newsletter: 'Pošiljajte mi nasvete proti staranju po e-pošti',
      addressNote: 'Naslov za dostavo vpišeš na varni strani za plačilo (s samodejnim izpolnjevanjem).',
    },
    payment: {
      title: 'Plačilo',
      body: 'Nakup zaključiš na varni strani Stripe. Kartica, Apple Pay, Google Pay in drugi načini se tam prikažejo, če so na voljo v tvoji državi.',
      installments: 'Možnosti plačila na obroke se prikažejo pri plačilu, če so na voljo.',
      pay: 'Varno plačaj',
      redirecting: 'Odpiramo varno plačilo…',
      error: 'Plačila ni bilo mogoče začeti. Poskusi znova.',
      ssl: 'SSL šifriranje',
      guarantee: '30-dnevno jamstvo',
      stripe: 'Plačila prek Stripe',
    },
  },
  upsell1: {
    title: 'Naročilo je potrjeno. Še nekaj…',
    body: 'Dodaj Kit 6 (enkratni nakup) s 45 % popusta za 6-mesečno rutino. Ponudba velja samo na tej strani.',
    accept: 'Da, dodaj Kit 6 za {price}',
    decline: 'Ne, hvala',
    charge: 'S shranjene kartice bomo enkrat bremenili {price}. To ni naročnina.',
  },
  upsell2: {
    title: 'Nikoli brez zaloge, in 30 % ceneje',
    body: 'Prejemaj Kit 3 vsake 3 mesece za {price} namesto {full}. Popust velja, dokler si naročen/a.',
    accept: 'Da, naročnina za {price} vsake 3 mesece',
    decline: 'Ne, hvala',
    charge: 'S shranjene kartice bomo bremenili {price} danes in nato vsake 3 mesece, dokler ne prekličeš. Prekličeš lahko kadar koli.',
  },
  upsell: {
    processing: 'Obdelava…',
    error: 'Ni uspelo. Ničesar ti nismo zaračunali.',
    action: 'Tvoja banka mora potrditi to plačilo. Nadaljuj na varni strani.',
  },
  thankYou: {
    title: 'Hvala{name}!',
    body: 'Tvoje naročilo je potrjeno. Račun je na poti v tvoj e-poštni predal.',
    howTo: 'Kako začeti',
    steps: ['Vsako jutro vzemi en odmerek.', 'Vmešaj v vodo, kavo ali smuti.', 'Nadaljuj do konca cikla.'],
    vip: { title: 'VIP skupina', body: 'Nasveti, recepti in podpora drugih strank.', cta: 'Pridruži se skupini' },
    referral: {
      title: 'Deli s prijateljem',
      body: 'Pošlji svojo povezavo. Kdor jo uporabi, dobi 10 % popusta s kodo RENOVA10.',
      copy: 'Kopiraj povezavo',
      copied: 'Kopirano!',
    },
    order: 'Povzetek naročila',
  },
  neutral: {
    intro: 'Odgovori na 8 kratkih vprašanj (približno 60 sekund) in dobi svoj načrt za mlajši videz kože in energijo vsak dan.',
    painLibido: 'Manj vitalnosti',
    heroSub: 'Tvoj vsakodnevni ritual: formula s kolagenom + peptidi za tiste, ki želijo mlajši videz kože in več energije, prilagojena tvojim odgovorom.',
    bullet: 'Dobro počutje v svojem telesu se začne z vsakodnevno skrbjo zase',
    pillar: { title: 'Vitalnost in samozavest', body: 'Dobro počutje v svojem telesu je del samozavesti. Vsakodnevni ritual skrbi zase za moške in ženske, brez hormonov in brez poživil.' },
  },
  emails: {
    footer: 'To sporočilo prejemaš, ker si izpolnil/a kviz RENOVA CELL.',
    unsubscribe: 'Odjava',
    diagnosis: {
      subject: '{name}, tvoj načrt RENOVA CELL',
      body: 'Tukaj je tvoj rezultat: {diagnosis}\n\nTvoj priporočeni načrt je {plan}. Oglej si ga tukaj: {link}',
    },
    vsl: {
      subject: '2-minutni video za tvoj profil',
      body: 'Pripravili smo kratek video o tem, kaj pomenijo tvoji odgovori. Oglej si ga tukaj: {link}',
    },
    sms: { body: 'RENOVA CELL: 10 % popusta na tvoj načrt s kodo RENOVA10 → {link} Za odjavo odgovori STOP.' },
    socialProof: {
      subject: 'Zakaj ljudje vztrajajo',
      body: 'Večina študij o kolagenu je trajala 8 do 12 tednov. Zato je 90-dnevni Kit 3 naš najpogosteje izbran načrt. Tvoj načrt: {link}',
    },
    lastChance: {
      subject: 'Tvoja koda za 10 % popusta te še čaka',
      body: 'Tvoja koda RENOVA10 te še vedno čaka. Uporabi jo tukaj: {link}',
    },
    story: {
      subject: 'Majhne navade, velika razlika',
      body: 'Najboljša rutina je tista, ki se je držiš. En odmerek na dan, vsak dan. Ko boš pripravljen/a: {link}',
    },
  },
};
