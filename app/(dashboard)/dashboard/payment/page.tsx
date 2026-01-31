'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Lock,
  Shield,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const amount = searchParams.get('amount');

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [bookingDetails, setBookingDetails] = useState<{
    slotNumber: string;
    vehicleNumber: string;
    startTime: string;
    endTime: string;
    lotName: string;
  } | null>(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // UPI state
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        setBookingDetails({
          slotNumber: data.booking.slot?.slotNumber || 'N/A',
          vehicleNumber: data.booking.vehicleNumber,
          startTime: data.booking.startTime,
          endTime: data.booking.endTime,
          lotName: data.booking.parkingLot?.name || 'Unknown',
        });
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handlePayment = async () => {
    if (!bookingId) {
      alert('Invalid booking');
      return;
    }

    // Validate payment method
    if (paymentMethod === 'card') {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        alert('Please fill in all card details');
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId) {
        alert('Please enter UPI ID');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setQrCode(data.qrCode);
        setPaymentComplete(true);
      } else {
        alert(data.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred during payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!bookingId || !amount) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="bg-card border-border p-6 text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">Invalid Payment Request</h2>
          <p className="text-muted-foreground mb-4">No booking information provided</p>
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
          <div className="bg-primary/10 p-6 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Payment Successful!</h2>
            <p className="text-muted-foreground mt-2">Your parking spot has been booked</p>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Booking Summary */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Location</span>
                <span className="text-foreground font-medium">{bookingDetails?.lotName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Slot Number</span>
                <span className="text-foreground font-medium">{bookingDetails?.slotNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vehicle</span>
                <span className="text-foreground font-medium">{bookingDetails?.vehicleNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="text-primary font-bold">Rs. {amount}</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center p-6 bg-secondary/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">Show this QR code at the parking entrance</p>
              <div className="p-4 bg-white rounded-lg">
                <QRCodeSVG
                  value={JSON.stringify({
                    bookingId,
                    slot: bookingDetails?.slotNumber,
                    vehicle: bookingDetails?.vehicleNumber,
                    validFrom: bookingDetails?.startTime,
                    validTo: bookingDetails?.endTime,
                  })}
                  size={180}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Valid from {bookingDetails?.startTime && new Date(bookingDetails.startTime).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/dashboard/bookings" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  View Bookings
                </Button>
              </Link>
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/locations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Complete Payment</h1>
          <p className="text-muted-foreground">Secure payment powered by Razorpay</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Payment Method</CardTitle>
              <CardDescription>Choose how you want to pay</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-3 flex-1 cursor-pointer">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Credit / Debit Card</p>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard, RuPay</p>
                    </div>
                  </Label>
                </div>

                <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="flex items-center gap-3 flex-1 cursor-pointer">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">UPI</p>
                      <p className="text-xs text-muted-foreground">GPay, PhonePe, Paytm</p>
                    </div>
                  </Label>
                </div>

                <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${paymentMethod === 'netbanking' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <RadioGroupItem value="netbanking" id="netbanking" />
                  <Label htmlFor="netbanking" className="flex items-center gap-3 flex-1 cursor-pointer">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Net Banking</p>
                      <p className="text-xs text-muted-foreground">All major banks</p>
                    </div>
                  </Label>
                </div>

                <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${paymentMethod === 'wallet' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <RadioGroupItem value="wallet" id="wallet" />
                  <Label htmlFor="wallet" className="flex items-center gap-3 flex-1 cursor-pointer">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Wallet</p>
                      <p className="text-xs text-muted-foreground">Paytm, Mobikwik, Amazon Pay</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment Details Form */}
          {paymentMethod === 'card' && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Card Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Card Number</Label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Name on Card</Label>
                  <Input
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Expiry Date</Label>
                    <Input
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">CVV</Label>
                    <Input
                      type="password"
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {paymentMethod === 'upi' && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">UPI Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-foreground">UPI ID</Label>
                  <Input
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bookingDetails && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="text-foreground font-medium">{bookingDetails.lotName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slot</span>
                    <span className="text-foreground font-medium">{bookingDetails.slotNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vehicle</span>
                    <span className="text-foreground font-medium">{bookingDetails.vehicleNumber}</span>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">Rs. {amount}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
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
                By completing this payment, you agree to our Terms of Service and Privacy Policy. 
                This is a demo payment - no actual charges will be made.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
