import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from '#services/users.service.js';
import {
  userIdSchema,
  updateUserSchema,
} from '#validations/users.validation.js';

// Get all users
export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting all users');

    const allUsers = await getAllUsers();

    res.json({
      message: 'Successfully retrieved all users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error('Error in fetchAllUsers', e);
    next(e);
  }
};

// Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    // Validate request params
    const validatedParams = userIdSchema.parse(req.params);
    const { id } = validatedParams;

    logger.info(`Getting user with ID: ${id}`);

    const user = await getUserByIdService(id);

    res.json({
      message: 'Successfully retrieved user',
      user,
    });
  } catch (e) {
    if (e.name === 'ZodError') {
      logger.error('Validation error in getUserById', e);
      return res.status(400).json({
        message: 'Invalid user ID',
        errors: e.errors,
      });
    }
    logger.error('Error in getUserById', e);
    next(e);
  }
};

// Update user
export const updateUser = async (req, res, next) => {
  try {
    // Validate request params
    const validatedParams = userIdSchema.parse(req.params);
    const { id } = validatedParams;

    // Validate request body
    const validatedBody = updateUserSchema.parse(req.body);

    logger.info(`Updating user with ID: ${id}`);

    // Check if authenticated user is updating their own information
    const authenticatedUserId = req.user?.id; // Assuming req.user is set by auth middleware
    const authenticatedUserRole = req.user?.role;

    // Users can only update their own information
    if (authenticatedUserId !== id) {
      // Unless they're an admin
      if (authenticatedUserRole !== 'admin') {
        logger.warn(
          `User ${authenticatedUserId} attempted to update user ${id}`
        );
        return res.status(403).json({
          message: 'Forbidden: You can only update your own information',
        });
      }
    }

    // Only admins can change user roles
    if (validatedBody.role && authenticatedUserRole !== 'admin') {
      logger.warn(
        `Non-admin user ${authenticatedUserId} attempted to change role`
      );
      return res.status(403).json({
        message: 'Forbidden: Only administrators can change user roles',
      });
    }

    // If non-admin is updating themselves, remove role from updates
    const updates = { ...validatedBody };
    if (authenticatedUserId === id && authenticatedUserRole !== 'admin') {
      delete updates.role;
    }

    const updatedUser = await updateUserService(id, updates);

    res.json({
      message: 'Successfully updated user',
      user: updatedUser,
    });
  } catch (e) {
    if (e.name === 'ZodError') {
      logger.error('Validation error in updateUser', e);
      return res.status(400).json({
        message: 'Validation failed',
        errors: e.errors,
      });
    }
    logger.error('Error in updateUser', e);
    next(e);
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  try {
    // Validate request params
    const validatedParams = userIdSchema.parse(req.params);
    const { id } = validatedParams;

    logger.info(`Deleting user with ID: ${id}`);

    // Check authorization - users can delete their own account, or admin can delete any
    const authenticatedUserId = req.user?.id;
    const authenticatedUserRole = req.user?.role;

    if (authenticatedUserId !== id && authenticatedUserRole !== 'admin') {
      logger.warn(`User ${authenticatedUserId} attempted to delete user ${id}`);
      return res.status(403).json({
        message: 'Forbidden: You can only delete your own account',
      });
    }

    const deletedUser = await deleteUserService(id);

    res.json({
      message: 'Successfully deleted user',
      user: deletedUser,
    });
  } catch (e) {
    if (e.name === 'ZodError') {
      logger.error('Validation error in deleteUser', e);
      return res.status(400).json({
        message: 'Invalid user ID',
        errors: e.errors,
      });
    }
    logger.error('Error in deleteUser', e);
    next(e);
  }
};
