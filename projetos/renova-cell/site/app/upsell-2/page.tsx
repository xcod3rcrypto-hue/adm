import { Suspense } from 'react';
import { UpsellOffer } from '@/components/checkout/UpsellOffer';

export default function Upsell2() {
  return (
    <Suspense>
      <UpsellOffer kind="subscription" />
    </Suspense>
  );
}
