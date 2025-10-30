import express from 'express';
import { signup, signin, signout } from '#controllers/auth.controller.js';
import { authenticate } from '#middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/sign-up', signup);
router.post('/sign-in', signin);

// Protected routes (authentication required)
router.post('/sign-out', authenticate, signout);

export default router;
