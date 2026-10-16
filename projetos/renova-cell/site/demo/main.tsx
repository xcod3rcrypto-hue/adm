/**
 * Demo entry: renders the real funnel components in one page with an in-memory
 * router and a simulated backend, so the design can be reviewed on any phone.
 */
import { Suspense, useState, type ComponentType } from 'react';
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
import { htmlLang, localeFromLanguageList, type Locale } from '../lib/i18n';
import { getDictionary } from '../lib/i18n/dictionaries';
import { CURRENCIES, type Currency } from '../lib/products';
import { installMockApi, setDemoCurrency } from './mock-api';
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

const BANNER: Partial<Record<Locale, { note: string; currency: string }>> = {
  pt: { note: 'Demonstração: pagamento, e-mails, vídeo e IA simulados', currency: 'Moeda' },
  en: { note: 'Demo: payment, emails, video and AI are simulated', currency: 'Currency' },
  es: { note: 'Demostración: pago, correos, vídeo e IA simulados', currency: 'Moneda' },
  fr: { note: 'Démo : paiement, e-mails, vidéo et IA simulés', currency: 'Devise' },
  de: { note: 'Demo: Zahlung, E-Mails, Video und KI simuliert', currency: 'Währung' },
};

function DemoBanner({ currency, onCurrency }: { currency: Currency; onCurrency: (c: Currency) => void }) {
  const { locale } = useT();
  const copy = BANNER[locale] ?? BANNER.en!;
  return (
    <div role="note" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-coral px-4 py-1.5 text-center text-xs font-semibold text-ink">
      <span>{copy.note}</span>
      <label className="inline-flex items-center gap-1">
        {copy.currency}:
        <select
          value={currency}
          onChange={(e) => onCurrency(e.target.value as Currency)}
          className="rounded border border-ink/30 bg-cream px-1 py-0.5 text-base font-semibold sm:text-xs"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c.toUpperCase()}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function App({ currency, onCurrency }: { currency: Currency; onCurrency: (c: Currency) => void }) {
  const { pathname } = useLocation();
  const Page = PAGES[pathname] ?? QuizFlow;
  return (
    <>
      <DemoBanner currency={currency} onCurrency={onCurrency} />
      <Suspense>
        <Page key={pathname} />
      </Suspense>
    </>
  );
}

let languages: readonly string[] = [];
try {
  languages = navigator.languages?.length ? navigator.languages : [navigator.language];
} catch {
  // ignore
}
const locale: Locale = localeFromLanguageList(languages) ?? 'pt';
document.documentElement.lang = htmlLang(locale);

function Root() {
  const [currency, setCurrency] = useState<Currency>('usd');
  const change = (c: Currency) => {
    setDemoCurrency(c);
    setCurrency(c);
  };
  return (
    <Providers initialLocale={locale} initialDictionary={getDictionary(locale)} currency={currency}>
      <App currency={currency} onCurrency={change} />
    </Providers>
  );
}

createRoot(document.getElementById('root')!).render(<Root />);
