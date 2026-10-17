import type { Dictionary } from './en';

export const nl: Dictionary = {
  common: {
    brand: 'RENOVA CELL',
    back: 'Terug',
    next: 'Volgende',
    continue: 'Doorgaan',
    skip: 'Overslaan',
    loading: 'Laden…',
    language: 'Taal',
    resultsVary: 'Resultaten verschillen per persoon.',
    fdaDisclaimer:
      'Deze uitspraken zijn niet beoordeeld door de Amerikaanse Food and Drug Administration. Dit product is niet bedoeld om een ziekte te diagnosticeren, te behandelen, te genezen of te voorkomen.',
    euDisclaimer:
      'Voedingssupplementen zijn geen vervanging voor een gevarieerd en evenwichtig voedingspatroon en een gezonde levensstijl. De aanbevolen dagelijkse dosis niet overschrijden. Buiten bereik van jonge kinderen bewaren.',
  },
  consent: {
    text: 'We gebruiken cookies voor analyse en het meten van advertenties.',
    accept: 'Accepteren',
    decline: 'Weigeren',
  },
  quiz: {
    progress: '{pct}% klaar',
    intro: 'Beantwoord 8 korte vragen (ongeveer 60 seconden) en krijg je plan voor een jonger ogende huid, meer zin en energie in het dagelijks leven.',
    questions: {
      gender: {
        title: 'Hoe identificeer je jezelf?',
        options: { male: 'Man', female: 'Vrouw', other: 'Zeg ik liever niet' },
      },
      age: {
        title: 'Hoe oud ben je?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: 'Waar heb je nu het meeste last van?',
        options: {
          skin: 'Huid verliest stevigheid',
          energy: 'Weinig energie',
          libido: 'Weinig zin / vitaliteit',
          joints: 'Stijve of pijnlijke gewrichten',
          all: 'Van alles een beetje',
        },
      },
      duration: {
        title: 'Hoelang heb je hier al last van?',
        options: { lt6m: 'Korter dan 6 maanden', '6m-2y': '6 maanden – 2 jaar', '2y+': 'Langer dan 2 jaar' },
      },
      history: {
        title: 'Heb je eerder collageen gebruikt?',
        options: { never: 'Nooit', tried: 'Ja, zonder resultaat', using: 'Ik gebruik het nu' },
      },
      energy: { title: 'Hoe is je energie overdag?', min: 'Uitgeput', max: 'Vol energie' },
      confidence: { title: 'Hoe goed voel je je in je lichaam?', min: 'Helemaal niet', max: 'Helemaal' },
      goal: {
        title: 'Wat wil je de komende 15 dagen het liefst voelen?',
        options: {
          skin: 'Steviger ogende huid',
          energy: 'Meer energie',
          libido: 'Meer vitaliteit',
          joints: 'Makkelijker bewegen',
          all: 'Alles',
        },
      },
    },
    contact: {
      title: 'Waar mogen we je plan naartoe sturen?',
      subtitle: 'Optioneel: je kunt je resultaat ook meteen zien zonder dit in te vullen.',
      name: 'Voornaam',
      email: 'E-mail',
      phone: 'Mobiel (optioneel, voor sms)',
      marketing: 'Stuur me tips en aanbiedingen per e-mail. Ik kan me altijd afmelden.',
      sms: 'Stuur me aanbiedingen per sms op dit nummer. Er kunnen kosten gelden. Antwoord STOP om af te melden.',
      submit: 'Bekijk mijn resultaat',
      skip: 'Overslaan en resultaat bekijken',
      privacy: 'We verkopen je gegevens nooit.',
    },
  },
  analyzing: {
    title: 'Je plan wordt gemaakt',
    steps: ['Je 8 antwoorden lezen…', 'Je collageenprofiel inschatten…', 'Je persoonlijke advies schrijven…'],
  },
  offer: {
    trust: 'Analyse klaar voor {name} • Op basis van je 8 antwoorden',
    trustAnon: 'Analyse klaar • Op basis van je 8 antwoorden',
    hero: {
      fallback: {
        woman: 'Een steviger ogende huid en stabiele energie beginnen bij wat je je lichaam elke dag geeft',
        man: 'Voel je weer klaar voor de dag: dagelijks collageen voor gewrichten, huid en stabiele energie',
        senior: 'Na je 50e maakt je lichaam minder collageen aan. Je dagelijkse routine kan dat aanvullen',
      },
      sub: 'Je dagelijkse jeugdritueel: een formule met collageen + peptiden voor wie een jonger ogende huid, meer zin en meer energie wil, afgestemd op je antwoorden.',
      cta: 'Bekijk mijn aanbevolen plan',
    },
    vsl: {
      title: 'Bekijk: wat je antwoorden betekenen',
      unavailable: 'De video is nu niet beschikbaar. Alles wat je nodig hebt staat hieronder.',
      cta: 'Ik wil mijn plan',
      resume: 'Verder waar je gebleven was',
    },
    diagnosis: {
      title: 'Je collageenschatting',
      body: 'Vanaf ongeveer je 25e maakt het lichaam elk jaar zo’n 1% minder collageen aan. Op jouw leeftijd is dat ongeveer {pct}% minder dan op je 25e.',
      note: 'Illustratieve schatting op basis van een vaak genoemd gemiddelde, geen medische meting.',
    },
    bullets: {
      title: 'Wat dit voor jou betekent',
      items: {
        skin: [
          'Collageenpeptiden werden in placebogecontroleerde studies gekoppeld aan een elastischere huid',
          'Een eenvoudige dagelijkse portie die in je ochtend past',
          'Bedoeld voor een huid die stevigheid begint te verliezen',
        ],
        energy: [
          'Een eiwitrijke dagelijkse portie die je routine ondersteunt',
          'Geen stimulerende middelen, dus geen dip achteraf',
          'Past bij slaap, water en beweging voor stabielere dagen',
        ],
        libido: [
          'Je goed voelen in je huid hoort bij zin hebben',
          'Een dagelijks zelfzorgritueel dat je zelfvertrouwen steunt',
          'Zonder hormonen en zonder stimulerende middelen',
        ],
        joints: [
          'Collageenhydrolysaat werd onderzocht bij gewrichtsklachten door beweging',
          'Steun voor het kraakbeen en bindweefsel dat je elke dag gebruikt',
          'Makkelijk elke dag te nemen, en daar gaat het om',
        ],
        all: [
          'Eén dagelijkse portie voor huid, gewrichten en algemeen welzijn',
          'Collageenpeptiden plus een peptidenmix',
          'Gemaakt voor de routine die je al hebt',
        ],
      },
    },
    pillars: {
      title: 'Eén dagelijks ritueel, drie doelen',
      items: [
        { title: 'Jonger ogende huid', body: 'Collageenpeptiden werden in placebogecontroleerde studies gekoppeld aan een elastischere en beter gehydrateerde huid.' },
        { title: 'Zin en vitaliteit', body: 'Je goed voelen in je lichaam hoort bij zin hebben. Een dagelijks zelfzorgritueel voor mannen en vrouwen, zonder hormonen en zonder stimulerende middelen.' },
        { title: 'Energie voor je dag', body: 'Een eiwitrijke dagelijkse portie die in je ochtend past, zonder stimulerende middelen en zonder dip.' },
      ],
      note: 'Resultaten verschillen. RENOVA CELL is een voedingssupplement, geen geneesmiddel.',
    },
    science: {
      title: 'Wat onderzoek zegt',
      flip: 'Tik om de bron te zien',
      cards: [
        {
          title: 'Elasticiteit van de huid',
          finding:
            '69 vrouwen namen 8 weken lang 2,5 g of 5 g specifieke collageenpeptiden of een placebo. De elasticiteit van de huid verbeterde ten opzichte van placebo.',
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Comfort van gewrichten',
          finding:
            'Sporters die 24 weken lang 10 g collageenhydrolysaat per dag namen, meldden minder gewrichtspijn bij inspanning dan met placebo.',
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'Het grotere plaatje',
          finding:
            'Een meta-analyse van 26 gerandomiseerde studies (1.721 deelnemers) vond een betere hydratatie en elasticiteit van de huid dan met placebo.',
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'De studies testten specifieke collageenformules; de resultaten gelden mogelijk niet voor elk product, ook niet voor dit product.',
    },
    timeline: {
      title: 'Wat je kunt verwachten',
      steps: [
        { day: 'Dag 1', title: 'Begin je ritueel', body: 'Eén portie per dag. Regelmaat is wat telt.' },
        { day: 'Dag 5', title: 'Maak het een gewoonte', body: 'Zelfde tijd, zelfde plek. De gewoonte zet zich vast.' },
        { day: 'Dag 15', title: 'Even stilstaan', body: 'Let op hoe je je voelt en houd de gewoonte vast.' },
        { day: 'Dag 30', title: 'Eén maand', body: 'Ga door. Studies maten huidveranderingen na 4 tot 12 weken.' },
        { day: 'Dag 90', title: 'Volledige cyclus', body: 'De periode die de meeste studies bekeken. Tijd om te vergelijken.' },
      ],
    },
    beforeAfter: {
      title: 'Echte klanten',
      before: 'Voor',
      after: 'Na',
      note: 'Onbewerkte foto’s, gedeeld met toestemming. Resultaten verschillen.',
    },
    testimonials: {
      title: 'Mensen zoals jij',
      note: 'Echte klanten, gedeeld met toestemming. Resultaten verschillen.',
    },
    simulator: {
      title: 'Jouw collageencurve',
      label: 'Je leeftijd',
      yAxis: 'Geschat collageen t.o.v. 25 jaar (%)',
      you: 'Jij',
      note: 'Weergave van de vaak genoemde daling van ~1% per jaar na je 25e. Geen voorspelling van productresultaten.',
    },
    comparison: {
      title: 'RENOVA CELL vs. een gewoon collageen',
      us: 'RENOVA CELL',
      them: 'Gewoon collageen',
      rows: [
        { label: 'Gehydrolyseerde collageenpeptiden', us: 'yes', them: 'yes' },
        { label: 'Extra peptidenmix', us: 'yes', them: 'no' },
        { label: 'Plan afgestemd op je quiz', us: 'yes', them: 'no' },
        { label: '30 dagen geld-terug-garantie', us: 'yes', them: 'varies' },
      ],
      varies: 'Wisselt',
    },
    pricing: {
      perMonth: '/mnd',
      once: 'Eenmalige aankoop',
      subscribe: 'Abonnement: opnieuw geleverd als het op is',
      interval: { m1: 'elke maand', m3: 'elke 3 maanden', m6: 'elke 6 maanden' },
      title: 'Kies je plan',
      recommended: 'Aanbevolen voor jou',
      perUnit: '{price} per stuk',
      save: 'Bespaar {pct}%',
      plans: {
        single: { name: '1 stuk', desc: 'Probeer het een maand' },
        kit3: { name: 'Kit 3', desc: 'De cyclus van 90 dagen uit de meeste studies' },
        kit6: { name: 'Kit 6', desc: 'Voorraad voor 6 maanden' },
      },
      recurring: 'Er wordt {price} {interval} afgeschreven tot je opzegt. Opzeggen kan altijd via je ontvangstbewijs per e-mail.',
      cta: 'Kies dit plan',
    },
    shipping: { free: 'Gratis verzending', fast: 'Snelle levering met track & trace', discreet: 'Discrete verpakking' },
    bonus: {
      title: 'Inbegrepen bij Kit 3 en Kit 6',
      items: ['E-book: De collageenroutine', 'Maaltijdplan voor 15 dagen', 'VIP-klantengroep'],
    },
    guarantee: {
      title: '30 dagen geld-terug-garantie',
      body: 'Probeer het 30 dagen. Ben je niet tevreden, mail ons dan en we betalen je bestelling terug, zonder vragen.',
    },
    faq: {
      title: 'Vragen',
      items: {
        different: {
          q: 'Ik heb al eens collageen geprobeerd en merkte niets. Waarom zou het nu anders zijn?',
          a: 'Veel mensen stoppen na een paar weken. De meeste studies liepen 8 tot 12 weken met een dagelijkse dosis; daarom raden we de Kit 3 van 90 dagen aan. En werkt het niet voor jou, dan geldt de garantie van 30 dagen.',
        },
        time: {
          q: 'Hoe snel zie ik resultaat?',
          a: 'Iedereen is anders. Onderzoek mat huidveranderingen na 4 tot 12 weken dagelijks gebruik. Geef het minstens één volledige cyclus.',
        },
        safe: {
          q: 'Is het veilig voor mij?',
          a: 'Collageen is een voedingseiwit dat meestal goed wordt verdragen. Ben je zwanger, geef je borstvoeding, gebruik je medicijnen of heb je een medische aandoening, overleg dan eerst met je arts.',
        },
        men: {
          q: 'Is het ook voor mannen?',
          a: 'Ja. Collageen ondersteunt huid en gewrichten bij iedereen. We beweren niet dat het hormonen verandert.',
        },
        how: {
          q: 'Hoe neem ik het in?',
          a: 'Eén portie per dag, door water, koffie of een smoothie. Elke dag op hetzelfde moment werkt het best.',
        },
        cancel: {
          q: 'Hoe zeg ik een abonnement op?',
          a: 'Gebruik de link in een van je ontvangstbewijzen per e-mail of schrijf ons. Opzeggen kan altijd, zonder kosten.',
        },
        shipping: {
          q: 'Hoe werkt de verzending?',
          a: 'Verzending is gratis naar alle landen waar we leveren. Bestellingen worden snel verzonden, met track & trace, in een neutrale, discrete verpakking zonder productnaam aan de buitenkant. De trackinglink komt per e-mail zodra de bestelling is verzonden.',
        },
      },
    },
    sticky: { cta: 'Ik wil mijn plan' },
    exit: {
      title: 'Wacht: 10% korting voor je gaat',
      body: 'Gebruik deze code bij het afrekenen:',
      code: 'RENOVA10',
      cta: 'Gebruik mijn 10% korting',
      dismiss: 'Nee, bedankt',
    },
    chat: {
      title: 'Vraag het Elena',
      subtitle: 'AI-assistent · geen arts',
      greeting: 'Hoi! Ik ben Elena, de AI-assistent van RENOVA CELL. Vraag me alles over het product of je plan.',
      placeholder: 'Typ je vraag…',
      send: 'Versturen',
      error: 'Sorry, er ging iets mis. Probeer het opnieuw.',
      open: 'Chat openen',
      close: 'Chat sluiten',
    },
    social: { ordered: '{count} mensen bestelden in de afgelopen 24 uur' },
    footer: {
      privacy: 'Privacy',
      terms: 'Voorwaarden',
      contact: 'Contact',
      rights: 'Alle rechten voorbehouden.',
    },
  },
  checkout: {
    steps: ['Winkelwagen', 'Je gegevens', 'Betaling'],
    cart: {
      title: 'Je bestelling',
      bumpTitle: '+1 extra stuk voor {price}',
      bumpBody: 'Alleen op deze pagina: voeg nog een stuk toe voor een lagere prijs.',
      coupon: 'Kortingscode',
      couponPlaceholder: 'Voer code in',
      apply: 'Toepassen',
      hint: 'Psst… probeer RENOVA10',
      valid: 'Code toegepast: {pct}% korting',
      invalid: 'Deze code is niet geldig.',
      total: 'Totaal',
      discountNote: 'Korting wordt bij de betaling verrekend',
      shipping: 'Verzending',
      free: 'Gratis',
    },
    info: {
      title: 'Je gegevens',
      name: 'Volledige naam',
      email: 'E-mail',
      newsletter: 'Stuur me anti-aging-tips per e-mail',
      addressNote: 'Je vult je bezorgadres in op de beveiligde betaalpagina (met automatisch aanvullen).',
    },
    payment: {
      title: 'Betaling',
      body: 'Je rondt af op de beveiligde pagina van Stripe. Kaart, Apple Pay, Google Pay en andere methoden verschijnen daar als ze in jouw land beschikbaar zijn.',
      installments: 'Opties om in termijnen te betalen verschijnen bij de betaling als ze beschikbaar zijn.',
      pay: 'Veilig betalen',
      redirecting: 'Beveiligde betaling wordt geopend…',
      error: 'We konden de betaling niet starten. Probeer het opnieuw.',
      ssl: 'SSL-versleuteld',
      guarantee: '30 dagen garantie',
      stripe: 'Betalingen via Stripe',
    },
  },
  upsell1: {
    title: 'Je bestelling is bevestigd. Nog één ding…',
    body: 'Voeg een Kit 6 (eenmalig) toe met 45% korting, voor de routine van 6 maanden. Dit aanbod staat alleen op deze pagina.',
    accept: 'Ja, voeg Kit 6 toe voor {price}',
    decline: 'Nee, bedankt',
    charge: 'Je opgeslagen kaart wordt eenmalig met {price} belast. Geen abonnement.',
  },
  upsell2: {
    title: 'Nooit meer zonder, en 30% minder betalen',
    body: 'Ontvang Kit 3 elke 3 maanden voor {price} in plaats van {full}. De korting geldt zolang je abonnee blijft.',
    accept: 'Ja, abonneer voor {price} elke 3 maanden',
    decline: 'Nee, bedankt',
    charge: 'Je opgeslagen kaart wordt vandaag en daarna elke 3 maanden met {price} belast tot je opzegt. Opzeggen kan altijd.',
  },
  upsell: {
    processing: 'Bezig…',
    error: 'Dit is niet gelukt. Er is niets afgeschreven.',
    action: 'Je bank moet deze betaling bevestigen. Ga verder op de beveiligde pagina.',
  },
  thankYou: {
    title: 'Bedankt{name}!',
    body: 'Je bestelling is bevestigd. Het ontvangstbewijs komt naar je e-mail.',
    howTo: 'Zo begin je',
    steps: ['Neem elke ochtend één portie.', 'Meng het door water, koffie of een smoothie.', 'Houd het vol tot de cyclus rond is.'],
    vip: { title: 'VIP-groep', body: 'Tips, recepten en steun van andere klanten.', cta: 'Word lid van de groep' },
    referral: {
      title: 'Deel het met een vriend(in)',
      body: 'Stuur je link. Wie hem gebruikt, krijgt 10% korting met code RENOVA10.',
      copy: 'Link kopiëren',
      copied: 'Gekopieerd!',
    },
    order: 'Overzicht van je bestelling',
  },
  emails: {
    footer: 'Je ontvangt dit omdat je de RENOVA CELL-quiz hebt ingevuld.',
    unsubscribe: 'Afmelden',
    diagnosis: {
      subject: '{name}, je RENOVA CELL-plan',
      body: 'Dit is je resultaat: {diagnosis}\n\nJe aanbevolen plan is {plan}. Bekijk het hier: {link}',
    },
    vsl: {
      subject: 'De video van 2 minuten voor jouw profiel',
      body: 'We maakten een korte video over wat je antwoorden betekenen. Bekijk hem hier: {link}',
    },
    sms: { body: 'RENOVA CELL: 10% korting op je plan met code RENOVA10 → {link} Antwoord STOP om af te melden.' },
    socialProof: {
      subject: 'Waarom mensen het volhouden',
      body: 'De meeste studies naar collageen liepen 8 tot 12 weken. Daarom is de Kit 3 van 90 dagen ons meest gekozen plan. Jouw plan: {link}',
    },
    lastChance: {
      subject: 'Je code voor 10% korting ligt nog klaar',
      body: 'Je code RENOVA10 ligt nog voor je klaar. Gebruik hem hier: {link}',
    },
    story: {
      subject: 'Kleine gewoontes, groot verschil',
      body: 'De beste routine is de routine die je volhoudt. Eén portie per dag, elke dag. Als je er klaar voor bent: {link}',
    },
  },
};
