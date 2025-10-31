import logger from '#config/logger.js';
import { signupSchema, signInSchema } from '#validations/auth.validation.js';
import {
  createUser,
  getUserByEmail,
  comparePassword,
} from '#services/auth.service.js';
import { cookies } from '#utils/cookies.js';
import { jwtToken } from '#utils/jwt.js';
import { formatValidationError } from '#utils/format.js';

export const signup = async (req, res, next) => {
  try {
    // Validate request body
    const validationResult = signupSchema.safeParse(req.body);

    // Check if validation failed (not success)
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    // Extract validated data (including password)
    const { name, email, password, role } = validationResult.data;

    // Create user in database
    const user = await createUser({ name, email, password, role });

    // Generate JWT token
    const token = jwtToken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Set token in secure cookie
    cookies.set(res, 'token', token);

    logger.info(`User registered successfully: ${email}`);
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    logger.error('Signup error', e);
    res.status(500).json({
      error: 'Failed to register user',
      message: e.message,
    });
  }
};

// Sign in controller
export const signin = async (req, res) => {
  try {
    // Validate request body
    const validationResult = signInSchema.safeParse(req.body);

    // Check if validation failed
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const user = await getUserByEmail(email);

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
      });
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.password);

    // Check if password is correct
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = jwtToken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Set token in secure cookie
    cookies.set(res, 'token', token);

    logger.info(`User signed in successfully: ${email}`);
    res.status(200).json({
      message: 'Signed in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    logger.error('Signin error', e);
    res.status(500).json({
      error: 'Failed to sign in',
      message: e.message,
    });
  }
};

// Sign out controller
export const signout = async (req, res) => {
  try {
    // Clear the authentication cookie
    cookies.clear(res, 'token');

    logger.info('User signed out successfully');
    res.status(200).json({
      message: 'Signed out successfully',
    });
  } catch (e) {
    logger.error('Signout error', e);
    res.status(500).json({
      error: 'Failed to sign out',
      message: e.message,
    });
  }
};
