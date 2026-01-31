/**
 * ParkingLot Model
 * Represents a parking location with its details
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IParkingLot extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  address: string;
  city: string;
  totalSlots: number;
  pricePerHour: number;
  openTime: string;
  closeTime: string;
  amenities: string[];
  isActive: boolean;
  image?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ParkingLotSchema = new Schema<IParkingLot>(
  {
    name: {
      type: String,
      required: [true, 'Parking lot name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    totalSlots: {
      type: Number,
      required: [true, 'Total slots is required'],
      min: [1, 'Must have at least 1 slot'],
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Price per hour is required'],
      min: [0, 'Price cannot be negative'],
    },
    openTime: {
      type: String,
      required: true,
      default: '06:00',
    },
    closeTime: {
      type: String,
      required: true,
      default: '22:00',
    },
    amenities: [{
      type: String,
      trim: true,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ParkingLotSchema.index({ city: 1 });
ParkingLotSchema.index({ isActive: 1 });
ParkingLotSchema.index({ name: 'text', address: 'text' });

const ParkingLot: Model<IParkingLot> = mongoose.models.ParkingLot || mongoose.model<IParkingLot>('ParkingLot', ParkingLotSchema);

export default ParkingLot;
