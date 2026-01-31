'use client';

/**
 * Stripe Provider Component
 * Wraps the app with Stripe configuration
 */

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { ReactNode } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
}

export function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const options: StripeElementsOptions = {
    clientSecret: clientSecret || '',
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#3b82f6',
        colorBackground: '#1f2937',
        colorText: '#f3f4f6',
        colorDanger: '#ef4444',
        borderRadius: '0.5rem',
        fontSizeBase: '16px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={clientSecret ? options : undefined}>
      {children}
    </Elements>
  );
}
