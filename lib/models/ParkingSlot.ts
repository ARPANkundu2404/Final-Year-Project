/**
 * ParkingSlot Model
 * Individual parking slots within a lot
 * Status: available (green), occupied (red), booked (yellow)
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export type SlotStatus = 'available' | 'occupied' | 'booked';
export type SlotType = 'regular' | 'handicapped' | 'ev' | 'compact';

export interface IParkingSlot extends Document {
  _id: mongoose.Types.ObjectId;
  parkingLotId: mongoose.Types.ObjectId;
  slotNumber: string;
  floor: number;
  row: string;
  column: number;
  status: SlotStatus;
  type: SlotType;
  currentBookingId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ParkingSlotSchema = new Schema<IParkingSlot>(
  {
    parkingLotId: {
      type: Schema.Types.ObjectId,
      ref: 'ParkingLot',
      required: [true, 'Parking lot ID is required'],
    },
    slotNumber: {
      type: String,
      required: [true, 'Slot number is required'],
      trim: true,
    },
    floor: {
      type: Number,
      required: true,
      default: 1,
    },
    row: {
      type: String,
      required: true,
      trim: true,
    },
    column: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'booked'],
      default: 'available',
    },
    type: {
      type: String,
      enum: ['regular', 'handicapped', 'ev', 'compact'],
      default: 'regular',
    },
    currentBookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
ParkingSlotSchema.index({ parkingLotId: 1, status: 1 });
ParkingSlotSchema.index({ parkingLotId: 1, floor: 1, row: 1 });
ParkingSlotSchema.index({ parkingLotId: 1, slotNumber: 1 }, { unique: true });

const ParkingSlot: Model<IParkingSlot> = mongoose.models.ParkingSlot || mongoose.model<IParkingSlot>('ParkingSlot', ParkingSlotSchema);

export default ParkingSlot;
