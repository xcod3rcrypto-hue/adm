/**
 * Demo entry: renders the real funnel components in one page with an in-memory
 * router and a simulated backend, so the design can be reviewed on any phone.
 */
import { Suspense, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import AnalyzingPage from '../app/analyzing/page';
import PrivacyPage from '../app/privacy/page';
import TermsPage from '../app/terms/page';
import { CheckoutFlow } from '../components/checkout/CheckoutFlow';
import { ThankYou } from '../components/checkout/ThankYou';
import { UpsellOffer } from '../components/checkout/UpsellOffer';
import { OfferPage } from '../components/offer/OfferPage';
import { Providers } from '../components/Providers';
import { QuizFlow } from '../components/quiz/QuizFlow';
import { useT } from '../lib/hooks';
import { localeFromLanguageTag } from '../lib/i18n';
import { installMockApi } from './mock-api';
import { useLocation } from './shims/navigation';

installMockApi();

const PAGES: Record<string, ComponentType> = {
  '/quiz': QuizFlow,
  '/analyzing': AnalyzingPage,
  '/offer': OfferPage,
  '/checkout': CheckoutFlow,
  '/upsell-1': () => <UpsellOffer kind="kit6" />,
  '/upsell-2': () => <UpsellOffer kind="subscription" />,
  '/thank-you': ThankYou,
  '/privacy': PrivacyPage,
  '/terms': TermsPage,
};

const BANNER: Record<string, string> = {
  pt: 'Demonstração: pagamento, e-mails, vídeo e IA são simulados',
  en: 'Demo: payment, emails, video and AI are simulated',
  es: 'Demostración: pago, correos, vídeo e IA simulados',
  fr: 'Démo : paiement, e-mails, vidéo et IA simulés',
  de: 'Demo: Zahlung, E-Mails, Video und KI sind simuliert',
};

function DemoBanner() {
  const { locale } = useT();
  return (
    <div role="note" className="bg-coral px-4 py-1.5 text-center text-xs font-semibold text-ink">
      {BANNER[locale]}
    </div>
  );
}

function App() {
  const { pathname } = useLocation();
  const Page = PAGES[pathname] ?? QuizFlow;
  return (
    <>
      <DemoBanner />
      <Suspense>
        <Page key={pathname} />
      </Suspense>
    </>
  );
}

let initial: ReturnType<typeof localeFromLanguageTag> = null;
try {
  initial = localeFromLanguageTag(navigator.language);
} catch {
  // ignore
}
const locale = initial ?? 'pt';
document.documentElement.lang = locale;

createRoot(document.getElementById('root')!).render(
  <Providers initialLocale={locale}>
    <App />
  </Providers>,
);
