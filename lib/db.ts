/**
 * MongoDB Database Connection Utility
 * Manages connection pooling and caching for serverless environment
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.warn('Warning: MONGODB_URI is not defined. Using in-memory mock data.');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var myMongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.myMongoose || { conn: null, promise: null };

if (!global.myMongoose) {
  global.myMongoose = cached;
}

/**
 * Connect to MongoDB with connection caching
 * Essential for serverless environments to prevent connection exhaustion
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error('Please define MONGODB_URI environment variable');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((myMongoose) => {
      return myMongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
