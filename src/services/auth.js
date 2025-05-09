import createHttpError from 'http-errors';
import UsersCollection from '../db/models/users.js';
import bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/index.js';
import SessionsCollection from '../db/models/sessions.js';
import { sendMail } from '../utils/sendMail.js';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import fs from 'node:fs/promises';
import handlebars from 'handlebars';

const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates');

export const registerUser = async (userData) => {
  const { email, password } = userData;

  const isUserExists = await UsersCollection.findOne({ email });

  if (isUserExists) {
    throw createHttpError(409, 'User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await UsersCollection.create({
    ...userData,
    password: hashedPassword,
  });
  return newUser;
};

export const loginUser = async (userData) => {
  const { email, password } = userData;

  const user = await UsersCollection.findOne({ email });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid password');
  }
  // Delete all previous sessions for the user
  await SessionsCollection.deleteMany({ userId: user._id });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');
  const accessTokenValidUntil = new Date(Date.now() + FIFTEEN_MINUTES);
  const refreshTokenValidUntil = new Date(Date.now() + THIRTY_DAYS);

  const session = await SessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return session;
};

export const logoutUser = async (userId) => {
  await SessionsCollection.findByIdAndDelete(userId);
};

export const refreshUser = async ({ refreshToken, sessionId }) => {
  const session = await SessionsCollection.findById({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(404, 'Session not found');
  }

  if (session.refreshTokenValidUntil < new Date()) {
    throw createHttpError(401, 'Refresh token expired');
  }

  const accessTokenNew = randomBytes(30).toString('base64');
  const refreshTokenNew = randomBytes(30).toString('base64');
  const accessTokenValidUntilNew = new Date(Date.now() + FIFTEEN_MINUTES);
  const refreshTokenValidUntilNew = new Date(Date.now() + THIRTY_DAYS);

  const sessionNew = await SessionsCollection.create({
    userId: session._id,
    accessToken: accessTokenNew,
    refreshToken: refreshTokenNew,
    accessTokenValidUntil: accessTokenValidUntilNew,
    refreshTokenValidUntil: refreshTokenValidUntilNew,
  });

  await SessionsCollection.findByIdAndDelete(sessionId);

  return sessionNew;
};

export const sendResetEmail = async (email) => {
  const user = await UsersCollection.findOne({ email });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const resetToken = jwt.sign(
    { sub: user._id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );

  const templatePath = path.join(TEMPLATES_DIR, 'reset-password-mail.html');
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  const template = handlebars.compile(templateContent.toString());

  const htmlContent = template({
    name: user.name,
    url: `${process.env.APP_DOMAIN}/auth/reset-password?token=${resetToken}`,
    token: resetToken,
    DOMAIN: process.env.APP_DOMAIN,
  });

  await sendMail({
    from: process.env.SMTP_FROM,
    to: user.email,
    subject: 'Password Reset',
    html: htmlContent,
  });

  return resetToken;
};

export const resetPassword = async (token, newPassword) => {
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.log(error);
    throw createHttpError(401, 'Invalid token');
  }

  const userId = decodedToken.sub;
  const userEmail = decodedToken.email;

  const user = await UsersCollection.findOne({
    _id: userId,
    email: userEmail,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await UsersCollection.findByIdAndUpdate(userId, {
    password: hashedPassword,
  });

  return true;
};
