import express from 'express';
import { validate, loginSchema, registerSchema } from '../middleware/validation.js';
import { registerUser, loginUser, refreshAccessToken, logoutUser } from '../services/auth.service.js';
import { authenticateUser } from '../middleware/auth.js';
import { throwError } from '../middleware/errorHandler.js';

const router = express.Router();

// Register
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const user = await registerUser(email, password, name);
    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;
    const result = await loginUser(email, password, rememberMe);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Refresh Token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throwError('Refresh token required', 400);
    }
    const result = await refreshAccessToken(refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', authenticateUser, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await logoutUser(req.userId, refreshToken);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
