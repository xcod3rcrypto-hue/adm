import type { Dictionary } from './en';

export const pl: Dictionary = {
  common: {
    brand: 'VitalRise',
    back: 'Wstecz',
    next: 'Dalej',
    continue: 'Kontynuuj',
    skip: 'Pomiń',
    loading: 'Ładowanie…',
    language: 'Język',
    resultsVary: 'Efekty różnią się u poszczególnych osób.',
    fdaDisclaimer:
      'Te stwierdzenia nie zostały ocenione przez amerykańską Agencję Żywności i Leków (FDA). Produkt nie jest przeznaczony do diagnozowania, leczenia ani zapobiegania jakimkolwiek chorobom.',
    euDisclaimer:
      'Suplement diety nie może być stosowany jako substytut zróżnicowanej i zbilansowanej diety oraz zdrowego trybu życia. Nie należy przekraczać zalecanej porcji do spożycia w ciągu dnia. Przechowywać w miejscu niedostępnym dla małych dzieci.',
  },
  consent: {
    text: 'Używamy plików cookie do analityki i pomiaru reklam.',
    accept: 'Akceptuję',
    decline: 'Odrzucam',
  },
  quiz: {
    progress: 'Ukończono {pct}%',
    intro: 'Odpowiedz na 8 krótkich pytań (około 60 sekund) i otrzymaj swój plan dla młodziej wyglądającej skóry, większej ochoty i energii na co dzień.',
    questions: {
      gender: {
        title: 'Jak się identyfikujesz?',
        options: { male: 'Mężczyzna', female: 'Kobieta', other: 'Wolę nie mówić' },
      },
      age: {
        title: 'Ile masz lat?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: 'Co teraz najbardziej Ci przeszkadza?',
        options: {
          skin: 'Skóra traci jędrność',
          energy: 'Mało energii',
          libido: 'Mniejsza ochota / witalność',
          joints: 'Sztywne lub bolące stawy',
          all: 'Wszystkiego po trochu',
        },
      },
      duration: {
        title: 'Od jak dawna Ci to przeszkadza?',
        options: { lt6m: 'Krócej niż 6 miesięcy', '6m-2y': '6 miesięcy – 2 lata', '2y+': 'Dłużej niż 2 lata' },
      },
      history: {
        title: 'Czy brałeś(-aś) już kolagen?',
        options: { never: 'Nigdy', tried: 'Tak, ale bez efektów', using: 'Biorę go teraz' },
      },
      energy: { title: 'Jak oceniasz swoją energię na co dzień?', min: 'Wyczerpanie', max: 'Pełnia energii' },
      confidence: { title: 'Jak dobrze czujesz się we własnym ciele?', min: 'Wcale', max: 'Całkowicie' },
      goal: {
        title: 'Co najbardziej chcesz poczuć w ciągu 15 dni?',
        options: {
          skin: 'Jędrniejsza skóra',
          energy: 'Więcej energii',
          libido: 'Więcej witalności',
          joints: 'Swobodniejszy ruch',
          all: 'Wszystko naraz',
        },
      },
    },
    contact: {
      title: 'Gdzie wysłać Twój plan?',
      subtitle: 'Opcjonalnie: wynik możesz zobaczyć od razu, bez wypełniania.',
      name: 'Imię',
      email: 'E-mail',
      phone: 'Telefon (opcjonalnie, do SMS)',
      marketing: 'Chcę dostawać porady i oferty e-mailem. Mogę zrezygnować w każdej chwili.',
      sms: 'Chcę dostawać oferty SMS-em na ten numer. Mogą obowiązywać opłaty operatora. Odpisz STOP, aby zrezygnować.',
      submit: 'Pokaż mój wynik',
      skip: 'Pomiń i pokaż wynik',
      privacy: 'Nigdy nie sprzedajemy Twoich danych.',
    },
  },
  analyzing: {
    title: 'Tworzymy Twój plan',
    steps: ['Czytamy Twoje 8 odpowiedzi…', 'Szacujemy Twój profil kolagenowy…', 'Piszemy Twoją spersonalizowaną rekomendację…'],
  },
  offer: {
    trust: 'Analiza gotowa dla: {name} • Na podstawie Twoich 8 odpowiedzi',
    trustAnon: 'Analiza gotowa • Na podstawie Twoich 8 odpowiedzi',
    hero: {
      fallback: {
        woman: 'Jędrniej wyglądająca skóra i stabilna energia zaczynają się od tego, co codziennie dajesz swojemu ciału',
        man: 'Znów poczuj gotowość na cały dzień: codzienny kolagen dla stawów, skóry i stabilnej energii',
        senior: 'Po 50. roku życia organizm wytwarza mniej kolagenu. Twoja codzienna rutyna może to uzupełnić',
      },
      sub: 'Twój codzienny rytuał młodości: formuła z kolagenem + peptydami dla osób, które chcą młodziej wyglądającej skóry, większej ochoty i więcej energii, dopasowana do Twoich odpowiedzi.',
      cta: 'Zobacz polecany plan',
    },
    vsl: {
      title: 'Obejrzyj: co oznaczają Twoje odpowiedzi',
      unavailable: 'Film jest teraz niedostępny. Wszystko, czego potrzebujesz, znajdziesz poniżej.',
      cta: 'Chcę swój plan',
      resume: 'Wznawiamy od miejsca, w którym skończyłeś(-aś)',
    },
    diagnosis: {
      title: 'Twój szacunek kolagenu',
      body: 'Od około 25. roku życia organizm co roku wytwarza mniej więcej o 1% mniej kolagenu. W Twoim wieku to około {pct}% mniej niż w wieku 25 lat.',
      note: 'Szacunek poglądowy oparty na często podawanej średniej, a nie pomiar medyczny.',
    },
    bullets: {
      title: 'Co to oznacza dla Ciebie',
      items: {
        skin: [
          'Peptydy kolagenowe wiązano z lepszą elastycznością skóry w badaniach z placebo',
          'Prosta codzienna porcja, która pasuje do Twojego poranka',
          'Stworzone dla skóry, która zaczyna tracić jędrność',
        ],
        energy: [
          'Bogata w białko codzienna porcja wspierająca Twoją rutynę',
          'Bez stymulantów, więc bez spadku energii później',
          'Działa w parze ze snem, wodą i ruchem dla stabilniejszych dni',
        ],
        libido: [
          'Dobre samopoczucie we własnej skórze to część odczuwania ochoty',
          'Codzienny rytuał dbania o siebie, który wspiera pewność siebie',
          'Bez hormonów i bez stymulantów',
        ],
        joints: [
          'Hydrolizat kolagenu badano przy dolegliwościach stawów związanych z aktywnością',
          'Wsparcie dla chrząstki i tkanki łącznej, których używasz każdego dnia',
          'Łatwy do przyjmowania codziennie, a to jest najważniejsze',
        ],
        all: [
          'Jedna codzienna porcja dla skóry, stawów i ogólnego samopoczucia',
          'Peptydy kolagenowe plus mieszanka peptydów',
          'Stworzone pod rutynę, którą już masz',
        ],
      },
    },
    pillars: {
      title: 'Jeden codzienny rytuał, trzy cele',
      items: [
        { title: 'Młodziej wyglądająca skóra', body: 'Peptydy kolagenowe wiązano z lepszą elastycznością i nawilżeniem skóry w badaniach z placebo.' },
        { title: 'Ochota i witalność', body: 'Dobre samopoczucie we własnym ciele to część odczuwania ochoty. Codzienny rytuał dbania o siebie dla kobiet i mężczyzn, bez hormonów i bez stymulantów.' },
        { title: 'Energia na cały dzień', body: 'Bogata w białko codzienna porcja, która pasuje do Twojego poranka, bez stymulantów i bez spadków energii.' },
      ],
      note: 'Efekty są różne. VitalRise to suplement diety, a nie lek.',
    },
    science: {
      title: 'Co mówią badania',
      flip: 'Dotknij, aby zobaczyć źródło',
      cards: [
        {
          title: 'Elastyczność skóry',
          finding:
            '69 kobiet przez 8 tygodni przyjmowało 2,5 g lub 5 g określonych peptydów kolagenowych albo placebo. Elastyczność skóry poprawiła się w porównaniu z placebo.',
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Komfort stawów',
          finding:
            'Przez 24 tygodnie sportowcy przyjmujący 10 g hydrolizatu kolagenu dziennie zgłaszali mniejszy ból stawów związany z aktywnością niż przy placebo.',
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'Szerszy obraz',
          finding:
            'Metaanaliza 26 badań z randomizacją (1721 uczestników) wykazała poprawę nawilżenia i elastyczności skóry w porównaniu z placebo.',
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: 'Badania dotyczyły konkretnych formuł kolagenu; wyniki mogą nie dotyczyć każdego produktu, w tym tego.',
    },
    timeline: {
      title: 'Czego się spodziewać',
      steps: [
        { day: 'Dzień 1', title: 'Zacznij swój rytuał', body: 'Jedna porcja dziennie. Liczy się regularność.' },
        { day: 'Dzień 5', title: 'Zrób z tego nawyk', body: 'Ta sama pora, to samo miejsce. Nawyk się utrwala.' },
        { day: 'Dzień 15', title: 'Zatrzymaj się na chwilę', body: 'Zwróć uwagę, jak się czujesz, i trzymaj się nawyku.' },
        { day: 'Dzień 30', title: 'Pierwszy miesiąc', body: 'Nie przerywaj. Badania mierzyły zmiany skóry po 4–12 tygodniach.' },
        { day: 'Dzień 90', title: 'Pełny cykl', body: 'Okres, który analizowała większość badań. Czas porównać.' },
      ],
    },
    beforeAfter: {
      title: 'Prawdziwi klienci',
      before: 'Przed',
      after: 'Po',
      note: 'Zdjęcia bez retuszu, udostępnione za zgodą. Efekty są różne.',
    },
    testimonials: {
      title: 'Osoby takie jak Ty',
      note: 'Prawdziwi klienci, udostępnione za zgodą. Efekty są różne.',
    },
    simulator: {
      title: 'Twoja krzywa kolagenu',
      label: 'Twój wiek',
      yAxis: 'Szacowany kolagen vs. w wieku 25 lat (%)',
      you: 'Ty',
      note: 'Ilustracja często podawanego spadku o ~1% rocznie po 25. roku życia. To nie jest prognoza efektów produktu.',
    },
    comparison: {
      title: 'VitalRise vs. typowy kolagen',
      us: 'VitalRise',
      them: 'Typowy kolagen',
      rows: [
        { label: 'Hydrolizowane peptydy kolagenowe', us: 'yes', them: 'yes' },
        { label: 'Dodatkowa mieszanka peptydów', us: 'yes', them: 'no' },
        { label: 'Plan dopasowany do quizu', us: 'yes', them: 'no' },
        { label: '30-dniowa gwarancja zwrotu pieniędzy', us: 'yes', them: 'varies' },
      ],
      varies: 'Różnie',
    },
    pricing: {
      perMonth: '/mies.',
      once: 'Zakup jednorazowy',
      subscribe: 'Subskrypcja: dostawa, gdy się skończy',
      interval: { m1: 'co miesiąc', m3: 'co 3 miesiące', m6: 'co 6 miesięcy' },
      title: 'Wybierz swój plan',
      recommended: 'Polecany dla Ciebie',
      perUnit: '{price} za sztukę',
      save: 'Oszczędzasz {pct}%',
      plans: {
        single: { name: '1 sztuka', desc: 'Wypróbuj przez miesiąc' },
        kit3: { name: 'Kit 3', desc: '90-dniowy cykl z większości badań' },
        kit6: { name: 'Kit 6', desc: 'Zapas na 6 miesięcy' },
      },
      recurring: 'Opłata {price} {interval}, dopóki nie zrezygnujesz. Zrezygnujesz w każdej chwili przez link w e-mailu z potwierdzeniem.',
      cta: 'Wybieram ten plan',
    },
    shipping: { free: 'Darmowa wysyłka', fast: 'Dostawa w maks. 2 dni robocze', discreet: 'Dyskretne opakowanie', tracked: 'Dostawa ze śledzeniem' },
    bonus: {
      title: 'W zestawie z Kit 3 i Kit 6',
      items: ['E-book: Rutyna z kolagenem', '15-dniowy plan posiłków', 'Grupa VIP dla klientów'],
    },
    guarantee: {
      title: '30-dniowa gwarancja zwrotu pieniędzy',
      body: 'Wypróbuj przez 30 dni. Jeśli nie będziesz zadowolony(-a), napisz do nas, a zwrócimy pieniądze za zamówienie, bez pytań.',
    },
    faq: {
      title: 'Pytania',
      items: {
        different: {
          q: 'Brałem(-am) już kolagen i nic nie zauważyłem(-am). Dlaczego teraz miałoby być inaczej?',
          a: 'Wiele osób przestaje po kilku tygodniach. Większość badań trwała 8–12 tygodni przy codziennej dawce, dlatego polecamy 90-dniowy Kit 3. A jeśli u Ciebie się nie sprawdzi, obowiązuje 30-dniowa gwarancja.',
        },
        time: {
          q: 'Jak szybko zobaczę efekty?',
          a: 'Każdy jest inny. Badania mierzyły zmiany skóry po 4–12 tygodniach codziennego stosowania. Daj sobie co najmniej jeden pełny cykl.',
        },
        safe: {
          q: 'Czy to jest dla mnie bezpieczne?',
          a: 'Kolagen to białko spożywcze, zwykle dobrze tolerowane. Jeśli jesteś w ciąży, karmisz piersią, przyjmujesz leki lub masz schorzenie, najpierw porozmawiaj z lekarzem.',
        },
        men: {
          q: 'Czy to także dla mężczyzn?',
          a: 'Tak. Kolagen wspiera skórę i stawy u każdego. Nie twierdzimy, że wpływa na hormony.',
        },
        how: {
          q: 'Jak go przyjmować?',
          a: 'Jedna porcja dziennie, wymieszana z wodą, kawą lub smoothie. Najlepiej codziennie o tej samej porze.',
        },
        cancel: {
          q: 'Jak zrezygnować z subskrypcji?',
          a: 'Użyj linku z dowolnego e-maila z potwierdzeniem albo napisz do nas. Możesz zrezygnować w każdej chwili, bez opłat.',
        },
        shipping: {
          q: 'Jak wygląda wysyłka?',
          a: 'Wysyłka jest darmowa do wszystkich krajów, do których dostarczamy. Dostawa trwa maksymalnie 2 dni robocze, ze śledzeniem, w zwykłym, dyskretnym opakowaniu bez nazwy produktu na zewnątrz. Link do śledzenia przychodzi e-mailem, gdy tylko zamówienie zostanie wysłane.',
          aStandard: 'Wysyłka jest darmowa do wszystkich krajów, do których dostarczamy. Zamówienia wysyłamy ze śledzeniem, w zwykłym, dyskretnym opakowaniu bez nazwy produktu na zewnątrz. Szacowany czas dostawy do Twojego kraju widać przy płatności, a link do śledzenia przychodzi e-mailem, gdy tylko zamówienie zostanie wysłane.',
        },
      },
    },
    sticky: { cta: 'Chcę swój plan' },
    exit: {
      title: 'Zaczekaj: 10% zniżki, zanim wyjdziesz',
      body: 'Użyj tego kodu przy płatności:',
      code: 'VITAL10',
      cta: 'Użyj mojej zniżki 10%',
      dismiss: 'Nie, dziękuję',
    },
    chat: {
      title: 'Zapytaj Elenę',
      subtitle: 'Asystentka AI · nie lekarz',
      greeting: 'Cześć! Jestem Elena, asystentka AI VitalRise. Zapytaj mnie o produkt albo o swój plan.',
      placeholder: 'Wpisz pytanie…',
      send: 'Wyślij',
      error: 'Przepraszamy, coś poszło nie tak. Spróbuj ponownie.',
      open: 'Otwórz czat',
      close: 'Zamknij czat',
    },
    social: { ordered: 'Liczba zamówień z ostatnich 24 godzin: {count}' },
    footer: {
      privacy: 'Prywatność',
      terms: 'Regulamin',
      contact: 'Kontakt',
      rights: 'Wszelkie prawa zastrzeżone.',
    },
  },
  checkout: {
    steps: ['Koszyk', 'Twoje dane', 'Płatność'],
    cart: {
      title: 'Twoje zamówienie',
      bumpTitle: '+1 dodatkowa sztuka za {price}',
      bumpBody: 'Tylko na tej stronie: dodaj jeszcze jedną sztukę w niższej cenie.',
      coupon: 'Kod rabatowy',
      couponPlaceholder: 'Wpisz kod',
      apply: 'Zastosuj',
      hint: 'Psst… wypróbuj VITAL10',
      valid: 'Kod zastosowany: {pct}% zniżki',
      invalid: 'Ten kod jest nieważny.',
      total: 'Razem',
      discountNote: 'Rabat zostanie naliczony przy płatności',
      shipping: 'Wysyłka',
      free: 'Gratis',
    },
    info: {
      title: 'Twoje dane',
      name: 'Imię i nazwisko',
      email: 'E-mail',
      newsletter: 'Chcę dostawać e-mailem porady anti-aging',
      addressNote: 'Adres dostawy wpiszesz na bezpiecznej stronie płatności (z autouzupełnianiem).',
    },
    payment: {
      title: 'Płatność',
      body: 'Dokończysz zakup na bezpiecznej stronie Stripe. Karta, Apple Pay, Google Pay i inne metody pojawią się tam, jeśli są dostępne w Twoim kraju.',
      installments: 'Opcje płatności w ratach pojawią się przy płatności, jeśli są dostępne.',
      pay: 'Zapłać bezpiecznie',
      redirecting: 'Otwieramy bezpieczną płatność…',
      error: 'Nie udało się rozpocząć płatności. Spróbuj ponownie.',
      ssl: 'Szyfrowanie SSL',
      guarantee: '30 dni gwarancji',
      stripe: 'Płatności przez Stripe',
    },
  },
  upsell1: {
    title: 'Zamówienie potwierdzone. Jeszcze jedno…',
    body: 'Dodaj Kit 6 (jednorazowo) z rabatem 45% na 6-miesięczną rutynę. Oferta dostępna tylko na tej stronie.',
    accept: 'Tak, dodaj Kit 6 za {price}',
    decline: 'Nie, dziękuję',
    charge: 'Twoja zapisana karta zostanie obciążona jednorazowo kwotą {price}. To nie jest subskrypcja.',
  },
  upsell2: {
    title: 'Nigdy bez zapasu, a do tego 30% taniej',
    body: 'Otrzymuj Kit 3 co 3 miesiące za {price} zamiast {full}. Rabat obowiązuje, dopóki masz subskrypcję.',
    accept: 'Tak, subskrybuję za {price} co 3 miesiące',
    decline: 'Nie, dziękuję',
    charge: 'Twoja zapisana karta zostanie obciążona kwotą {price} dziś i co 3 miesiące, dopóki nie zrezygnujesz. Możesz zrezygnować w każdej chwili.',
  },
  upsell: {
    processing: 'Przetwarzanie…',
    error: 'Nie udało się tego zrealizować. Nie pobraliśmy żadnej opłaty.',
    action: 'Twój bank musi potwierdzić tę płatność. Kontynuuj na bezpiecznej stronie.',
  },
  thankYou: {
    title: 'Dziękujemy{name}!',
    body: 'Twoje zamówienie jest potwierdzone. Potwierdzenie trafi na Twój e-mail.',
    howTo: 'Jak zacząć',
    steps: ['Przyjmuj jedną porcję każdego ranka.', 'Wymieszaj z wodą, kawą lub smoothie.', 'Kontynuuj do końca cyklu.'],
    vip: { title: 'Grupa VIP', body: 'Porady, przepisy i wsparcie innych klientów.', cta: 'Dołącz do grupy' },
    referral: {
      title: 'Poleć znajomym',
      body: 'Wyślij swój link. Osoba, która go użyje, dostanie 10% zniżki z kodem VITAL10.',
      copy: 'Kopiuj link',
      copied: 'Skopiowano!',
    },
    order: 'Podsumowanie zamówienia',
  },
  neutral: {
    intro: 'Odpowiedz na 8 krótkich pytań (około 60 sekund) i otrzymaj swój plan dla młodziej wyglądającej skóry i energii na co dzień.',
    painLibido: 'Mniejsza witalność',
    heroSub: 'Twój codzienny rytuał: formuła z kolagenem + peptydami dla osób, które chcą młodziej wyglądającej skóry i więcej energii, dopasowana do Twoich odpowiedzi.',
    bullet: 'Dobre samopoczucie we własnym ciele zaczyna się od codziennej troski o siebie',
    pillar: { title: 'Witalność i pewność siebie', body: 'Dobre samopoczucie we własnym ciele to część pewności siebie. Codzienny rytuał dbania o siebie dla kobiet i mężczyzn, bez hormonów i bez stymulantów.' },
  },
  emails: {
    footer: 'Otrzymujesz tę wiadomość, ponieważ wypełniłeś(-aś) quiz VitalRise.',
    unsubscribe: 'Wypisz się',
    diagnosis: {
      subject: '{name}, Twój plan VitalRise',
      body: 'Oto Twój wynik: {diagnosis}\n\nPolecany dla Ciebie plan to {plan}. Zobacz go tutaj: {link}',
    },
    vsl: {
      subject: '2-minutowy film przygotowany dla Twojego profilu',
      body: 'Przygotowaliśmy krótki film o tym, co oznaczają Twoje odpowiedzi. Obejrzyj go tutaj: {link}',
    },
    sms: { body: 'VitalRise: 10% zniżki na Twój plan z kodem VITAL10 → {link} Odpisz STOP, aby zrezygnować.' },
    socialProof: {
      subject: 'Dlaczego ludzie przy tym zostają',
      body: 'Większość badań nad kolagenem trwała 8–12 tygodni. Dlatego 90-dniowy Kit 3 to nasz najczęściej wybierany plan. Twój plan: {link}',
    },
    lastChance: {
      subject: 'Twój kod na 10% zniżki wciąż czeka',
      body: 'Twój kod VITAL10 wciąż na Ciebie czeka. Użyj go tutaj: {link}',
    },
    story: {
      subject: 'Małe nawyki, duża różnica',
      body: 'Najlepsza rutyna to ta, której się trzymasz. Jedna porcja dziennie, każdego dnia. Kiedy będziesz gotowy(-a): {link}',
    },
  },
};
