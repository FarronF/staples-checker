import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        discordId?: string;
        username: string;
        email?: string;
      };
      isAuthenticated: boolean;
    }
  }
}

export interface AuthUser {
  id: string; // Internal user ID (not OAuth provider ID)
  email: string;
  username: string;
  // OAuth provider info for backward compatibility
  discordId?: string;
  // Add other provider IDs as needed
  googleId?: string;
}

/**
 * Optional authentication middleware
 * - If token is provided and valid, sets req.user and req.isAuthenticated = true
 * - If no token or invalid token, sets req.isAuthenticated = false
 * - Always calls next() - never blocks the request
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  // Default to unauthenticated
  req.isAuthenticated = false;
  req.user = undefined;

  if (!token) {
    return next();
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.warn('JWT_SECRET not configured, authentication disabled');
    return next();
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthUser;
    req.user = decoded;
    req.isAuthenticated = true;
  } catch (error) {
    // Invalid token - log but don't block
    console.log(
      'Invalid JWT token provided:',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  next();
};

/**
 * Required authentication middleware
 * Use this for endpoints that absolutely require authentication
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Please provide a valid Bearer token',
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    res.status(500).json({
      error: 'Server configuration error',
      message: 'Authentication not properly configured',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthUser;
    req.user = decoded;
    req.isAuthenticated = true;
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Invalid token',
      message: 'Please provide a valid Bearer token',
    });
  }
};

/**
 * Conditional authentication middleware
 * - If authentication is enabled (OAuth providers configured), requires authentication
 * - If authentication is disabled, allows access without authentication
 * - Use this for protecting resources when auth is available
 */
export const conditionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check if authentication is enabled by checking for OAuth providers and JWT secret
  const hasJwtSecret = !!process.env.JWT_SECRET;
  const hasDiscordAuth = !!(
    process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
  );
  const hasGoogleAuth = !!(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );

  const authEnabled = hasJwtSecret && (hasDiscordAuth || hasGoogleAuth);

  if (!authEnabled) {
    // Authentication is disabled - allow access
    req.isAuthenticated = false;
    next();
    return;
  }

  // Authentication is enabled - require valid token
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({
      error: 'Authentication required',
      message:
        'Authentication is enabled. Please provide a valid Bearer token.',
      hint: 'Visit /auth/oauth/discord or /auth/oauth/google to authenticate',
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    res.status(500).json({
      error: 'Server configuration error',
      message: 'Authentication not properly configured',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthUser;
    req.user = decoded;
    req.isAuthenticated = true;
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Invalid token',
      message: 'Please provide a valid Bearer token',
      hint: 'Your token may have expired. Please re-authenticate.',
    });
  }
};

/**
 * Utility function to generate JWT tokens
 */
export const generateToken = (user: AuthUser): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(user, jwtSecret, { expiresIn } as jwt.SignOptions);
};
