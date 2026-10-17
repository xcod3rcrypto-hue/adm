import type { Dictionary } from './en';

export const hu: Dictionary = {
  common: {
    brand: 'RENOVA CELL',
    back: 'Vissza',
    next: 'Tovább',
    continue: 'Folytatás',
    skip: 'Kihagyás',
    loading: 'Betöltés…',
    language: 'Nyelv',
    resultsVary: 'Az eredmények egyénenként eltérnek.',
    fdaDisclaimer:
      'Ezeket az állításokat az amerikai Élelmiszer- és Gyógyszerügyi Hivatal (FDA) nem értékelte. A termék nem alkalmas betegségek diagnosztizálására, kezelésére, gyógyítására vagy megelőzésére.',
    euDisclaimer:
      'Az étrend-kiegészítő nem helyettesíti a változatos, kiegyensúlyozott étrendet és az egészséges életmódot. Az ajánlott napi mennyiséget ne lépje túl. Kisgyermekek elől elzárva tartandó.',
  },
  consent: {
    text: 'Sütiket használunk elemzéshez és a hirdetések méréséhez.',
    accept: 'Elfogadom',
    decline: 'Elutasítom',
  },
  quiz: {
    progress: '{pct}% kész',
    intro: 'Válaszolj 8 rövid kérdésre (kb. 60 másodperc), és megkapod a terved a fiatalosabb bőrért, több vágyért és mindennapi energiáért.',
    questions: {
      gender: {
        title: 'Minek vallod magad?',
        options: { male: 'Férfi', female: 'Nő', other: 'Nem szeretném megadni' },
      },
      age: {
        title: 'Hány éves vagy?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: 'Mi zavar most a legjobban?',
        options: {
          skin: 'A bőr veszít feszességéből',
          energy: 'Kevés energia',
          libido: 'Kevesebb vágy / vitalitás',
          joints: 'Merev vagy fájós ízületek',
          all: 'Egy kicsit minden',
        },
      },
      duration: {
        title: 'Mióta zavar ez?',
        options: { lt6m: 'Kevesebb mint 6 hónapja', '6m-2y': '6 hónap – 2 év', '2y+': 'Több mint 2 éve' },
      },
      history: {
        title: 'Szedtél már kollagént?',
        options: { never: 'Soha', tried: 'Igen, de eredmény nélkül', using: 'Most is szedem' },
      },
      energy: { title: 'Milyen a napi energiád?', min: 'Kimerült', max: 'Csupa energia' },
      confidence: { title: 'Mennyire érzed jól magad a testedben?', min: 'Egyáltalán nem', max: 'Teljesen' },
      goal: {
        title: 'Mit szeretnél leginkább érezni a következő 15 napban?',
        options: {
          skin: 'Feszesebbnek tűnő bőr',
          energy: 'Több energia',
          libido: 'Több vitalitás',
          joints: 'Könnyebb mozgás',
          all: 'Mindezt',
        },
      },
    },
    contact: {
      title: 'Hová küldjük a terved?',
      subtitle: 'Nem kötelező: az eredményt enélkül is azonnal látod.',
      name: 'Keresztnév',
      email: 'E-mail',
      phone: 'Mobil (nem kötelező, SMS-hez)',
      marketing: 'Kérek tippeket és ajánlatokat e-mailben. Bármikor leiratkozhatok.',
      sms: 'Kérek ajánlatokat SMS-ben erre a számra. Szolgáltatói díjak felmerülhetnek. Leiratkozás: válaszolj STOP-pal.',
      submit: 'Mutasd az eredményem',
      skip: 'Kihagyás és eredmény',
      privacy: 'Soha nem adjuk el az adataidat.',
    },
  },
  analyzing: {
    title: 'Készül a terved',
    steps: ['Olvassuk a 8 válaszodat…', 'Felmérjük a kollagénprofilodat…', 'Megírjuk a személyre szabott ajánlásodat…'],
  },
  offer: {
    trust: 'Elemzés kész: {name} • A 8 válaszod alapján',
    trustAnon: 'Elemzés kész • A 8 válaszod alapján',
    hero: {
      fallback: {
        woman: 'A feszesebbnek tűnő bőr és a kiegyensúlyozott energia azzal kezdődik, amit nap mint nap a testednek adsz',
        man: 'Érezd újra, hogy készen állsz a napra: napi kollagén az ízületekért, a bőrért és a kiegyensúlyozott energiáért',
        senior: '50 felett a szervezet kevesebb kollagént termel. A napi rutinod ezt pótolhatja',
      },
      sub: 'A napi fiatalság-rituálé: kollagén + peptid formula azoknak, akik fiatalosabb bőrt, több vágyat és több energiát szeretnének, a válaszaidra szabva.',
      cta: 'Mutasd az ajánlott tervet',
    },
    vsl: {
      title: 'Nézd meg: mit jelentenek a válaszaid',
      unavailable: 'A videó most nem érhető el. Minden, amire szükséged van, lent megtalálod.',
      cta: 'Kérem a tervem',
      resume: 'Ott folytatjuk, ahol abbahagytad',
    },
    diagnosis: {
      title: 'A kollagénbecslésed',
      body: 'Nagyjából 25 éves kortól a szervezet évente körülbelül 1%-kal kevesebb kollagént termel. A te korodban ez nagyjából {pct}%-kal kevesebb, mint 25 évesen.',
      note: 'Szemléltető becslés egy gyakran idézett átlag alapján, nem orvosi mérés.',
    },
    bullets: {
      title: 'Mit jelent ez számodra',
      items: {
        skin: [
          'A kollagénpeptideket placebokontrollos vizsgálatokban jobb bőrrugalmassággal hozták összefüggésbe',
          'Egyszerű napi adag, ami belefér a reggeledbe',
          'Olyan bőrnek, amely kezd veszíteni a feszességéből',
        ],
        energy: [
          'Fehérjében gazdag napi adag a rutinod támogatására',
          'Serkentők nélkül, így nincs utána visszaesés',
          'Jól kiegészíti az alvást, a vizet és a mozgást a kiegyensúlyozottabb napokért',
        ],
        libido: [
          'A jó közérzet a saját bőrödben a vágy része',
          'Napi öngondoskodási rituálé, ami támogatja az önbizalmat',
          'Hormonok és serkentők nélkül',
        ],
        joints: [
          'A kollagén-hidrolizátumot mozgással összefüggő ízületi panaszoknál vizsgálták',
          'Támogatás a porcoknak és kötőszöveteknek, amelyeket minden nap használsz',
          'Könnyű minden nap szedni, és ez a lényeg',
        ],
        all: [
          'Egy napi adag a bőrért, az ízületekért és az általános jóllétért',
          'Kollagénpeptidek és peptidkeverék',
          'A már meglévő rutinodhoz igazítva',
        ],
      },
    },
    pillars: {
      title: 'Egy napi rituálé, három cél',
      items: [
        { title: 'Fiatalosabb bőr', body: 'A kollagénpeptideket placebokontrollos vizsgálatokban jobb bőrrugalmassággal és hidratáltsággal hozták összefüggésbe.' },
        { title: 'Vágy és vitalitás', body: 'A jó közérzet a saját testedben a vágy része. Napi öngondoskodási rituálé férfiaknak és nőknek, hormonok és serkentők nélkül.' },
        { title: 'Energia a napodhoz', body: 'Fehérjében gazdag napi adag, ami belefér a reggeledbe, serkentők és visszaesés nélkül.' },
      ],
      note: 'Az eredmények eltérnek. A RENOVA CELL étrend-kiegészítő, nem gyógyszer.',
    },
    science: {
      title: 'Mit mond a kutatás',
      flip: 'Koppints a forrásért',
      cards: [
        {
          title: 'Bőrrugalmasság',
          finding:
            '69 nő szedett 8 héten át 2,5 g vagy 5 g specifikus kollagénpeptidet vagy placebót. A bőr rugalmassága a placebóhoz képest javult.',
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Ízületi komfort',
          finding:
            '24 hét alatt a napi 10 g kollagén-hidrolizátumot szedő sportolók kevesebb mozgással összefüggő ízületi fájdalomról számoltak be, mint a placebócsoport.',
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'A nagyobb kép',
          finding:
            '26 randomizált vizsgálat (1721 résztvevő) metaanalízise a bőr hidratáltságának és rugalmasságának javulását találta a placebóhoz képest.',
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'A vizsgálatok konkrét kollagénkészítményeket teszteltek; az eredmények nem feltétlenül érvényesek minden termékre, így erre sem.',
    },
    timeline: {
      title: 'Mire számíthatsz',
      steps: [
        { day: '1. nap', title: 'Kezdd el a rituálét', body: 'Napi egy adag. A rendszeresség számít.' },
        { day: '5. nap', title: 'Legyen szokás', body: 'Ugyanakkor, ugyanott. A szokás megszilárdul.' },
        { day: '15. nap', title: 'Állj meg egy pillanatra', body: 'Figyeld meg, hogy érzed magad, és tartsd meg a szokást.' },
        { day: '30. nap', title: 'Egy hónap', body: 'Folytasd. A vizsgálatok 4–12 hét után mérték a bőr változásait.' },
        { day: '90. nap', title: 'Teljes ciklus', body: 'Az az időszak, amelyet a legtöbb vizsgálat nézett. Ideje összehasonlítani.' },
      ],
    },
    beforeAfter: {
      title: 'Valódi vásárlók',
      before: 'Előtte',
      after: 'Utána',
      note: 'Szerkesztetlen fotók, engedéllyel megosztva. Az eredmények eltérnek.',
    },
    testimonials: {
      title: 'Hozzád hasonló emberek',
      note: 'Valódi vásárlók, engedéllyel megosztva. Az eredmények eltérnek.',
    },
    simulator: {
      title: 'A kollagéngörbéd',
      label: 'Életkorod',
      yAxis: 'Becsült kollagén a 25 éves korhoz képest (%)',
      you: 'Te',
      note: 'A gyakran idézett, 25 év utáni évi ~1%-os csökkenés szemléltetése. Nem a termék eredményeinek előrejelzése.',
    },
    comparison: {
      title: 'RENOVA CELL vs. átlagos kollagén',
      us: 'RENOVA CELL',
      them: 'Átlagos kollagén',
      rows: [
        { label: 'Hidrolizált kollagénpeptidek', us: 'yes', them: 'yes' },
        { label: 'Hozzáadott peptidkeverék', us: 'yes', them: 'no' },
        { label: 'A kvízedre szabott terv', us: 'yes', them: 'no' },
        { label: '30 napos pénzvisszafizetési garancia', us: 'yes', them: 'varies' },
      ],
      varies: 'Változó',
    },
    pricing: {
      perMonth: '/hó',
      once: 'Egyszeri vásárlás',
      subscribe: 'Előfizetés: újra küldjük, ha elfogy',
      interval: { m1: 'havonta', m3: '3 havonta', m6: '6 havonta' },
      title: 'Válaszd ki a terved',
      recommended: 'Neked ajánlott',
      perUnit: '{price} / db',
      save: 'Spórolj {pct}%-ot',
      plans: {
        single: { name: '1 db', desc: 'Próbáld ki egy hónapig' },
        kit3: { name: 'Kit 3', desc: 'A legtöbb vizsgálat 90 napos ciklusa' },
        kit6: { name: 'Kit 6', desc: '6 hónapra elegendő' },
      },
      recurring: '{price} terhelés {interval}, amíg le nem mondod. Bármikor lemondhatod az e-mailes nyugtán keresztül.',
      cta: 'Ezt választom',
    },
    shipping: { free: 'Ingyenes szállítás', fast: 'Gyors, követhető kiszállítás', discreet: 'Diszkrét csomagolás' },
    bonus: {
      title: 'A Kit 3 és a Kit 6 mellé jár',
      items: ['E-könyv: A kollagénrutin', '15 napos étrend', 'VIP vásárlói csoport'],
    },
    guarantee: {
      title: '30 napos pénzvisszafizetési garancia',
      body: 'Próbáld ki 30 napig. Ha nem vagy elégedett, írj nekünk, és kérdés nélkül visszatérítjük a rendelés árát.',
    },
    faq: {
      title: 'Kérdések',
      items: {
        different: {
          q: 'Próbáltam már kollagént, és nem vettem észre semmit. Most miért lenne más?',
          a: 'Sokan pár hét után abbahagyják. A legtöbb vizsgálat 8–12 hétig tartott napi adaggal, ezért ajánljuk a 90 napos Kit 3-at. Ha pedig nem válik be, él a 30 napos garancia.',
        },
        time: {
          q: 'Milyen gyorsan látok eredményt?',
          a: 'Mindenki más. A kutatások 4–12 hét napi használat után mérték a bőr változásait. Adj neki legalább egy teljes ciklust.',
        },
        safe: {
          q: 'Biztonságos számomra?',
          a: 'A kollagén élelmiszer-fehérje, amelyet általában jól tolerálnak. Ha várandós vagy, szoptatsz, gyógyszert szedsz vagy valamilyen betegséged van, előbb beszélj az orvosoddal.',
        },
        men: {
          q: 'Férfiaknak is jó?',
          a: 'Igen. A kollagén mindenkinél támogatja a bőrt és az ízületeket. Nem állítjuk, hogy hatással van a hormonokra.',
        },
        how: {
          q: 'Hogyan kell szedni?',
          a: 'Napi egy adag vízbe, kávéba vagy turmixba keverve. A legjobb minden nap ugyanabban az időben.',
        },
        cancel: {
          q: 'Hogyan mondhatom le az előfizetést?',
          a: 'Használd bármelyik nyugtás e-mailben lévő linket, vagy írj nekünk. Bármikor lemondhatod, díjmentesen.',
        },
        shipping: {
          q: 'Hogyan működik a szállítás?',
          a: 'A szállítás ingyenes minden országba, ahová szállítunk. A rendeléseket gyorsan, nyomkövetéssel küldjük, semleges, diszkrét csomagolásban, kívül terméknév nélkül. A nyomkövetési linket e-mailben küldjük, amint a rendelést feladtuk.',
        },
      },
    },
    sticky: { cta: 'Kérem a tervem' },
    exit: {
      title: 'Várj: 10% kedvezmény, mielőtt elmész',
      body: 'Használd ezt a kódot a pénztárnál:',
      code: 'RENOVA10',
      cta: 'Kérem a 10% kedvezményt',
      dismiss: 'Nem, köszönöm',
    },
    chat: {
      title: 'Kérdezd Elenát',
      subtitle: 'MI-asszisztens · nem orvos',
      greeting: 'Szia! Elena vagyok, a RENOVA CELL MI-asszisztense. Kérdezz bármit a termékről vagy a tervedről.',
      placeholder: 'Írd be a kérdésed…',
      send: 'Küldés',
      error: 'Elnézést, valami hiba történt. Próbáld újra.',
      open: 'Chat megnyitása',
      close: 'Chat bezárása',
    },
    social: { ordered: 'Az elmúlt 24 órában {count} ember rendelt' },
    footer: {
      privacy: 'Adatvédelem',
      terms: 'Feltételek',
      contact: 'Kapcsolat',
      rights: 'Minden jog fenntartva.',
    },
  },
  checkout: {
    steps: ['Kosár', 'Adataid', 'Fizetés'],
    cart: {
      title: 'A rendelésed',
      bumpTitle: '+1 extra darab {price} áron',
      bumpBody: 'Csak ezen az oldalon: adj hozzá még egy darabot kedvezőbb áron.',
      coupon: 'Kuponkód',
      couponPlaceholder: 'Írd be a kódot',
      apply: 'Beváltás',
      hint: 'Psszt… próbáld a RENOVA10-et',
      valid: 'Kód beváltva: {pct}% kedvezmény',
      invalid: 'Ez a kód nem érvényes.',
      total: 'Összesen',
      discountNote: 'A kedvezményt fizetéskor vonjuk le',
      shipping: 'Szállítás',
      free: 'Ingyenes',
    },
    info: {
      title: 'Adataid',
      name: 'Teljes név',
      email: 'E-mail',
      newsletter: 'Kérek bőrfiatalító tippeket e-mailben',
      addressNote: 'A szállítási címet a biztonságos fizetési oldalon adod meg (automatikus kitöltéssel).',
    },
    payment: {
      title: 'Fizetés',
      body: 'A vásárlást a Stripe biztonságos oldalán fejezed be. Kártya, Apple Pay, Google Pay és más módok ott jelennek meg, ha elérhetők az országodban.',
      installments: 'A részletfizetési lehetőségek fizetéskor jelennek meg, ha elérhetők.',
      pay: 'Biztonságos fizetés',
      redirecting: 'Megnyitjuk a biztonságos fizetést…',
      error: 'Nem sikerült elindítani a fizetést. Próbáld újra.',
      ssl: 'SSL-titkosítás',
      guarantee: '30 napos garancia',
      stripe: 'Fizetés a Stripe-on keresztül',
    },
  },
  upsell1: {
    title: 'A rendelésed visszaigazoltuk. Még egy dolog…',
    body: 'Adj hozzá egy Kit 6-ot (egyszeri vásárlás) 45% kedvezménnyel a 6 hónapos rutinhoz. Az ajánlat csak ezen az oldalon él.',
    accept: 'Igen, kérem a Kit 6-ot {price} áron',
    decline: 'Nem, köszönöm',
    charge: 'A mentett kártyádat egyszer terheljük meg {price} összeggel. Nem előfizetés.',
  },
  upsell2: {
    title: 'Soha ne fogyj ki, és fizess 30%-kal kevesebbet',
    body: 'Kapd meg a Kit 3-at 3 havonta {price} áron {full} helyett. A kedvezmény addig él, amíg előfizető vagy.',
    accept: 'Igen, előfizetek {price} áron 3 havonta',
    decline: 'Nem, köszönöm',
    charge: 'A mentett kártyádat ma és utána 3 havonta {price} összeggel terheljük, amíg le nem mondod. Bármikor lemondhatod.',
  },
  upsell: {
    processing: 'Feldolgozás…',
    error: 'Ez nem sikerült. Nem terheltünk meg semmit.',
    action: 'A bankodnak jóvá kell hagynia ezt a fizetést. Folytasd a biztonságos oldalon.',
  },
  thankYou: {
    title: 'Köszönjük{name}!',
    body: 'A rendelésed visszaigazoltuk. A nyugta úton van az e-mail-címedre.',
    howTo: 'Így kezdj hozzá',
    steps: ['Vegyél be minden reggel egy adagot.', 'Keverd vízbe, kávéba vagy turmixba.', 'Folytasd a ciklus végéig.'],
    vip: { title: 'VIP csoport', body: 'Tippek, receptek és támogatás más vásárlóktól.', cta: 'Csatlakozom' },
    referral: {
      title: 'Oszd meg egy barátoddal',
      body: 'Küldd el a linked. Aki használja, 10% kedvezményt kap a RENOVA10 kóddal.',
      copy: 'Link másolása',
      copied: 'Kimásolva!',
    },
    order: 'Rendelés összesítése',
  },
  emails: {
    footer: 'Azért kapod ezt az üzenetet, mert kitöltötted a RENOVA CELL kvízt.',
    unsubscribe: 'Leiratkozás',
    diagnosis: {
      subject: '{name}, a RENOVA CELL terved',
      body: 'Itt az eredményed: {diagnosis}\n\nA neked ajánlott terv: {plan}. Itt megnézheted: {link}',
    },
    vsl: {
      subject: 'A profilodhoz készült 2 perces videó',
      body: 'Készítettünk egy rövid videót arról, mit jelentenek a válaszaid. Itt megnézheted: {link}',
    },
    sms: { body: 'RENOVA CELL: 10% kedvezmény a tervedre a RENOVA10 kóddal → {link} Leiratkozás: válaszolj STOP-pal.' },
    socialProof: {
      subject: 'Miért maradnak az emberek',
      body: 'A legtöbb kollagénvizsgálat 8–12 hétig tartott. Ezért a 90 napos Kit 3 a legnépszerűbb tervünk. A terved: {link}',
    },
    lastChance: {
      subject: 'A 10%-os kuponkódod még vár',
      body: 'A RENOVA10 kódod még mindig vár rád. Itt használhatod: {link}',
    },
    story: {
      subject: 'Apró szokások, nagy különbség',
      body: 'A legjobb rutin az, amit meg is tartasz. Napi egy adag, minden nap. Ha készen állsz: {link}',
    },
  },
};
