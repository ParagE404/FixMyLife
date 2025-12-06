import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config.js';
import { throwError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

export const registerUser = async (email, password, name) => {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throwError('Email already registered', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      timezone: 'UTC',
      preferences: {
        create: {},
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  return user;
};

export const loginUser = async (email, password, rememberMe = false) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throwError('Invalid email or password', 401);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throwError('Invalid email or password', 401);
  }

  // Generate tokens
  const accessToken = jwt.sign(
    { userId: user.id },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  const refreshExpiresIn = rememberMe ? '30d' : config.jwt.refreshExpiresIn;
  const refreshToken = jwt.sign(
    { userId: user.id },
    config.jwt.refreshSecret,
    { expiresIn: refreshExpiresIn }
  );

  // Store refresh token
  await prisma.sessionToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days max
    },
  });

  // Update lastLoginAt
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

export const refreshAccessToken = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
  const userId = decoded.userId;

  // Check if session exists
  const session = await prisma.sessionToken.findUnique({
    where: { token: refreshToken },
  });

  if (!session || session.expiresAt < new Date()) {
    throwError('Refresh token expired', 401);
  }

  // Generate new access token
  const newAccessToken = jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  return { accessToken: newAccessToken };
};

export const logoutUser = async (userId, refreshToken) => {
  // Delete session token
  await prisma.sessionToken.deleteMany({
    where: {
      userId,
      token: refreshToken,
    },
  });
};
