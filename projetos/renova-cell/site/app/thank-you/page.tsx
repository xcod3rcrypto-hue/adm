import { Suspense } from 'react';
import { ThankYou } from '@/components/checkout/ThankYou';

export default function ThankYouPage() {
  return (
    <Suspense>
      <ThankYou />
    </Suspense>
  );
}
