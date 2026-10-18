import type { Dictionary } from './en';

export const fi: Dictionary = {
  common: {
    brand: 'VitalRise',
    back: 'Takaisin',
    next: 'Seuraava',
    continue: 'Jatka',
    skip: 'Ohita',
    loading: 'Ladataan…',
    language: 'Kieli',
    resultsVary: 'Tulokset vaihtelevat yksilöllisesti.',
    fdaDisclaimer:
      'Yhdysvaltain elintarvike- ja lääkevirasto FDA ei ole arvioinut näitä väittämiä. Tätä tuotetta ei ole tarkoitettu minkään sairauden diagnosointiin, hoitoon, parantamiseen tai ehkäisyyn.',
    euDisclaimer:
      'Ravintolisää ei pidä käyttää monipuolisen ja tasapainoisen ruokavalion ja terveellisten elintapojen korvaajana. Suositeltua päivittäistä annosta ei pidä ylittää. Säilytettävä pienten lasten ulottumattomissa.',
  },
  consent: {
    text: 'Käytämme evästeitä analytiikkaan ja mainonnan mittaamiseen.',
    accept: 'Hyväksy',
    decline: 'Hylkää',
  },
  quiz: {
    progress: '{pct} % valmiina',
    intro: 'Vastaa 8 lyhyeen kysymykseen (noin 60 sekuntia) ja saat suunnitelmasi nuorekkaamman näköiselle iholle, haluun ja arjen energiaan.',
    questions: {
      gender: {
        title: 'Miten määrittelet itsesi?',
        options: { male: 'Mies', female: 'Nainen', other: 'En halua kertoa' },
      },
      age: {
        title: 'Kuinka vanha olet?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: 'Mikä vaivaa sinua eniten juuri nyt?',
        options: {
          skin: 'Iho menettää kiinteyttään',
          energy: 'Vähän energiaa',
          libido: 'Vähän halua / elinvoimaa',
          joints: 'Jäykät tai kipeät nivelet',
          all: 'Vähän kaikkea',
        },
      },
      duration: {
        title: 'Kuinka kauan tämä on vaivannut?',
        options: { lt6m: 'Alle 6 kuukautta', '6m-2y': '6 kk – 2 vuotta', '2y+': 'Yli 2 vuotta' },
      },
      history: {
        title: 'Oletko käyttänyt kollageenia aiemmin?',
        options: { never: 'En koskaan', tried: 'Kyllä, ilman tuloksia', using: 'Käytän nyt' },
      },
      energy: { title: 'Millainen on päivittäinen energiasi?', min: 'Uupunut', max: 'Täynnä energiaa' },
      confidence: { title: 'Kuinka hyvin viihdyt kehossasi?', min: 'En lainkaan', max: 'Täysin' },
      goal: {
        title: 'Mitä haluaisit eniten tuntea seuraavan 15 päivän aikana?',
        options: {
          skin: 'Kiinteämmän näköinen iho',
          energy: 'Enemmän energiaa',
          libido: 'Enemmän elinvoimaa',
          joints: 'Kevyempi liikkuminen',
          all: 'Kaikkea tätä',
        },
      },
    },
    contact: {
      title: 'Minne lähetämme suunnitelmasi?',
      subtitle: 'Vapaaehtoinen: näet tuloksesi heti ilman tätäkin.',
      name: 'Etunimi',
      email: 'Sähköposti',
      phone: 'Matkapuhelin (vapaaehtoinen, tekstiviesteille)',
      marketing: 'Lähettäkää minulle vinkkejä ja tarjouksia sähköpostilla. Voin perua tilauksen milloin tahansa.',
      sms: 'Lähettäkää minulle tarjouksia tekstiviestillä tähän numeroon. Operaattorin maksut voivat koskea. Vastaa STOP lopettaaksesi.',
      submit: 'Näytä tulokseni',
      skip: 'Ohita ja näytä tulos',
      privacy: 'Emme koskaan myy tietojasi.',
    },
  },
  analyzing: {
    title: 'Suunnitelmaasi laaditaan',
    steps: ['Luetaan 8 vastaustasi…', 'Arvioidaan kollageeniprofiiliasi…', 'Kirjoitetaan henkilökohtaista suositustasi…'],
  },
  offer: {
    trust: 'Analyysi valmis: {name} • Perustuu 8 vastaukseesi',
    trustAnon: 'Analyysi valmis • Perustuu 8 vastaukseesi',
    hero: {
      fallback: {
        woman: 'Kiinteämmän näköinen iho ja tasainen energia alkavat siitä, mitä annat keholle joka päivä',
        man: 'Tunne itsesi taas valmiiksi päivään: päivittäistä kollageenia niveliin, ihoon ja tasaiseen energiaan',
        senior: '50 ikävuoden jälkeen elimistö tuottaa vähemmän kollageenia. Päivittäinen rutiinisi voi paikata sitä',
      },
      sub: 'Päivittäinen nuoruusrituaalisi: kollageeni- ja peptidikoostumus niille, jotka haluavat nuorekkaamman näköisen ihon, enemmän halua ja enemmän energiaa, vastaustesi mukaan.',
      cta: 'Näytä suositeltu suunnitelma',
    },
    vsl: {
      title: 'Katso: mitä vastauksesi tarkoittavat',
      unavailable: 'Video ei ole nyt saatavilla. Kaikki tarvittava löytyy alta.',
      cta: 'Haluan suunnitelmani',
      resume: 'Jatketaan siitä, mihin jäit',
    },
    diagnosis: {
      title: 'Kollageeniarviosi',
      body: 'Noin 25 ikävuodesta alkaen elimistö tuottaa vuosittain noin 1 % vähemmän kollageenia. Sinun iässäsi se tarkoittaa noin {pct} % vähemmän kuin 25-vuotiaana.',
      note: 'Havainnollistava arvio, joka perustuu usein mainittuun keskiarvoon. Ei lääketieteellinen mittaus.',
    },
    bullets: {
      title: 'Mitä tämä tarkoittaa sinulle',
      items: {
        skin: [
          'Kollageenipeptidit yhdistettiin parempaan ihon kimmoisuuteen lumekontrolloiduissa tutkimuksissa',
          'Helppo päivittäinen annos, joka sopii aamuusi',
          'Iholle, joka on alkanut menettää kiinteyttään',
        ],
        energy: [
          'Proteiinipitoinen päivittäinen annos rutiinisi tueksi',
          'Ei piristeitä, joten ei myöhempää romahdusta',
          'Sopii yhteen unen, veden ja liikkeen kanssa tasaisempia päiviä varten',
        ],
        libido: [
          'Hyvä olo omassa ihossa on osa halua',
          'Päivittäinen itsestä huolehtimisen rituaali, joka tukee itsevarmuutta',
          'Ei hormoneja eikä piristeitä',
        ],
        joints: [
          'Kollageenihydrolysaattia tutkittiin liikuntaan liittyvissä nivelvaivoissa',
          'Tukea rustolle ja sidekudokselle, joita käytät joka päivä',
          'Helppo ottaa joka päivä, ja juuri se ratkaisee',
        ],
        all: [
          'Yksi päivittäinen annos iholle, nivelille ja yleiselle hyvinvoinnille',
          'Kollageenipeptidit ja peptidisekoitus',
          'Sopii rutiiniin, joka sinulla jo on',
        ],
      },
    },
    pillars: {
      title: 'Yksi päivittäinen rituaali, kolme tavoitetta',
      items: [
        { title: 'Nuorekkaamman näköinen iho', body: 'Kollageenipeptidit yhdistettiin parempaan ihon kimmoisuuteen ja kosteuteen lumekontrolloiduissa tutkimuksissa.' },
        { title: 'Halu ja elinvoima', body: 'Hyvä olo omassa kehossa on osa halua. Päivittäinen itsestä huolehtimisen rituaali miehille ja naisille, ilman hormoneja ja piristeitä.' },
        { title: 'Energiaa päivään', body: 'Proteiinipitoinen päivittäinen annos, joka sopii aamuusi, ilman piristeitä ja ilman romahdusta.' },
      ],
      note: 'Tulokset vaihtelevat. VitalRise on ravintolisä, ei lääke.',
    },
    science: {
      title: 'Mitä tutkimukset sanovat',
      flip: 'Napauta nähdäksesi lähteen',
      cards: [
        {
          title: 'Ihon kimmoisuus',
          finding:
            '69 naista otti 8 viikon ajan 2,5 g tai 5 g tiettyjä kollageenipeptidejä tai lumelääkettä. Ihon kimmoisuus parani lumelääkkeeseen verrattuna.',
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Nivelten mukavuus',
          finding:
            'Urheilijat, jotka ottivat 24 viikon ajan 10 g kollageenihydrolysaattia päivässä, raportoivat vähemmän liikuntaan liittyvää nivelkipua kuin lumeryhmä.',
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'Kokonaiskuva',
          finding:
            'Meta-analyysi 26 satunnaistetusta tutkimuksesta (1 721 osallistujaa) havaitsi ihon kosteuden ja kimmoisuuden paranevan lumeeseen verrattuna.',
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'Tutkimuksissa testattiin tiettyjä kollageenikoostumuksia, joten tulokset eivät välttämättä päde jokaiseen tuotteeseen, ei myöskään tähän.',
    },
    timeline: {
      title: 'Mitä odottaa',
      steps: [
        { day: 'Päivä 1', title: 'Aloita rituaalisi', body: 'Yksi annos päivässä. Säännöllisyys ratkaisee.' },
        { day: 'Päivä 5', title: 'Tee siitä tapa', body: 'Sama aika, sama paikka. Tapa vakiintuu.' },
        { day: 'Päivä 15', title: 'Pysähdy hetkeksi', body: 'Huomaa, miltä sinusta tuntuu, ja pidä tavasta kiinni.' },
        { day: 'Päivä 30', title: 'Kuukausi takana', body: 'Jatka. Tutkimuksissa ihomuutoksia mitattiin 4–12 viikon kohdalla.' },
        { day: 'Päivä 90', title: 'Täysi jakso', body: 'Ajanjakso, jota useimmat tutkimukset tarkastelivat. Aika verrata.' },
      ],
    },
    beforeAfter: {
      title: 'Oikeita asiakkaita',
      before: 'Ennen',
      after: 'Jälkeen',
      note: 'Muokkaamattomat kuvat, jaettu luvalla. Tulokset vaihtelevat.',
    },
    testimonials: {
      title: 'Kaltaisiasi ihmisiä',
      note: 'Oikeita asiakkaita, jaettu luvalla. Tulokset vaihtelevat.',
    },
    simulator: {
      title: 'Kollageenikäyräsi',
      label: 'Ikäsi',
      yAxis: 'Arvioitu kollageeni vs. 25-vuotiaana (%)',
      you: 'Sinä',
      note: 'Havainnollistus usein mainitusta ~1 %:n vuosittaisesta laskusta 25 ikävuoden jälkeen. Ei ennuste tuotteen tuloksista.',
    },
    comparison: {
      title: 'VitalRise vs. tavallinen kollageeni',
      us: 'VitalRise',
      them: 'Tavallinen kollageeni',
      rows: [
        { label: 'Hydrolysoidut kollageenipeptidit', us: 'yes', them: 'yes' },
        { label: 'Lisätty peptidisekoitus', us: 'yes', them: 'no' },
        { label: 'Visaasi sopiva suunnitelma', us: 'yes', them: 'no' },
        { label: '30 päivän rahat takaisin -takuu', us: 'yes', them: 'varies' },
      ],
      varies: 'Vaihtelee',
    },
    pricing: {
      perMonth: '/kk',
      once: 'Kertaostos',
      subscribe: 'Tilaus: uusi toimitus, kun loppuu',
      interval: { m1: 'joka kuukausi', m3: '3 kuukauden välein', m6: '6 kuukauden välein' },
      title: 'Valitse suunnitelmasi',
      recommended: 'Suositeltu sinulle',
      perUnit: '{price} / kpl',
      save: 'Säästä {pct} %',
      plans: {
        single: { name: '1 kpl', desc: 'Kokeile kuukauden ajan' },
        kit3: { name: 'Kit 3', desc: 'Useimpien tutkimusten 90 päivän jakso' },
        kit6: { name: 'Kit 6', desc: 'Kuuden kuukauden tarve' },
      },
      recurring: 'Veloitamme {price} {interval}, kunnes perut. Voit perua milloin tahansa sähköpostikuittisi kautta.',
      cta: 'Valitse tämä',
    },
    shipping: { free: 'Ilmainen toimitus', fast: 'Toimitus enintään 2 arkipäivässä', discreet: 'Huomaamaton pakkaus', tracked: 'Seurattava toimitus' },
    bonus: {
      title: 'Sisältyy Kit 3:een ja Kit 6:een',
      items: ['E-kirja: Kollageenirutiini', '15 päivän ateriasuunnitelma', 'VIP-asiakasryhmä'],
    },
    guarantee: {
      title: '30 päivän rahat takaisin -takuu',
      body: 'Kokeile 30 päivää. Jos et ole tyytyväinen, lähetä meille sähköpostia, niin palautamme tilauksesi hinnan kyselemättä.',
    },
    faq: {
      title: 'Kysymyksiä',
      items: {
        different: {
          q: 'Kokeilin kollageenia aiemmin enkä huomannut mitään. Miksi nyt olisi toisin?',
          a: 'Moni lopettaa muutaman viikon jälkeen. Useimmat tutkimukset kestivät 8–12 viikkoa päivittäisellä annoksella, joten suosittelemme 90 päivän Kit 3:a. Ja jos se ei sovi sinulle, 30 päivän takuu on voimassa.',
        },
        time: {
          q: 'Kuinka nopeasti näen tuloksia?',
          a: 'Jokainen on erilainen. Tutkimuksissa ihomuutoksia mitattiin 4–12 viikon päivittäisen käytön jälkeen. Anna sille vähintään yksi täysi jakso.',
        },
        safe: {
          q: 'Onko se minulle turvallinen?',
          a: 'Kollageeni on ruoan proteiini, joka sopii yleensä hyvin. Jos olet raskaana, imetät, käytät lääkkeitä tai sinulla on jokin sairaus, keskustele ensin lääkärin kanssa.',
        },
        men: {
          q: 'Sopiiko se myös miehille?',
          a: 'Kyllä. Kollageeni tukee kaikkien ihoa ja niveliä. Emme väitä sen muuttavan hormoneja.',
        },
        how: {
          q: 'Miten sitä otetaan?',
          a: 'Yksi annos päivässä veteen, kahviin tai smoothieen sekoitettuna. Paras ottaa joka päivä samaan aikaan.',
        },
        cancel: {
          q: 'Miten perun tilauksen?',
          a: 'Käytä minkä tahansa kuittisähköpostin linkkiä tai kirjoita meille. Voit perua milloin tahansa ilman kuluja.',
        },
        shipping: {
          q: 'Miten toimitus toimii?',
          a: 'Toimitus on ilmainen kaikkiin maihin, joihin toimitamme. Toimitus kestää enintään 2 arkipäivää, seurattavana, neutraalissa, huomaamattomassa pakkauksessa ilman tuotteen nimeä ulkopuolella. Seurantalinkki lähetetään sähköpostiin heti, kun tilaus on lähetetty.',
          aStandard: 'Toimitus on ilmainen kaikkiin maihin, joihin toimitamme. Tilaukset lähetetään seurattavina neutraalissa, huomaamattomassa pakkauksessa ilman tuotteen nimeä ulkopuolella. Arvioitu toimitusaika maahasi näkyy maksuvaiheessa, ja seurantalinkki lähetetään sähköpostiin heti, kun tilaus on lähetetty.',
        },
      },
    },
    sticky: { cta: 'Haluan suunnitelmani' },
    exit: {
      title: 'Odota: 10 % alennus ennen kuin lähdet',
      body: 'Käytä tätä koodia kassalla:',
      code: 'VITAL10',
      cta: 'Käytä 10 % alennukseni',
      dismiss: 'Ei kiitos',
    },
    chat: {
      title: 'Kysy Elenalta',
      subtitle: 'Tekoälyavustaja · ei lääkäri',
      greeting: 'Hei! Olen Elena, VitalRisen tekoälyavustaja. Kysy minulta mitä tahansa tuotteesta tai suunnitelmastasi.',
      placeholder: 'Kirjoita kysymyksesi…',
      send: 'Lähetä',
      error: 'Pahoittelut, jotain meni pieleen. Yritä uudelleen.',
      open: 'Avaa chat',
      close: 'Sulje chat',
    },
    social: { ordered: '{count} ihmistä tilasi viimeisen 24 tunnin aikana' },
    footer: {
      privacy: 'Tietosuoja',
      terms: 'Ehdot',
      contact: 'Yhteystiedot',
      rights: 'Kaikki oikeudet pidätetään.',
    },
  },
  checkout: {
    steps: ['Ostoskori', 'Tietosi', 'Maksu'],
    cart: {
      title: 'Tilauksesi',
      bumpTitle: '+1 lisäpakkaus hintaan {price}',
      bumpBody: 'Vain tällä sivulla: lisää yksi pakkaus edullisemmin.',
      coupon: 'Alennuskoodi',
      couponPlaceholder: 'Syötä koodi',
      apply: 'Käytä',
      hint: 'Psst… kokeile VITAL10',
      valid: 'Koodi käytössä: {pct} % alennus',
      invalid: 'Koodi ei ole voimassa.',
      total: 'Yhteensä',
      discountNote: 'Alennus vähennetään maksun yhteydessä',
      shipping: 'Toimitus',
      free: 'Ilmainen',
    },
    info: {
      title: 'Tietosi',
      name: 'Koko nimi',
      email: 'Sähköposti',
      newsletter: 'Lähettäkää minulle ikääntymiseen liittyviä vinkkejä sähköpostilla',
      addressNote: 'Syötät toimitusosoitteesi suojatulla maksusivulla (automaattisella täydennyksellä).',
    },
    payment: {
      title: 'Maksu',
      body: 'Viimeistelet ostoksen Stripen suojatulla sivulla. Kortti, Apple Pay, Google Pay ja muut tavat näkyvät siellä, jos ne ovat saatavilla maassasi.',
      installments: 'Osamaksuvaihtoehdot näkyvät maksun yhteydessä, jos niitä on saatavilla.',
      pay: 'Maksa turvallisesti',
      redirecting: 'Avataan suojattu maksu…',
      error: 'Maksun aloittaminen epäonnistui. Yritä uudelleen.',
      ssl: 'SSL-salattu',
      guarantee: '30 päivän takuu',
      stripe: 'Maksut Stripen kautta',
    },
  },
  upsell1: {
    title: 'Tilauksesi on vahvistettu. Vielä yksi asia…',
    body: 'Lisää Kit 6 (kertaostos) 45 % alennuksella kuuden kuukauden rutiiniin. Tarjous vain tällä sivulla.',
    accept: 'Kyllä, lisää Kit 6 hintaan {price}',
    decline: 'Ei kiitos',
    charge: 'Tallennetulta kortiltasi veloitetaan kerran {price}. Ei tilausta.',
  },
  upsell2: {
    title: 'Ei enää loppumista, ja 30 % halvemmalla',
    body: 'Saat Kit 3:n 3 kuukauden välein hintaan {price} hinnan {full} sijaan. Alennus on voimassa niin kauan kuin tilauksesi jatkuu.',
    accept: 'Kyllä, tilaan hintaan {price} 3 kuukauden välein',
    decline: 'Ei kiitos',
    charge: 'Tallennetulta kortiltasi veloitetaan {price} tänään ja sen jälkeen 3 kuukauden välein, kunnes perut. Voit perua milloin tahansa.',
  },
  upsell: {
    processing: 'Käsitellään…',
    error: 'Tämä ei onnistunut. Sinulta ei veloitettu mitään.',
    action: 'Pankkisi täytyy vahvistaa tämä maksu. Jatka suojatulla sivulla.',
  },
  thankYou: {
    title: 'Kiitos{name}!',
    body: 'Tilauksesi on vahvistettu. Kuitti on matkalla sähköpostiisi.',
    howTo: 'Näin aloitat',
    steps: ['Ota yksi annos joka aamu.', 'Sekoita veteen, kahviin tai smoothieen.', 'Jatka koko jakson ajan.'],
    vip: { title: 'VIP-ryhmä', body: 'Vinkkejä, reseptejä ja tukea muilta asiakkailta.', cta: 'Liity ryhmään' },
    referral: {
      title: 'Jaa ystävälle',
      body: 'Lähetä linkkisi. Linkin käyttäjä saa 10 % alennuksen koodilla VITAL10.',
      copy: 'Kopioi linkki',
      copied: 'Kopioitu!',
    },
    order: 'Tilauksen yhteenveto',
  },
  neutral: {
    intro: 'Vastaa 8 lyhyeen kysymykseen (noin 60 sekuntia) ja saat suunnitelmasi nuorekkaamman näköiselle iholle ja arjen energiaan.',
    painLibido: 'Vähän elinvoimaa',
    heroSub: 'Päivittäinen rituaalisi: kollageeni- ja peptidikoostumus niille, jotka haluavat nuorekkaamman näköisen ihon ja enemmän energiaa, vastaustesi mukaan.',
    bullet: 'Hyvä olo omassa kehossa alkaa päivittäisestä itsestä huolehtimisesta',
    pillar: { title: 'Elinvoima ja itsevarmuus', body: 'Hyvä olo omassa kehossa on osa itsevarmuutta. Päivittäinen itsestä huolehtimisen rituaali miehille ja naisille, ilman hormoneja ja piristeitä.' },
  },
  emails: {
    footer: 'Saat tämän viestin, koska teit VitalRise -visan.',
    unsubscribe: 'Peru tilaus',
    diagnosis: {
      subject: '{name}, VitalRise -suunnitelmasi',
      body: 'Tässä tuloksesi: {diagnosis}\n\nSinulle suositeltu suunnitelma on {plan}. Katso se täältä: {link}',
    },
    vsl: {
      subject: 'Profiilillesi tehty 2 minuutin video',
      body: 'Teimme lyhyen videon siitä, mitä vastauksesi tarkoittavat. Katso se täältä: {link}',
    },
    sms: { body: 'VitalRise: 10 % alennus suunnitelmastasi koodilla VITAL10 → {link} Vastaa STOP lopettaaksesi.' },
    socialProof: {
      subject: 'Miksi ihmiset jatkavat',
      body: 'Useimmat kollageenitutkimukset kestivät 8–12 viikkoa. Siksi 90 päivän Kit 3 on valituin suunnitelmamme. Suunnitelmasi: {link}',
    },
    lastChance: {
      subject: '10 % alennuskoodisi odottaa yhä',
      body: 'Koodisi VITAL10 odottaa sinua yhä. Käytä se täällä: {link}',
    },
    story: {
      subject: 'Pienet tavat, iso ero',
      body: 'Paras rutiini on se, jonka pidät. Yksi annos päivässä, joka päivä. Kun olet valmis: {link}',
    },
  },
};
