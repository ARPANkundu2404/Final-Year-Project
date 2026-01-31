/**
 * Single Parking Lot API
 * GET /api/parking-lots/[id] - Get lot details with slots
 * PATCH /api/parking-lots/[id] - Update lot (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { mockParkingLots, mockParkingSlots, initializeMockData } from '@/lib/mock-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeMockData();
    const { id } = await params;

    const lot = mockParkingLots.find(l => l._id === id);
    if (!lot) {
      return NextResponse.json(
        { error: 'Parking lot not found' },
        { status: 404 }
      );
    }

    // Get slots for this lot
    const slots = mockParkingSlots.filter(s => s.parkingLotId === id && s.isActive);

    // Group slots by floor
    const slotsByFloor = slots.reduce((acc, slot) => {
      if (!acc[slot.floor]) {
        acc[slot.floor] = [];
      }
      acc[slot.floor].push(slot);
      return acc;
    }, {} as Record<number, typeof slots>);

    const stats = {
      total: slots.length,
      available: slots.filter(s => s.status === 'available').length,
      occupied: slots.filter(s => s.status === 'occupied').length,
      booked: slots.filter(s => s.status === 'booked').length,
    };

    return NextResponse.json({
      parkingLot: lot,
      slots,
      slotsByFloor,
      stats,
    });
  } catch (error) {
    console.error('Get parking lot error:', error);
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

    // Check admin authorization
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const lotIndex = mockParkingLots.findIndex(l => l._id === id);
    if (lotIndex === -1) {
      return NextResponse.json(
        { error: 'Parking lot not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const allowedUpdates = ['name', 'address', 'pricePerHour', 'openTime', 'closeTime', 'amenities', 'isActive'];

    // Update only allowed fields
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        (mockParkingLots[lotIndex] as Record<string, unknown>)[key] = body[key];
      }
    }

    return NextResponse.json({
      message: 'Parking lot updated successfully',
      parkingLot: mockParkingLots[lotIndex],
    });
  } catch (error) {
    console.error('Update parking lot error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
