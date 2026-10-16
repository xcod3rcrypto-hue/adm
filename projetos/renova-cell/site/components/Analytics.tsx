'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { CONSENT_KEY, readConsent } from '@/lib/analytics';
import { useT } from '@/lib/hooks';

const GA = process.env.NEXT_PUBLIC_GA4_ID;
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
const HOTJAR = process.env.NEXT_PUBLIC_HOTJAR_ID;

const COPY = {
  en: { text: 'We use cookies for analytics and ads measurement.', accept: 'Accept', decline: 'Decline' },
  pt: { text: 'Usamos cookies para análise e medição de anúncios.', accept: 'Aceitar', decline: 'Recusar' },
  es: { text: 'Usamos cookies para analítica y medición de anuncios.', accept: 'Aceptar', decline: 'Rechazar' },
  fr: { text: 'Nous utilisons des cookies pour la mesure d’audience et publicitaire.', accept: 'Accepter', decline: 'Refuser' },
  de: { text: 'Wir verwenden Cookies für Analyse und Anzeigenmessung.', accept: 'Akzeptieren', decline: 'Ablehnen' },
};

/** Tracking scripts load only after explicit consent (GDPR/LGPD friendly, also fine for the US). */
export function Analytics() {
  const { locale } = useT();
  const [consent, setConsent] = useState<'granted' | 'denied' | null | 'loading'>('loading');
  useEffect(() => setConsent(readConsent()), []);

  const anyTool = GA || PIXEL || POSTHOG_KEY || HOTJAR;
  if (!anyTool || consent === 'loading') return null;

  const choose = (value: 'granted' | 'denied') => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // storage blocked — keep the choice for this page view only
    }
    setConsent(value);
  };

  if (consent === null) {
    const c = COPY[locale];
    return (
      <div role="dialog" aria-live="polite" className="fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-xl flex-col gap-3 rounded-2xl bg-ink p-4 text-sm text-cream shadow-2xl sm:flex-row sm:items-center">
        <p className="flex-1">{c.text}</p>
        <div className="flex gap-2">
          <button onClick={() => choose('denied')} className="rounded-full border border-cream/40 px-4 py-2">
            {c.decline}
          </button>
          <button onClick={() => choose('granted')} className="rounded-full bg-gold px-4 py-2 font-semibold text-ink">
            {c.accept}
          </button>
        </div>
      </div>
    );
  }
  if (consent !== 'granted') return null;

  return (
    <>
      {GA && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA}');`}
          </Script>
        </>
      )}
      {PIXEL && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL}');fbq('track','PageView');`}
        </Script>
      )}
      {POSTHOG_KEY && (
        <Script id="posthog" strategy="afterInteractive">
          {`!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init('${POSTHOG_KEY}',{api_host:'${POSTHOG_HOST}',person_profiles:'identified_only'});`}
        </Script>
      )}
      {HOTJAR && (
        <Script id="hotjar" strategy="afterInteractive">
          {`(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${Number(HOTJAR)},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
        </Script>
      )}
    </>
  );
}
