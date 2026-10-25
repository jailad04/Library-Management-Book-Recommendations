import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Book from '../models/Book.js';
import Borrowing from '../models/Borrowing.js';

dotenv.config();

const SEED_USERS = [
  {
    name: 'Alex Morgan',
    email: 'alex.morgan@university.edu',
    password: 'student1234',
    memberId: 'BN-2026-8842',
    department: 'Computer Science & Engineering',
    role: 'user',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    joinDate: '2025-09-01',
    preferredGenres: ['Computer Science', 'Artificial Intelligence', 'Sci-Fi', 'Psychology'],
    readingGoal: { target: 24, completed: 11 }
  },
  {
    name: 'Dr. Evelyn Vance',
    email: 'admin@university.edu',
    password: 'admin1234',
    memberId: 'BN-STAFF-001',
    department: 'Library Administration',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    joinDate: '2023-01-15',
    preferredGenres: ['Computer Science', 'Philosophy'],
    readingGoal: { target: 30, completed: 18 }
  }
];

const SEED_BOOKS = [
  {
    customId: 'b-101',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    isbn: '9781449373320',
    genre: 'Computer Science',
    category: 'Software Architecture',
    publishedYear: 2017,
    publisher: "O'Reilly Media",
    pages: 616,
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781449373320-L.jpg',
    rating: 4.9,
    ratingCount: 342,
    totalCopies: 8,
    availableCopies: 3,
    shelfLocation: 'Floor 2 — Shelf CS-14',
    featured: true,
    tags: ['Distributed Systems', 'Databases', 'Scalability', 'Reliability'],
    description: 'The definitive guide to the principles and architectures underpinning modern big data and scalable computing systems.'
  },
  {
    customId: 'b-102',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    genre: 'Computer Science',
    category: 'Software Engineering',
    publishedYear: 2008,
    publisher: 'Prentice Hall',
    pages: 464,
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
    rating: 4.7,
    ratingCount: 520,
    totalCopies: 12,
    availableCopies: 5,
    shelfLocation: 'Floor 2 — Shelf CS-02',
    featured: true,
    tags: ['Best Practices', 'Refactoring', 'Clean Architecture'],
    description: 'A handbook of agile software craftsmanship with best practices for maintainable and readable code.'
  },
  {
    customId: 'b-103',
    title: 'Deep Learning with Python',
    author: 'François Chollet',
    isbn: '9781617294433',
    genre: 'Artificial Intelligence',
    category: 'Machine Learning',
    publishedYear: 2021,
    publisher: 'Manning',
    pages: 504,
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781617294433-L.jpg',
    rating: 4.8,
    ratingCount: 189,
    totalCopies: 6,
    availableCopies: 2,
    shelfLocation: 'Floor 2 — Shelf AI-07',
    featured: true,
    tags: ['Deep Learning', 'Keras', 'Python', 'Neural Networks'],
    description: 'Introduces deep learning using Python and Keras without complex mathematical jargon.'
  },
  {
    customId: 'b-104',
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '9780441013593',
    genre: 'Sci-Fi',
    category: 'Epic Science Fiction',
    publishedYear: 1965,
    publisher: 'Chilton Books',
    pages: 688,
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780441013593-L.jpg',
    rating: 4.9,
    ratingCount: 940,
    totalCopies: 10,
    availableCopies: 4,
    shelfLocation: 'Floor 3 — Shelf SF-01',
    featured: true,
    tags: ['Sci-Fi', 'Classics', 'Space Opera'],
    description: 'Set on the desert planet Arrakis, Dune tells the story of Paul Atreides and the battle for spice.'
  },
  {
    customId: 'b-105',
    title: 'Atomic Habits',
    author: 'James Clear',
    isbn: '9780735211292',
    genre: 'Psychology',
    category: 'Self Improvement',
    publishedYear: 2018,
    publisher: 'Avery',
    pages: 320,
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
    rating: 4.8,
    ratingCount: 1250,
    totalCopies: 15,
    availableCopies: 7,
    shelfLocation: 'Floor 1 — Shelf PSY-03',
    featured: false,
    tags: ['Productivity', 'Habits', 'Behavioral Psychology'],
    description: 'A proven framework for improving every day through tiny changes that deliver remarkable results.'
  }
];

/**
 * Core seed logic — runs on an EXISTING Mongoose connection.
 * Safe to call from server.js without disconnecting.
 */
export const seedData = async () => {
  const allowReset = process.argv.includes('--reset');

  console.log('🌱 Running BookNest auto-seed...');

  if (allowReset) {
    await User.deleteMany({});
    await Book.deleteMany({});
    await Borrowing.deleteMany({});
    console.log('🧹 Collections cleared (--reset).');
  }

  // 1. Users
  let usersCreated = 0;
  const userMap = {};
  for (const userData of SEED_USERS) {
    const existing = await User.findOne({ email: userData.email });
    if (!existing) {
      const user = await User.create(userData);
      userMap[user.email] = user;
      usersCreated++;
    } else {
      userMap[existing.email] = existing;
    }
  }
  console.log(`👤 Users: ${usersCreated} seeded.`);

  // 2. Books
  let booksCreated = 0;
  const bookMap = {};
  for (const bookData of SEED_BOOKS) {
    const existing = await Book.findOne({ isbn: bookData.isbn });
    if (!existing) {
      const book = await Book.create(bookData);
      bookMap[book.customId] = book;
      booksCreated++;
    } else {
      bookMap[existing.customId || existing.isbn] = existing;
    }
  }
  console.log(`📚 Books: ${booksCreated} seeded.`);

  // 3. Sample Borrowing
  const studentUser = userMap['alex.morgan@university.edu'];
  const ddiaBook = bookMap['b-101'];
  let borrowingsCreated = 0;
  if (studentUser && ddiaBook) {
    const existingLoan = await Borrowing.findOne({ customId: 'br-901' });
    if (!existingLoan) {
      await Borrowing.create({
        customId: 'br-901',
        user: studentUser._id,
        book: ddiaBook._id,
        bookId: ddiaBook.customId || ddiaBook._id.toString(),
        bookTitle: ddiaBook.title,
        bookAuthor: ddiaBook.author,
        bookCover: ddiaBook.coverUrl,
        borrowDate: '2026-10-10',
        dueDate: '2026-10-24',
        status: 'due-soon',
        renewalsLeft: 1
      });
      borrowingsCreated++;
    }
  }
  console.log(`📋 Borrowings: ${borrowingsCreated} seeded.`);
  console.log('✨ Seed complete.');
};

/**
 * CLI wrapper — opens its own connection, seeds, then closes.
 * Used by: npm run seed
 */
export const seedDatabase = async () => {
  console.log('🌱 Starting standalone BookNest seed...');
  await connectDB();
  try {
    await seedData();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    throw err;
  } finally {
    await disconnectDB();
  }
};

// Run when executed directly via CLI
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedData as default };
