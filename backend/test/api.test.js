/**
 * BookNest API Test Suite
 * Run: node backend/test/api.test.js
 */

const BASE = 'http://localhost:5000/api';
const DELAY = 120; // ms between requests to avoid ECONNRESET

let passCount = 0, failCount = 0;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const request = async (method, path, body, token, retries = 2) => {
  await sleep(DELAY);
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const opts = { method, headers: { 'Content-Type': 'application/json' } };
      if (token) opts.headers.Authorization = `Bearer ${token}`;
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(`${BASE}${path}`, opts);
      const data = await res.json().catch(() => ({}));
      return { status: res.status, ok: res.ok, data };
    } catch (err) {
      if (attempt < retries) {
        await sleep(300 * (attempt + 1));
        continue;
      }
      throw err;
    }
  }
};

const test = (name, fn) => async () => {
  try {
    await fn();
    console.log(`  ✅  ${name}`);
    passCount++;
  } catch (err) {
    console.log(`  ❌  ${name}`);
    console.log(`       ${err.message}`);
    failCount++;
  }
};

const assert = (cond, msg) => { if (!cond) throw new Error(msg || 'Assertion failed'); };
const eq = (a, b) => assert(a === b, `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);

let studentToken, adminToken, bookIds;

const run = async () => {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('   BookNest API Test Suite');
  console.log('══════════════════════════════════════════════════════\n');

  // Wait for server to be ready
  console.log('⏳ Waiting for server...');
  for (let i = 0; i < 10; i++) {
    try {
      const r = await fetch(`${BASE}/health`);
      if (r.ok) { console.log('✅ Server ready\n'); break; }
    } catch { await sleep(1000); }
  }

  // ─── AUTH ───────────────────────────────────────────────────────────────────
  console.log('─── Auth ───────────────────────────────────────────────');

  await test('Register new student (role must be "user")', async () => {
    const r = await request('POST', '/auth/register', {
      name: 'API Tester', email: 'apitester@uni.edu',
      password: 'pass1234', memberId: 'BN-T99', department: 'Testing'
    });
    assert(r.status === 201 || r.status === 200 || r.status === 409, `Got ${r.status}: ${JSON.stringify(r.data)}`);
    // 409 = already registered (re-runs are fine)
    if (r.status !== 409) {
      assert(r.data.token, 'No token returned');
      eq(r.data.user.role, 'user');
    }
  })();

  await test('Public register ignores role=admin in body', async () => {
    const r = await request('POST', '/auth/register', {
      name: 'Attacker', email: `attacker${Date.now()}@uni.edu`,
      password: 'attack1234', memberId: `BN-A${Date.now()}`,
      department: 'Hacking', role: 'admin'
    });
    assert(r.data.user?.role !== 'admin', `SECURITY FAIL: role=${r.data.user?.role}`);
  })();

  await test('Register with missing name/email returns 400', async () => {
    const r = await request('POST', '/auth/register', { password: 'x' });
    assert(r.status === 400 || r.status === 422, `Got ${r.status}`);
  })();

  await test('Login as seeded student (alex.morgan@university.edu)', async () => {
    const r = await request('POST', '/auth/login', {
      email: 'alex.morgan@university.edu', password: 'student1234'
    });
    assert(r.ok, `Login failed (${r.status}): ${r.data.message}`);
    assert(r.data.token, 'No token');
    studentToken = r.data.token;
  })();

  await test('Login as seeded admin (admin@university.edu)', async () => {
    const r = await request('POST', '/auth/login', {
      email: 'admin@university.edu', password: 'admin1234'
    });
    assert(r.ok, `Admin login failed (${r.status}): ${r.data.message}`);
    adminToken = r.data.token;
  })();

  await test('Wrong password returns 401', async () => {
    const r = await request('POST', '/auth/login', {
      email: 'alex.morgan@university.edu', password: 'wrongpassword!'
    });
    eq(r.status, 401);
  })();

  await test('GET /auth/me without token → 401', async () => {
    const r = await request('GET', '/auth/me');
    eq(r.status, 401);
  })();

  await test('GET /auth/me with valid token → user object', async () => {
    const r = await request('GET', '/auth/me', null, studentToken);
    assert(r.ok, `Failed: ${r.data.message}`);
    assert(r.data.user?.name, 'No name in response');
    eq(r.data.user.role, 'user');
  })();

  // ─── BOOKS ──────────────────────────────────────────────────────────────────
  console.log('\n─── Books ──────────────────────────────────────────────');

  await test('GET /books returns books array + pagination', async () => {
    const r = await request('GET', '/books?limit=10');
    assert(r.ok, `Failed: ${r.data.message}`);
    assert(Array.isArray(r.data.books), 'books must be array');
    assert(r.data.books.length > 0, 'Expected seeded books');
    assert(r.data.pagination, 'No pagination object');
    bookIds = r.data.books.map(b => b._id);
  })();

  await test('Pagination: page=1&limit=2 returns 2 books', async () => {
    const r = await request('GET', '/books?page=1&limit=2');
    assert(r.data.books?.length <= 2, 'More than limit returned');
    eq(r.data.pagination.currentPage, 1);
  })();

  await test('Search "Dune" finds Dune in results', async () => {
    const r = await request('GET', '/books?search=Dune');
    assert(r.ok, 'Search failed');
    assert(r.data.books?.some(b => b.title.includes('Dune')), '"Dune" not found in search results');
  })();

  await test('Filter genre=Computer Science → all results are CS', async () => {
    const r = await request('GET', '/books?genre=Computer+Science');
    assert(r.ok, 'Filter failed');
    if (r.data.books.length > 0) {
      assert(r.data.books.every(b => b.genre === 'Computer Science'), 'Genre filter not applied');
    }
  })();

  await test('Filter availability=available → all have availableCopies>0', async () => {
    const r = await request('GET', '/books?availability=available');
    assert(r.ok, 'Filter failed');
    assert(r.data.books.every(b => b.availableCopies > 0), 'Unavailable book in results');
  })();

  await test('GET /books/:id returns a single book', async () => {
    assert(bookIds?.length > 0, 'No bookIds from list test');
    const r = await request('GET', `/books/${bookIds[0]}`);
    assert(r.ok, `Failed: ${r.data.message}`);
    assert(r.data.book, 'No book in response');
  })();

  await test('GET /books/invalid-id returns 400/404', async () => {
    const r = await request('GET', '/books/not-a-mongo-id');
    assert(r.status === 400 || r.status === 404, `Expected 400/404, got ${r.status}`);
  })();

  await test('Student POST /books → 403', async () => {
    const r = await request('POST', '/books', {
      title: 'Unauthorized', author: 'Test', isbn: '0000000000001',
      genre: 'Test', totalCopies: 1
    }, studentToken);
    eq(r.status, 403);
  })();

  let newBookId;
  await test('Admin POST /books creates book → 201', async () => {
    const r = await request('POST', '/books', {
      title: 'Test Book Created By Admin', author: 'Test Author',
      isbn: '0000000000099', genre: 'Testing', category: 'Unit Tests',
      publishedYear: 2026, publisher: 'TestPress', totalCopies: 3
    }, adminToken);
    assert(r.status === 201 || r.ok, `Got ${r.status}: ${r.data.message}`);
    newBookId = r.data.book?._id;
    assert(newBookId, 'No book ID returned');
  })();

  await test('Admin PUT /books/:id updates book', async () => {
    assert(newBookId, 'No book to update');
    const r = await request('PUT', `/books/${newBookId}`, { rating: 4.2, description: 'Updated desc' }, adminToken);
    assert(r.ok, `Update failed: ${r.data.message}`);
  })();

  await test('Admin DELETE /books/:id removes book', async () => {
    assert(newBookId, 'No book to delete');
    const r = await request('DELETE', `/books/${newBookId}`, null, adminToken);
    assert(r.ok, `Delete failed: ${r.data.message}`);
  })();

  // ─── BORROWINGS ─────────────────────────────────────────────────────────────
  console.log('\n─── Borrowings ─────────────────────────────────────────');

  await test('GET /borrowings/my without auth → 401', async () => {
    const r = await request('GET', '/borrowings/my');
    eq(r.status, 401);
  })();

  await test('GET /borrowings/my returns array', async () => {
    const r = await request('GET', '/borrowings/my', null, studentToken);
    assert(r.ok, `Failed: ${r.data.message}`);
    assert(Array.isArray(r.data.borrowings), 'borrowings should be array');
  })();

  let borrowTargetId;
  await test('Find available book to borrow', async () => {
    const r = await request('GET', '/books?availability=available&limit=10');
    // Skip books already in due-soon borrowing (b-101)
    const usable = r.data.books.find(b => b.availableCopies > 0);
    assert(usable, 'No available books in DB');
    borrowTargetId = usable._id;
  })();

  let borrowingId;
  await test('POST /borrowings/borrow → creates borrowing', async () => {
    assert(borrowTargetId, 'No available book to borrow');
    const r = await request('POST', '/borrowings/borrow', { bookId: borrowTargetId }, studentToken);
    assert(r.ok || r.status === 201, `Borrow failed (${r.status}): ${r.data.message}`);
    borrowingId = r.data.borrowing?._id;
    assert(borrowingId, 'No borrowing ID returned');
    eq(r.data.borrowing.status, 'active');
  })();

  await test('POST /borrowings/borrow same book → 409 (duplicate loan)', async () => {
    assert(borrowTargetId, 'No book');
    const r = await request('POST', '/borrowings/borrow', { bookId: borrowTargetId }, studentToken);
    eq(r.status, 409);
  })();

  await test('PUT /borrowings/:id/renew → renewalsLeft decreases', async () => {
    assert(borrowingId, 'No borrowing ID');
    const r = await request('PUT', `/borrowings/${borrowingId}/renew`, null, studentToken);
    assert(r.ok, `Renew failed: ${r.data.message}`);
    assert(typeof r.data.borrowing.renewalsLeft === 'number', 'renewalsLeft missing');
    assert(r.data.borrowing.renewalsLeft < 2, 'Count should have decreased');
  })();

  await test('PUT /borrowings/:id/return → status=returned', async () => {
    assert(borrowingId, 'No borrowing ID');
    const r = await request('PUT', `/borrowings/${borrowingId}/return`, null, studentToken);
    assert(r.ok, `Return failed: ${r.data.message}`);
    eq(r.data.borrowing.status, 'returned');
  })();

  await test('PUT /borrowings/:id/return on already-returned → 400/409', async () => {
    assert(borrowingId, 'No borrowing ID');
    const r = await request('PUT', `/borrowings/${borrowingId}/return`, null, studentToken);
    assert(r.status === 400 || r.status === 409, `Got ${r.status}`);
  })();

  await test('Admin cannot return student\'s book (ownership enforced)', async () => {
    assert(borrowingId, 'No borrowing');
    const r = await request('PUT', `/borrowings/${borrowingId}/return`, null, adminToken);
    assert(r.status === 403 || r.status === 404, `Got ${r.status}`);
  })();

  // ─── WISHLIST ────────────────────────────────────────────────────────────────
  console.log('\n─── Wishlist ───────────────────────────────────────────');

  await test('GET /wishlist without auth → 401', async () => {
    const r = await request('GET', '/wishlist');
    eq(r.status, 401);
  })();

  await test('GET /wishlist returns bookIds array', async () => {
    const r = await request('GET', '/wishlist', null, studentToken);
    assert(r.ok, 'Failed');
    assert(Array.isArray(r.data.bookIds), 'bookIds must be array');
  })();

  await test('POST /wishlist/toggle adds book', async () => {
    assert(bookIds?.[0], 'No bookId');
    const r = await request('POST', '/wishlist/toggle', { bookId: bookIds[0] }, studentToken);
    assert(r.ok, `Toggle failed: ${r.data.message}`);
    assert(r.data.bookIds.includes(bookIds[0]), 'Book not added to wishlist');
  })();

  await test('POST /wishlist/toggle again removes book', async () => {
    assert(bookIds?.[0], 'No bookId');
    const r = await request('POST', '/wishlist/toggle', { bookId: bookIds[0] }, studentToken);
    assert(r.ok, 'Toggle failed');
    assert(!r.data.bookIds.includes(bookIds[0]), 'Book should be removed after 2nd toggle');
  })();

  await test('POST /wishlist/toggle without auth → 401', async () => {
    const r = await request('POST', '/wishlist/toggle', { bookId: bookIds[0] });
    eq(r.status, 401);
  })();

  // ─── REVIEWS ─────────────────────────────────────────────────────────────────
  console.log('\n─── Reviews ────────────────────────────────────────────');

  await test('GET /reviews is public', async () => {
    const r = await request('GET', '/reviews');
    assert(r.ok, 'Failed');
    assert(Array.isArray(r.data.reviews), 'reviews must be array');
  })();

  await test('POST /reviews without auth → 401', async () => {
    const r = await request('POST', '/reviews', { bookId: bookIds[0], rating: 4, comment: 'test' });
    eq(r.status, 401);
  })();

  await test('POST /reviews with rating=10 → 400 validation error', async () => {
    const r = await request('POST', '/reviews', { bookId: bookIds[0], rating: 10, comment: 'test' }, studentToken);
    assert(r.status === 400 || r.status === 422, `Got ${r.status}`);
  })();

  let reviewId;
  await test('POST /reviews creates review → 201', async () => {
    assert(bookIds?.[0], 'No bookId');
    const r = await request('POST', '/reviews', {
      bookId: bookIds[0], rating: 4,
      comment: 'This book really helped me understand distributed systems.'
    }, studentToken);
    assert(r.ok || r.status === 201, `Submit failed (${r.status}): ${r.data.message}`);
    reviewId = r.data.review?._id;
    assert(reviewId, 'No review ID returned');
    assert(r.data.review.comment?.length > 0, 'No comment in response');
  })();

  await test('DELETE /reviews/:id by non-owner student fails (403)', async () => {
    // Create a second review with admin, then try to delete with student
    const r2 = await request('POST', '/reviews', {
      bookId: bookIds[0], rating: 3,
      comment: 'Admin test review for auth testing.'
    }, adminToken);
    if (r2.ok || r2.status === 201) {
      const adminReviewId = r2.data.review?._id;
      const delR = await request('DELETE', `/reviews/${adminReviewId}`, null, studentToken);
      assert(delR.status === 403, `Expected 403, got ${delR.status}`);
      // Clean up: admin deletes their own
      await request('DELETE', `/reviews/${adminReviewId}`, null, adminToken);
    } else {
      throw new Error(`Could not create admin review: ${r2.data.message}`);
    }
  })();

  await test('DELETE /reviews/:id by author → 200', async () => {
    assert(reviewId, 'No review ID');
    const r = await request('DELETE', `/reviews/${reviewId}`, null, studentToken);
    assert(r.ok, `Delete failed: ${r.data.message}`);
  })();

  // ─── PROFILE ─────────────────────────────────────────────────────────────────
  console.log('\n─── Profile ────────────────────────────────────────────');

  await test('GET /auth/profile without auth → 401', async () => {
    const r = await request('GET', '/auth/profile');
    eq(r.status, 401);
  })();

  await test('GET /auth/profile → returns user object', async () => {
    const r = await request('GET', '/auth/profile', null, studentToken);
    assert(r.ok, `Failed: ${r.data.message}`);
    assert(r.data.user?.name, 'No name in profile response');
    assert(r.data.user?.email, 'No email in profile response');
  })();

  await test('PUT /auth/profile updates name + preferredGenres', async () => {
    const r = await request('PUT', '/auth/profile', {
      name: 'Alex Morgan (Updated)',
      preferredGenres: ['Computer Science', 'Philosophy'],
      readingGoal: { target: 30 }
    }, studentToken);
    assert(r.ok, `Update failed: ${r.data.message}`);
    assert(r.data.user?.preferredGenres?.includes('Philosophy'), 'preferredGenres not updated');
  })();

  await test('PUT /auth/profile role escalation is blocked', async () => {
    const r = await request('PUT', '/auth/profile', { role: 'admin' }, studentToken);
    // Response should succeed (200) but role should NOT be admin
    const role = r.data.user?.role;
    assert(role !== 'admin', `SECURITY: role escalated to admin!`);
  })();

  // ─── ADMIN ───────────────────────────────────────────────────────────────────
  console.log('\n─── Admin Access ───────────────────────────────────────');

  await test('Admin GET /borrowings → all borrowings visible', async () => {
    const r = await request('GET', '/borrowings', null, adminToken);
    assert(r.ok, `Failed: ${r.data.message}`);
    assert(Array.isArray(r.data.borrowings), 'Should return array');
  })();

  await test('Student GET /borrowings (admin route) → 403', async () => {
    const r = await request('GET', '/borrowings', null, studentToken);
    assert(r.status === 403, `Expected 403, got ${r.status}`);
  })();

  // ─── SUMMARY ─────────────────────────────────────────────────────────────────
  const total = passCount + failCount;
  console.log('\n══════════════════════════════════════════════════════');
  console.log(`   Results: ${passCount}/${total} passed  |  ${failCount} failed`);
  if (failCount === 0) console.log('   🎉 ALL TESTS PASSED!');
  console.log('══════════════════════════════════════════════════════\n');
  process.exit(failCount > 0 ? 1 : 0);
};

run().catch(err => {
  console.error('\nTest runner crashed:', err);
  process.exit(1);
});
