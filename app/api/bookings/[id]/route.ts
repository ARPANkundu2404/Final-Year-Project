/**
 * Single Booking API
 * GET /api/bookings/[id] - Get booking details
 * PATCH /api/bookings/[id] - Update booking status
 * DELETE /api/bookings/[id] - Cancel booking
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { mockBookings, mockParkingLots, mockParkingSlots, mockPayments, initializeMockData } from '@/lib/mock-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeMockData();
    const { id } = await params;

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const booking = mockBookings.find(b => b._id === id);
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (booking.userId !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const lot = mockParkingLots.find(l => l._id === booking.parkingLotId);
    const slot = mockParkingSlots.find(s => s._id === booking.slotId);
    const payment = mockPayments.find(p => p.bookingId === booking._id);

    return NextResponse.json({
      booking: {
        ...booking,
        parkingLot: lot ? {
          name: lot.name,
          address: lot.address,
          city: lot.city,
          pricePerHour: lot.pricePerHour,
        } : null,
        slot: slot ? {
          slotNumber: slot.slotNumber,
          floor: slot.floor,
          row: slot.row,
          type: slot.type,
        } : null,
        payment: payment ? {
          _id: payment._id,
          status: payment.status,
          method: payment.method,
        } : null,
      },
    });
  } catch (error) {
    console.error('Get booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeMockData();
    const { id } = await params;

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const bookingIndex = mockBookings.findIndex(b => b._id === id);
    if (bookingIndex === -1) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const booking = mockBookings[bookingIndex];

    // Check authorization
    if (booking.userId !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['active', 'cancelled'],
      active: ['completed'],
      completed: [],
      cancelled: [],
    };

    if (status && !validTransitions[booking.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${booking.status} to ${status}` },
        { status: 400 }
      );
    }

    if (status) {
      mockBookings[bookingIndex].status = status;

      // Update slot status based on booking status
      const slotIndex = mockParkingSlots.findIndex(s => s._id === booking.slotId);
      if (slotIndex !== -1) {
        if (status === 'confirmed') {
          mockParkingSlots[slotIndex].status = 'booked';
          mockParkingSlots[slotIndex].currentBookingId = booking._id;
        } else if (status === 'active') {
          mockParkingSlots[slotIndex].status = 'occupied';
        } else if (status === 'completed' || status === 'cancelled') {
          mockParkingSlots[slotIndex].status = 'available';
          mockParkingSlots[slotIndex].currentBookingId = undefined;
        }
      }
    }

    return NextResponse.json({
      message: 'Booking updated successfully',
      booking: mockBookings[bookingIndex],
    });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeMockData();
    const { id } = await params;

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const bookingIndex = mockBookings.findIndex(b => b._id === id);
    if (bookingIndex === -1) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const booking = mockBookings[bookingIndex];

    // Check authorization
    if (booking.userId !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Can only cancel pending or confirmed bookings
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return NextResponse.json(
        { error: 'Cannot cancel this booking' },
        { status: 400 }
      );
    }

    // Update status to cancelled
    mockBookings[bookingIndex].status = 'cancelled';

    // Free up the slot
    const slotIndex = mockParkingSlots.findIndex(s => s._id === booking.slotId);
    if (slotIndex !== -1) {
      mockParkingSlots[slotIndex].status = 'available';
      mockParkingSlots[slotIndex].currentBookingId = undefined;
    }

    return NextResponse.json({
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
