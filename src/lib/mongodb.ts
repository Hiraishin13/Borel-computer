import mongoose from 'mongoose'
import { env } from './env'

/**
 * Cached connection for serverless environments (Vercel). Prevents opening a new
 * connection on every function invocation / hot reload.
 */
interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined
}

const cached: MongooseCache = global._mongoose ?? { conn: null, promise: null }
global._mongoose = cached

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(env.mongodbUri, {
      bufferCommands: false,
      maxPoolSize: 10,
      // marge pour un cluster M0 qui sort de veille + cold start serverless
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    // Reset so the next request can retry instead of awaiting a rejected promise.
    cached.promise = null
    throw err
  }

  return cached.conn
}
