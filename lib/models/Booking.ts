/**
 * Booking Model
 * Tracks all parking reservations with payment and timing details
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  parkingLotId: mongoose.Types.ObjectId;
  slotId: mongoose.Types.ObjectId;
  vehicleNumber: string;
  vehicleType: 'car' | 'motorcycle' | 'truck';
  startTime: Date;
  endTime: Date;
  actualEndTime?: Date;
  totalAmount: number;
  status: BookingStatus;
  paymentId?: mongoose.Types.ObjectId;
  qrCode?: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    parkingLotId: {
      type: Schema.Types.ObjectId,
      ref: 'ParkingLot',
      required: [true, 'Parking lot ID is required'],
    },
    slotId: {
      type: Schema.Types.ObjectId,
      ref: 'ParkingSlot',
      required: [true, 'Slot ID is required'],
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
      uppercase: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ['car', 'motorcycle', 'truck'],
      default: 'car',
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    actualEndTime: {
      type: Date,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    qrCode: {
      type: String,
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
BookingSchema.index({ userId: 1, status: 1 });
BookingSchema.index({ parkingLotId: 1, status: 1 });
BookingSchema.index({ slotId: 1, startTime: 1, endTime: 1 });
BookingSchema.index({ createdAt: -1 });

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
