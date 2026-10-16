import type { Dictionary } from './en';

export const de: Dictionary = {
  common: {
    brand: 'RENOVA CELL',
    back: 'Zurück',
    next: 'Weiter',
    continue: 'Weiter',
    skip: 'Überspringen',
    loading: 'Lädt…',
    language: 'Sprache',
    resultsVary: 'Ergebnisse sind individuell verschieden.',
    fdaDisclaimer:
      'Diese Aussagen wurden nicht von der FDA bewertet. Dieses Produkt ist nicht dazu bestimmt, Krankheiten zu diagnostizieren, zu behandeln, zu heilen oder zu verhindern.',
  },
  quiz: {
    progress: '{pct} % erledigt',
    intro: 'Beantworte 8 kurze Fragen (etwa 60 Sekunden) und erhalte deinen persönlichen Plan.',
    questions: {
      gender: {
        title: 'Wie identifizierst du dich?',
        options: { male: 'Mann', female: 'Frau', other: 'Möchte ich nicht sagen' },
      },
      age: {
        title: 'Wie alt bist du?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: 'Was stört dich gerade am meisten?',
        options: {
          skin: 'Haut verliert an Festigkeit',
          energy: 'Wenig Energie',
          libido: 'Wenig Lust / Vitalität',
          joints: 'Steife oder schmerzende Gelenke',
          all: 'Ein bisschen von allem',
        },
      },
      duration: {
        title: 'Seit wann stört dich das?',
        options: { lt6m: 'Weniger als 6 Monate', '6m-2y': '6 Monate bis 2 Jahre', '2y+': 'Mehr als 2 Jahre' },
      },
      history: {
        title: 'Hast du schon einmal Kollagen genommen?',
        options: { never: 'Nie', tried: 'Ja, aber ohne Ergebnis', using: 'Ich nehme gerade welches' },
      },
      energy: { title: 'Wie ist deine Energie im Alltag?', min: 'Erschöpft', max: 'Voller Energie' },
      confidence: { title: 'Wie wohl fühlst du dich in deinem Körper?', min: 'Gar nicht', max: 'Total' },
      goal: {
        title: 'Was möchtest du in den nächsten 15 Tagen am meisten spüren?',
        options: {
          skin: 'Straffer wirkende Haut',
          energy: 'Mehr Energie',
          libido: 'Mehr Vitalität',
          joints: 'Leichter bewegen',
          all: 'Alles davon',
        },
      },
    },
    contact: {
      title: 'Wohin sollen wir deinen Plan schicken?',
      subtitle: 'Optional – du siehst dein Ergebnis auch ohne Angaben sofort.',
      name: 'Vorname',
      email: 'E-Mail',
      phone: 'Handy (optional, für SMS)',
      marketing: 'Schickt mir Tipps und Angebote per E-Mail. Ich kann mich jederzeit abmelden.',
      sms: 'Schickt mir Angebote per SMS an diese Nummer. Antworte STOP zum Abbestellen.',
      submit: 'Mein Ergebnis ansehen',
      skip: 'Überspringen und Ergebnis ansehen',
      privacy: 'Wir verkaufen deine Daten niemals.',
    },
  },
  analyzing: {
    title: 'Dein Plan wird erstellt',
    steps: ['Deine 8 Antworten werden gelesen…', 'Dein Kollagen-Profil wird geschätzt…', 'Deine persönliche Empfehlung wird geschrieben…'],
  },
  offer: {
    trust: 'Analyse abgeschlossen für {name} • Basierend auf deinen 8 Antworten',
    trustAnon: 'Analyse abgeschlossen • Basierend auf deinen 8 Antworten',
    hero: {
      fallback: {
        woman: 'Straffer wirkende Haut und stabile Energie beginnen mit dem, was du deinem Körper jeden Tag gibst',
        man: 'Fühl dich wieder bereit für den Tag: tägliches Kollagen für Gelenke, Haut und Energie',
        senior: 'Ab 50 bildet der Körper weniger Kollagen. Deine tägliche Routine kann das ausgleichen',
      },
      sub: 'Eine tägliche Formel aus Kollagen + Peptiden, abgestimmt auf deine Antworten.',
      cta: 'Meinen empfohlenen Plan ansehen',
    },
    vsl: {
      title: 'Ansehen: Was deine Antworten bedeuten',
      unavailable: 'Das Video ist gerade nicht verfügbar. Alles Wichtige steht unten.',
      cta: 'Jetzt meinen Plan holen',
      resume: 'Weiter an der Stelle, an der du aufgehört hast',
    },
    diagnosis: {
      title: 'Deine Kollagen-Schätzung',
      body: 'Ab etwa 25 bildet der Körper jedes Jahr rund 1 % weniger Kollagen. In deinem Alter sind das etwa {pct} % weniger als mit 25.',
      note: 'Anschauliche Schätzung auf Basis eines häufig zitierten Durchschnitts, keine medizinische Messung.',
    },
    bullets: {
      title: 'Was das für dich bedeutet',
      items: {
        skin: [
          'Kollagenpeptide wurden in placebokontrollierten Studien mit besserer Hautelastizität in Verbindung gebracht',
          'Eine einfache tägliche Portion, die in deinen Morgen passt',
          'Gedacht für Haut, die an Festigkeit verliert',
        ],
        energy: [
          'Proteinreiche tägliche Portion für deine Routine',
          'Keine Stimulanzien – kein Absturz danach',
          'Passt zu Schlaf, Wasser und Bewegung für ausgeglichenere Tage',
        ],
        libido: [
          'Sich in der eigenen Haut wohlzufühlen gehört zur Lust dazu',
          'Ein tägliches Selbstfürsorge-Ritual, das Selbstvertrauen stärkt',
          'Ohne Hormone und ohne Stimulanzien',
        ],
        joints: [
          'Kollagenhydrolysat wurde bei belastungsbedingten Gelenkbeschwerden untersucht',
          'Unterstützung für Knorpel und Bindegewebe, die du jeden Tag nutzt',
          'Leicht jeden Tag einzunehmen – und darauf kommt es an',
        ],
        all: [
          'Eine tägliche Portion für Haut, Gelenke und Wohlbefinden',
          'Kollagenpeptide plus Peptid-Mix',
          'Passend zu der Routine, die du schon hast',
        ],
      },
    },
    science: {
      title: 'Was die Forschung sagt',
      flip: 'Tippen, um die Quelle zu sehen',
      cards: [
        {
          title: 'Hautelastizität',
          finding:
            '69 Frauen nahmen 8 Wochen lang 2,5 g oder 5 g spezifischer Kollagenpeptide oder Placebo. Die Hautelastizität verbesserte sich gegenüber Placebo.',
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Gelenkkomfort',
          finding:
            'Über 24 Wochen berichteten Sportler mit 10 g/Tag Kollagenhydrolysat über weniger belastungsbedingte Gelenkschmerzen als unter Placebo.',
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'Das Gesamtbild',
          finding:
            'Eine Metaanalyse von 26 randomisierten Studien (1.721 Teilnehmende) fand Verbesserungen der Hautfeuchtigkeit und -elastizität gegenüber Placebo.',
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'Die Studien testeten bestimmte Kollagenformeln; die Ergebnisse gelten nicht unbedingt für jedes Produkt, auch nicht für dieses.',
    },
    timeline: {
      title: 'Was dich erwartet',
      steps: [
        { day: 'Tag 1', title: 'Starte dein Ritual', body: 'Eine Portion pro Tag. Entscheidend ist die Regelmäßigkeit.' },
        { day: 'Tag 5', title: 'Mach es automatisch', body: 'Gleiche Zeit, gleicher Ort. Die Gewohnheit setzt sich fest.' },
        { day: 'Tag 15', title: 'Zwischenbilanz', body: 'Achte darauf, wie du dich fühlst. Viele berichten von gleichmäßigeren Tagen.' },
        { day: 'Tag 30', title: 'Ein Monat', body: 'Bleib dran. Studien maßen Hautveränderungen nach 4 bis 12 Wochen.' },
        { day: 'Tag 90', title: 'Voller Zyklus', body: 'Der Zeitraum, den die meisten Studien betrachtet haben. Zeit zu vergleichen.' },
      ],
    },
    beforeAfter: {
      title: 'Echte Kundinnen und Kunden',
      before: 'Vorher',
      after: 'Nachher',
      note: 'Unbearbeitete Fotos, mit Erlaubnis geteilt. Ergebnisse variieren.',
    },
    testimonials: {
      title: 'Menschen wie du',
      note: 'Echte Kundinnen und Kunden, mit Erlaubnis geteilt. Ergebnisse variieren.',
    },
    simulator: {
      title: 'Deine Kollagen-Kurve',
      label: 'Dein Alter',
      yAxis: 'Geschätztes Kollagen vs. mit 25 (%)',
      you: 'Du',
      note: 'Darstellung des häufig zitierten Rückgangs von ~1 % pro Jahr ab 25. Keine Vorhersage von Produktergebnissen.',
    },
    comparison: {
      title: 'RENOVA CELL vs. typisches Kollagen',
      us: 'RENOVA CELL',
      them: 'Typisches Kollagen',
      rows: [
        { label: 'Hydrolysierte Kollagenpeptide', us: 'yes', them: 'yes' },
        { label: 'Zusätzlicher Peptid-Mix', us: 'yes', them: 'no' },
        { label: 'Plan passend zu deinem Quiz', us: 'yes', them: 'no' },
        { label: '30 Tage Geld-zurück-Garantie', us: 'yes', them: 'varies' },
      ],
      varies: 'Unterschiedlich',
    },
    pricing: {
      perMonth: '/Monat',
      title: 'Wähle deinen Plan',
      recommended: 'Für dich empfohlen',
      perUnit: '{price} pro Einheit',
      save: 'Spare {pct} %',
      plans: {
        single: { name: '1 Einheit', desc: 'Einen Monat lang testen' },
        kit3: { name: 'Kit 3', desc: 'Der 90-Tage-Zyklus der meisten Studien' },
        kit6: { name: 'Kit 6 – monatlich', desc: '6 Einheiten jeden Monat geliefert' },
      },
      recurring: 'Monatlich {price}, bis du kündigst. Jederzeit über den Link in deiner Beleg-E-Mail kündbar.',
      cta: 'Diesen Plan wählen',
    },
    bonus: {
      title: 'Inklusive bei Kit 3 und Kit 6',
      items: ['E-Book: Die Kollagen-Routine', '15-Tage-Ernährungsplan', 'VIP-Kundengruppe'],
    },
    guarantee: {
      title: '30 Tage Geld-zurück-Garantie',
      body: 'Teste es 30 Tage. Wenn du nicht zufrieden bist, schreib uns und wir erstatten deine Bestellung – ohne Fragen.',
    },
    faq: {
      title: 'Fragen',
      items: {
        different: {
          q: 'Ich habe schon Kollagen probiert und nichts gemerkt. Warum sollte es diesmal anders sein?',
          a: 'Viele hören nach wenigen Wochen auf. Die meisten Studien liefen 8 bis 12 Wochen mit täglicher Einnahme – deshalb empfehlen wir das 90-Tage-Kit 3. Und falls es für dich nicht passt, gilt die 30-Tage-Garantie.',
        },
        time: {
          q: 'Wie schnell sehe ich Ergebnisse?',
          a: 'Jeder Mensch ist anders. Studien maßen Hautveränderungen nach 4 bis 12 Wochen täglicher Einnahme. Gib ihm mindestens einen vollen Zyklus.',
        },
        safe: {
          q: 'Ist es sicher für mich?',
          a: 'Kollagen ist ein Nahrungsprotein und wird meist gut vertragen. Wenn du schwanger bist, stillst, Medikamente nimmst oder eine Erkrankung hast, sprich vorher mit deiner Ärztin oder deinem Arzt.',
        },
        men: {
          q: 'Ist es auch für Männer?',
          a: 'Ja. Kollagen unterstützt Haut und Gelenke bei allen. Wir behaupten nicht, dass es Hormone verändert.',
        },
        how: {
          q: 'Wie nehme ich es ein?',
          a: 'Eine Portion pro Tag, in Wasser, Kaffee oder einen Smoothie gerührt. Am besten immer zur gleichen Zeit.',
        },
        cancel: {
          q: 'Wie kündige ich den Monatsplan?',
          a: 'Über den Link in jeder Beleg-E-Mail oder schreib uns. Jederzeit kündbar, ohne Gebühren.',
        },
        shipping: {
          q: 'Wie lange dauert der Versand?',
          a: 'Du bekommst einen Tracking-Link per E-Mail, sobald deine Bestellung verschickt ist.',
        },
      },
    },
    sticky: { cta: 'Meinen Plan holen' },
    exit: {
      title: 'Warte – 10 % Rabatt, bevor du gehst',
      body: 'Nutze diesen Code an der Kasse:',
      code: 'RENOVA10',
      cta: 'Meine 10 % nutzen',
      dismiss: 'Nein danke',
    },
    chat: {
      title: 'Frag Elena',
      subtitle: 'KI-Assistentin · keine Ärztin',
      greeting: 'Hallo! Ich bin Elena, die KI-Assistentin von RENOVA CELL. Frag mich alles zum Produkt oder zu deinem Plan.',
      placeholder: 'Schreib deine Frage…',
      send: 'Senden',
      error: 'Entschuldige, da ist etwas schiefgelaufen. Bitte versuch es noch einmal.',
      open: 'Chat öffnen',
      close: 'Chat schließen',
    },
    social: { ordered: '{count} Personen haben in den letzten 24 Stunden bestellt' },
    footer: {
      privacy: 'Datenschutz',
      terms: 'AGB',
      contact: 'Kontakt',
      rights: 'Alle Rechte vorbehalten.',
    },
  },
  checkout: {
    steps: ['Warenkorb', 'Deine Daten', 'Zahlung'],
    cart: {
      title: 'Deine Bestellung',
      bumpTitle: '+1 zusätzliche Einheit für {price}',
      bumpBody: 'Nur auf dieser Seite: eine weitere Einheit zum reduzierten Preis.',
      coupon: 'Rabattcode',
      couponPlaceholder: 'Code eingeben',
      apply: 'Anwenden',
      hint: 'Psst… probier RENOVA10',
      valid: 'Code angewendet: {pct} % Rabatt',
      invalid: 'Dieser Code ist ungültig.',
      total: 'Gesamt',
      discountNote: 'Rabatt wird bei der Zahlung abgezogen',
    },
    info: {
      title: 'Deine Daten',
      name: 'Vollständiger Name',
      email: 'E-Mail',
      newsletter: 'Schickt mir Anti-Aging-Tipps per E-Mail',
      addressNote: 'Deine Lieferadresse gibst du auf der sicheren Zahlungsseite ein (mit Autovervollständigung).',
    },
    payment: {
      title: 'Zahlung',
      body: 'Du schließt auf der sicheren Stripe-Seite ab. Karte, Apple Pay, Google Pay und weitere Methoden erscheinen dort, wenn sie in deinem Land verfügbar sind.',
      installments: 'Ratenzahlungsoptionen erscheinen bei der Zahlung, wenn verfügbar.',
      pay: 'Sicher bezahlen',
      redirecting: 'Sichere Zahlung wird geöffnet…',
      error: 'Die Zahlung konnte nicht gestartet werden. Bitte versuch es erneut.',
      ssl: 'SSL-verschlüsselt',
      guarantee: '30 Tage Garantie',
      stripe: 'Zahlungen über Stripe',
    },
  },
  upsell1: {
    title: 'Deine Bestellung ist bestätigt. Noch eine Sache…',
    body: 'Füge ein Kit 6 (Einmalkauf) mit 45 % Rabatt hinzu – für die 6-Monats-Routine. Angebot nur auf dieser Seite.',
    accept: 'Ja, Kit 6 für {price} hinzufügen',
    decline: 'Nein danke',
    charge: 'Deine gespeicherte Karte wird einmalig mit {price} belastet. Kein Abo.',
  },
  upsell2: {
    title: 'Nie mehr leer – und 30 % weniger zahlen',
    body: 'Erhalte Kit 3 jeden Monat für {price} statt {full}. Der Rabatt gilt, solange du Abonnent bist.',
    accept: 'Ja, für {price}/Monat abonnieren',
    decline: 'Nein danke',
    charge: 'Deine gespeicherte Karte wird heute und jeden Monat mit {price} belastet, bis du kündigst. Jederzeit kündbar.',
  },
  upsell: {
    processing: 'Wird verarbeitet…',
    error: 'Das hat nicht geklappt. Es wurde nichts abgebucht.',
    action: 'Deine Bank muss diese Zahlung bestätigen. Weiter auf der sicheren Seite.',
  },
  thankYou: {
    title: 'Danke{name}!',
    body: 'Deine Bestellung ist bestätigt. Der Beleg ist unterwegs in dein Postfach.',
    howTo: 'So startest du',
    steps: ['Nimm jeden Morgen eine Portion.', 'In Wasser, Kaffee oder einen Smoothie rühren.', 'Bleib dran, bis der Zyklus vollständig ist.'],
    vip: { title: 'VIP-Gruppe', body: 'Tipps, Rezepte und Unterstützung von anderen Kunden.', cta: 'Gruppe beitreten' },
    referral: {
      title: 'Mit Freunden teilen',
      body: 'Schick deinen Link. Wer ihn nutzt, bekommt 10 % mit dem Code RENOVA10.',
      copy: 'Link kopieren',
      copied: 'Kopiert!',
    },
    order: 'Bestellübersicht',
  },
  emails: {
    footer: 'Du erhältst diese E-Mail, weil du am RENOVA CELL Quiz teilgenommen hast.',
    unsubscribe: 'Abmelden',
    diagnosis: {
      subject: '{name}, dein RENOVA CELL Plan',
      body: 'Hier ist dein Ergebnis: {diagnosis}\n\nDein empfohlener Plan ist {plan}. Hier ansehen: {link}',
    },
    vsl: {
      subject: 'Das 2-Minuten-Video für dein Profil',
      body: 'Wir haben ein kurzes Video dazu gemacht, was deine Antworten bedeuten. Hier ansehen: {link}',
    },
    sms: { body: 'RENOVA CELL: 10 % auf deinen Plan mit Code RENOVA10 → {link} Antworte STOP zum Abbestellen.' },
    socialProof: {
      subject: 'Warum Menschen dranbleiben',
      body: 'Die meisten Kollagen-Studien liefen 8 bis 12 Wochen. Deshalb ist das 90-Tage-Kit 3 unser meistgewählter Plan. Dein Plan: {link}',
    },
    lastChance: {
      subject: 'Dein 10-%-Code ist noch gültig',
      body: 'Dein Code RENOVA10 wartet noch auf dich. Hier einlösen: {link}',
    },
    story: {
      subject: 'Kleine Gewohnheiten, großer Unterschied',
      body: 'Die beste Routine ist die, die du beibehältst. Eine Portion pro Tag, jeden Tag. Wenn du so weit bist: {link}',
    },
  },
};
