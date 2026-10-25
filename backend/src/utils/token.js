import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'booknest_jwt_dev_secret_university_2026_xyz';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      email: user.email
    },
    secret,
    { expiresIn }
  );
};

export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'booknest_jwt_dev_secret_university_2026_xyz';
  return jwt.verify(token, secret);
};

export default { generateToken, verifyToken };
