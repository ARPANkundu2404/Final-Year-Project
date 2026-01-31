/**
 * Mock Data Store
 * In-memory data for demo purposes when MongoDB is not configured
 */

import { hashPassword } from './auth';

export interface MockUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockParkingLot {
  _id: string;
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
}

export interface MockParkingSlot {
  _id: string;
  parkingLotId: string;
  slotNumber: string;
  floor: number;
  row: string;
  column: number;
  status: 'available' | 'occupied' | 'booked';
  type: 'regular' | 'handicapped' | 'ev' | 'compact';
  currentBookingId?: string;
  isActive: boolean;
}

export interface MockBooking {
  _id: string;
  userId: string;
  parkingLotId: string;
  slotId: string;
  vehicleNumber: string;
  vehicleType: 'car' | 'motorcycle' | 'truck';
  startTime: Date;
  endTime: Date;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  paymentId?: string;
  qrCode?: string;
  createdAt: Date;
}

export interface MockPayment {
  _id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  method?: 'card' | 'upi' | 'netbanking' | 'wallet';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
}

// In-memory data stores
export const mockUsers: MockUser[] = [];
export const mockParkingLots: MockParkingLot[] = [];
export const mockParkingSlots: MockParkingSlot[] = [];
export const mockBookings: MockBooking[] = [];
export const mockPayments: MockPayment[] = [];

// Combined mock data object for easy access
export const mockData = {
  users: mockUsers,
  parkingLots: mockParkingLots,
  parkingSlots: mockParkingSlots,
  bookings: mockBookings,
  payments: mockPayments,
};

// Generate unique IDs
let idCounter = 1;
export function generateId(): string {
  return `mock_${Date.now()}_${idCounter++}`;
}

// Initialize with sample data
export async function initializeMockData() {
  if (mockParkingLots.length > 0) return; // Already initialized

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  mockUsers.push({
    _id: 'admin_001',
    email: 'admin@parkingsystem.com',
    password: adminPassword,
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create demo user
  const userPassword = await hashPassword('user123');
  mockUsers.push({
    _id: 'user_001',
    email: 'user@example.com',
    password: userPassword,
    name: 'Demo User',
    role: 'user',
    phone: '+1234567890',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create parking lots
  const lots = [
    {
      _id: 'lot_001',
      name: 'Central Mall Parking',
      address: '123 Main Street',
      city: 'New York',
      totalSlots: 48,
      pricePerHour: 50,
      openTime: '06:00',
      closeTime: '23:00',
      amenities: ['CCTV', 'EV Charging', 'Wheelchair Access', 'Car Wash'],
      isActive: true,
    },
    {
      _id: 'lot_002',
      name: 'Tech Park Plaza',
      address: '456 Innovation Drive',
      city: 'New York',
      totalSlots: 36,
      pricePerHour: 40,
      openTime: '05:00',
      closeTime: '22:00',
      amenities: ['CCTV', 'EV Charging', 'Covered Parking'],
      isActive: true,
    },
    {
      _id: 'lot_003',
      name: 'Airport Long Stay',
      address: '789 Terminal Road',
      city: 'New York',
      totalSlots: 60,
      pricePerHour: 80,
      openTime: '00:00',
      closeTime: '23:59',
      amenities: ['CCTV', '24/7 Security', 'Shuttle Service', 'Covered Parking'],
      isActive: true,
    },
    {
      _id: 'lot_004',
      name: 'Downtown Express',
      address: '321 Business Ave',
      city: 'Los Angeles',
      totalSlots: 24,
      pricePerHour: 60,
      openTime: '07:00',
      closeTime: '21:00',
      amenities: ['CCTV', 'Valet Service'],
      isActive: true,
    },
  ];

  mockParkingLots.push(...lots);

  // Create parking slots for each lot
  lots.forEach((lot) => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const slotsPerRow = Math.ceil(lot.totalSlots / rows.length);
    let slotCount = 0;

    for (let floor = 1; floor <= 2 && slotCount < lot.totalSlots; floor++) {
      for (let r = 0; r < rows.length && slotCount < lot.totalSlots; r++) {
        for (let c = 1; c <= slotsPerRow && slotCount < lot.totalSlots; c++) {
          const slot: MockParkingSlot = {
            _id: `slot_${lot._id}_${floor}_${rows[r]}${c}`,
            parkingLotId: lot._id,
            slotNumber: `${floor}${rows[r]}${c.toString().padStart(2, '0')}`,
            floor,
            row: rows[r],
            column: c,
            status: getRandomStatus(),
            type: getRandomType(r, c),
            isActive: true,
          };
          mockParkingSlots.push(slot);
          slotCount++;
        }
      }
    }
  });

  // Create some sample bookings
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (let i = 0; i < 15; i++) {
    const bookingDate = new Date(today);
    bookingDate.setDate(bookingDate.getDate() - Math.floor(Math.random() * 7));
    
    const startHour = 8 + Math.floor(Math.random() * 8);
    const duration = 1 + Math.floor(Math.random() * 4);
    
    const startTime = new Date(bookingDate);
    startTime.setHours(startHour, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(startHour + duration);

    const lotIndex = Math.floor(Math.random() * lots.length);
    const lot = lots[lotIndex];
    const lotSlots = mockParkingSlots.filter(s => s.parkingLotId === lot._id);
    const slot = lotSlots[Math.floor(Math.random() * lotSlots.length)];

    mockBookings.push({
      _id: `booking_${generateId()}`,
      userId: 'user_001',
      parkingLotId: lot._id,
      slotId: slot._id,
      vehicleNumber: `NY${1000 + i}XY`,
      vehicleType: 'car',
      startTime,
      endTime,
      totalAmount: lot.pricePerHour * duration,
      status: bookingDate < yesterday ? 'completed' : 'confirmed',
      qrCode: `QR_${Date.now()}_${i}`,
      createdAt: bookingDate,
    });
  }
}

function getRandomStatus(): 'available' | 'occupied' | 'booked' {
  const rand = Math.random();
  if (rand < 0.6) return 'available';
  if (rand < 0.85) return 'occupied';
  return 'booked';
}

function getRandomType(row: number, col: number): 'regular' | 'handicapped' | 'ev' | 'compact' {
  if (row === 0 && col <= 2) return 'handicapped';
  if (row === 1 && col <= 2) return 'ev';
  if (col >= 7) return 'compact';
  return 'regular';
}
