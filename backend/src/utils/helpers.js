const jwt = require('jsonwebtoken');

/**
 * Generate access token (short-lived)
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
};

/**
 * Generate refresh token (long-lived)
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

/**
 * Set auth cookies on response
 */
const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/v1/auth/refresh',
  });
};

/**
 * Clear auth cookies
 */
const clearAuthCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
};

/**
 * Generate random OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Paginate results
 */
const paginate = (page = 1, limit = 20, maxLimit = 100) => {
  const parsedPage = Math.max(1, parseInt(page));
  const parsedLimit = Math.min(Math.max(1, parseInt(limit)), maxLimit);
  const offset = (parsedPage - 1) * parsedLimit;

  return { limit: parsedLimit, offset, page: parsedPage };
};

/**
 * Format pagination response
 */
const paginationResponse = (count, page, limit) => {
  const totalPages = Math.ceil(count / limit);
  return {
    currentPage: page,
    totalPages,
    totalItems: count,
    hasMore: page < totalPages,
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  generateOTP,
  paginate,
  paginationResponse,
};
