'use client';

/**
 * Checkout Form Component
 * Stripe PaymentElement for secure payment processing
 */

import { useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutFormProps {
  bookingId: string;
  amount: number;
  onSuccess?: (paymentIntentId: string) => void;
  isLoading?: boolean;
}

export function CheckoutForm({
  bookingId,
  amount,
  onSuccess,
  isLoading = false,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe not loaded');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/payment?success=true&bookingId=${bookingId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        toast.error(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        onSuccess?.(paymentIntent.id);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Payment Details</CardTitle>
          <CardDescription>Secure payment powered by Stripe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PaymentElement />

          {errorMessage && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-sm text-destructive">{errorMessage}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={!stripe || !elements || isProcessing || isLoading}
            size="lg"
            className="w-full"
          >
            {isProcessing || isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Pay Rs. {amount}
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Secured by 256-bit SSL encryption</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-secondary/30 border-border">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground text-center">
            Your payment information is processed securely. We do not store card details on our servers.
          </p>
        </CardContent>
      </Card>
    </form>
  );
}
