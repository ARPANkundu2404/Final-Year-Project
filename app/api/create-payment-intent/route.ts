/**
 * Create Payment Intent API Route
 * Initializes a Stripe PaymentIntent for secure card processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

const stripe = require('stripe');

const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { bookingId, amount } = await request.json();

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: 'Booking ID and amount are required' },
        { status: 400 }
      );
    }

    // Validate amount (convert to cents)
    const amountInCents = Math.round(amount * 100);
    if (amountInCents < 1) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create PaymentIntent with Stripe
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: amountInCents,
      currency: 'inr',
      metadata: {
        bookingId,
        userId: user.userId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: unknown) {
    console.error('Payment intent error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
