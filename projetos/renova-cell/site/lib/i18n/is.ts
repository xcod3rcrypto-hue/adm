import type { Dictionary } from './en';

export const is: Dictionary = {
  common: {
    brand: 'RENOVA CELL',
    back: 'Til baka',
    next: 'Áfram',
    continue: 'Halda áfram',
    skip: 'Sleppa',
    loading: 'Hleður…',
    language: 'Tungumál',
    resultsVary: 'Árangur er misjafn eftir einstaklingum.',
    fdaDisclaimer:
      'Þessar fullyrðingar hafa ekki verið metnar af Matvæla- og lyfjastofnun Bandaríkjanna (FDA). Varan er ekki ætluð til að greina, meðhöndla, lækna eða fyrirbyggja sjúkdóma.',
    euDisclaimer:
      'Fæðubótarefni koma ekki í stað fjölbreytts og hollrar fæðu og heilbrigðra lifnaðarhátta. Ekki má neyta meira en ráðlagður dagskammtur segir til um. Geymist þar sem börn hvorki ná til né sjá.',
  },
  consent: {
    text: 'Við notum vafrakökur til greiningar og mælinga á auglýsingum.',
    accept: 'Samþykkja',
    decline: 'Hafna',
  },
  quiz: {
    progress: '{pct}% lokið',
    intro: 'Svaraðu 8 stuttum spurningum (um 60 sekúndur) og fáðu áætlunina þína fyrir unglegri húð, meiri löngun og orku í daglegu lífi.',
    questions: {
      gender: {
        title: 'Hvernig skilgreinir þú þig?',
        options: { male: 'Karl', female: 'Kona', other: 'Vil ekki segja' },
      },
      age: {
        title: 'Hvað ertu gömul/gamall?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: 'Hvað angrar þig mest núna?',
        options: {
          skin: 'Húðin missir stinnleika',
          energy: 'Lítil orka',
          libido: 'Lítil löngun / lífsþróttur',
          joints: 'Stífir eða aumir liðir',
          all: 'Smá af öllu',
        },
      },
      duration: {
        title: 'Hve lengi hefur þetta angrað þig?',
        options: { lt6m: 'Skemur en 6 mánuði', '6m-2y': '6 mánuði – 2 ár', '2y+': 'Lengur en 2 ár' },
      },
      history: {
        title: 'Hefur þú tekið kollagen áður?',
        options: { never: 'Aldrei', tried: 'Já, en án árangurs', using: 'Ég tek það núna' },
      },
      energy: { title: 'Hvernig er orkan þín dagsdaglega?', min: 'Örmagna', max: 'Full/ur af orku' },
      confidence: { title: 'Hversu vel líður þér í líkamanum?', min: 'Alls ekki', max: 'Fullkomlega' },
      goal: {
        title: 'Hvað myndir þú helst vilja finna næstu 15 daga?',
        options: {
          skin: 'Stinnari húð að sjá',
          energy: 'Meiri orku',
          libido: 'Meiri lífsþrótt',
          joints: 'Léttari hreyfingu',
          all: 'Allt þetta',
        },
      },
    },
    contact: {
      title: 'Hvert eigum við að senda áætlunina þína?',
      subtitle: 'Valfrjálst: þú sérð niðurstöðuna strax án þess.',
      name: 'Fornafn',
      email: 'Netfang',
      phone: 'Farsími (valfrjálst, fyrir SMS)',
      marketing: 'Sendið mér ráð og tilboð í tölvupósti. Ég get afskráð mig hvenær sem er.',
      sms: 'Sendið mér tilboð með SMS í þetta númer. Gjöld símafyrirtækis geta átt við. Svaraðu STOP til að hætta.',
      submit: 'Sjá niðurstöðuna mína',
      skip: 'Sleppa og sjá niðurstöðu',
      privacy: 'Við seljum aldrei gögnin þín.',
    },
  },
  analyzing: {
    title: 'Við útbúum áætlunina þína',
    steps: ['Lesum 8 svörin þín…', 'Metum kollagensniðið þitt…', 'Skrifum persónulegu ráðlegginguna þína…'],
  },
  offer: {
    trust: 'Greiningu lokið fyrir {name} • Byggt á 8 svörum þínum',
    trustAnon: 'Greiningu lokið • Byggt á 8 svörum þínum',
    hero: {
      fallback: {
        woman: 'Stinnari húð að sjá og jöfn orka byrja á því sem þú gefur líkamanum á hverjum degi',
        man: 'Vertu aftur tilbúinn í daginn: daglegt kollagen fyrir liði, húð og jafna orku',
        senior: 'Eftir fimmtugt framleiðir líkaminn minna kollagen. Dagleg rútína getur bætt það upp',
      },
      sub: 'Daglegi æskusiðurinn þinn: blanda af kollageni og peptíðum fyrir þau sem vilja unglegri húð, meiri löngun og meiri orku, sniðin að svörum þínum.',
      cta: 'Sjá ráðlagða áætlun',
    },
    vsl: {
      title: 'Horfðu: hvað svörin þín þýða',
      unavailable: 'Myndbandið er ekki tiltækt núna. Allt sem þú þarft er hér fyrir neðan.',
      cta: 'Ég vil áætlunina mína',
      resume: 'Heldur áfram þar sem frá var horfið',
    },
    diagnosis: {
      title: 'Kollagenmatið þitt',
      body: 'Frá um 25 ára aldri framleiðir líkaminn um 1% minna kollagen á ári. Á þínum aldri eru það um {pct}% minna en við 25 ára aldur.',
      note: 'Áætlun til skýringar, byggð á oft nefndu meðaltali. Ekki læknisfræðileg mæling.',
    },
    bullets: {
      title: 'Hvað þetta þýðir fyrir þig',
      items: {
        skin: [
          'Kollagenpeptíð voru tengd betri teygjanleika húðar í samanburðarrannsóknum við lyfleysu',
          'Einfaldur dagskammtur sem passar inn í morguninn',
          'Hugsað fyrir húð sem er farin að missa stinnleika',
        ],
        energy: [
          'Próteinríkur dagskammtur sem styður rútínuna þína',
          'Engin örvandi efni, svo ekkert orkufall seinna',
          'Fer vel saman við svefn, vatn og hreyfingu fyrir jafnari daga',
        ],
        libido: [
          'Að líða vel í eigin skinni er hluti af því að finna löngun',
          'Daglegur sjálfsumhyggjusiður sem styður sjálfstraust',
          'Engin hormón og engin örvandi efni',
        ],
        joints: [
          'Kollagen-hýdrólýsat var rannsakað við liðóþægindum tengdum hreyfingu',
          'Stuðningur við brjósk og bandvef sem þú notar á hverjum degi',
          'Auðvelt að taka daglega, og það er það sem skiptir máli',
        ],
        all: [
          'Einn dagskammtur fyrir húð, liði og almenna vellíðan',
          'Kollagenpeptíð og peptíðblanda',
          'Hannað fyrir rútínuna sem þú ert þegar með',
        ],
      },
    },
    pillars: {
      title: 'Einn daglegur siður, þrjú markmið',
      items: [
        { title: 'Unglegri húð', body: 'Kollagenpeptíð voru tengd betri teygjanleika og raka húðar í samanburðarrannsóknum við lyfleysu.' },
        { title: 'Löngun og lífsþróttur', body: 'Að líða vel í eigin líkama er hluti af því að finna löngun. Daglegur sjálfsumhyggjusiður fyrir karla og konur, án hormóna og örvandi efna.' },
        { title: 'Orka fyrir daginn', body: 'Próteinríkur dagskammtur sem passar inn í morguninn, án örvandi efna og án orkufalls.' },
      ],
      note: 'Árangur er misjafn. RENOVA CELL er fæðubótarefni, ekki lyf.',
    },
    science: {
      title: 'Hvað rannsóknir segja',
      flip: 'Ýttu til að sjá heimildina',
      cards: [
        {
          title: 'Teygjanleiki húðar',
          finding:
            '69 konur tóku 2,5 g eða 5 g af tilteknum kollagenpeptíðum eða lyfleysu í 8 vikur. Teygjanleiki húðar batnaði miðað við lyfleysu.',
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Þægindi í liðum',
          finding:
            'Á 24 vikum greindu íþróttamenn sem tóku 10 g af kollagen-hýdrólýsati á dag frá minni liðverkjum tengdum hreyfingu en lyfleysuhópurinn.',
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'Heildarmyndin',
          finding:
            'Safngreining á 26 slembirannsóknum (1.721 þátttakandi) sýndi betri raka og teygjanleika húðar en með lyfleysu.',
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'Rannsóknirnar prófuðu tilteknar kollagenblöndur; niðurstöðurnar eiga ekki endilega við allar vörur, þar á meðal þessa.',
    },
    timeline: {
      title: 'Við hverju má búast',
      steps: [
        { day: 'Dagur 1', title: 'Byrjaðu siðinn', body: 'Einn skammtur á dag. Það er reglusemin sem skiptir máli.' },
        { day: 'Dagur 5', title: 'Gerðu það að vana', body: 'Sami tími, sami staður. Vaninn festist.' },
        { day: 'Dagur 15', title: 'Staldraðu við', body: 'Taktu eftir hvernig þér líður og haltu vananum.' },
        { day: 'Dagur 30', title: 'Einn mánuður', body: 'Haltu áfram. Rannsóknir mældu breytingar á húð eftir 4 til 12 vikur.' },
        { day: 'Dagur 90', title: 'Heill hringur', body: 'Tímabilið sem flestar rannsóknir skoðuðu. Tími til að bera saman.' },
      ],
    },
    beforeAfter: {
      title: 'Raunverulegir viðskiptavinir',
      before: 'Fyrir',
      after: 'Eftir',
      note: 'Óunnar myndir, birtar með leyfi. Árangur er misjafn.',
    },
    testimonials: {
      title: 'Fólk eins og þú',
      note: 'Raunverulegir viðskiptavinir, birt með leyfi. Árangur er misjafn.',
    },
    simulator: {
      title: 'Kollagenferillinn þinn',
      label: 'Aldur þinn',
      yAxis: 'Áætlað kollagen miðað við 25 ára (%)',
      you: 'Þú',
      note: 'Mynd af oft nefndri ~1% árlegri lækkun eftir 25 ára aldur. Ekki spá um árangur vörunnar.',
    },
    comparison: {
      title: 'RENOVA CELL vs. venjulegt kollagen',
      us: 'RENOVA CELL',
      them: 'Venjulegt kollagen',
      rows: [
        { label: 'Vatnsrofin kollagenpeptíð', us: 'yes', them: 'yes' },
        { label: 'Viðbætt peptíðblanda', us: 'yes', them: 'no' },
        { label: 'Áætlun sniðin að prófinu', us: 'yes', them: 'no' },
        { label: '30 daga skilaréttur', us: 'yes', them: 'varies' },
      ],
      varies: 'Misjafnt',
    },
    pricing: {
      perMonth: '/mán.',
      once: 'Stök kaup',
      subscribe: 'Áskrift: ný sending þegar klárast',
      interval: { m1: 'í hverjum mánuði', m3: 'á 3 mánaða fresti', m6: 'á 6 mánaða fresti' },
      title: 'Veldu áætlun',
      recommended: 'Ráðlagt fyrir þig',
      perUnit: '{price} stykkið',
      save: 'Sparaðu {pct}%',
      plans: {
        single: { name: '1 stk.', desc: 'Prófaðu í mánuð' },
        kit3: { name: 'Kit 3', desc: '90 daga hringurinn úr flestum rannsóknum' },
        kit6: { name: 'Kit 6', desc: 'Birgðir til 6 mánaða' },
      },
      recurring: '{price} er gjaldfært {interval} þar til þú segir upp. Segðu upp hvenær sem er í gegnum kvittunina í tölvupósti.',
      cta: 'Velja þessa áætlun',
    },
    shipping: { free: 'Frí sending', fast: 'Hröð afhending með rakningu', discreet: 'Látlausar umbúðir' },
    bonus: {
      title: 'Fylgir Kit 3 og Kit 6',
      items: ['Rafbók: Kollagenrútínan', '15 daga matseðill', 'VIP-hópur viðskiptavina'],
    },
    guarantee: {
      title: '30 daga skilaréttur',
      body: 'Prófaðu í 30 daga. Ef þú ert ekki ánægð/ur sendirðu okkur tölvupóst og við endurgreiðum pöntunina, engar spurningar.',
    },
    faq: {
      title: 'Spurningar',
      items: {
        different: {
          q: 'Ég prófaði kollagen áður og fann engan mun. Af hverju ætti þetta að vera öðruvísi?',
          a: 'Margir hætta eftir nokkrar vikur. Flestar rannsóknir stóðu í 8 til 12 vikur með daglegum skammti og þess vegna mælum við með 90 daga Kit 3. Og ef það hentar þér ekki gildir 30 daga skilarétturinn.',
        },
        time: {
          q: 'Hversu fljótt sé ég árangur?',
          a: 'Allir eru ólíkir. Rannsóknir mældu breytingar á húð eftir 4 til 12 vikna daglega notkun. Gefðu því að minnsta kosti einn heilan hring.',
        },
        safe: {
          q: 'Er þetta öruggt fyrir mig?',
          a: 'Kollagen er fæðuprótein sem fer yfirleitt vel í fólk. Ef þú ert barnshafandi, með barn á brjósti, tekur lyf eða ert með sjúkdóm skaltu fyrst ræða við lækni.',
        },
        men: {
          q: 'Er þetta líka fyrir karla?',
          a: 'Já. Kollagen styður húð og liði hjá öllum. Við höldum því ekki fram að það breyti hormónum.',
        },
        how: {
          q: 'Hvernig á að taka það?',
          a: 'Einn skammtur á dag, hrærður út í vatn, kaffi eða þeyting. Best er að taka það á sama tíma dag hvern.',
        },
        cancel: {
          q: 'Hvernig segi ég upp áskrift?',
          a: 'Notaðu tengilinn í hvaða kvittunarpósti sem er eða skrifaðu okkur. Þú getur sagt upp hvenær sem er án gjalds.',
        },
        shipping: {
          q: 'Hvernig virkar sendingin?',
          a: 'Sendingin er frí til allra landa sem við sendum til. Pantanir eru sendar fljótt, með rakningu, í hlutlausum, látlausum umbúðum án vöruheitis að utan. Rakningarhlekkurinn er sendur í tölvupósti um leið og pöntunin fer af stað.',
        },
      },
    },
    sticky: { cta: 'Ég vil áætlunina' },
    exit: {
      title: 'Bíddu: 10% afsláttur áður en þú ferð',
      body: 'Notaðu þennan kóða í greiðsluferlinu:',
      code: 'RENOVA10',
      cta: 'Nota 10% afsláttinn',
      dismiss: 'Nei takk',
    },
    chat: {
      title: 'Spyrðu Elenu',
      subtitle: 'Gervigreindaraðstoð · ekki læknir',
      greeting: 'Hæ! Ég er Elena, gervigreindaraðstoð RENOVA CELL. Spyrðu mig um vöruna eða áætlunina þína.',
      placeholder: 'Skrifaðu spurninguna þína…',
      send: 'Senda',
      error: 'Því miður fór eitthvað úrskeiðis. Reyndu aftur.',
      open: 'Opna spjall',
      close: 'Loka spjalli',
    },
    social: { ordered: 'Pantanir síðasta sólarhring: {count}' },
    footer: {
      privacy: 'Persónuvernd',
      terms: 'Skilmálar',
      contact: 'Hafa samband',
      rights: 'Allur réttur áskilinn.',
    },
  },
  checkout: {
    steps: ['Karfa', 'Upplýsingar', 'Greiðsla'],
    cart: {
      title: 'Pöntunin þín',
      bumpTitle: '+1 auka stykki fyrir {price}',
      bumpBody: 'Aðeins á þessari síðu: bættu við einu stykki á lægra verði.',
      coupon: 'Afsláttarkóði',
      couponPlaceholder: 'Sláðu inn kóða',
      apply: 'Nota',
      hint: 'Psst… prófaðu RENOVA10',
      valid: 'Kóði virkur: {pct}% afsláttur',
      invalid: 'Þessi kóði er ekki gildur.',
      total: 'Samtals',
      discountNote: 'Afslátturinn er dreginn frá við greiðslu',
      shipping: 'Sending',
      free: 'Frítt',
    },
    info: {
      title: 'Upplýsingarnar þínar',
      name: 'Fullt nafn',
      email: 'Netfang',
      newsletter: 'Sendið mér ráð gegn öldrun í tölvupósti',
      addressNote: 'Þú slærð inn sendingarheimilisfang á öruggu greiðslusíðunni (með sjálfvirkri útfyllingu).',
    },
    payment: {
      title: 'Greiðsla',
      body: 'Þú klárar á öruggri síðu Stripe. Kort, Apple Pay, Google Pay og aðrar leiðir birtast þar ef þær eru í boði í þínu landi.',
      installments: 'Möguleikar á raðgreiðslum birtast við greiðslu ef þeir eru í boði.',
      pay: 'Greiða á öruggan hátt',
      redirecting: 'Opna örugga greiðslu…',
      error: 'Ekki tókst að hefja greiðsluna. Reyndu aftur.',
      ssl: 'SSL-dulkóðað',
      guarantee: '30 daga trygging',
      stripe: 'Greiðslur með Stripe',
    },
  },
  upsell1: {
    title: 'Pöntunin er staðfest. Eitt enn…',
    body: 'Bættu við Kit 6 (stök kaup) með 45% afslætti, fyrir 6 mánaða rútínu. Tilboðið er aðeins á þessari síðu.',
    accept: 'Já, bæta við Kit 6 fyrir {price}',
    decline: 'Nei takk',
    charge: 'Vistaða kortið þitt verður skuldfært einu sinni um {price}. Engin áskrift.',
  },
  upsell2: {
    title: 'Verða aldrei uppiskroppa, og borga 30% minna',
    body: 'Fáðu Kit 3 á 3 mánaða fresti á {price} í stað {full}. Afslátturinn gildir á meðan þú ert í áskrift.',
    accept: 'Já, áskrift á {price} á 3 mánaða fresti',
    decline: 'Nei takk',
    charge: 'Vistaða kortið þitt verður skuldfært um {price} í dag og á 3 mánaða fresti þar til þú segir upp. Segðu upp hvenær sem er.',
  },
  upsell: {
    processing: 'Vinnsla í gangi…',
    error: 'Þetta tókst ekki. Þú varst ekki rukkuð/rukkaður.',
    action: 'Bankinn þinn þarf að staðfesta greiðsluna. Haltu áfram á öruggu síðunni.',
  },
  thankYou: {
    title: 'Takk fyrir{name}!',
    body: 'Pöntunin þín er staðfest. Kvittunin er á leiðinni í tölvupóstinn þinn.',
    howTo: 'Svona byrjar þú',
    steps: ['Taktu einn skammt á hverjum morgni.', 'Hrærðu út í vatn, kaffi eða þeyting.', 'Haltu áfram út hringinn.'],
    vip: { title: 'VIP-hópur', body: 'Ráð, uppskriftir og stuðningur frá öðrum viðskiptavinum.', cta: 'Ganga í hópinn' },
    referral: {
      title: 'Deildu með vini',
      body: 'Sendu tengilinn þinn. Sá sem notar hann fær 10% afslátt með kóðanum RENOVA10.',
      copy: 'Afrita tengil',
      copied: 'Afritað!',
    },
    order: 'Yfirlit pöntunar',
  },
  emails: {
    footer: 'Þú færð þennan póst af því að þú tókst RENOVA CELL prófið.',
    unsubscribe: 'Afskrá',
    diagnosis: {
      subject: '{name}, RENOVA CELL áætlunin þín',
      body: 'Hér er niðurstaðan þín: {diagnosis}\n\nRáðlögð áætlun fyrir þig er {plan}. Sjáðu hana hér: {link}',
    },
    vsl: {
      subject: '2 mínútna myndband fyrir þig',
      body: 'Við gerðum stutt myndband um hvað svörin þín þýða. Horfðu á það hér: {link}',
    },
    sms: { body: 'RENOVA CELL: 10% afsláttur af áætluninni með kóðanum RENOVA10 → {link} Svaraðu STOP til að hætta.' },
    socialProof: {
      subject: 'Af hverju fólk heldur áfram',
      body: 'Flestar rannsóknir á kollageni stóðu í 8 til 12 vikur. Þess vegna er 90 daga Kit 3 vinsælasta áætlunin okkar. Áætlunin þín: {link}',
    },
    lastChance: {
      subject: '10% afsláttarkóðinn þinn bíður enn',
      body: 'Kóðinn þinn RENOVA10 bíður þín enn. Notaðu hann hér: {link}',
    },
    story: {
      subject: 'Litlar venjur, mikill munur',
      body: 'Besta rútínan er sú sem þú heldur. Einn skammtur á dag, alla daga. Þegar þú ert tilbúin/n: {link}',
    },
  },
};
