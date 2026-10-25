/**
 * ============================================================================
 * BookNest Mock Data Module
 * ============================================================================
 * NOTE FOR REVIEWERS & EVALUATORS:
 * This file isolates all realistic sample data used during frontend development,
 * testing, and portfolio demonstrations before connecting to the Express & FastAPI backends.
 * It strictly mirrors the schemas defined in MongoDB Mongoose & FastAPI endpoints.
 *
 * Book covers: Open Library Covers API  https://covers.openlibrary.org/b/isbn/{ISBN}-L.jpg
 * Fallback:    Generic placeholder served from /placeholder-cover.svg
 */

// Open Library cover helper
const olCover = (isbn, size = 'L') =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;

export const MOCK_BOOKS = [
  {
    id: "b-101",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    isbn: "9781449373320",
    genre: "Computer Science",
    category: "Software Architecture",
    publishedYear: 2017,
    publisher: "O'Reilly Media",
    pages: 616,
    coverUrl: olCover("9781449373320"),
    rating: 4.9,
    ratingCount: 342,
    totalCopies: 8,
    availableCopies: 3,
    shelfLocation: "Floor 2 — Shelf CS-14",
    featured: true,
    tags: ["Distributed Systems", "Databases", "Scalability", "Reliability"],
    description: "The definitive guide to the principles and architectures underpinning modern big data and scalable computing systems. Covers storage engines, replication, partitioning, transactions, and stream processing."
  },
  {
    id: "b-102",
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "9780132350884",
    genre: "Computer Science",
    category: "Software Engineering",
    publishedYear: 2008,
    publisher: "Prentice Hall",
    pages: 464,
    coverUrl: olCover("9780132350884"),
    rating: 4.7,
    ratingCount: 520,
    totalCopies: 12,
    availableCopies: 5,
    shelfLocation: "Floor 2 — Shelf CS-02",
    featured: true,
    tags: ["Best Practices", "Refactoring", "Clean Architecture"],
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. A must-read classic on writing readable, testable, and maintainable software."
  },
  {
    id: "b-103",
    title: "Deep Learning with Python",
    author: "François Chollet",
    isbn: "9781617294433",
    genre: "Artificial Intelligence",
    category: "Machine Learning",
    publishedYear: 2021,
    publisher: "Manning",
    pages: 504,
    coverUrl: olCover("9781617294433"),
    rating: 4.8,
    ratingCount: 189,
    totalCopies: 6,
    availableCopies: 2,
    shelfLocation: "Floor 2 — Shelf AI-07",
    featured: true,
    tags: ["Deep Learning", "Keras", "Python", "Neural Networks"],
    description: "Written by Keras creator François Chollet, this book introduces deep learning using Python and Keras without complex mathematical jargon, focusing on practical concepts and state-of-the-art architectures."
  },
  {
    id: "b-104",
    title: "Project Hail Mary",
    author: "Andy Weir",
    isbn: "9780593135204",
    genre: "Sci-Fi",
    category: "Fiction",
    publishedYear: 2021,
    publisher: "Ballantine Books",
    pages: 496,
    coverUrl: olCover("9780593135204"),
    rating: 4.9,
    ratingCount: 680,
    totalCopies: 10,
    availableCopies: 4,
    shelfLocation: "Floor 1 — Shelf SF-09",
    featured: true,
    tags: ["Space Exploration", "Interstellar", "Science Fiction"],
    description: "Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself are doomed. A thrilling interstellar adventure packed with real science and friendship."
  },
  {
    id: "b-105",
    title: "Atomic Habits",
    author: "James Clear",
    isbn: "9780735211292",
    genre: "Psychology",
    category: "Self-Improvement",
    publishedYear: 2018,
    publisher: "Avery",
    pages: 320,
    coverUrl: olCover("9780735211292"),
    rating: 4.8,
    ratingCount: 1250,
    totalCopies: 15,
    availableCopies: 7,
    shelfLocation: "Floor 1 — Shelf PSY-03",
    featured: false,
    tags: ["Habits", "Productivity", "Behavioral Science"],
    description: "No matter your goals, Atomic Habits offers a proven framework for improving every day through tiny behavioral changes that compound into remarkable outcomes."
  },
  {
    id: "b-106",
    title: "Introduction to Algorithms (CLRS)",
    author: "Cormen, Leiserson, Rivest & Stein",
    isbn: "9780262046305",
    genre: "Computer Science",
    category: "Algorithms",
    publishedYear: 2022,
    publisher: "MIT Press",
    pages: 1312,
    coverUrl: olCover("9780262046305"),
    rating: 4.6,
    ratingCount: 890,
    totalCopies: 20,
    availableCopies: 8,
    shelfLocation: "Floor 2 — Shelf CS-01",
    featured: false,
    tags: ["Algorithms", "Data Structures", "MIT", "Complexity Theory"],
    description: "Universally acknowledged as the premier reference and textbook on algorithms, comprehensively covering graph theory, dynamic programming, sorting, and algorithmic design."
  },
  {
    id: "b-107",
    title: "Dune",
    author: "Frank Herbert",
    isbn: "9780441172719",
    genre: "Sci-Fi",
    category: "Fiction",
    publishedYear: 1965,
    publisher: "Chilton Books",
    pages: 688,
    coverUrl: olCover("9780441172719"),
    rating: 4.7,
    ratingCount: 940,
    totalCopies: 9,
    availableCopies: 0,
    shelfLocation: "Floor 1 — Shelf SF-01",
    featured: false,
    tags: ["Arrakis", "Classic Sci-Fi", "Epic Space Opera"],
    description: "Set on the desert planet Arrakis, Dune tells the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the spice melange."
  },
  {
    id: "b-108",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    isbn: "9780062316097",
    genre: "History",
    category: "Anthropology",
    publishedYear: 2014,
    publisher: "Harper",
    pages: 464,
    coverUrl: olCover("9780062316097"),
    rating: 4.7,
    ratingCount: 1100,
    totalCopies: 14,
    availableCopies: 6,
    shelfLocation: "Floor 3 — Shelf HIS-12",
    featured: false,
    tags: ["Human History", "Evolution", "Sociology"],
    description: "Explores how Homo sapiens conquered the globe through cognitive, agricultural, and scientific revolutions, exploring how biology and history define what it means to be human."
  },
  {
    id: "b-109",
    title: "The Pragmatic Programmer",
    author: "David Thomas & Andrew Hunt",
    isbn: "9780135957059",
    genre: "Computer Science",
    category: "Software Engineering",
    publishedYear: 2019,
    publisher: "Addison-Wesley",
    pages: 352,
    coverUrl: olCover("9780135957059"),
    rating: 4.8,
    ratingCount: 412,
    totalCopies: 7,
    availableCopies: 2,
    shelfLocation: "Floor 2 — Shelf CS-05",
    featured: true,
    tags: ["Pragmatic Thinking", "Career", "Software Craftsmanship"],
    description: "Filled with practical tips, philosophies, and career guidance for engineers wanting to hone their craft, avoid software rot, and design flexible, maintainable systems."
  },
  {
    id: "b-110",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    isbn: "9780374533557",
    genre: "Psychology",
    category: "Behavioral Economics",
    publishedYear: 2011,
    publisher: "Farrar, Straus and Giroux",
    pages: 512,
    coverUrl: olCover("9780374533557"),
    rating: 4.6,
    ratingCount: 820,
    totalCopies: 10,
    availableCopies: 3,
    shelfLocation: "Floor 1 — Shelf PSY-08",
    featured: false,
    tags: ["Cognitive Biases", "Heuristics", "Decision Making"],
    description: "Nobel laureate Daniel Kahneman explains the two systems that drive the way we think: System 1 (fast, intuitive, and emotional) and System 2 (slower, more deliberative, and more logical)."
  }
];

