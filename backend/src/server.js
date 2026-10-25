import dotenv from 'dotenv';
import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import Book from './models/Book.js';
import { seedData } from './scripts/seed.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Auto-seed the in-memory instance when it starts empty (dev / demo mode)
    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      console.log('📭 Empty database — running auto-seed for demo data...');
      try {
        await seedData();
      } catch (seedErr) {
        console.warn('⚠️  Auto-seed error (non-fatal):', seedErr.message);
      }
    } else {
      console.log(`📚 Database has ${bookCount} book(s) — skipping auto-seed.`);
    }

    const app = createApp();

    const server = app.listen(PORT, () => {
      console.log(`🚀 BookNest Server running on http://localhost:${PORT}`);
      console.log(`🩺 Health check endpoint: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log('✅ Server closed cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    process.on('unhandledRejection', (err) => {
      console.error('💥 Unhandled Rejection:', err.message);
      shutdown('unhandledRejection');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
