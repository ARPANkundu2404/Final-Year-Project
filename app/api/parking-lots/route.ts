/**
 * Parking Lots API
 * GET /api/parking-lots - List all parking lots
 * POST /api/parking-lots - Create new lot (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { mockParkingLots, mockParkingSlots, generateId, initializeMockData } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    await initializeMockData();
    
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const search = searchParams.get('search');

    let lots = mockParkingLots.filter(lot => lot.isActive);

    // Filter by city
    if (city) {
      lots = lots.filter(lot => lot.city.toLowerCase() === city.toLowerCase());
    }

    // Search by name or address
    if (search) {
      const searchLower = search.toLowerCase();
      lots = lots.filter(lot =>
        lot.name.toLowerCase().includes(searchLower) ||
        lot.address.toLowerCase().includes(searchLower)
      );
    }

    // Add available slots count
    const lotsWithAvailability = lots.map(lot => {
      const slots = mockParkingSlots.filter(s => s.parkingLotId === lot._id && s.isActive);
      const availableSlots = slots.filter(s => s.status === 'available').length;
      const occupiedSlots = slots.filter(s => s.status === 'occupied').length;
      const bookedSlots = slots.filter(s => s.status === 'booked').length;

      return {
        ...lot,
        availableSlots,
        occupiedSlots,
        bookedSlots,
        totalSlots: slots.length,
      };
    });

    return NextResponse.json({ parkingLots: lotsWithAvailability });
  } catch (error) {
    console.error('Get parking lots error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeMockData();
    
    // Check admin authorization
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, address, city, totalSlots, pricePerHour, openTime, closeTime, amenities } = body;

    // Validation
    if (!name || !address || !city || !totalSlots || !pricePerHour) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create parking lot
    const newLot = {
      _id: generateId(),
      name,
      address,
      city,
      totalSlots,
      pricePerHour,
      openTime: openTime || '06:00',
      closeTime: closeTime || '22:00',
      amenities: amenities || [],
      isActive: true,
    };

    mockParkingLots.push(newLot);

    // Create slots for the lot
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const slotsPerRow = Math.ceil(totalSlots / rows.length);
    let slotCount = 0;

    for (let floor = 1; floor <= 2 && slotCount < totalSlots; floor++) {
      for (let r = 0; r < rows.length && slotCount < totalSlots; r++) {
        for (let c = 1; c <= slotsPerRow && slotCount < totalSlots; c++) {
          mockParkingSlots.push({
            _id: `slot_${newLot._id}_${floor}_${rows[r]}${c}`,
            parkingLotId: newLot._id,
            slotNumber: `${floor}${rows[r]}${c.toString().padStart(2, '0')}`,
            floor,
            row: rows[r],
            column: c,
            status: 'available',
            type: 'regular',
            isActive: true,
          });
          slotCount++;
        }
      }
    }

    return NextResponse.json({
      message: 'Parking lot created successfully',
      parkingLot: newLot,
    }, { status: 201 });
  } catch (error) {
    console.error('Create parking lot error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
