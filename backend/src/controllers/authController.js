import User from '../models/User.js';
import { generateToken } from '../utils/token.js';

/**
 * @desc    Register a new student/user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, memberId, department, preferredGenres } = req.body;

    if (!name || !email || !password || !memberId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, password, and member ID.'
      });
    }

    // Check for duplicate email
    const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (emailExists) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email already exists.'
      });
    }

    // Check for duplicate memberId
    const memberIdExists = await User.findOne({ memberId: memberId.trim() });
    if (memberIdExists) {
      return res.status(409).json({
        success: false,
        error: 'An account with this member ID already exists.'
      });
    }

    // Public registration MUST ALWAYS force role='user'
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      memberId: memberId.trim(),
      department: department || 'Computer Science & Engineering',
      role: 'user', // Enforce non-admin role
      preferredGenres: Array.isArray(preferredGenres) ? preferredGenres : ['Computer Science']
    });

    const token = generateToken(user);

    // Sanitize user output
    const userOutput = user.toObject();
    delete userOutput.password;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: userOutput
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const token = generateToken(user);

    const userOutput = user.toObject();
    delete userOutput.password;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: userOutput
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update permitted profile fields
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found.'
      });
    }

    const { name, department, preferredGenres, readingGoal, avatarUrl } = req.body;

    if (name) user.name = name.trim();
    if (department) user.department = department.trim();
    if (Array.isArray(preferredGenres)) user.preferredGenres = preferredGenres;
    if (avatarUrl) user.avatarUrl = avatarUrl.trim();

    if (readingGoal) {
      if (readingGoal.target !== undefined) {
        user.readingGoal.target = Math.max(1, Number(readingGoal.target));
      }
      if (readingGoal.completed !== undefined) {
        user.readingGoal.completed = Math.max(0, Number(readingGoal.completed));
      }
    }

    // Note: 'role', 'password', 'email', 'memberId' are NOT modifiable through this endpoint
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

export default { register, login, getMe, updateProfile, logout };
