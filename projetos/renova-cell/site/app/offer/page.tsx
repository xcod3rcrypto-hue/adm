import { Suspense } from 'react';
import { OfferPage } from '@/components/offer/OfferPage';

export default function Offer() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-ink" />}>
      <OfferPage />
    </Suspense>
  );
}
