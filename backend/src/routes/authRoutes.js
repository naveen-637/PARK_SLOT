import express from 'express';
import {
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  refresh
} from '../controllers/authController.js';
import { validateRequest, schemas } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validateRequest(schemas.register), register);
router.post('/login', validateRequest(schemas.login), login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh', refresh);

export default router;
