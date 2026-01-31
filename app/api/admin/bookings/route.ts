/**
 * Admin Bookings API
 * GET /api/admin/bookings - Get all bookings with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { mockBookings, mockParkingLots, mockParkingSlots, mockUsers, initializeMockData } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    await initializeMockData();

    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const lotId = searchParams.get('lotId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let bookings = [...mockBookings];

    // Apply filters
    if (status) {
      bookings = bookings.filter(b => b.status === status);
    }

    if (lotId) {
      bookings = bookings.filter(b => b.parkingLotId === lotId);
    }

    // Sort by creation date (newest first)
    bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = bookings.length;

    // Apply pagination
    bookings = bookings.slice(offset, offset + limit);

    // Enrich with details
    const enrichedBookings = bookings.map(booking => {
      const lot = mockParkingLots.find(l => l._id === booking.parkingLotId);
      const slot = mockParkingSlots.find(s => s._id === booking.slotId);
      const bookingUser = mockUsers.find(u => u._id === booking.userId);

      return {
        ...booking,
        parkingLot: lot ? {
          name: lot.name,
          address: lot.address,
        } : null,
        slot: slot ? {
          slotNumber: slot.slotNumber,
          floor: slot.floor,
        } : null,
        user: bookingUser ? {
          name: bookingUser.name,
          email: bookingUser.email,
        } : null,
      };
    });

    return NextResponse.json({
      bookings: enrichedBookings,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Get admin bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
