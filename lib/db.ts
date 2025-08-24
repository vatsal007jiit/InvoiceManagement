import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cached: typeof mongoose | null = null;

async function dbConnect() {
  if (cached) {
    return cached;
  }

  const opts = {
    bufferCommands: false,
  };

  cached = await mongoose.connect(MONGODB_URI!, opts);
  return cached;
}

export default dbConnect;
