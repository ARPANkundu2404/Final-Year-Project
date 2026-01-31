'use client';

/**
 * Payment Page with Stripe Integration
 * Handles booking payment with Stripe Elements and QR code generation
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  Car,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { StripeProvider } from '@/components/stripe-provider';
import { CheckoutForm } from '@/components/checkout-form';
import { toast } from 'sonner';

interface BookingDetails {
  _id: string;
  slotNumber: string;
  vehicleNumber: string;
  startTime: string;
  endTime: string;
  lotName: string;
  totalAmount: number;
}

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const amount = searchParams.get('amount');
  const success = searchParams.get('success');

  const [paymentComplete, setPaymentComplete] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Fetch booking details
  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  // Initialize payment intent
  useEffect(() => {
    if (bookingId && amount && !clientSecret) {
      initializePaymentIntent();
    }
  }, [bookingId, amount, clientSecret]);

  // Check for success redirect
  useEffect(() => {
    if (success === 'true') {
      setPaymentComplete(true);
      toast.success('Payment successful!');
    }
  }, [success]);

  const fetchBookingDetails = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        const booking = data.booking;
        setBookingDetails({
          _id: booking._id,
          slotNumber: booking.slot?.slotNumber || 'N/A',
          vehicleNumber: booking.vehicleNumber,
          startTime: booking.startTime,
          endTime: booking.endTime,
          lotName: booking.parkingLot?.name || 'Unknown',
          totalAmount: booking.totalAmount,
        });
      } else {
        setError('Failed to load booking details');
        toast.error('Failed to load booking details');
      }
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError('Error loading booking');
      toast.error('Error loading booking');
    } finally {
      setIsLoading(false);
    }
  };

  const initializePaymentIntent = async () => {
    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          amount: parseFloat(amount || '0'),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setClientSecret(data.clientSecret);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to initialize payment');
        toast.error(data.error || 'Failed to initialize payment');
      }
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError('Failed to initialize payment');
      toast.error('Failed to initialize payment');
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Update booking status and generate QR code
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          paymentMethod: 'stripe_card',
          paymentIntentId,
        }),
      });

      if (res.ok) {
        setPaymentComplete(true);
        toast.success('Payment successful! QR code generated.');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to complete booking');
        toast.error(data.error || 'Failed to complete booking');
      }
    } catch (err) {
      console.error('Error updating booking:', err);
      setError('Failed to complete booking');
      toast.error('Failed to complete booking');
    }
  };

  if (!bookingId || !amount) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="bg-card border-border p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Invalid Payment Request</h2>
          <p className="text-muted-foreground mb-6">No booking information provided</p>
          <Link href="/dashboard/locations">
            <Button>Find Parking</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Card className="bg-card border-border overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-8 text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-primary/10">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">Payment Successful!</h2>
            <p className="text-muted-foreground mt-2">Your parking spot has been reserved</p>
          </div>

          <CardContent className="p-8 space-y-8">
            {/* Booking Summary */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Booking Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Location</p>
                  <p className="text-sm font-semibold text-foreground">{bookingDetails?.lotName}</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Slot Number</p>
                  <p className="text-sm font-semibold text-foreground">{bookingDetails?.slotNumber}</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Car className="h-3 w-3" />
                    Vehicle
                  </p>
                  <p className="text-sm font-semibold text-foreground">{bookingDetails?.vehicleNumber}</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Duration
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {bookingDetails?.startTime && 
                      new Date(bookingDetails.startTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Entry QR Code</h3>
              <div className="flex flex-col items-center p-8 bg-secondary/30 rounded-xl border-2 border-dashed border-primary/30">
                <p className="text-sm text-muted-foreground mb-6 text-center">
                  Show this QR code at the parking entrance for entry/exit
                </p>
                <div className="p-6 bg-white rounded-lg shadow-lg">
                  <QRCodeSVG
                    value={JSON.stringify({
                      bookingId,
                      slot: bookingDetails?.slotNumber,
                      vehicle: bookingDetails?.vehicleNumber,
                      validFrom: bookingDetails?.startTime,
                      validTo: bookingDetails?.endTime,
                    })}
                    size={200}
                    level="H"
                    includeMargin
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-6 text-center">
                  Valid until:{' '}
                  <span className="font-semibold text-foreground">
                    {bookingDetails?.endTime && new Date(bookingDetails.endTime).toLocaleString()}
                  </span>
                </p>
              </div>
            </div>

            {/* Amount Section */}
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Amount Paid</p>
              <p className="text-2xl font-bold text-primary">Rs. {amount}</p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/bookings" className="w-full">
                <Button variant="outline" className="w-full bg-transparent hover:bg-secondary">
                  View Bookings
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/locations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Complete Payment</h1>
          <p className="text-muted-foreground">Secure payment powered by Stripe</p>
        </div>
      </div>

      {error && (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Payment Error</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <Card className="bg-card border-border">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ) : clientSecret ? (
            <StripeProvider clientSecret={clientSecret}>
              <CheckoutForm
                bookingId={bookingId}
                amount={parseFloat(amount || '0')}
                onSuccess={handlePaymentSuccess}
                isLoading={isLoading}
              />
            </StripeProvider>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                <p className="text-muted-foreground">Initializing payment...</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="bg-card border-border sticky top-4">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : bookingDetails ? (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </span>
                    <span className="text-foreground font-medium text-right max-w-xs">
                      {bookingDetails.lotName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Slot</span>
                    <Badge variant="secondary">{bookingDetails.slotNumber}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Vehicle
                    </span>
                    <span className="text-foreground font-medium">{bookingDetails.vehicleNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Duration
                    </span>
                    <span className="text-foreground font-medium text-right">
                      {bookingDetails.startTime && 
                        new Date(bookingDetails.startTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="pt-4 border-t border-border mt-6">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">Rs. {amount}</span>
                </div>
              </div>

              <div className="p-4 bg-secondary/30 rounded-lg text-xs text-muted-foreground text-center space-y-2">
                <p>🔒 Secured by 256-bit SSL encryption</p>
                <p>Your card details are never stored on our servers</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PaymentPageWithSuspense() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading payment details...</p>
          </div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}

export default PaymentPageWithSuspense;
