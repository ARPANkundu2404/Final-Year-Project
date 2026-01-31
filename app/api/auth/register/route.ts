/**
 * User Registration API
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';
import { mockUsers, generateId, initializeMockData } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
  try {
    await initializeMockData();
    
    const body = await request.json();
    const { email, password, name, phone } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const newUser = {
      _id: generateId(),
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: 'user' as const,
      phone,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUsers.push(newUser);

    // Generate token and set cookie
    const token = await generateToken({
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
