/**
 * Admin Statistics API
 * GET /api/admin/stats - Get dashboard statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import {
  mockBookings,
  mockParkingLots,
  mockParkingSlots,
  mockPayments,
  mockUsers,
  initializeMockData,
} from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    await initializeMockData();

    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Overall stats
    const totalLots = mockParkingLots.filter((l) => l.isActive).length;
    const totalSlots = mockParkingSlots.filter((s) => s.isActive).length;
    const availableSlots = mockParkingSlots.filter((s) => s.status === 'available' && s.isActive).length;
    const occupiedSlots = mockParkingSlots.filter((s) => s.status === 'occupied' && s.isActive).length;
    const bookedSlots = mockParkingSlots.filter((s) => s.status === 'booked' && s.isActive).length;

    // Booking stats
    const totalBookings = mockBookings.length;
    const activeBookings = mockBookings.filter(
      (b) => b.status === 'active' || b.status === 'confirmed'
    ).length;
    const completedBookings = mockBookings.filter((b) => b.status === 'completed').length;
    const cancelledBookings = mockBookings.filter((b) => b.status === 'cancelled').length;

    // Revenue stats
    const totalRevenue = mockPayments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    // Daily stats (last 7 days)
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayBookings = mockBookings.filter((b) => {
        const created = new Date(b.createdAt);
        return created >= date && created < nextDate;
      });

      const dayRevenue = dayBookings
        .filter((b) => b.status === 'completed' || b.status === 'confirmed')
        .reduce((sum, b) => sum + b.totalAmount, 0);

      dailyStats.push({
        date: date.toISOString().split('T')[0],
        bookings: dayBookings.length,
        revenue: dayRevenue,
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      });
    }

    // Hourly distribution
    const hourlyDistribution = Array(24)
      .fill(0)
      .map((_, hour) => ({
        hour,
        label: `${hour.toString().padStart(2, '0')}:00`,
        bookings: mockBookings.filter((b) => {
          const start = new Date(b.startTime);
          return start.getHours() === hour;
        }).length,
      }));

    // Lot statistics
    const lotStats = mockParkingLots.map((lot) => {
      const lotSlots = mockParkingSlots.filter((s) => s.parkingLotId === lot._id && s.isActive);
      const lotBookings = mockBookings.filter((b) => b.parkingLotId === lot._id);

      return {
        _id: lot._id,
        name: lot.name,
        totalSlots: lotSlots.length,
        available: lotSlots.filter((s) => s.status === 'available').length,
        occupied: lotSlots.filter((s) => s.status === 'occupied').length,
        booked: lotSlots.filter((s) => s.status === 'booked').length,
        totalBookings: lotBookings.length,
        occupancyRate:
          lotSlots.length > 0
            ? Math.round(
                ((lotSlots.filter((s) => s.status !== 'available').length / lotSlots.length) * 100)
              )
            : 0,
      };
    });

    // User stats
    const totalUsers = mockUsers.filter((u) => u.role === 'user').length;

    return NextResponse.json({
      overview: {
        totalLots,
        totalSlots,
        availableSlots,
        occupiedSlots,
        bookedSlots,
        occupancyRate: totalSlots > 0 ? Math.round(((totalSlots - availableSlots) / totalSlots) * 100) : 0,
      },
      bookings: {
        total: totalBookings,
        active: activeBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
      },
      revenue: {
        total: totalRevenue,
        average: totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0,
      },
      users: {
        total: totalUsers,
      },
      dailyStats,
      hourlyDistribution,
      lotStats,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
