import type { Dictionary } from './en';

export const fr: Dictionary = {
  common: {
    brand: 'VitalRise',
    back: 'Retour',
    next: 'Suivant',
    continue: 'Continuer',
    skip: 'Passer',
    loading: 'Chargement…',
    language: 'Langue',
    resultsVary: 'Les résultats varient selon les personnes.',
    fdaDisclaimer:
      "Ces allégations n'ont pas été évaluées par la FDA. Ce produit n'est pas destiné à diagnostiquer, traiter, guérir ou prévenir une maladie.",
    euDisclaimer:
      "Les compléments alimentaires ne doivent pas être utilisés comme substituts d'un régime alimentaire varié et équilibré et d'un mode de vie sain. Ne pas dépasser la dose journalière recommandée. Tenir hors de la portée des jeunes enfants.",
  },
  consent: {
    text: 'Nous utilisons des cookies pour la mesure d’audience et publicitaire.',
    accept: 'Accepter',
    decline: 'Refuser',
  },
  quiz: {
    progress: '{pct} % terminé',
    intro: "Répondez à 8 questions rapides (environ 60 secondes) et recevez votre plan pour une peau d’aspect plus jeune, plus de désir et d’énergie au quotidien.",
    questions: {
      gender: {
        title: 'Comment vous identifiez-vous ?',
        options: { male: 'Homme', female: 'Femme', other: 'Je préfère ne pas répondre' },
      },
      age: {
        title: 'Quel âge avez-vous ?',
        options: { '25-34': '25–34', '35-44': '35–44', '45-54': '45–54', '55+': '55+' },
      },
      pain: {
        title: "Qu'est-ce qui vous gêne le plus en ce moment ?",
        options: {
          skin: 'Une peau qui perd de sa fermeté',
          energy: "Peu d'énergie",
          libido: 'Peu de désir / vitalité',
          joints: 'Articulations raides ou douloureuses',
          all: 'Un peu de tout',
        },
      },
      duration: {
        title: 'Depuis combien de temps ?',
        options: { lt6m: 'Moins de 6 mois', '6m-2y': '6 mois à 2 ans', '2y+': 'Plus de 2 ans' },
      },
      history: {
        title: 'Avez-vous déjà pris du collagène ?',
        options: { never: 'Jamais', tried: 'Oui, sans résultat', using: "J'en prends en ce moment" },
      },
      energy: { title: 'Comment est votre énergie au quotidien ?', min: 'Épuisé(e)', max: "Plein(e) d'énergie" },
      confidence: { title: 'À quel point vous sentez-vous bien dans votre corps ?', min: 'Pas du tout', max: 'Totalement' },
      goal: {
        title: "Qu'aimeriez-vous ressentir dans les 15 prochains jours ?",
        options: {
          skin: "Une peau à l'aspect plus ferme",
          energy: "Plus d'énergie",
          libido: 'Plus de vitalité',
          joints: 'Bouger plus facilement',
          all: 'Tout cela',
        },
      },
    },
    contact: {
      title: 'Où envoyer votre plan ?',
      subtitle: 'Facultatif : vous pouvez voir votre résultat tout de suite sans remplir.',
      name: 'Prénom',
      email: 'E-mail',
      phone: 'Mobile (facultatif, pour les SMS)',
      marketing: "Envoyez-moi des conseils et des offres par e-mail. Je peux me désinscrire à tout moment.",
      sms: 'Envoyez-moi des offres par SMS à ce numéro. Répondez STOP pour arrêter.',
      submit: 'Voir mon résultat',
      skip: 'Passer et voir mon résultat',
      privacy: 'Nous ne vendons jamais vos données.',
    },
  },
  analyzing: {
    title: 'Préparation de votre plan',
    steps: ['Lecture de vos 8 réponses…', 'Estimation de votre profil collagène…', 'Rédaction de votre recommandation personnalisée…'],
  },
  offer: {
    trust: 'Analyse terminée pour {name} • Basée sur vos 8 réponses',
    trustAnon: 'Analyse terminée • Basée sur vos 8 réponses',
    hero: {
      fallback: {
        woman: "Une peau à l'aspect plus ferme et une énergie stable commencent par ce que vous donnez à votre corps chaque jour",
        man: 'Sentez-vous de nouveau prêt pour la journée : du collagène au quotidien pour les articulations, la peau et l’énergie',
        senior: 'Après 50 ans, le corps fabrique moins de collagène. Votre routine quotidienne peut compenser',
      },
      sub: "Votre rituel jeunesse quotidien : une formule collagène + peptides pour celles et ceux qui veulent une peau d’aspect plus jeune, plus de désir et plus d’énergie, adaptée à vos réponses.",
      cta: 'Voir mon plan recommandé',
    },
    vsl: {
      title: 'Regardez : ce que disent vos réponses',
      unavailable: "La vidéo n'est pas disponible pour le moment. Tout ce qu'il vous faut est ci-dessous.",
      cta: 'Je veux mon plan',
      resume: 'Reprise là où vous vous étiez arrêté(e)',
    },
    diagnosis: {
      title: 'Votre estimation de collagène',
      body: "À partir de 25 ans environ, le corps fabrique à peu près 1 % de collagène en moins chaque année. À votre âge, cela représente environ {pct} % de moins qu'à 25 ans.",
      note: 'Estimation illustrative fondée sur une moyenne souvent citée, pas une mesure médicale.',
    },
    bullets: {
      title: 'Ce que cela signifie pour vous',
      items: {
        skin: [
          "Les peptides de collagène ont été associés à une meilleure élasticité de la peau dans des études contre placebo",
          'Une dose quotidienne simple qui trouve sa place le matin',
          'Pensé pour une peau qui commence à perdre de sa fermeté',
        ],
        energy: [
          'Une dose quotidienne riche en protéines pour soutenir votre routine',
          'Sans stimulants : pas de coup de barre ensuite',
          "S'associe au sommeil, à l'eau et au mouvement pour des journées plus stables",
        ],
        libido: [
          'Se sentir bien dans sa peau fait partie du désir',
          'Un rituel quotidien de soin de soi qui renforce la confiance',
          "Sans hormones et sans stimulants",
        ],
        joints: [
          "Le collagène hydrolysé a été étudié pour l'inconfort articulaire lié à l'activité",
          'Un soutien pour le cartilage et les tissus conjonctifs que vous sollicitez chaque jour',
          "Facile à prendre tous les jours, et c'est ce qui compte",
        ],
        all: [
          'Une dose quotidienne pour la peau, les articulations et le bien-être',
          'Peptides de collagène + complexe de peptides',
          'Pensé pour la routine que vous avez déjà',
        ],
      },
    },
    pillars: {
      title: "Un rituel quotidien, trois objectifs",
      items: [
        { title: "Une peau d’aspect plus jeune", body: "Les peptides de collagène ont été associés à une meilleure élasticité et hydratation de la peau dans des études contre placebo." },
        { title: "Désir et vitalité", body: "Se sentir bien dans son corps fait partie du désir. Un rituel quotidien de soin de soi pour les hommes et les femmes, sans hormones ni stimulants." },
        { title: "De l’énergie pour la journée", body: "Une dose quotidienne riche en protéines qui trouve sa place le matin, sans stimulants ni coup de barre." },
      ],
      note: "Les résultats varient. VitalRise est un complément alimentaire, pas un médicament.",
    },
    science: {
      title: 'Ce que dit la recherche',
      flip: 'Touchez pour voir la source',
      cards: [
        {
          title: 'Élasticité de la peau',
          finding:
            "69 femmes ont pris 2,5 g ou 5 g de peptides de collagène spécifiques ou un placebo pendant 8 semaines. L'élasticité de la peau s'est améliorée par rapport au placebo.",
          source: 'Proksch et al., Skin Pharmacol Physiol, 2014',
          link: 'https://doi.org/10.1159/000351376',
          ref: 'DOI 10.1159/000351376',
        },
        {
          title: 'Confort articulaire',
          finding:
            "Sur 24 semaines, des athlètes prenant 10 g/jour de collagène hydrolysé ont signalé moins de douleurs articulaires liées à l'activité que sous placebo.",
          source: 'Clark et al., Curr Med Res Opin, 2008',
          link: 'https://doi.org/10.1185/030079908X291967',
          ref: 'DOI 10.1185/030079908X291967',
        },
        {
          title: 'Vue d’ensemble',
          finding:
            "Une méta-analyse de 26 essais randomisés (1 721 participants) a montré une amélioration de l'hydratation et de l'élasticité de la peau par rapport au placebo.",
          source: 'Pu et al., Nutrients, 2023',
          link: 'https://pubmed.ncbi.nlm.nih.gov/37432180/',
          ref: 'PMID 37432180',
        },
      ],
      note: "Les études ont testé des formules de collagène spécifiques ; les résultats peuvent ne pas s'appliquer à tous les produits, y compris celui-ci.",
    },
    timeline: {
      title: 'À quoi vous attendre',
      steps: [
        { day: 'Jour 1', title: 'Commencez votre rituel', body: 'Une dose par jour. La régularité est ce qui compte.' },
        { day: 'Jour 5', title: 'Rendez-le automatique', body: "Même heure, même endroit. L'habitude s'installe." },
        { day: 'Jour 15', title: 'Faites le point', body: "Observez comment vous vous sentez et gardez l’habitude." },
        { day: 'Jour 30', title: 'Un mois', body: 'Continuez. Les études ont mesuré des changements de la peau entre 4 et 12 semaines.' },
        { day: 'Jour 90', title: 'Cycle complet', body: "La durée étudiée par la plupart des recherches. L'heure de comparer." },
      ],
    },
    beforeAfter: {
      title: 'De vrais clients',
      before: 'Avant',
      after: 'Après',
      note: 'Photos non retouchées, partagées avec autorisation. Les résultats varient.',
    },
    testimonials: {
      title: 'Des personnes comme vous',
      note: 'De vrais clients, partagé avec autorisation. Les résultats varient.',
    },
    simulator: {
      title: 'Votre courbe de collagène',
      label: 'Votre âge',
      yAxis: 'Collagène estimé vs. à 25 ans (%)',
      you: 'Vous',
      note: "Illustration de la baisse souvent citée d'environ 1 % par an après 25 ans. Ce n'est pas une prédiction des résultats du produit.",
    },
    comparison: {
      title: 'VitalRise vs. un collagène classique',
      us: 'VitalRise',
      them: 'Collagène classique',
      rows: [
        { label: 'Peptides de collagène hydrolysé', us: 'yes', them: 'yes' },
        { label: 'Complexe de peptides ajouté', us: 'yes', them: 'no' },
        { label: 'Plan adapté à votre quiz', us: 'yes', them: 'no' },
        { label: 'Satisfait ou remboursé 30 jours', us: 'yes', them: 'varies' },
      ],
      varies: 'Variable',
    },
    pricing: {
      perMonth: '/mois',
      once: "Achat unique",
      subscribe: "Abonnement : recevez-le à nouveau quand il est fini",
      interval: { m1: "chaque mois", m3: "tous les 3 mois", m6: "tous les 6 mois" },
      title: 'Choisissez votre plan',
      recommended: 'Recommandé pour vous',
      perUnit: '{price} par unité',
      save: 'Économisez {pct} %',
      plans: {
        single: { name: '1 unité', desc: 'Essayez pendant un mois' },
        kit3: { name: 'Kit 3', desc: 'Le cycle de 90 jours utilisé par la plupart des études' },
        kit6: { name: "Kit 6", desc: "Réserve pour 6 mois" },
      },
      recurring: "Facturé {price} {interval} jusqu’à résiliation. Résiliez à tout moment depuis votre reçu par e-mail.",
      cta: 'Choisir ce plan',
    },
    shipping: { free: 'Livraison gratuite', fast: 'Livraison en 2 jours ouvrés maximum', discreet: 'Emballage discret', tracked: 'Livraison suivie' },
    bonus: {
      title: 'Inclus avec le Kit 3 et le Kit 6',
      items: ['E-book : La routine collagène', 'Plan de repas sur 15 jours', 'Groupe clients VIP'],
    },
    guarantee: {
      title: 'Satisfait ou remboursé 30 jours',
      body: "Essayez pendant 30 jours. Si vous n'êtes pas satisfait(e), écrivez-nous et nous vous remboursons, sans questions.",
    },
    faq: {
      title: 'Questions',
      items: {
        different: {
          q: "J'ai déjà essayé le collagène sans rien voir. Pourquoi ce serait différent ?",
          a: "Beaucoup arrêtent au bout de quelques semaines. La plupart des études ont duré 8 à 12 semaines avec une dose quotidienne ; c'est pourquoi nous recommandons le Kit 3 de 90 jours. Et si cela ne vous convient pas, la garantie de 30 jours s'applique.",
        },
        time: {
          q: 'En combien de temps verrai-je des résultats ?',
          a: 'Chacun est différent. Les recherches ont mesuré des changements de la peau après 4 à 12 semaines de prise quotidienne. Faites au moins un cycle complet.',
        },
        safe: {
          q: 'Est-ce sans danger pour moi ?',
          a: "Le collagène est une protéine alimentaire généralement bien tolérée. Si vous êtes enceinte, allaitez, prenez un traitement ou avez un problème de santé, parlez-en d'abord à votre médecin.",
        },
        men: {
          q: 'Est-ce aussi pour les hommes ?',
          a: "Oui. Le collagène soutient la peau et les articulations de tous. Nous n'affirmons pas qu'il modifie les hormones.",
        },
        how: {
          q: 'Comment le prendre ?',
          a: "Une dose par jour, dans de l'eau, du café ou un smoothie. Idéalement toujours à la même heure.",
        },
        cancel: {
          q: "Comment résilier un abonnement ?",
          a: "Utilisez le lien de n'importe quel reçu par e-mail ou écrivez-nous. Résiliez à tout moment, sans frais.",
        },
        shipping: {
          q: 'Comment fonctionne la livraison ?',
          a: 'La livraison est gratuite dans tous les pays que nous desservons. Elle prend 2 jours ouvrés maximum, avec suivi, dans un emballage neutre et discret, sans nom de produit à l’extérieur. Le lien de suivi est envoyé par e-mail dès l’expédition.',
          aStandard: 'La livraison est gratuite dans tous les pays que nous desservons. Les commandes partent avec suivi, dans un emballage neutre et discret, sans nom de produit à l’extérieur. Le délai estimé pour votre pays s’affiche au paiement, et le lien de suivi est envoyé par e-mail dès l’expédition.',
        },
      },
    },
    sticky: { cta: 'Je veux mon plan' },
    exit: {
      title: 'Attendez : -10 % avant de partir',
      body: 'Utilisez ce code au paiement :',
      code: 'VITAL10',
      cta: 'Utiliser mes -10 %',
      dismiss: 'Non merci',
    },
    chat: {
      title: 'Demandez à Elena',
      subtitle: "Assistante IA · pas médecin",
      greeting: "Bonjour ! Je suis Elena, l'assistante IA de VitalRise. Posez-moi vos questions sur le produit ou votre plan.",
      placeholder: 'Écrivez votre question…',
      send: 'Envoyer',
      error: "Désolée, une erreur s'est produite. Réessayez.",
      open: 'Ouvrir le chat',
      close: 'Fermer le chat',
    },
    social: { ordered: '{count} personnes ont commandé ces dernières 24 heures' },
    footer: {
      privacy: 'Confidentialité',
      terms: 'Conditions',
      contact: 'Contact',
      rights: 'Tous droits réservés.',
    },
  },
  checkout: {
    steps: ['Panier', 'Vos coordonnées', 'Paiement'],
    cart: {
      title: 'Votre commande',
      bumpTitle: '+1 unité supplémentaire pour {price}',
      bumpBody: 'Uniquement sur cette page : ajoutez une unité à prix réduit.',
      coupon: 'Code promo',
      couponPlaceholder: 'Saisissez le code',
      apply: 'Appliquer',
      hint: 'Psst… essayez VITAL10',
      valid: 'Code appliqué : -{pct} %',
      invalid: "Ce code n'est pas valide.",
      total: 'Total',
      discountNote: 'Réduction appliquée au paiement',
      shipping: 'Livraison',
      free: 'Gratuite',
    },
    info: {
      title: 'Vos coordonnées',
      name: 'Nom complet',
      email: 'E-mail',
      newsletter: 'Envoyez-moi des conseils anti-âge par e-mail',
      addressNote: 'Vous saisirez votre adresse de livraison sur la page de paiement sécurisée (avec saisie automatique).',
    },
    payment: {
      title: 'Paiement',
      body: 'Vous finaliserez sur la page sécurisée de Stripe. Carte, Apple Pay, Google Pay et d’autres moyens y apparaissent lorsqu’ils sont disponibles dans votre pays.',
      installments: 'Les options de paiement en plusieurs fois apparaissent au paiement lorsqu’elles sont disponibles.',
      pay: 'Payer en toute sécurité',
      redirecting: 'Ouverture du paiement sécurisé…',
      error: "Impossible de lancer le paiement. Réessayez.",
      ssl: 'Chiffrement SSL',
      guarantee: 'Garantie 30 jours',
      stripe: 'Paiements par Stripe',
    },
  },
  upsell1: {
    title: 'Votre commande est confirmée. Encore une chose…',
    body: 'Ajoutez un Kit 6 (achat unique) à -45 %, pour la routine de 6 mois. Offre uniquement sur cette page.',
    accept: 'Oui, ajouter le Kit 6 pour {price}',
    decline: 'Non merci',
    charge: 'Votre carte enregistrée sera débitée de {price} une seule fois. Pas d’abonnement.',
  },
  upsell2: {
    title: 'Ne soyez jamais à court, et payez 30 % de moins',
    body: "Recevez le Kit 3 tous les 3 mois pour {price} au lieu de {full}. La remise dure tant que vous restez abonné(e).",
    accept: "Oui, m’abonner pour {price} tous les 3 mois",
    decline: 'Non merci',
    charge: "Votre carte enregistrée sera débitée de {price} aujourd’hui puis tous les 3 mois jusqu’à résiliation. Résiliez à tout moment.",
  },
  upsell: {
    processing: 'Traitement…',
    error: "Impossible de finaliser. Vous n'avez pas été débité(e).",
    action: 'Votre banque doit confirmer ce paiement. Continuez sur la page sécurisée.',
  },
  thankYou: {
    title: 'Merci{name} !',
    body: 'Votre commande est confirmée. Le reçu arrive dans votre boîte e-mail.',
    howTo: 'Pour commencer',
    steps: ['Prenez une dose chaque matin.', "Mélangez-la à de l'eau, du café ou un smoothie.", "Continuez jusqu'au bout du cycle."],
    vip: { title: 'Groupe VIP', body: "Conseils, recettes et soutien d'autres clients.", cta: 'Rejoindre le groupe' },
    referral: {
      title: 'Partagez avec un proche',
      body: 'Envoyez votre lien. Votre proche obtient -10 % avec le code VITAL10.',
      copy: 'Copier le lien',
      copied: 'Copié !',
    },
    order: 'Récapitulatif de commande',
  },
  neutral: {
    intro: 'Répondez à 8 questions rapides (environ 60 secondes) et recevez votre plan pour une peau d’aspect plus jeune et de l’énergie au quotidien.',
    painLibido: 'Peu de vitalité',
    heroSub: 'Votre rituel quotidien : une formule collagène + peptides pour celles et ceux qui veulent une peau d’aspect plus jeune et plus d’énergie, adaptée à vos réponses.',
    bullet: 'Se sentir bien dans son corps commence par le soin de soi au quotidien',
    pillar: { title: 'Vitalité et confiance', body: 'Se sentir bien dans son corps fait partie de la confiance en soi. Un rituel quotidien de soin de soi pour les hommes et les femmes, sans hormones ni stimulants.' },
  },
  emails: {
    footer: 'Vous recevez ce message car vous avez répondu au quiz VitalRise.',
    unsubscribe: 'Se désinscrire',
    diagnosis: {
      subject: '{name}, votre plan VitalRise',
      body: 'Voici votre résultat : {diagnosis}\n\nVotre plan recommandé est {plan}. Voir ici : {link}',
    },
    vsl: {
      subject: 'La vidéo de 2 minutes faite pour votre profil',
      body: 'Nous avons préparé une courte vidéo sur ce que disent vos réponses. Regardez-la ici : {link}',
    },
    sms: { body: 'VitalRise : -10 % sur votre plan avec le code VITAL10 → {link} Répondez STOP pour arrêter.' },
    socialProof: {
      subject: 'Pourquoi on continue',
      body: 'La plupart des études sur le collagène ont duré 8 à 12 semaines. C’est pourquoi le Kit 3 de 90 jours est le plus choisi. Votre plan : {link}',
    },
    lastChance: {
      subject: 'Votre code -10 % est toujours valable',
      body: 'Votre code VITAL10 vous attend toujours. Utilisez-le ici : {link}',
    },
    story: {
      subject: 'Petites habitudes, grande différence',
      body: 'La meilleure routine est celle que l’on garde. Une dose par jour, chaque jour. Quand vous serez prêt(e) : {link}',
    },
  },
};
