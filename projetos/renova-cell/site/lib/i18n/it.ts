import type { Dictionary } from './en';

export const it: Dictionary = {
  common: {
    brand: 'RENOVA CELL',
    back: 'Indietro',
    next: 'Avanti',
    continue: 'Continua',
    skip: 'Salta',
    loading: 'Caricamento…',
    language: 'Lingua',
    resultsVary: 'I risultati variano da persona a persona.',
    fdaDisclaimer:
      'Queste dichiarazioni non sono state valutate dalla Food and Drug Administration (FDA) statunitense. Questo prodotto non è destinato a diagnosticare, trattare, curare o prevenire alcuna malattia.',
    euDisclaimer:
      'Gli integratori non vanno intesi come sostituti di una dieta variata ed equilibrata e di uno stile di vita sano. Non superare la dose giornaliera raccomandata. Tenere fuori dalla portata dei bambini al di sotto dei tre anni di età.',
  },
  consent: {
    text: 'Usiamo i cookie per analisi e misurazione degli annunci.',
    accept: 'Accetta',
    decline: 'Rifiuta',
  },
  quiz: {
    progress: '{pct}% completato',
    intro: 'Rispondi a 8 domande veloci (circa 60 secondi) e ricevi il tuo piano personalizzato.',
    questions: {
      gender: {
        title: 'Come ti identifichi?',
        options: { male: 'Uomo', female: 'Donna', other: 'Preferisco non dirlo' },
      },
      age: {
        title: 'Quanti anni hai?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: 'Cosa ti dà più fastidio in questo periodo?',
        options: {
          skin: 'Pelle che perde tonicità',
          energy: 'Poca energia',
          libido: 'Poco desiderio / vitalità',
          joints: 'Fastidi alle articolazioni',
          all: "Un po' di tutto",
        },
      },
      duration: {
        title: 'Da quanto tempo ti dà fastidio?',
        options: { lt6m: 'Meno di 6 mesi', '6m-2y': 'Da 6 mesi a 2 anni', '2y+': 'Più di 2 anni' },
      },
      history: {
        title: 'Hai già provato il collagene?',
        options: { never: 'Mai', tried: 'Sì, ma senza risultati', using: 'Lo sto prendendo ora' },
      },
      energy: { title: "Com'è la tua energia durante la giornata?", min: 'Zero energie', max: 'Energia a mille' },
      confidence: { title: 'Quanto ti senti a tuo agio nel tuo corpo?', min: 'Per niente', max: 'Totalmente' },
      goal: {
        title: 'Cosa vorresti sentire di più nei prossimi 15 giorni?',
        options: {
          skin: "Pelle dall'aspetto più tonico",
          energy: 'Più energia',
          libido: 'Più vitalità',
          joints: 'Movimenti più sciolti',
          all: 'Tutto questo',
        },
      },
    },
    contact: {
      title: 'Dove ti mandiamo il tuo piano?',
      subtitle: 'Facoltativo: puoi vedere subito il tuo risultato anche senza.',
      name: 'Nome',
      email: 'Email',
      phone: 'Cellulare (facoltativo, per gli SMS)',
      marketing: 'Inviami consigli e offerte via email. Posso disiscrivermi quando voglio.',
      sms: 'Inviami offerte via SMS a questo numero. Potrebbero essere applicati costi per messaggi e dati. Rispondi STOP per annullare.',
      submit: 'Vedi il mio risultato',
      skip: 'Salta e vedi il risultato',
      privacy: 'Non vendiamo mai i tuoi dati.',
    },
  },
  analyzing: {
    title: 'Stiamo creando il tuo piano',
    steps: ['Leggiamo le tue 8 risposte…', 'Stimiamo il tuo profilo di collagene…', 'Scriviamo la tua raccomandazione personalizzata…'],
  },
  offer: {
    trust: 'Analisi completata per {name} • In base alle tue 8 risposte',
    trustAnon: 'Analisi completata • In base alle tue 8 risposte',
    hero: {
      fallback: {
        woman: "Una pelle dall'aspetto più tonico e un'energia costante iniziano da ciò che dai al tuo corpo ogni giorno",
        man: 'Torna a sentirti pronto per la giornata: collagene ogni giorno per articolazioni, pelle ed energia costante',
        senior: 'Dopo i 50 anni il corpo produce meno collagene. La tua routine quotidiana può aiutarti a compensare',
      },
      sub: 'Una formula quotidiana di collagene + peptidi, su misura per le tue risposte.',
      cta: 'Vedi il piano consigliato',
    },
    vsl: {
      title: 'Guarda: cosa significano le tue risposte',
      unavailable: 'Il video non è disponibile al momento. Qui sotto trovi tutto quello che ti serve.',
      cta: 'Voglio il mio piano ora',
      resume: 'Riprendiamo da dove avevi interrotto',
    },
    diagnosis: {
      title: 'La tua stima del collagene',
      body: "Dai 25 anni circa, il corpo produce all'incirca l'1% di collagene in meno ogni anno. Alla tua età, fanno circa {pct}% in meno rispetto ai 25 anni.",
      note: 'Stima illustrativa basata su una media spesso citata, non una misurazione medica.',
    },
    bullets: {
      title: 'Cosa significa per te',
      items: {
        skin: [
          'I peptidi di collagene sono stati associati a una maggiore elasticità della pelle in studi controllati con placebo',
          'Una dose quotidiana semplice che si inserisce nella tua mattina',
          'Pensato per la pelle che inizia a perdere tonicità',
        ],
        energy: [
          'Una dose quotidiana ricca di proteine per sostenere la tua routine',
          'Niente stimolanti: nessun calo improvviso dopo',
          'Insieme a sonno, acqua e movimento, per giornate più stabili',
        ],
        libido: [
          'Sentirsi bene nella propria pelle fa parte del desiderio',
          'Un rituale quotidiano di cura di sé che sostiene la tua sicurezza',
          'Niente ormoni e niente stimolanti',
        ],
        joints: [
          "Il collagene idrolizzato è stato studiato per i fastidi articolari legati all'attività fisica",
          'Un supporto per le cartilagini e il tessuto connettivo che usi ogni giorno',
          'Facile da prendere ogni giorno, ed è questo che conta',
        ],
        all: [
          'Una dose al giorno per pelle, articolazioni e benessere generale',
          'Peptidi di collagene più un mix di peptidi',
          'Pensato per la routine che hai già',
        ],
      },
    },
    science: {
      title: 'Cosa dice la ricerca',
      flip: 'Tocca per vedere la fonte',
      cards: [
        {
          title: 'Elasticità della pelle',
          finding:
            "69 donne hanno assunto 2,5 g o 5 g di specifici peptidi di collagene oppure un placebo per 8 settimane. L'elasticità della pelle è migliorata rispetto al placebo.",
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Comfort articolare',
          finding:
            "In 24 settimane, gli atleti che assumevano 10 g al giorno di collagene idrolizzato hanno riferito meno dolore articolare legato all'attività rispetto al placebo.",
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'Il quadro generale',
          finding:
            "Una meta-analisi di 26 studi randomizzati (1.721 partecipanti) ha rilevato miglioramenti dell'idratazione e dell'elasticità della pelle rispetto al placebo.",
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'Gli studi hanno testato formule specifiche di collagene; i risultati potrebbero non valere per tutti i prodotti, compreso questo.',
    },
    timeline: {
      title: 'Cosa aspettarti',
      steps: [
        { day: 'Giorno 1', title: 'Inizia il tuo rituale', body: 'Una dose al giorno. Quello che conta è la costanza.' },
        { day: 'Giorno 5', title: 'Rendilo automatico', body: "Stessa ora, stesso posto. L'abitudine prende forma." },
        { day: 'Giorno 15', title: 'Fai il punto', body: 'Nota come ti senti. Molte persone dicono di sentirsi più costanti.' },
        { day: 'Giorno 30', title: 'Il primo mese', body: 'Continua così. Gli studi hanno misurato cambiamenti della pelle tra 4 e 12 settimane.' },
        { day: 'Giorno 90', title: 'Ciclo completo', body: 'Il periodo osservato dalla maggior parte delle ricerche. È il momento di fare un confronto.' },
      ],
    },
    beforeAfter: {
      title: 'Clienti reali',
      before: 'Prima',
      after: 'Dopo',
      note: 'Foto non ritoccate, condivise con il consenso dei clienti. I risultati variano.',
    },
    testimonials: {
      title: 'Persone come te',
      note: 'Clienti reali, testimonianze condivise con il loro consenso. I risultati variano.',
    },
    simulator: {
      title: 'La tua curva del collagene',
      label: 'La tua età',
      yAxis: 'Collagene stimato rispetto ai 25 anni (%)',
      you: 'Tu',
      note: "Illustrazione del calo spesso citato di circa l'1% l'anno dopo i 25 anni. Non è una previsione dei risultati del prodotto.",
    },
    comparison: {
      title: 'RENOVA CELL vs. un collagene comune',
      us: 'RENOVA CELL',
      them: 'Collagene comune',
      rows: [
        { label: 'Peptidi di collagene idrolizzato', us: 'yes', them: 'yes' },
        { label: 'Mix di peptidi aggiunto', us: 'yes', them: 'no' },
        { label: 'Piano basato sul tuo quiz', us: 'yes', them: 'no' },
        { label: 'Soddisfatti o rimborsati 30 giorni', us: 'yes', them: 'varies' },
      ],
      varies: 'Dipende',
    },
    pricing: {
      perMonth: '/mese',
      title: 'Scegli il tuo piano',
      recommended: 'Consigliato per te',
      perUnit: '{price} a confezione',
      save: 'Risparmia {pct}%',
      plans: {
        single: { name: '1 confezione', desc: 'Provalo per un mese' },
        kit3: { name: 'Kit 3', desc: 'Il ciclo di 90 giorni usato nella maggior parte degli studi' },
        kit6: { name: 'Kit 6 — mensile', desc: '6 confezioni consegnate ogni mese' },
      },
      recurring: 'Addebito di {price} ogni mese fino alla disdetta. Puoi disdire quando vuoi dalla ricevuta che ricevi via email.',
      cta: 'Scegli questo piano',
    },
    bonus: {
      title: 'Incluso con Kit 3 e Kit 6',
      items: ['E-book: La routine del collagene', 'Piano alimentare di 15 giorni', 'Gruppo clienti VIP'],
    },
    guarantee: {
      title: 'Soddisfatti o rimborsati 30 giorni',
      body: "Provalo per 30 giorni. Se non ti convince, scrivici un'email e ti rimborsiamo l'ordine, senza fare domande.",
    },
    faq: {
      title: 'Domande frequenti',
      items: {
        different: {
          q: 'Ho già provato il collagene e non ho visto nulla. Perché questo dovrebbe essere diverso?',
          a: 'Molte persone smettono dopo poche settimane. La maggior parte degli studi è durata da 8 a 12 settimane con una dose quotidiana: per questo consigliamo il Kit 3 da 90 giorni. E se non funziona per te, vale la garanzia di 30 giorni.',
        },
        time: {
          q: 'In quanto tempo vedrò dei risultati?',
          a: 'Ognuno è diverso. Le ricerche hanno misurato cambiamenti della pelle dopo 4-12 settimane di uso quotidiano. Concediti almeno un ciclo completo.',
        },
        safe: {
          q: 'È sicuro per me?',
          a: 'Il collagene è una proteina alimentare generalmente ben tollerata. Se sei in gravidanza, allatti, assumi farmaci o hai una condizione medica, parlane prima con il tuo medico.',
        },
        men: {
          q: 'Va bene anche per gli uomini?',
          a: 'Sì. Il collagene supporta pelle e articolazioni di tutti. Non affermiamo che modifichi gli ormoni.',
        },
        how: {
          q: 'Come si prende?',
          a: 'Una dose al giorno, mescolata in acqua, caffè o in uno smoothie. Meglio sempre alla stessa ora.',
        },
        cancel: {
          q: 'Come disdico il piano mensile?',
          a: 'Usa il link presente in qualsiasi email di ricevuta oppure scrivici. Puoi disdire quando vuoi, senza costi.',
        },
        shipping: {
          q: 'Quanto tempo richiede la spedizione?',
          a: 'Riceverai via email un link di tracciamento appena il tuo ordine verrà spedito.',
        },
      },
    },
    sticky: { cta: 'Voglio il mio piano' },
    exit: {
      title: 'Aspetta: 10% di sconto prima di andare',
      body: 'Usa questo codice al momento del pagamento:',
      code: 'RENOVA10',
      cta: 'Usa il mio sconto del 10%',
      dismiss: 'No, grazie',
    },
    chat: {
      title: 'Chiedi a Elena',
      subtitle: 'Assistente IA · non è un medico',
      greeting: "Ciao! Sono Elena, l'assistente IA di RENOVA CELL. Chiedimi quello che vuoi sul prodotto o sul tuo piano.",
      placeholder: 'Scrivi la tua domanda…',
      send: 'Invia',
      error: 'Scusa, qualcosa è andato storto. Riprova.',
      open: 'Apri la chat',
      close: 'Chiudi la chat',
    },
    social: { ordered: '{count} persone hanno ordinato nelle ultime 24 ore' },
    footer: {
      privacy: 'Privacy',
      terms: 'Termini e condizioni',
      contact: 'Contatti',
      rights: 'Tutti i diritti riservati.',
    },
  },
  checkout: {
    steps: ['Carrello', 'I tuoi dati', 'Pagamento'],
    cart: {
      title: 'Il tuo ordine',
      bumpTitle: '+1 confezione extra a {price}',
      bumpBody: "Solo su questa pagina: aggiungi un'altra confezione a un prezzo più basso.",
      coupon: 'Codice sconto',
      couponPlaceholder: 'Inserisci il codice',
      apply: 'Applica',
      hint: 'Psst… prova RENOVA10',
      valid: 'Codice applicato: -{pct}%',
      invalid: 'Questo codice non è valido.',
      total: 'Totale',
      discountNote: 'Sconto applicato al pagamento',
    },
    info: {
      title: 'I tuoi dati',
      name: 'Nome e cognome',
      email: 'Email',
      newsletter: 'Inviami consigli anti-age via email',
      addressNote: "Inserirai l'indirizzo di spedizione nella pagina di pagamento sicura (con compilazione automatica).",
    },
    payment: {
      title: 'Pagamento',
      body: "Completerai l'acquisto sulla pagina sicura di Stripe. Carta, Apple Pay, Google Pay e altri metodi compaiono lì, se disponibili nel tuo Paese.",
      installments: 'Le opzioni di pagamento a rate compaiono al momento del pagamento, se disponibili.',
      pay: 'Paga in sicurezza',
      redirecting: 'Apertura del pagamento sicuro…',
      error: 'Non siamo riusciti ad avviare il pagamento. Riprova.',
      ssl: 'Crittografia SSL',
      guarantee: 'Garanzia di 30 giorni',
      stripe: 'Pagamenti con Stripe',
    },
  },
  upsell1: {
    title: 'Il tuo ordine è confermato. Ancora una cosa…',
    body: 'Aggiungi un Kit 6 (acquisto singolo) con il 45% di sconto, per la routine di 6 mesi. Offerta disponibile solo su questa pagina.',
    accept: 'Sì, aggiungi il Kit 6 a {price}',
    decline: 'No, grazie',
    charge: 'Addebiteremo {price} sulla carta salvata una sola volta. Nessun abbonamento.',
  },
  upsell2: {
    title: 'Non restare mai senza, e paga il 30% in meno',
    body: "Ricevi il Kit 3 ogni mese a {price} invece di {full}. Lo sconto resta valido finché mantieni l'abbonamento.",
    accept: 'Sì, mi abbono a {price}/mese',
    decline: 'No, grazie',
    charge: 'Addebiteremo {price} sulla carta salvata oggi e poi ogni mese fino alla disdetta. Puoi disdire quando vuoi.',
  },
  upsell: {
    processing: 'Elaborazione…',
    error: "Non siamo riusciti a completare l'operazione. Non ti è stato addebitato nulla.",
    action: 'La tua banca deve confermare questo pagamento. Continua sulla pagina sicura.',
  },
  thankYou: {
    title: 'Grazie{name}!',
    body: 'Il tuo ordine è confermato. La ricevuta sta arrivando nella tua casella email.',
    howTo: 'Come iniziare',
    steps: ['Prendi una dose ogni mattina.', 'Mescolala in acqua, caffè o in uno smoothie.', 'Continua per tutto il ciclo.'],
    vip: { title: 'Gruppo VIP', body: 'Consigli, ricette e supporto da altri clienti.', cta: 'Entra nel gruppo' },
    referral: {
      title: "Condividi con un'amica o un amico",
      body: 'Invia il tuo link. Chi lo riceve ottiene il 10% di sconto con il codice RENOVA10.',
      copy: 'Copia il link',
      copied: 'Copiato!',
    },
    order: 'Riepilogo ordine',
  },
  emails: {
    footer: 'Ricevi questa email perché hai fatto il quiz RENOVA CELL.',
    unsubscribe: 'Annulla iscrizione',
    diagnosis: {
      subject: '{name}, il tuo piano RENOVA CELL',
      body: 'Ecco il tuo risultato: {diagnosis}\n\nIl piano consigliato per te è {plan}. Lo trovi qui: {link}',
    },
    vsl: {
      subject: 'Il video di 2 minuti pensato per il tuo profilo',
      body: 'Abbiamo preparato un breve video su cosa significano le tue risposte. Guardalo qui: {link}',
    },
    sms: { body: 'RENOVA CELL: 10% di sconto sul tuo piano con il codice RENOVA10 → {link} Rispondi STOP per disiscriverti.' },
    socialProof: {
      subject: 'Perché in tanti continuano',
      body: 'La maggior parte degli studi sul collagene è durata da 8 a 12 settimane. Per questo il Kit 3 da 90 giorni è il nostro piano più scelto. Il tuo piano: {link}',
    },
    lastChance: {
      subject: 'Il tuo sconto del 10% ti aspetta ancora',
      body: 'Il tuo codice RENOVA10 ti sta ancora aspettando. Usalo qui: {link}',
    },
    story: {
      subject: 'Piccole abitudini, grande differenza',
      body: 'La routine migliore è quella che mantieni. Una dose al giorno, ogni giorno. Quando vuoi: {link}',
    },
  },
};
