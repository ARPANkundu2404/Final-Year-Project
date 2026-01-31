/**
 * Parking Slots API
 * GET /api/parking-lots/[id]/slots - Get all slots for a lot
 * PATCH /api/parking-lots/[id]/slots - Update slot status (admin only)
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

    const { searchParams } = new URL(request.url);
    const floor = searchParams.get('floor');
    const status = searchParams.get('status');

    let slots = mockParkingSlots.filter(s => s.parkingLotId === id && s.isActive);

    if (floor) {
      slots = slots.filter(s => s.floor === parseInt(floor));
    }

    if (status) {
      slots = slots.filter(s => s.status === status);
    }

    // Sort by floor, row, column
    slots.sort((a, b) => {
      if (a.floor !== b.floor) return a.floor - b.floor;
      if (a.row !== b.row) return a.row.localeCompare(b.row);
      return a.column - b.column;
    });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Get slots error:', error);
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

    const body = await request.json();
    const { slotId, status } = body;

    if (!slotId || !status) {
      return NextResponse.json(
        { error: 'Slot ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['available', 'occupied', 'booked'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const slotIndex = mockParkingSlots.findIndex(
      s => s._id === slotId && s.parkingLotId === id
    );

    if (slotIndex === -1) {
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      );
    }

    mockParkingSlots[slotIndex].status = status;
    if (status === 'available') {
      mockParkingSlots[slotIndex].currentBookingId = undefined;
    }

    return NextResponse.json({
      message: 'Slot status updated',
      slot: mockParkingSlots[slotIndex],
    });
  } catch (error) {
    console.error('Update slot error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
