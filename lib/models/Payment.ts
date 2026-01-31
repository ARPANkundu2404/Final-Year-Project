/**
 * Payment Model
 * Tracks all payment transactions (Razorpay integration ready)
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: PaymentMethod;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  transactionId?: string;
  refundAmount?: number;
  refundReason?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    method: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet'],
    },
    razorpayOrderId: {
      type: String,
      sparse: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
    },
    razorpaySignature: {
      type: String,
    },
    stripePaymentIntentId: {
      type: String,
      sparse: true,
    },
    transactionId: {
      type: String,
    },
    refundAmount: {
      type: Number,
    },
    refundReason: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PaymentSchema.index({ bookingId: 1 });
PaymentSchema.index({ userId: 1, status: 1 });
PaymentSchema.index({ razorpayOrderId: 1 });
PaymentSchema.index({ razorpayPaymentId: 1 });
PaymentSchema.index({ createdAt: -1 });

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
