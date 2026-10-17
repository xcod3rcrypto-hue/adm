import type { Dictionary } from './en';

export const cs: Dictionary = {
  common: {
    brand: 'RENOVA CELL',
    back: 'Zpět',
    next: 'Další',
    continue: 'Pokračovat',
    skip: 'Přeskočit',
    loading: 'Načítání…',
    language: 'Jazyk',
    resultsVary: 'Výsledky se u jednotlivých lidí liší.',
    fdaDisclaimer:
      'Tato tvrzení nebyla hodnocena americkým Úřadem pro kontrolu potravin a léčiv (FDA). Výrobek není určen k diagnostice, léčbě, vyléčení ani prevenci jakéhokoli onemocnění.',
    euDisclaimer:
      'Doplněk stravy není náhradou pestré a vyvážené stravy a zdravého životního stylu. Nepřekračujte doporučenou denní dávku. Uchovávejte mimo dosah malých dětí.',
  },
  consent: {
    text: 'Používáme cookies pro analýzu a měření reklam.',
    accept: 'Přijmout',
    decline: 'Odmítnout',
  },
  quiz: {
    progress: 'Hotovo {pct} %',
    intro: 'Odpovězte na 8 krátkých otázek (asi 60 sekund) a získejte svůj plán pro mladší vzhled pleti, více chuti a energie v každodenním životě.',
    questions: {
      gender: {
        title: 'Jak se identifikujete?',
        options: { male: 'Muž', female: 'Žena', other: 'Nechci uvádět' },
      },
      age: {
        title: 'Kolik vám je let?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: 'Co vás teď trápí nejvíc?',
        options: {
          skin: 'Pleť ztrácí pevnost',
          energy: 'Málo energie',
          libido: 'Menší chuť / vitalita',
          joints: 'Ztuhlé nebo bolavé klouby',
          all: 'Od všeho trochu',
        },
      },
      duration: {
        title: 'Jak dlouho vás to trápí?',
        options: { lt6m: 'Méně než 6 měsíců', '6m-2y': '6 měsíců – 2 roky', '2y+': 'Déle než 2 roky' },
      },
      history: {
        title: 'Užíval(a) jste už kolagen?',
        options: { never: 'Nikdy', tried: 'Ano, ale bez výsledku', using: 'Užívám ho teď' },
      },
      energy: { title: 'Jakou máte energii během dne?', min: 'Vyčerpání', max: 'Plno energie' },
      confidence: { title: 'Jak dobře se cítíte ve svém těle?', min: 'Vůbec', max: 'Naprosto' },
      goal: {
        title: 'Co byste nejvíc chtěl(a) cítit v příštích 15 dnech?',
        options: {
          skin: 'Pevněji vypadající pleť',
          energy: 'Více energie',
          libido: 'Více vitality',
          joints: 'Snazší pohyb',
          all: 'Všechno',
        },
      },
    },
    contact: {
      title: 'Kam vám máme poslat plán?',
      subtitle: 'Nepovinné: výsledek uvidíte hned i bez vyplnění.',
      name: 'Křestní jméno',
      email: 'E-mail',
      phone: 'Mobil (nepovinné, pro SMS)',
      marketing: 'Posílejte mi tipy a nabídky e-mailem. Odhlásit se můžu kdykoli.',
      sms: 'Posílejte mi nabídky SMS na toto číslo. Mohou být účtovány poplatky operátora. Odhlásíte se odpovědí STOP.',
      submit: 'Zobrazit výsledek',
      skip: 'Přeskočit a zobrazit výsledek',
      privacy: 'Vaše údaje nikdy neprodáváme.',
    },
  },
  analyzing: {
    title: 'Připravujeme váš plán',
    steps: ['Čteme vašich 8 odpovědí…', 'Odhadujeme váš kolagenový profil…', 'Píšeme vaše osobní doporučení…'],
  },
  offer: {
    trust: 'Analýza hotova pro: {name} • Na základě vašich 8 odpovědí',
    trustAnon: 'Analýza hotova • Na základě vašich 8 odpovědí',
    hero: {
      fallback: {
        woman: 'Pevněji vypadající pleť a stabilní energie začínají tím, co tělu dáváte každý den',
        man: 'Buďte zase připraveni na celý den: každodenní kolagen pro klouby, pleť a stabilní energii',
        senior: 'Po padesátce tělo vytváří méně kolagenu. Vaše denní rutina to může vyvážit',
      },
      sub: 'Váš každodenní rituál mládí: složení s kolagenem + peptidy pro ty, kdo chtějí mladší vzhled pleti, více chuti a více energie, podle vašich odpovědí.',
      cta: 'Zobrazit doporučený plán',
    },
    vsl: {
      title: 'Podívejte se: co znamenají vaše odpovědi',
      unavailable: 'Video teď není k dispozici. Vše potřebné najdete níže.',
      cta: 'Chci svůj plán',
      resume: 'Pokračujeme tam, kde jste skončil(a)',
    },
    diagnosis: {
      title: 'Odhad vašeho kolagenu',
      body: 'Zhruba od 25 let tělo každý rok vytváří přibližně o 1 % méně kolagenu. Ve vašem věku to dělá asi o {pct} % méně než ve 25 letech.',
      note: 'Ilustrativní odhad na základě často uváděného průměru, nikoli lékařské měření.',
    },
    bullets: {
      title: 'Co to znamená pro vás',
      items: {
        skin: [
          'Kolagenové peptidy byly ve studiích s placebem spojeny s lepší pružností pleti',
          'Jednoduchá denní dávka, která se vejde do vašeho rána',
          'Pro pleť, která začíná ztrácet pevnost',
        ],
        energy: [
          'Denní dávka bohatá na bílkoviny jako podpora vaší rutiny',
          'Bez stimulantů, takže žádný pozdější propad',
          'Doplňuje spánek, vodu a pohyb pro vyrovnanější dny',
        ],
        libido: [
          'Cítit se dobře ve vlastní kůži je součástí chuti',
          'Každodenní rituál péče o sebe, který podporuje sebevědomí',
          'Bez hormonů a bez stimulantů',
        ],
        joints: [
          'Hydrolyzovaný kolagen byl zkoumán u kloubních potíží spojených s pohybem',
          'Podpora chrupavky a pojivové tkáně, které používáte každý den',
          'Snadno se užívá denně, a o to jde',
        ],
        all: [
          'Jedna denní dávka pro pleť, klouby a celkovou pohodu',
          'Kolagenové peptidy a směs peptidů',
          'Vytvořeno pro rutinu, kterou už máte',
        ],
      },
    },
    pillars: {
      title: 'Jeden denní rituál, tři cíle',
      items: [
        { title: 'Mladší vzhled pleti', body: 'Kolagenové peptidy byly ve studiích s placebem spojeny s lepší pružností a hydratací pleti.' },
        { title: 'Chuť a vitalita', body: 'Cítit se dobře ve svém těle je součástí chuti. Každodenní rituál péče o sebe pro muže i ženy, bez hormonů a bez stimulantů.' },
        { title: 'Energie na celý den', body: 'Denní dávka bohatá na bílkoviny, která se vejde do vašeho rána, bez stimulantů a bez propadů.' },
      ],
      note: 'Výsledky se liší. RENOVA CELL je doplněk stravy, nikoli léčivo.',
    },
    science: {
      title: 'Co říká výzkum',
      flip: 'Klepnutím zobrazíte zdroj',
      cards: [
        {
          title: 'Pružnost pleti',
          finding:
            '69 žen užívalo 8 týdnů 2,5 g nebo 5 g konkrétních kolagenových peptidů nebo placebo. Pružnost pleti se oproti placebu zlepšila.',
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Komfort kloubů',
          finding:
            'Sportovci, kteří 24 týdnů užívali 10 g hydrolyzovaného kolagenu denně, uváděli méně bolesti kloubů při pohybu než skupina s placebem.',
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'Celkový pohled',
          finding:
            'Metaanalýza 26 randomizovaných studií (1 721 účastníků) zjistila zlepšení hydratace a pružnosti pleti oproti placebu.',
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'Studie testovaly konkrétní kolagenové přípravky; výsledky nemusí platit pro každý výrobek, ani pro tento.',
    },
    timeline: {
      title: 'Co čekat',
      steps: [
        { day: 'Den 1', title: 'Začněte s rituálem', body: 'Jedna dávka denně. Rozhoduje pravidelnost.' },
        { day: 'Den 5', title: 'Udělejte z toho zvyk', body: 'Stejný čas, stejné místo. Zvyk se upevňuje.' },
        { day: 'Den 15', title: 'Zastavte se', body: 'Všímejte si, jak se cítíte, a držte se zvyku.' },
        { day: 'Den 30', title: 'Jeden měsíc', body: 'Pokračujte. Studie měřily změny pleti po 4 až 12 týdnech.' },
        { day: 'Den 90', title: 'Celý cyklus', body: 'Období, které sledovala většina studií. Čas porovnat.' },
      ],
    },
    beforeAfter: {
      title: 'Skuteční zákazníci',
      before: 'Před',
      after: 'Po',
      note: 'Neupravené fotografie sdílené se souhlasem. Výsledky se liší.',
    },
    testimonials: {
      title: 'Lidé jako vy',
      note: 'Skuteční zákazníci, sdíleno se souhlasem. Výsledky se liší.',
    },
    simulator: {
      title: 'Vaše kolagenová křivka',
      label: 'Váš věk',
      yAxis: 'Odhad kolagenu oproti 25 letům (%)',
      you: 'Vy',
      note: 'Znázornění často uváděného poklesu o ~1 % ročně po 25. roce. Nejde o předpověď výsledků výrobku.',
    },
    comparison: {
      title: 'RENOVA CELL vs. běžný kolagen',
      us: 'RENOVA CELL',
      them: 'Běžný kolagen',
      rows: [
        { label: 'Hydrolyzované kolagenové peptidy', us: 'yes', them: 'yes' },
        { label: 'Přidaná směs peptidů', us: 'yes', them: 'no' },
        { label: 'Plán podle vašeho kvízu', us: 'yes', them: 'no' },
        { label: '30denní záruka vrácení peněz', us: 'yes', them: 'varies' },
      ],
      varies: 'Různě',
    },
    pricing: {
      perMonth: '/měs.',
      once: 'Jednorázový nákup',
      subscribe: 'Předplatné: doručíme znovu, až dojde',
      interval: { m1: 'každý měsíc', m3: 'každé 3 měsíce', m6: 'každých 6 měsíců' },
      title: 'Vyberte si plán',
      recommended: 'Doporučeno pro vás',
      perUnit: '{price} za kus',
      save: 'Ušetříte {pct} %',
      plans: {
        single: { name: '1 kus', desc: 'Vyzkoušejte na měsíc' },
        kit3: { name: 'Kit 3', desc: '90denní cyklus z většiny studií' },
        kit6: { name: 'Kit 6', desc: 'Zásoba na 6 měsíců' },
      },
      recurring: 'Strhneme {price} {interval}, dokud nezrušíte. Zrušit můžete kdykoli přes účtenku v e-mailu.',
      cta: 'Vybrat tento plán',
    },
    shipping: { free: 'Doprava zdarma', fast: 'Rychlé doručení se sledováním', discreet: 'Diskrétní balení' },
    bonus: {
      title: 'Součástí Kit 3 a Kit 6',
      items: ['E-kniha: Kolagenová rutina', '15denní jídelníček', 'VIP skupina zákazníků'],
    },
    guarantee: {
      title: '30denní záruka vrácení peněz',
      body: 'Vyzkoušejte to 30 dní. Pokud nebudete spokojeni, napište nám a peníze za objednávku vrátíme bez otázek.',
    },
    faq: {
      title: 'Otázky',
      items: {
        different: {
          q: 'Kolagen jsem už zkoušel(a) a nic jsem nepoznal(a). Proč by to teď mělo být jiné?',
          a: 'Hodně lidí přestane po pár týdnech. Většina studií trvala 8 až 12 týdnů s denní dávkou, proto doporučujeme 90denní Kit 3. A pokud vám nevyhovuje, platí 30denní záruka.',
        },
        time: {
          q: 'Jak rychle uvidím výsledky?',
          a: 'Každý je jiný. Výzkum měřil změny pleti po 4 až 12 týdnech denního užívání. Dejte tomu aspoň jeden celý cyklus.',
        },
        safe: {
          q: 'Je to pro mě bezpečné?',
          a: 'Kolagen je potravinová bílkovina, která se obvykle dobře snáší. Pokud jste těhotná, kojíte, užíváte léky nebo máte zdravotní potíže, poraďte se nejdřív s lékařem.',
        },
        men: {
          q: 'Je to i pro muže?',
          a: 'Ano. Kolagen podporuje pleť a klouby u každého. Netvrdíme, že ovlivňuje hormony.',
        },
        how: {
          q: 'Jak se užívá?',
          a: 'Jedna dávka denně, rozmíchaná ve vodě, kávě nebo smoothie. Nejlépe každý den ve stejnou dobu.',
        },
        cancel: {
          q: 'Jak zruším předplatné?',
          a: 'Použijte odkaz v kterémkoli e-mailu s účtenkou nebo nám napište. Zrušit můžete kdykoli a bez poplatků.',
        },
        shipping: {
          q: 'Jak funguje doprava?',
          a: 'Doprava je zdarma do všech zemí, kam doručujeme. Objednávky odesíláme rychle, se sledováním zásilky, v neutrálním, diskrétním balení bez názvu produktu na obalu. Odkaz na sledování přijde e-mailem, jakmile je objednávka odeslána.',
        },
      },
    },
    sticky: { cta: 'Chci svůj plán' },
    exit: {
      title: 'Počkejte: sleva 10 %, než odejdete',
      body: 'Použijte tento kód v pokladně:',
      code: 'RENOVA10',
      cta: 'Použít slevu 10 %',
      dismiss: 'Ne, děkuji',
    },
    chat: {
      title: 'Zeptejte se Eleny',
      subtitle: 'AI asistentka · není lékařka',
      greeting: 'Dobrý den! Jsem Elena, AI asistentka RENOVA CELL. Zeptejte se mě na cokoli o výrobku nebo vašem plánu.',
      placeholder: 'Napište svůj dotaz…',
      send: 'Odeslat',
      error: 'Omlouváme se, něco se pokazilo. Zkuste to znovu.',
      open: 'Otevřít chat',
      close: 'Zavřít chat',
    },
    social: { ordered: 'Objednávek za posledních 24 hodin: {count}' },
    footer: {
      privacy: 'Ochrana soukromí',
      terms: 'Podmínky',
      contact: 'Kontakt',
      rights: 'Všechna práva vyhrazena.',
    },
  },
  checkout: {
    steps: ['Košík', 'Vaše údaje', 'Platba'],
    cart: {
      title: 'Vaše objednávka',
      bumpTitle: '+1 kus navíc za {price}',
      bumpBody: 'Jen na této stránce: přidejte další kus za nižší cenu.',
      coupon: 'Slevový kód',
      couponPlaceholder: 'Zadejte kód',
      apply: 'Použít',
      hint: 'Psst… zkuste RENOVA10',
      valid: 'Kód použit: sleva {pct} %',
      invalid: 'Tento kód není platný.',
      total: 'Celkem',
      discountNote: 'Sleva se odečte při platbě',
      shipping: 'Doprava',
      free: 'Zdarma',
    },
    info: {
      title: 'Vaše údaje',
      name: 'Celé jméno',
      email: 'E-mail',
      newsletter: 'Posílejte mi e-mailem tipy proti stárnutí',
      addressNote: 'Doručovací adresu zadáte na zabezpečené platební stránce (s automatickým doplňováním).',
    },
    payment: {
      title: 'Platba',
      body: 'Nákup dokončíte na zabezpečené stránce Stripe. Karta, Apple Pay, Google Pay a další metody se tam zobrazí, pokud jsou ve vaší zemi dostupné.',
      installments: 'Možnosti platby na splátky se zobrazí při platbě, pokud jsou dostupné.',
      pay: 'Bezpečně zaplatit',
      redirecting: 'Otevíráme zabezpečenou platbu…',
      error: 'Platbu se nepodařilo zahájit. Zkuste to znovu.',
      ssl: 'Šifrování SSL',
      guarantee: '30denní záruka',
      stripe: 'Platby přes Stripe',
    },
  },
  upsell1: {
    title: 'Objednávka je potvrzena. Ještě jedna věc…',
    body: 'Přidejte si Kit 6 (jednorázově) se slevou 45 % na 6měsíční rutinu. Nabídka platí jen na této stránce.',
    accept: 'Ano, přidat Kit 6 za {price}',
    decline: 'Ne, děkuji',
    charge: 'Z vaší uložené karty jednorázově strhneme {price}. Nejde o předplatné.',
  },
  upsell2: {
    title: 'Už nikdy bez zásoby, a o 30 % levněji',
    body: 'Dostávejte Kit 3 každé 3 měsíce za {price} místo {full}. Sleva platí, dokud budete mít předplatné.',
    accept: 'Ano, předplatit za {price} každé 3 měsíce',
    decline: 'Ne, děkuji',
    charge: 'Z vaší uložené karty strhneme {price} dnes a pak každé 3 měsíce, dokud nezrušíte. Zrušit můžete kdykoli.',
  },
  upsell: {
    processing: 'Zpracováváme…',
    error: 'Nepodařilo se to dokončit. Nic jsme vám nestrhli.',
    action: 'Vaše banka musí tuto platbu potvrdit. Pokračujte na zabezpečené stránce.',
  },
  thankYou: {
    title: 'Děkujeme{name}!',
    body: 'Vaše objednávka je potvrzena. Účtenka míří do vašeho e-mailu.',
    howTo: 'Jak začít',
    steps: ['Každé ráno si dejte jednu dávku.', 'Rozmíchejte ve vodě, kávě nebo smoothie.', 'Pokračujte až do konce cyklu.'],
    vip: { title: 'VIP skupina', body: 'Tipy, recepty a podpora od dalších zákazníků.', cta: 'Přidat se do skupiny' },
    referral: {
      title: 'Doporučte to přátelům',
      body: 'Pošlete svůj odkaz. Kdo ho použije, získá slevu 10 % s kódem RENOVA10.',
      copy: 'Kopírovat odkaz',
      copied: 'Zkopírováno!',
    },
    order: 'Souhrn objednávky',
  },
  emails: {
    footer: 'Tento e-mail dostáváte, protože jste vyplnil(a) kvíz RENOVA CELL.',
    unsubscribe: 'Odhlásit se',
    diagnosis: {
      subject: '{name}, váš plán RENOVA CELL',
      body: 'Tady je váš výsledek: {diagnosis}\n\nDoporučený plán pro vás je {plan}. Podívejte se na něj zde: {link}',
    },
    vsl: {
      subject: 'Dvouminutové video pro váš profil',
      body: 'Připravili jsme krátké video o tom, co znamenají vaše odpovědi. Podívejte se zde: {link}',
    },
    sms: { body: 'RENOVA CELL: sleva 10 % na váš plán s kódem RENOVA10 → {link} Odhlásíte se odpovědí STOP.' },
    socialProof: {
      subject: 'Proč u toho lidé zůstávají',
      body: 'Většina studií kolagenu trvala 8 až 12 týdnů. Proto je 90denní Kit 3 náš nejčastěji volený plán. Váš plán: {link}',
    },
    lastChance: {
      subject: 'Váš slevový kód na 10 % stále čeká',
      body: 'Váš kód RENOVA10 na vás stále čeká. Použijte ho zde: {link}',
    },
    story: {
      subject: 'Malé zvyky, velký rozdíl',
      body: 'Nejlepší rutina je ta, které se držíte. Jedna dávka denně, každý den. Až budete připraveni: {link}',
    },
  },
};
