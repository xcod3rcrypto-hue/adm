import type { Dictionary } from './en';

export const ro: Dictionary = {
  common: {
    brand: 'VitalRise',
    back: 'Înapoi',
    next: 'Înainte',
    continue: 'Continuă',
    skip: 'Sari peste',
    loading: 'Se încarcă…',
    language: 'Limbă',
    resultsVary: 'Rezultatele variază de la o persoană la alta.',
    fdaDisclaimer:
      'Aceste afirmații nu au fost evaluate de Administrația pentru Alimente și Medicamente din SUA (FDA). Acest produs nu este destinat diagnosticării, tratării, vindecării sau prevenirii vreunei boli.',
    euDisclaimer:
      'Suplimentele alimentare nu trebuie utilizate ca substitut pentru o dietă variată și echilibrată și pentru un stil de viață sănătos. A nu se depăși doza zilnică recomandată. A nu se lăsa la îndemâna copiilor mici.',
  },
  consent: {
    text: 'Folosim cookie-uri pentru analiză și pentru măsurarea reclamelor.',
    accept: 'Accept',
    decline: 'Refuz',
  },
  quiz: {
    progress: '{pct}% completat',
    intro: "Răspunde la 8 întrebări rapide (aproximativ 60 de secunde) și primește planul tău pentru o piele cu aspect mai tânăr, mai multă dorință și energie în fiecare zi.",
    questions: {
      gender: {
        title: 'Cum te identifici?',
        options: { male: 'Bărbat', female: 'Femeie', other: 'Prefer să nu spun' },
      },
      age: {
        title: 'Câți ani ai?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: 'Ce te deranjează cel mai mult acum?',
        options: {
          skin: 'Pielea își pierde fermitatea',
          energy: 'Energie scăzută',
          libido: 'Dorință / vitalitate scăzută',
          joints: 'Articulații rigide sau care dor',
          all: 'Câte puțin din toate',
        },
      },
      duration: {
        title: 'De cât timp te deranjează asta?',
        options: { lt6m: 'Sub 6 luni', '6m-2y': 'Între 6 luni și 2 ani', '2y+': 'Peste 2 ani' },
      },
      history: {
        title: 'Ai mai luat colagen până acum?',
        options: { never: 'Niciodată', tried: 'Da, dar fără rezultate', using: 'Da, iau și acum' },
      },
      energy: { title: 'Cum e energia ta de zi cu zi?', min: 'Zero energie', max: 'Energie din plin' },
      confidence: { title: 'Cât de bine te simți în corpul tău?', min: 'Deloc', max: 'Pe deplin' },
      goal: {
        title: 'Ce ți-ar plăcea cel mai mult să simți în următoarele 15 zile?',
        options: {
          skin: 'Piele cu aspect mai ferm',
          energy: 'Mai multă energie',
          libido: 'Mai multă vitalitate',
          joints: 'Mișcare mai ușoară',
          all: 'Toate acestea',
        },
      },
    },
    contact: {
      title: 'Unde să-ți trimitem planul?',
      subtitle: 'Opțional — îți poți vedea rezultatul imediat și fără asta.',
      name: 'Prenume',
      email: 'E-mail',
      phone: 'Mobil (opțional, pentru SMS)',
      marketing: 'Vreau să primesc sfaturi și oferte pe e-mail. Mă pot dezabona oricând.',
      sms: 'Vreau să primesc oferte prin SMS la acest număr. Se pot aplica tarife pentru mesaje și date. Răspunde STOP ca să te dezabonezi.',
      submit: 'Vezi-mi rezultatul',
      skip: 'Sari direct la rezultat',
      privacy: 'Nu îți vindem niciodată datele.',
    },
  },
  analyzing: {
    title: 'Îți pregătim planul',
    steps: ['Citim cele 8 răspunsuri ale tale…', 'Estimăm profilul tău de colagen…', 'Scriem recomandarea ta personalizată…'],
  },
  offer: {
    trust: 'Analiză finalizată pentru {name} • Pe baza celor 8 răspunsuri ale tale',
    trustAnon: 'Analiză finalizată • Pe baza celor 8 răspunsuri ale tale',
    hero: {
      fallback: {
        woman: 'Pielea cu aspect mai ferm și energia constantă încep cu ce îi dai corpului tău în fiecare zi',
        man: 'Începe din nou ziua cu chef: colagen zilnic pentru articulații, piele și energie constantă',
        senior: 'După 50 de ani, corpul produce mai puțin colagen. Rutina ta zilnică poate compensa',
      },
      sub: "Ritualul tău zilnic de tinerețe: o formulă cu colagen + peptide pentru cei care vor o piele cu aspect mai tânăr, mai multă dorință și mai multă energie, adaptată răspunsurilor tale.",
      cta: 'Vezi planul recomandat',
    },
    vsl: {
      title: 'Urmărește: ce înseamnă răspunsurile tale',
      unavailable: 'Videoclipul nu este disponibil acum. Tot ce îți trebuie găsești mai jos.',
      cta: 'Vreau planul acum',
      resume: 'Continui de unde ai rămas',
    },
    diagnosis: {
      title: 'Estimarea ta de colagen',
      body: 'Cam de la 25 de ani, corpul produce în fiecare an cu aproximativ 1% mai puțin colagen. La vârsta ta, asta înseamnă cu circa {pct}% mai puțin decât la 25 de ani.',
      note: 'Estimare orientativă, bazată pe o medie citată frecvent, nu o măsurătoare medicală.',
    },
    bullets: {
      title: 'Ce înseamnă asta pentru tine',
      items: {
        skin: [
          'Peptidele de colagen au fost asociate cu o elasticitate mai bună a pielii în studii controlate cu placebo',
          'O porție zilnică simplă, care își face loc ușor în dimineața ta',
          'Gândit pentru pielea care începe să-și piardă fermitatea',
        ],
        energy: [
          'O porție zilnică bogată în proteine, care îți susține rutina',
          'Fără stimulente — nimic care să te lase fără vlagă mai târziu',
          'Merge mână în mână cu somnul, apa și mișcarea, pentru zile mai echilibrate',
        ],
        libido: [
          'Să te simți bine în pielea ta face parte din a simți dorință',
          'Un ritual zilnic de grijă față de tine, care îți susține încrederea',
          'Fără hormoni și fără stimulente',
        ],
        joints: [
          'Colagenul hidrolizat a fost studiat în legătură cu disconfortul articular asociat efortului fizic',
          'Sprijin pentru cartilajele și țesutul conjunctiv pe care le folosești zilnic',
          'Ușor de luat în fiecare zi — și asta contează',
        ],
        all: [
          'O singură porție pe zi pentru piele, articulații și starea generală de bine',
          'Peptide de colagen plus un complex de peptide',
          'Gândit să se potrivească rutinei pe care o ai deja',
        ],
      },
    },
    pillars: {
      title: "Un ritual zilnic, trei obiective",
      items: [
        { title: "Piele cu aspect mai tânăr", body: "Peptidele de colagen au fost asociate cu o elasticitate și o hidratare mai bune ale pielii în studii controlate cu placebo." },
        { title: "Dorință și vitalitate", body: "Să te simți bine în corpul tău face parte din a simți dorință. Un ritual zilnic de grijă față de tine, pentru bărbați și femei, fără hormoni și fără stimulente." },
        { title: "Energie pentru ziua ta", body: "O porție zilnică bogată în proteine, care se potrivește dimineții tale, fără stimulente și fără căderi de energie." },
      ],
      note: "Rezultatele variază. VitalRise este un supliment alimentar, nu un medicament.",
    },
    science: {
      title: 'Ce spun cercetările',
      flip: 'Atinge pentru a vedea sursa',
      cards: [
        {
          title: 'Elasticitatea pielii',
          finding:
            '69 de femei au luat 2,5 g sau 5 g de peptide de colagen specifice sau placebo, timp de 8 săptămâni. Elasticitatea pielii s-a îmbunătățit față de placebo.',
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Confortul articulațiilor',
          finding:
            'Pe parcursul a 24 de săptămâni, sportivii care au luat 10 g/zi de colagen hidrolizat au raportat mai puține dureri articulare legate de efort decât cei care au luat placebo.',
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'Imaginea de ansamblu',
          finding:
            'O meta-analiză a 26 de studii randomizate (1.721 de participanți) a constatat îmbunătățiri ale hidratării și elasticității pielii față de placebo.',
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'Studiile au testat formule specifice de colagen; rezultatele s-ar putea să nu se aplice oricărui produs, inclusiv acestuia.',
    },
    timeline: {
      title: 'La ce să te aștepți',
      steps: [
        { day: 'Ziua 1', title: 'Începe ritualul', body: 'O porție pe zi. Constanța e cea care contează.' },
        { day: 'Ziua 5', title: 'Transformă-l în obicei', body: 'Aceeași oră, același loc. Obiceiul prinde rădăcini.' },
        { day: 'Ziua 15', title: 'Fă un bilanț', body: "Observă cum te simți și păstrează obiceiul." },
        { day: 'Ziua 30', title: 'Prima lună', body: 'Continuă. Studiile au măsurat schimbări ale pielii între 4 și 12 săptămâni.' },
        { day: 'Ziua 90', title: 'Ciclu complet', body: 'Perioada analizată de majoritatea cercetărilor. E momentul să compari.' },
      ],
    },
    beforeAfter: {
      title: 'Clienți reali',
      before: 'Înainte',
      after: 'După',
      note: 'Fotografii needitate, publicate cu permisiune. Rezultatele variază.',
    },
    testimonials: {
      title: 'Oameni ca tine',
      note: 'Clienți reali, mărturii publicate cu permisiunea lor. Rezultatele variază.',
    },
    simulator: {
      title: 'Curba ta de colagen',
      label: 'Vârsta ta',
      yAxis: 'Colagen estimat față de vârsta de 25 de ani (%)',
      you: 'Tu',
      note: 'Ilustrare a scăderii de ~1%/an după 25 de ani, citată frecvent. Nu este o predicție a rezultatelor produsului.',
    },
    comparison: {
      title: 'VitalRise vs. un colagen obișnuit',
      us: 'VitalRise',
      them: 'Colagen obișnuit',
      rows: [
        { label: 'Peptide de colagen hidrolizat', us: 'yes', them: 'yes' },
        { label: 'Complex de peptide adăugat', us: 'yes', them: 'no' },
        { label: 'Plan adaptat chestionarului tău', us: 'yes', them: 'no' },
        { label: 'Banii înapoi în 30 de zile', us: 'yes', them: 'varies' },
      ],
      varies: 'Variază',
    },
    pricing: {
      perMonth: '/lună',
      once: "Achiziție unică",
      subscribe: "Abonament: îl primești din nou când se termină",
      interval: { m1: "în fiecare lună", m3: "la fiecare 3 luni", m6: "la fiecare 6 luni" },
      title: 'Alege-ți planul',
      recommended: 'Recomandat pentru tine',
      perUnit: '{price} pe bucată',
      save: 'Economisești {pct}%',
      plans: {
        single: { name: '1 bucată', desc: 'Încearcă-l timp de o lună' },
        kit3: { name: 'Kit 3', desc: 'Ciclul de 90 de zile folosit în majoritatea studiilor' },
        kit6: { name: "Kit 6", desc: "Rezervă pentru 6 luni" },
      },
      recurring: "Se percep {price} {interval} până anulezi. Poți anula oricând din chitanța primită pe e-mail.",
      cta: 'Vreau acest plan',
    },
    shipping: { free: 'Transport gratuit', fast: 'Livrare în maximum 2 zile lucrătoare', discreet: 'Ambalaj discret', tracked: 'Livrare cu urmărire' },
    bonus: {
      title: 'Incluse în Kit 3 și Kit 6',
      items: ['E-book: Rutina colagenului', 'Plan alimentar pe 15 zile', 'Grup VIP pentru clienți'],
    },
    guarantee: {
      title: 'Garanție de 30 de zile, banii înapoi',
      body: 'Încearcă-l 30 de zile. Dacă nu îți place, scrie-ne pe e-mail și îți returnăm banii pentru comandă — fără întrebări.',
    },
    faq: {
      title: 'Întrebări',
      items: {
        different: {
          q: 'Am mai luat colagen și n-am văzut nimic. De ce ar fi diferit acum?',
          a: 'Mulți renunță după câteva săptămâni. Majoritatea studiilor au durat între 8 și 12 săptămâni, cu o doză zilnică — de aceea recomandăm Kit 3, pentru 90 de zile. Iar dacă nu funcționează pentru tine, se aplică garanția de 30 de zile.',
        },
        time: {
          q: 'Cât de repede o să văd rezultate?',
          a: 'Fiecare persoană e diferită. Cercetările au măsurat schimbări ale pielii după 4 până la 12 săptămâni de utilizare zilnică. Acordă-i cel puțin un ciclu complet.',
        },
        safe: {
          q: 'Este sigur pentru mine?',
          a: 'Colagenul este o proteină alimentară, în general bine tolerată. Dacă ești însărcinată, alăptezi, iei medicamente sau ai o afecțiune medicală, discută mai întâi cu medicul tău.',
        },
        men: {
          q: 'Este și pentru bărbați?',
          a: 'Da. Colagenul susține pielea și articulațiile oricui. Nu afirmăm că modifică hormonii.',
        },
        how: {
          q: 'Cum îl iau?',
          a: 'O porție pe zi, amestecată în apă, cafea sau smoothie. Ideal este să-l iei la aceeași oră în fiecare zi.',
        },
        cancel: {
          q: "Cum anulez un abonament?",
          a: 'Folosește linkul din oricare e-mail cu chitanța sau scrie-ne. Poți anula oricând, fără taxe.',
        },
        shipping: {
          q: 'Cum funcționează livrarea?',
          a: 'Transportul este gratuit în toate țările în care livrăm. Livrarea durează maximum 2 zile lucrătoare, cu urmărire, într-un ambalaj simplu și discret, fără numele produsului la exterior. Linkul de urmărire este trimis pe e-mail imediat ce comanda este expediată.',
          aStandard: 'Transportul este gratuit în toate țările în care livrăm. Comenzile pleacă cu urmărire, într-un ambalaj simplu și discret, fără numele produsului la exterior. Termenul estimat pentru țara ta apare la plată, iar linkul de urmărire este trimis pe e-mail imediat ce comanda este expediată.',
        },
      },
    },
    sticky: { cta: 'Vreau planul meu' },
    exit: {
      title: 'Stai — 10% reducere înainte să pleci',
      body: 'Folosește acest cod la finalizarea comenzii:',
      code: 'VITAL10',
      cta: 'Vreau reducerea de 10%',
      dismiss: 'Nu, mulțumesc',
    },
    chat: {
      title: 'Întreab-o pe Elena',
      subtitle: 'Asistentă AI · nu e medic',
      greeting: 'Bună! Sunt Elena, asistenta AI de la VitalRise. Întreabă-mă orice despre produs sau despre planul tău.',
      placeholder: 'Scrie întrebarea ta…',
      send: 'Trimite',
      error: 'Ne pare rău, ceva n-a mers. Încearcă din nou.',
      open: 'Deschide chatul',
      close: 'Închide chatul',
    },
    social: { ordered: 'Comenzi plasate în ultimele 24 de ore: {count}' },
    footer: {
      privacy: 'Confidențialitate',
      terms: 'Termeni',
      contact: 'Contact',
      rights: 'Toate drepturile rezervate.',
    },
  },
  checkout: {
    steps: ['Coș', 'Datele tale', 'Plată'],
    cart: {
      title: 'Comanda ta',
      bumpTitle: '+1 bucată în plus la {price}',
      bumpBody: 'Doar pe această pagină: adaugă încă o bucată la un preț mai mic.',
      coupon: 'Cod de reducere',
      couponPlaceholder: 'Introdu codul',
      apply: 'Aplică',
      hint: 'Psst… încearcă VITAL10',
      valid: 'Cod aplicat: {pct}% reducere',
      invalid: 'Acest cod nu este valid.',
      total: 'Total',
      discountNote: 'Reducerea se aplică la plată',
      shipping: 'Transport',
      free: 'Gratuit',
    },
    info: {
      title: 'Datele tale',
      name: 'Nume complet',
      email: 'E-mail',
      newsletter: 'Vreau să primesc pe e-mail sfaturi anti-aging',
      addressNote: 'Adresa de livrare o vei introduce pe pagina de plată securizată (cu completare automată).',
    },
    payment: {
      title: 'Plată',
      body: 'Vei finaliza pe pagina securizată Stripe. Cardul, Apple Pay, Google Pay și alte metode apar acolo, dacă sunt disponibile în țara ta.',
      installments: 'Opțiunile de plată în rate apar la plată, dacă sunt disponibile.',
      pay: 'Plătește în siguranță',
      redirecting: 'Se deschide plata securizată…',
      error: 'Nu am putut iniția plata. Încearcă din nou.',
      ssl: 'Criptare SSL',
      guarantee: 'Garanție 30 de zile',
      stripe: 'Plăți prin Stripe',
    },
  },
  upsell1: {
    title: 'Comanda ta este confirmată. Încă un lucru…',
    body: 'Adaugă un Kit 6 (plată unică) cu 45% reducere — pentru rutina de 6 luni. Oferta este disponibilă doar pe această pagină.',
    accept: 'Da, adaugă Kit 6 la {price}',
    decline: 'Nu, mulțumesc',
    charge: 'Cardul tău salvat va fi debitat o singură dată cu {price}. Fără abonament.',
  },
  upsell2: {
    title: 'Nu rămâi niciodată fără — și plătești cu 30% mai puțin',
    body: "Primește Kit 3 la fiecare 3 luni cu {price} în loc de {full}. Reducerea se aplică atât timp cât rămâi abonat.",
    accept: "Da, mă abonez cu {price} la fiecare 3 luni",
    decline: 'Nu, mulțumesc',
    charge: "Cardul tău salvat va fi debitat cu {price} azi și la fiecare 3 luni până anulezi. Poți anula oricând.",
  },
  upsell: {
    processing: 'Se procesează…',
    error: 'Nu am putut finaliza operațiunea. Nu ți s-a retras nicio sumă.',
    action: 'Banca ta trebuie să confirme această plată. Continuă pe pagina securizată.',
  },
  thankYou: {
    title: 'Mulțumim{name}!',
    body: 'Comanda ta este confirmată. Chitanța e deja în drum spre e-mailul tău.',
    howTo: 'Cum să începi',
    steps: ['Ia o porție în fiecare dimineață.', 'Amestec-o în apă, cafea sau smoothie.', 'Continuă pe tot parcursul ciclului.'],
    vip: { title: 'Grupul VIP', body: 'Sfaturi, rețete și sprijin de la alți clienți.', cta: 'Intră în grup' },
    referral: {
      title: 'Recomandă unui prieten',
      body: 'Trimite linkul tău. Persoana căreia i-l trimiți primește 10% reducere cu codul VITAL10.',
      copy: 'Copiază linkul',
      copied: 'Copiat!',
    },
    order: 'Rezumatul comenzii',
  },
  neutral: {
    intro: 'Răspunde la 8 întrebări rapide (aproximativ 60 de secunde) și primește planul tău pentru o piele cu aspect mai tânăr și energie în fiecare zi.',
    painLibido: 'Vitalitate scăzută',
    heroSub: 'Ritualul tău zilnic: o formulă cu colagen + peptide pentru cei care vor o piele cu aspect mai tânăr și mai multă energie, adaptată răspunsurilor tale.',
    bullet: 'Să te simți bine în corpul tău începe cu grija zilnică față de tine',
    pillar: { title: 'Vitalitate și încredere', body: 'Să te simți bine în corpul tău face parte din încrederea în tine. Un ritual zilnic de grijă față de tine, pentru bărbați și femei, fără hormoni și fără stimulente.' },
  },
  emails: {
    footer: 'Primești acest mesaj pentru că ai completat chestionarul VitalRise.',
    unsubscribe: 'Dezabonare',
    diagnosis: {
      subject: '{name}, planul tău VitalRise',
      body: 'Iată rezultatul tău: {diagnosis}\n\nPlanul recomandat pentru tine: {plan}. Îl vezi aici: {link}',
    },
    vsl: {
      subject: 'Videoclipul de 2 minute făcut pentru profilul tău',
      body: 'Am pregătit un videoclip scurt despre ce înseamnă răspunsurile tale. Urmărește-l aici: {link}',
    },
    sms: { body: 'VitalRise: 10% reducere la planul tău cu codul VITAL10 → {link} Răspunde STOP pentru dezabonare.' },
    socialProof: {
      subject: 'De ce oamenii rămân fideli rutinei',
      body: 'Majoritatea studiilor despre colagen au durat între 8 și 12 săptămâni. De aceea, Kit 3 pentru 90 de zile este planul ales cel mai des. Planul tău: {link}',
    },
    lastChance: {
      subject: 'Codul tău de 10% reducere încă te așteaptă',
      body: 'Codul tău VITAL10 încă te așteaptă. Folosește-l aici: {link}',
    },
    story: {
      subject: 'Obiceiuri mici, diferență mare',
      body: 'Cea mai bună rutină este cea pe care o păstrezi. O porție pe zi, în fiecare zi. Când simți că e momentul: {link}',
    },
  },
};
