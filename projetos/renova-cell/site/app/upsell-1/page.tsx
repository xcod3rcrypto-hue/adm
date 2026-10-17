import { Suspense } from 'react';
import { UpsellOffer } from '@/components/checkout/UpsellOffer';

export default function Upsell1() {
  return (
    <Suspense>
      <UpsellOffer kind="kit6" />
    </Suspense>
  );
}
