import type { Dictionary } from './en';

export const sk: Dictionary = {
  common: {
    brand: 'RENOVA CELL',
    back: 'Späť',
    next: 'Ďalej',
    continue: 'Pokračovať',
    skip: 'Preskočiť',
    loading: 'Načítava sa…',
    language: 'Jazyk',
    resultsVary: 'Výsledky sa u jednotlivých ľudí líšia.',
    fdaDisclaimer:
      'Tieto tvrdenia neboli hodnotené americkým Úradom pre kontrolu potravín a liečiv (FDA). Výrobok nie je určený na diagnostiku, liečbu, vyliečenie ani prevenciu akéhokoľvek ochorenia.',
    euDisclaimer:
      'Výživový doplnok nie je náhradou pestrej a vyváženej stravy a zdravého životného štýlu. Neprekračujte odporúčanú dennú dávku. Uchovávajte mimo dosahu malých detí.',
  },
  consent: {
    text: 'Používame cookies na analýzu a meranie reklám.',
    accept: 'Prijať',
    decline: 'Odmietnuť',
  },
  quiz: {
    progress: 'Hotovo {pct} %',
    intro: 'Odpovedzte na 8 krátkych otázok (asi 60 sekúnd) a získajte svoj plán pre mladší vzhľad pleti, viac chuti a energie v každodennom živote.',
    questions: {
      gender: {
        title: 'Ako sa identifikujete?',
        options: { male: 'Muž', female: 'Žena', other: 'Nechcem uviesť' },
      },
      age: {
        title: 'Koľko máte rokov?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: 'Čo vás teraz trápi najviac?',
        options: {
          skin: 'Pleť stráca pevnosť',
          energy: 'Málo energie',
          libido: 'Menšia chuť / vitalita',
          joints: 'Stuhnuté alebo boľavé kĺby',
          all: 'Od všetkého trochu',
        },
      },
      duration: {
        title: 'Ako dlho vás to trápi?',
        options: { lt6m: 'Menej ako 6 mesiacov', '6m-2y': '6 mesiacov – 2 roky', '2y+': 'Viac ako 2 roky' },
      },
      history: {
        title: 'Užívali ste už kolagén?',
        options: { never: 'Nikdy', tried: 'Áno, ale bez výsledku', using: 'Užívam ho teraz' },
      },
      energy: { title: 'Akú máte energiu počas dňa?', min: 'Vyčerpanie', max: 'Plno energie' },
      confidence: { title: 'Ako dobre sa cítite vo svojom tele?', min: 'Vôbec', max: 'Úplne' },
      goal: {
        title: 'Čo by ste najviac chceli cítiť v nasledujúcich 15 dňoch?',
        options: {
          skin: 'Pevnejšie vyzerajúca pleť',
          energy: 'Viac energie',
          libido: 'Viac vitality',
          joints: 'Ľahší pohyb',
          all: 'Všetko',
        },
      },
    },
    contact: {
      title: 'Kam vám máme poslať plán?',
      subtitle: 'Nepovinné: výsledok uvidíte hneď aj bez vyplnenia.',
      name: 'Krstné meno',
      email: 'E-mail',
      phone: 'Mobil (nepovinné, pre SMS)',
      marketing: 'Posielajte mi tipy a ponuky e-mailom. Odhlásiť sa môžem kedykoľvek.',
      sms: 'Posielajte mi ponuky cez SMS na toto číslo. Môžu sa účtovať poplatky operátora. Odhlásite sa odpoveďou STOP.',
      submit: 'Zobraziť výsledok',
      skip: 'Preskočiť a zobraziť výsledok',
      privacy: 'Vaše údaje nikdy nepredávame.',
    },
  },
  analyzing: {
    title: 'Pripravujeme váš plán',
    steps: ['Čítame vašich 8 odpovedí…', 'Odhadujeme váš kolagénový profil…', 'Píšeme vaše osobné odporúčanie…'],
  },
  offer: {
    trust: 'Analýza hotová pre: {name} • Na základe vašich 8 odpovedí',
    trustAnon: 'Analýza hotová • Na základe vašich 8 odpovedí',
    hero: {
      fallback: {
        woman: 'Pevnejšie vyzerajúca pleť a stabilná energia sa začínajú tým, čo telu dávate každý deň',
        man: 'Buďte znova pripravení na celý deň: každodenný kolagén pre kĺby, pleť a stabilnú energiu',
        senior: 'Po päťdesiatke telo vytvára menej kolagénu. Vaša denná rutina to môže vyvážiť',
      },
      sub: 'Váš každodenný rituál mladosti: zloženie s kolagénom + peptidmi pre tých, ktorí chcú mladší vzhľad pleti, viac chuti a viac energie, podľa vašich odpovedí.',
      cta: 'Zobraziť odporúčaný plán',
    },
    vsl: {
      title: 'Pozrite sa: čo znamenajú vaše odpovede',
      unavailable: 'Video teraz nie je dostupné. Všetko potrebné nájdete nižšie.',
      cta: 'Chcem svoj plán',
      resume: 'Pokračujeme tam, kde ste skončili',
    },
    diagnosis: {
      title: 'Odhad vášho kolagénu',
      body: 'Približne od 25 rokov telo každý rok vytvára asi o 1 % menej kolagénu. Vo vašom veku je to približne o {pct} % menej ako v 25 rokoch.',
      note: 'Ilustratívny odhad na základe často uvádzaného priemeru, nie lekárske meranie.',
    },
    bullets: {
      title: 'Čo to znamená pre vás',
      items: {
        skin: [
          'Kolagénové peptidy boli v štúdiách s placebom spojené s lepšou pružnosťou pleti',
          'Jednoduchá denná dávka, ktorá sa zmestí do vášho rána',
          'Pre pleť, ktorá začína strácať pevnosť',
        ],
        energy: [
          'Denná dávka bohatá na bielkoviny ako podpora vašej rutiny',
          'Bez stimulantov, takže žiadny neskorší prepad',
          'Dopĺňa spánok, vodu a pohyb pre vyrovnanejšie dni',
        ],
        libido: [
          'Cítiť sa dobre vo vlastnej koži je súčasťou chuti',
          'Každodenný rituál starostlivosti o seba, ktorý podporuje sebavedomie',
          'Bez hormónov a bez stimulantov',
        ],
        joints: [
          'Hydrolyzovaný kolagén bol skúmaný pri kĺbových ťažkostiach spojených s pohybom',
          'Podpora chrupavky a spojivového tkaniva, ktoré používate každý deň',
          'Ľahko sa užíva denne, a o to ide',
        ],
        all: [
          'Jedna denná dávka pre pleť, kĺby a celkovú pohodu',
          'Kolagénové peptidy a zmes peptidov',
          'Vytvorené pre rutinu, ktorú už máte',
        ],
      },
    },
    pillars: {
      title: 'Jeden denný rituál, tri ciele',
      items: [
        { title: 'Mladší vzhľad pleti', body: 'Kolagénové peptidy boli v štúdiách s placebom spojené s lepšou pružnosťou a hydratáciou pleti.' },
        { title: 'Chuť a vitalita', body: 'Cítiť sa dobre vo svojom tele je súčasťou chuti. Každodenný rituál starostlivosti o seba pre mužov aj ženy, bez hormónov a bez stimulantov.' },
        { title: 'Energia na celý deň', body: 'Denná dávka bohatá na bielkoviny, ktorá sa zmestí do vášho rána, bez stimulantov a bez prepadov.' },
      ],
      note: 'Výsledky sa líšia. RENOVA CELL je výživový doplnok, nie liek.',
    },
    science: {
      title: 'Čo hovorí výskum',
      flip: 'Ťuknutím zobrazíte zdroj',
      cards: [
        {
          title: 'Pružnosť pleti',
          finding:
            '69 žien užívalo 8 týždňov 2,5 g alebo 5 g konkrétnych kolagénových peptidov alebo placebo. Pružnosť pleti sa oproti placebu zlepšila.',
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Komfort kĺbov',
          finding:
            'Športovci, ktorí 24 týždňov užívali 10 g hydrolyzovaného kolagénu denne, uvádzali menej bolesti kĺbov pri pohybe ako skupina s placebom.',
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'Celkový pohľad',
          finding:
            'Metaanalýza 26 randomizovaných štúdií (1 721 účastníkov) zistila zlepšenie hydratácie a pružnosti pleti oproti placebu.',
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'Štúdie testovali konkrétne kolagénové prípravky; výsledky nemusia platiť pre každý výrobok, ani pre tento.',
    },
    timeline: {
      title: 'Čo očakávať',
      steps: [
        { day: 'Deň 1', title: 'Začnite s rituálom', body: 'Jedna dávka denne. Rozhoduje pravidelnosť.' },
        { day: 'Deň 5', title: 'Urobte z toho zvyk', body: 'Rovnaký čas, rovnaké miesto. Zvyk sa upevňuje.' },
        { day: 'Deň 15', title: 'Zastavte sa', body: 'Všímajte si, ako sa cítite, a držte sa zvyku.' },
        { day: 'Deň 30', title: 'Jeden mesiac', body: 'Pokračujte. Štúdie merali zmeny pleti po 4 až 12 týždňoch.' },
        { day: 'Deň 90', title: 'Celý cyklus', body: 'Obdobie, ktoré sledovala väčšina štúdií. Čas porovnať.' },
      ],
    },
    beforeAfter: {
      title: 'Skutoční zákazníci',
      before: 'Pred',
      after: 'Po',
      note: 'Neupravené fotografie zdieľané so súhlasom. Výsledky sa líšia.',
    },
    testimonials: {
      title: 'Ľudia ako vy',
      note: 'Skutoční zákazníci, zdieľané so súhlasom. Výsledky sa líšia.',
    },
    simulator: {
      title: 'Vaša kolagénová krivka',
      label: 'Váš vek',
      yAxis: 'Odhad kolagénu oproti 25 rokom (%)',
      you: 'Vy',
      note: 'Znázornenie často uvádzaného poklesu o ~1 % ročne po 25. roku. Nejde o predpoveď výsledkov výrobku.',
    },
    comparison: {
      title: 'RENOVA CELL vs. bežný kolagén',
      us: 'RENOVA CELL',
      them: 'Bežný kolagén',
      rows: [
        { label: 'Hydrolyzované kolagénové peptidy', us: 'yes', them: 'yes' },
        { label: 'Pridaná zmes peptidov', us: 'yes', them: 'no' },
        { label: 'Plán podľa vášho kvízu', us: 'yes', them: 'no' },
        { label: '30-dňová záruka vrátenia peňazí', us: 'yes', them: 'varies' },
      ],
      varies: 'Rôzne',
    },
    pricing: {
      perMonth: '/mes.',
      once: 'Jednorazový nákup',
      subscribe: 'Predplatné: doručíme znova, keď dôjde',
      interval: { m1: 'každý mesiac', m3: 'každé 3 mesiace', m6: 'každých 6 mesiacov' },
      title: 'Vyberte si plán',
      recommended: 'Odporúčané pre vás',
      perUnit: '{price} za kus',
      save: 'Ušetríte {pct} %',
      plans: {
        single: { name: '1 kus', desc: 'Vyskúšajte na mesiac' },
        kit3: { name: 'Kit 3', desc: '90-dňový cyklus z väčšiny štúdií' },
        kit6: { name: 'Kit 6', desc: 'Zásoba na 6 mesiacov' },
      },
      recurring: 'Strhneme {price} {interval}, kým nezrušíte. Zrušiť môžete kedykoľvek cez potvrdenie v e-maile.',
      cta: 'Vybrať tento plán',
    },
    shipping: { free: 'Doprava zdarma', fast: 'Doručenie do 2 pracovných dní', discreet: 'Diskrétne balenie' },
    bonus: {
      title: 'Súčasťou Kit 3 a Kit 6',
      items: ['E-kniha: Kolagénová rutina', '15-dňový jedálniček', 'VIP skupina zákazníkov'],
    },
    guarantee: {
      title: '30-dňová záruka vrátenia peňazí',
      body: 'Vyskúšajte to 30 dní. Ak nebudete spokojní, napíšte nám a peniaze za objednávku vrátime bez otázok.',
    },
    faq: {
      title: 'Otázky',
      items: {
        different: {
          q: 'Kolagén som už skúšal(a) a nič som nezbadal(a). Prečo by to teraz malo byť iné?',
          a: 'Veľa ľudí prestane po pár týždňoch. Väčšina štúdií trvala 8 až 12 týždňov s dennou dávkou, preto odporúčame 90-dňový Kit 3. A ak vám nevyhovuje, platí 30-dňová záruka.',
        },
        time: {
          q: 'Ako rýchlo uvidím výsledky?',
          a: 'Každý je iný. Výskum meral zmeny pleti po 4 až 12 týždňoch denného užívania. Dajte tomu aspoň jeden celý cyklus.',
        },
        safe: {
          q: 'Je to pre mňa bezpečné?',
          a: 'Kolagén je potravinová bielkovina, ktorá sa zvyčajne dobre znáša. Ak ste tehotná, dojčíte, užívate lieky alebo máte zdravotné ťažkosti, najprv sa poraďte s lekárom.',
        },
        men: {
          q: 'Je to aj pre mužov?',
          a: 'Áno. Kolagén podporuje pleť a kĺby u každého. Netvrdíme, že ovplyvňuje hormóny.',
        },
        how: {
          q: 'Ako sa užíva?',
          a: 'Jedna dávka denne, rozmiešaná vo vode, káve alebo smoothie. Najlepšie každý deň v rovnakom čase.',
        },
        cancel: {
          q: 'Ako zruším predplatné?',
          a: 'Použite odkaz v ktoromkoľvek e-maile s potvrdením alebo nám napíšte. Zrušiť môžete kedykoľvek a bez poplatkov.',
        },
        shipping: {
          q: 'Ako funguje doprava?',
          a: 'Doprava je zdarma do všetkých krajín, kam doručujeme. Doručenie trvá najviac 2 pracovné dni, so sledovaním zásielky, v neutrálnom, diskrétnom balení bez názvu produktu na obale. Odkaz na sledovanie príde e-mailom hneď, ako je objednávka odoslaná.',
        },
      },
    },
    sticky: { cta: 'Chcem svoj plán' },
    exit: {
      title: 'Počkajte: zľava 10 %, kým odídete',
      body: 'Použite tento kód v pokladni:',
      code: 'RENOVA10',
      cta: 'Použiť zľavu 10 %',
      dismiss: 'Nie, ďakujem',
    },
    chat: {
      title: 'Opýtajte sa Eleny',
      subtitle: 'AI asistentka · nie je lekárka',
      greeting: 'Dobrý deň! Som Elena, AI asistentka RENOVA CELL. Opýtajte sa ma na čokoľvek o výrobku alebo vašom pláne.',
      placeholder: 'Napíšte svoju otázku…',
      send: 'Odoslať',
      error: 'Ospravedlňujeme sa, niečo sa pokazilo. Skúste to znova.',
      open: 'Otvoriť chat',
      close: 'Zavrieť chat',
    },
    social: { ordered: 'Objednávok za posledných 24 hodín: {count}' },
    footer: {
      privacy: 'Ochrana súkromia',
      terms: 'Podmienky',
      contact: 'Kontakt',
      rights: 'Všetky práva vyhradené.',
    },
  },
  checkout: {
    steps: ['Košík', 'Vaše údaje', 'Platba'],
    cart: {
      title: 'Vaša objednávka',
      bumpTitle: '+1 kus navyše za {price}',
      bumpBody: 'Len na tejto stránke: pridajte ďalší kus za nižšiu cenu.',
      coupon: 'Zľavový kód',
      couponPlaceholder: 'Zadajte kód',
      apply: 'Použiť',
      hint: 'Psst… skúste RENOVA10',
      valid: 'Kód použitý: zľava {pct} %',
      invalid: 'Tento kód nie je platný.',
      total: 'Spolu',
      discountNote: 'Zľava sa odpočíta pri platbe',
      shipping: 'Doprava',
      free: 'Zdarma',
    },
    info: {
      title: 'Vaše údaje',
      name: 'Celé meno',
      email: 'E-mail',
      newsletter: 'Posielajte mi e-mailom tipy proti starnutiu',
      addressNote: 'Doručovaciu adresu zadáte na zabezpečenej platobnej stránke (s automatickým dopĺňaním).',
    },
    payment: {
      title: 'Platba',
      body: 'Nákup dokončíte na zabezpečenej stránke Stripe. Karta, Apple Pay, Google Pay a ďalšie metódy sa tam zobrazia, ak sú vo vašej krajine dostupné.',
      installments: 'Možnosti platby na splátky sa zobrazia pri platbe, ak sú dostupné.',
      pay: 'Bezpečne zaplatiť',
      redirecting: 'Otvárame zabezpečenú platbu…',
      error: 'Platbu sa nepodarilo spustiť. Skúste to znova.',
      ssl: 'Šifrovanie SSL',
      guarantee: '30-dňová záruka',
      stripe: 'Platby cez Stripe',
    },
  },
  upsell1: {
    title: 'Objednávka je potvrdená. Ešte jedna vec…',
    body: 'Pridajte si Kit 6 (jednorazovo) so zľavou 45 % na 6-mesačnú rutinu. Ponuka platí len na tejto stránke.',
    accept: 'Áno, pridať Kit 6 za {price}',
    decline: 'Nie, ďakujem',
    charge: 'Z vašej uloženej karty jednorazovo strhneme {price}. Nejde o predplatné.',
  },
  upsell2: {
    title: 'Už nikdy bez zásoby, a o 30 % lacnejšie',
    body: 'Dostávajte Kit 3 každé 3 mesiace za {price} namiesto {full}. Zľava platí, kým budete mať predplatné.',
    accept: 'Áno, predplatiť za {price} každé 3 mesiace',
    decline: 'Nie, ďakujem',
    charge: 'Z vašej uloženej karty strhneme {price} dnes a potom každé 3 mesiace, kým nezrušíte. Zrušiť môžete kedykoľvek.',
  },
  upsell: {
    processing: 'Spracúvame…',
    error: 'Nepodarilo sa to dokončiť. Nič sme vám nestrhli.',
    action: 'Vaša banka musí túto platbu potvrdiť. Pokračujte na zabezpečenej stránke.',
  },
  thankYou: {
    title: 'Ďakujeme{name}!',
    body: 'Vaša objednávka je potvrdená. Potvrdenie smeruje do vášho e-mailu.',
    howTo: 'Ako začať',
    steps: ['Každé ráno si dajte jednu dávku.', 'Rozmiešajte vo vode, káve alebo smoothie.', 'Pokračujte až do konca cyklu.'],
    vip: { title: 'VIP skupina', body: 'Tipy, recepty a podpora od ďalších zákazníkov.', cta: 'Pridať sa do skupiny' },
    referral: {
      title: 'Odporučte to priateľom',
      body: 'Pošlite svoj odkaz. Kto ho použije, získa zľavu 10 % s kódom RENOVA10.',
      copy: 'Kopírovať odkaz',
      copied: 'Skopírované!',
    },
    order: 'Súhrn objednávky',
  },
  emails: {
    footer: 'Tento e-mail dostávate, pretože ste vyplnili kvíz RENOVA CELL.',
    unsubscribe: 'Odhlásiť sa',
    diagnosis: {
      subject: '{name}, váš plán RENOVA CELL',
      body: 'Tu je váš výsledok: {diagnosis}\n\nOdporúčaný plán pre vás je {plan}. Pozrite si ho tu: {link}',
    },
    vsl: {
      subject: 'Dvojminútové video pre váš profil',
      body: 'Pripravili sme krátke video o tom, čo znamenajú vaše odpovede. Pozrite si ho tu: {link}',
    },
    sms: { body: 'RENOVA CELL: zľava 10 % na váš plán s kódom RENOVA10 → {link} Odhlásite sa odpoveďou STOP.' },
    socialProof: {
      subject: 'Prečo pri tom ľudia zostávajú',
      body: 'Väčšina štúdií kolagénu trvala 8 až 12 týždňov. Preto je 90-dňový Kit 3 náš najčastejšie volený plán. Váš plán: {link}',
    },
    lastChance: {
      subject: 'Váš zľavový kód na 10 % stále čaká',
      body: 'Váš kód RENOVA10 na vás stále čaká. Použite ho tu: {link}',
    },
    story: {
      subject: 'Malé zvyky, veľký rozdiel',
      body: 'Najlepšia rutina je tá, ktorej sa držíte. Jedna dávka denne, každý deň. Keď budete pripravení: {link}',
    },
  },
};