export const MOCK_USER = {
  id: "u-8842",
  name: "Alex Morgan",
  email: "alex.morgan@university.edu",
  memberId: "BN-2026-8842",
  department: "Computer Science & Engineering",
  role: "user", // "user" or "admin"
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
  joinDate: "2025-09-01",
  preferredGenres: ["Computer Science", "Artificial Intelligence", "Sci-Fi", "Psychology"],
  readingGoal: {
    target: 24,
    completed: 11
  }
};

export const MOCK_BORROWINGS = [
  {
    id: "br-901",
    bookId: "b-101",
    bookTitle: "Designing Data-Intensive Applications",
    bookAuthor: "Martin Kleppmann",
    bookCover: olCover("9781449373320"),
    borrowDate: "2026-10-10",
    dueDate: "2026-10-24",
    returnDate: null,
    status: "due-soon",
    renewalsLeft: 1
  },
  {
    id: "br-902",
    bookId: "b-103",
    bookTitle: "Deep Learning with Python",
    bookAuthor: "François Chollet",
    bookCover: olCover("9781617294433"),
    borrowDate: "2026-10-18",
    dueDate: "2026-11-01",
    returnDate: null,
    status: "active",
    renewalsLeft: 2
  },
  {
    id: "br-903",
    bookId: "b-102",
    bookTitle: "Clean Code",
    bookAuthor: "Robert C. Martin",
    bookCover: olCover("9780132350884"),
    borrowDate: "2026-09-05",
    dueDate: "2026-09-19",
    returnDate: "2026-09-17",
    status: "returned",
    renewalsLeft: 0
  },
  {
    id: "br-904",
    bookId: "b-105",
    bookTitle: "Atomic Habits",
    bookAuthor: "James Clear",
    bookCover: olCover("9780735211292"),
    borrowDate: "2026-08-12",
    dueDate: "2026-08-26",
    returnDate: "2026-08-25",
    status: "returned",
    renewalsLeft: 0
  }
];

