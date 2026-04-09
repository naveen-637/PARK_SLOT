import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    await conn.connection.db.admin().ping();
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error:`, error.message);

    if (process.env.NODE_ENV === 'production') {
      throw error;
    }

    console.warn('⚠️ Continuing without database in development mode');
    return null;
  }
};
