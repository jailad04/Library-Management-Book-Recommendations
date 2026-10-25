import dotenv from 'dotenv';
import { connectDB, disconnectDB, getDBStatus } from '../config/db.js';
import User from '../models/User.js';
import Book from '../models/Book.js';
import Borrowing from '../models/Borrowing.js';
import { createApp } from '../app.js';

dotenv.config();

const runVerification = async () => {
  console.log('🧪 Starting BookNest Backend Verification Suite...\n');
  let passedTests = 0;
  let totalTests = 0;

  const assert = (condition, name) => {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${name}`);
    }
  };

  try {
    // Test 1: Database Connection
    console.log('📌 Test Group 1: Database Connection');
    await connectDB();
    const dbStatus = getDBStatus();
    assert(dbStatus.connected === true, `MongoDB connected successfully (Host: ${dbStatus.host}, DB: ${dbStatus.name})`);

    // Test 2: User Model Validation & Password Hashing
    console.log('\n📌 Test Group 2: User Model & Password Hashing');
    const testEmail = `test.scholar.${Date.now()}@university.edu`;
    const user = await User.create({
      name: 'Verification User',
      email: testEmail,
      password: 'plainSecretPassword123',
      memberId: `BN-TEST-${Date.now()}`,
      department: 'Data Science & AI'
    });
    assert(user.id && user._id, 'User virtual id and _id generated');
    assert(user.password !== 'plainSecretPassword123', 'Password automatically hashed with bcrypt');

    // Retrieve user with password explicitly selected to verify match
    const userWithPw = await User.findById(user._id).select('+password');
    const isMatch = await userWithPw.matchPassword('plainSecretPassword123');
    const isNotMatch = await userWithPw.matchPassword('wrongPassword!');
    assert(isMatch === true, 'matchPassword() returns true for correct credentials');
    assert(isNotMatch === false, 'matchPassword() returns false for incorrect credentials');

    // Test duplicate email error handling
    let duplicateCaught = false;
    try {
      await User.create({
        name: 'Duplicate User',
        email: testEmail,
        password: 'password123',
        memberId: `BN-DUP-${Date.now()}`
      });
    } catch (err) {
      duplicateCaught = err.code === 11000 || err.name === 'MongoServerError';
    }
    assert(duplicateCaught === true, 'Unique email constraint blocks duplicate registrations');

    // Test 3: Book Model & Inventory Validation
    console.log('\n📌 Test Group 3: Book Model & Inventory Validation');
    const testIsbn = `978${Date.now().toString().slice(-10)}`;
    const book = await Book.create({
      customId: `b-${Date.now().toString().slice(-4)}`,
      title: 'Database Systems Architecture',
      author: 'Prof. Alan Stone',
      isbn: testIsbn,
      genre: 'Computer Science',
      category: 'Databases',
      coverUrl: `https://covers.openlibrary.org/b/isbn/${testIsbn}-L.jpg`,
      totalCopies: 5,
      availableCopies: 5
    });
    assert(book.id && book.title === 'Database Systems Architecture', 'Book created with required fields');

    // Test inventory constraint: availableCopies cannot exceed totalCopies
    let inventoryErrorCaught = false;
    try {
      await Book.create({
        title: 'Overallocated Book',
        author: 'Author',
        isbn: `978${Date.now() + 1}`,
        genre: 'Computer Science',
        coverUrl: 'https://example.com/cover.jpg',
        totalCopies: 3,
        availableCopies: 10 // Invalid: exceeds totalCopies
      });
    } catch (err) {
      inventoryErrorCaught = err.name === 'ValidationError';
    }
    assert(inventoryErrorCaught === true, 'Inventory validator rejects availableCopies > totalCopies');

    // Test 4: Borrowing Model Validation
    console.log('\n📌 Test Group 4: Borrowing Model Validation');
    const borrowing = await Borrowing.create({
      customId: `br-test-${Date.now().toString().slice(-4)}`,
      user: user._id,
      book: book._id,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookCover: book.coverUrl,
      borrowDate: '2026-10-25',
      dueDate: '2026-11-08',
      status: 'active',
      renewalsLeft: 2
    });
    assert(borrowing.id && borrowing.status === 'active', 'Borrowing loan record created linked to user and book');

    // Test invalid status enum rejection
    let enumErrorCaught = false;
    try {
      await Borrowing.create({
        user: user._id,
        book: book._id,
        bookId: book.id,
        bookTitle: book.title,
        bookAuthor: book.author,
        dueDate: '2026-11-08',
        status: 'invalid-status-xyz'
      });
    } catch (err) {
      enumErrorCaught = err.name === 'ValidationError';
    }
    assert(enumErrorCaught === true, 'Borrowing schema rejects invalid lifecycle status enum values');

    // Test 5: Express App & Health Endpoint
    console.log('\n📌 Test Group 5: Express App & Health Check Endpoint');
    const app = createApp();

    // Mock Express request/response test for Health Endpoint
    let healthResponse = null;
    const mockReq = { method: 'GET', originalUrl: '/api/health' };
    const mockRes = {
      statusCode: 200,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        healthResponse = { statusCode: this.statusCode, data };
        return this;
      }
    };

    const healthController = await import('../controllers/healthController.js');
    healthController.getHealth(mockReq, mockRes);

    assert(healthResponse.statusCode === 200, 'Health endpoint responds with HTTP 200');
    assert(healthResponse.data.status === 'healthy', 'Health check confirms API status is "healthy"');
    assert(healthResponse.data.database.connected === true, 'Health check verifies database connection is active');

    // Clean up test records
    await User.findByIdAndDelete(user._id);
    await Book.findByIdAndDelete(book._id);
    await Borrowing.findByIdAndDelete(borrowing._id);
    console.log('\n🧹 Verification test artifacts cleaned up.');

    console.log(`\n========================================`);
    console.log(`🎉 VERIFICATION RESULT: ${passedTests}/${totalTests} Tests Passed`);
    console.log(`========================================\n`);

    if (passedTests !== totalTests) {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Unhandled exception during verification:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
};

runVerification();
