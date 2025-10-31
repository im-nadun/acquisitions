import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

// Get all users
export const getAllUsers = async () => {
  try {
    return await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.created_at,
        updatedAt: users.updated_at,
      })
      .from(users);
  } catch (e) {
    logger.error('Error getting users', e);
    throw e;
  }
};

// Get user by ID
export const getUserById = async id => {
  try {
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.created_at,
        updatedAt: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user || user.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user[0];
  } catch (e) {
    logger.error(`Error getting user by ID ${id}`, e);
    throw e;
  }
};

// Update user
export const updateUser = async (id, updates) => {
  try {
    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existingUser || existingUser.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Hash password if it's being updated
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Add updated_at timestamp
    updates.updated_at = new Date();

    // Perform the update
    const updatedUser = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.created_at,
        updatedAt: users.updated_at,
      });

    return updatedUser[0];
  } catch (e) {
    logger.error(`Error updating user ${id}`, e);
    throw e;
  }
};

// Delete user
export const deleteUser = async id => {
  try {
    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existingUser || existingUser.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Delete the user
    const deletedUser = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
      });

    return deletedUser[0];
  } catch (e) {
    logger.error(`Error deleting user ${id}`, e);
    throw e;
  }
};
