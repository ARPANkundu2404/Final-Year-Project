/**
 * Bookings API
 * GET /api/bookings - List user's bookings
 * POST /api/bookings - Create new booking
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import {
  mockBookings,
  mockParkingLots,
  mockParkingSlots,
  mockPayments,
  generateId,
  initializeMockData,
} from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    await initializeMockData();

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let bookings = mockBookings.filter((b) => b.userId === user.userId);

    if (status) {
      bookings = bookings.filter((b) => b.status === status);
    }

    // Sort by creation date (newest first)
    bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply limit
    bookings = bookings.slice(0, limit);

    // Enrich with lot and slot details
    const enrichedBookings = bookings.map((booking) => {
      const lot = mockParkingLots.find((l) => l._id === booking.parkingLotId);
      const slot = mockParkingSlots.find((s) => s._id === booking.slotId);

      return {
        ...booking,
        parkingLot: lot
          ? {
              name: lot.name,
              address: lot.address,
              city: lot.city,
            }
          : null,
        slot: slot
          ? {
              slotNumber: slot.slotNumber,
              floor: slot.floor,
              row: slot.row,
            }
          : null,
      };
    });

    return NextResponse.json({ bookings: enrichedBookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeMockData();

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { parkingLotId, slotId, vehicleNumber, vehicleType, startTime, endTime } = body;

    // Validation
    if (!parkingLotId || !slotId || !vehicleNumber || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if lot exists
    const lot = mockParkingLots.find((l) => l._id === parkingLotId);
    if (!lot) {
      return NextResponse.json({ error: 'Parking lot not found' }, { status: 404 });
    }

    // Check if slot exists and is available
    const slotIndex = mockParkingSlots.findIndex((s) => s._id === slotId && s.parkingLotId === parkingLotId);

    if (slotIndex === -1) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }

    if (mockParkingSlots[slotIndex].status !== 'available') {
      return NextResponse.json({ error: 'Slot is not available' }, { status: 409 });
    }

    // Check for overlapping bookings (prevent double booking)
    const start = new Date(startTime);
    const end = new Date(endTime);

    const hasOverlap = mockBookings.some(
      (b) =>
        b.slotId === slotId &&
        b.status !== 'cancelled' &&
        b.status !== 'completed' &&
        ((new Date(b.startTime) <= start && new Date(b.endTime) > start) ||
          (new Date(b.startTime) < end && new Date(b.endTime) >= end) ||
          (new Date(b.startTime) >= start && new Date(b.endTime) <= end))
    );

    if (hasOverlap) {
      return NextResponse.json({ error: 'Slot already booked for this time period' }, { status: 409 });
    }

    // Calculate amount
    const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    const totalAmount = hours * lot.pricePerHour;

    // Create booking
    const bookingId = generateId();
    const newBooking = {
      _id: bookingId,
      userId: user.userId,
      parkingLotId,
      slotId,
      vehicleNumber: vehicleNumber.toUpperCase(),
      vehicleType: vehicleType || 'car',
      startTime: start,
      endTime: end,
      totalAmount,
      status: 'pending' as const,
      createdAt: new Date(),
    };

    mockBookings.push(newBooking);

    // Create pending payment
    const paymentId = generateId();
    mockPayments.push({
      _id: paymentId,
      bookingId,
      userId: user.userId,
      amount: totalAmount,
      currency: 'INR',
      status: 'pending',
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        message: 'Booking created successfully',
        booking: {
          ...newBooking,
          parkingLot: {
            name: lot.name,
            address: lot.address,
            pricePerHour: lot.pricePerHour,
          },
        },
        paymentId,
        totalAmount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