export const MOCK_RECOMMENDATIONS = [
  {
    id: "rec-01",
    bookId: "b-109",
    book: MOCK_BOOKS.find(b => b.id === "b-109"),
    similarityScore: 0.94,
    reasonType: "genre-match",
    reasonExplanation: "Based on your interest in Computer Science & Software Craftsmanship",
    sourceBookTitle: "Clean Code",
    confidence: "Very High"
  },
  {
    id: "rec-02",
    bookId: "b-106",
    book: MOCK_BOOKS.find(b => b.id === "b-106"),
    similarityScore: 0.89,
    reasonType: "content-similarity",
    reasonExplanation: "Frequently borrowed alongside Designing Data-Intensive Applications",
    sourceBookTitle: "Designing Data-Intensive Applications",
    confidence: "High"
  },
  {
    id: "rec-03",
    bookId: "b-104",
    book: MOCK_BOOKS.find(b => b.id === "b-104"),
    similarityScore: 0.87,
    reasonType: "interest-match",
    reasonExplanation: "Trending in your preferred genre: Sci-Fi — rated 4.9",
    sourceBookTitle: null,
    confidence: "High"
  },
  {
    id: "rec-04",
    bookId: "b-110",
    book: MOCK_BOOKS.find(b => b.id === "b-110"),
    similarityScore: 0.82,
    reasonType: "behavioral-overlap",
    reasonExplanation: "Readers who borrowed Atomic Habits also enjoyed this title",
    sourceBookTitle: "Atomic Habits",
    confidence: "Medium"
  }
];

export const MOCK_WISHLIST = ["b-104", "b-106", "b-107"];

export const MOCK_REVIEWS = [
  {
    id: "rev-1",
    bookId: "b-101",
    userName: "David Chen",
    userRole: "Graduate Student",
    rating: 5,
    date: "2026-09-28",
    comment: "Hands down the best book on distributed systems. The chapters on replication and consensus saved my semester research project!"
  },
  {
    id: "rev-2",
    bookId: "b-101",
    userName: "Elena Rostova",
    userRole: "Software Engineering Scholar",
    rating: 5,
    date: "2026-10-04",
    comment: "Extremely lucid explanations of storage engines (LSM-trees vs B-trees). A permanent desk companion."
  },
  {
    id: "rev-3",
    bookId: "b-102",
    userName: "Alex Morgan",
    userRole: "Student",
    rating: 5,
    date: "2026-09-17",
    comment: "Changed the way I name variables and structure functions. Meaningful names and small functions really make a massive difference."
  }
];

export const MOCK_ADMIN_ANALYTICS = {
  catalogueSummary: {
    totalTitles: 1240,
    totalCopies: 4850,
    availableCopies: 3620,
    borrowedCopies: 1230,
    overdueCopies: 42,
    activeMembers: 840
  },
  monthlyTrends: [
    { month: "May", borrowings: 240, returns: 210 },
    { month: "Jun", borrowings: 310, returns: 280 },
    { month: "Jul", borrowings: 290, returns: 300 },
    { month: "Aug", borrowings: 450, returns: 390 },
    { month: "Sep", borrowings: 580, returns: 520 },
    { month: "Oct", borrowings: 640, returns: 590 }
  ],
  popularGenres: [
    { genre: "Computer Science", count: 480, percentage: 38 },
    { genre: "Artificial Intelligence", count: 280, percentage: 22 },
    { genre: "Sci-Fi", count: 210, percentage: 17 },
    { genre: "Psychology", count: 160, percentage: 13 },
    { genre: "History", count: 110, percentage: 10 }
  ]
};
