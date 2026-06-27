import { z } from 'zod';

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email or mobile number is required')
    .refine(
      value => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        const isMobile = /^[6-9]\d{9}$/.test(value); // Indian 10-digit mobile
        return isEmail || isMobile;
      },
      { message: 'Enter a valid email address or 10-digit mobile number' },
    ),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Register ─────────────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required').min(3, 'Enter your full name'),
    identifier: z
      .string()
      .min(1, 'Email or mobile number is required')
      .refine(
        value => {
          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          const isMobile = /^[6-9]\d{9}$/.test(value);
          return isEmail || isMobile;
        },
        { message: 'Enter a valid email address or 10-digit mobile number' },
      ),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(values => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── API Request / Response Types ─────────────────────────────────────────────

export interface LoginApiRequest {
  email: string;
  password: string;
}

export interface LogoutApiRequest {
  refreshToken: string;
}
