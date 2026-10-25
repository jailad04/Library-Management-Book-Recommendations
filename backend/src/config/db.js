import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async () => {
  let uri = process.env.MONGODB_URI;

  try {
    if (!uri || uri === 'memory' || uri === 'inmemory') {
      console.log('🔄 Initializing in-memory MongoDB server for testing/evaluation...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      uri = mongoMemoryServer.getUri();
      console.log(`📦 In-memory MongoDB instance ready.`);
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    // If connection to external/local URI failed and not already using memory server, try fallback
    if (!mongoMemoryServer && process.env.NODE_ENV !== 'production') {
      console.warn(`⚠️ Could not connect to primary MongoDB URI (${uri}): ${err.message}`);
      console.log('🔄 Attempting fallback to in-memory MongoDB instance...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const fallbackUri = mongoMemoryServer.getUri();
        const fallbackConn = await mongoose.connect(fallbackUri);
        console.log(`✅ MongoDB Connected via in-memory instance: ${fallbackConn.connection.host}`);
        return fallbackConn;
      } catch (fallbackErr) {
        console.error('❌ Failed to start fallback MongoDB:', fallbackErr.message);
        throw fallbackErr;
      }
    }

    console.error(`❌ MongoDB connection error: ${err.message}`);
    throw err;
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
  console.log('🔌 MongoDB Disconnected');
};

export const getDBStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const stateCode = mongoose.connection.readyState;
  return {
    state: states[stateCode] || 'unknown',
    connected: stateCode === 1,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null
  };
};

export default connectDB;
