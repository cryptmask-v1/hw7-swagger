import { Router } from 'express';
import { validateBody } from '../middlewares/validatorBody.js';
import { ctrlWrapper } from '../utils/crtlWrapper.js';
import { createUserSchema, loginUserSchema } from '../validators/users.js';
import {
  loginUserController,
  logoutUserController,
  refreshUserController,
  registerUserController,
  resetPasswordController,
  sendResetEmailController,
} from '../controllers/auth.js';

const authRouter = Router();

authRouter.post(
  '/register',
  validateBody(createUserSchema),
  ctrlWrapper(registerUserController),
);

authRouter.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(loginUserController),
);

authRouter.post('/logout', ctrlWrapper(logoutUserController));

authRouter.post('/refresh', ctrlWrapper(refreshUserController));

// /auth/send-reset-email route'u reset email için
authRouter.post('/send-reset-email', ctrlWrapper(sendResetEmailController));

// /reset-password route'u şifre sıfırlama için
authRouter.post('/reset-password', ctrlWrapper(resetPasswordController));

export default authRouter;
