import { z } from 'zod';

// 🧾 Schema for user signup
export const signupSchema = z.object({
  name: z.string().min(2).max(255).trim(),
  email: z.string().email().max(255).toLowerCase().trim(),
  password: z.string().min(6).max(128),
  role: z.enum(['user', 'admin']).default('user'),
});

// 🔐 Schema for user sign-in
export const signInSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
});
