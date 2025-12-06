import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { throwError } from './errorHandler.js';

export const authenticateUser = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ');
    if (!token) {
      throwError('No token provided', 401);
    }

    const decoded = jwt.verify(token[1], config.jwt.secret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throwError('Token expired', 401);
    }
    throwError('Invalid token', 401);
  }
};

export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret);
    return decoded;
  } catch (error) {
    throwError('Invalid refresh token', 401);
  }
};
