import { Router, Request, Response } from 'express';
import {
  generateToken,
  requireAuth,
  optionalAuth,
} from '../middleware/auth.middleware';
import { OAuthService } from '../../core/application/oauth/oauth.service';

const router = Router();
const oauthService = new OAuthService();

/**
 * Get available OAuth providers and authentication status
 * GET /auth/status
 */
router.get('/status', (req: Request, res: Response) => {
  const providers = oauthService.getAvailableProviders();
  const hasOAuth = oauthService.hasAnyConfiguredProviders();

  res.json({
    authentication: {
      enabled: hasOAuth,
      optional: true, // Authentication is always optional in your setup
      jwtConfigured: !!process.env.JWT_SECRET,
    },
    providers,
    message: hasOAuth
      ? 'OAuth providers are available'
      : 'No OAuth providers configured - authentication disabled',
  });
});

/**
 * Start OAuth flow for a specific provider
 * GET /auth/oauth/:provider
 * Supports: discord, google (when configured)
 */
router.get('/oauth/:provider', (req: Request, res: Response) => {
  const { provider } = req.params;
  const { state } = req.query;

  if (!['discord', 'google'].includes(provider)) {
    res.status(400).json({
      error: 'Unsupported provider',
      supportedProviders: ['discord', 'google'],
    });
    return;
  }

  try {
    const authUrl = oauthService.getAuthUrl(provider as any, state as string);

    // For API usage, return the URL
    if (req.headers.accept?.includes('application/json')) {
      res.json({ authUrl, provider });
    } else {
      // For browser usage, redirect
      res.redirect(authUrl);
    }
  } catch (error) {
    res.status(400).json({
      error: 'OAuth provider not available',
      message: error instanceof Error ? error.message : 'Unknown error',
      provider,
    });
  }
});

/**
 * Handle OAuth callback
 * GET /auth/oauth/:provider/callback
 */
router.get('/oauth/:provider/callback', async (req: Request, res: Response) => {
  const { provider } = req.params;
  const { code, state, error } = req.query;

  if (error) {
    res.status(400).send(`
      <h1>❌ Authentication Failed</h1>
      <p>Error: ${error}</p>
      <p><a href="/">Back to app</a></p>
    `);
    return;
  }

  if (!code) {
    res.status(400).send(`
      <h1>❌ Authentication Failed</h1>
      <p>No authorization code received</p>
      <p><a href="/">Back to app</a></p>
    `);
    return;
  }

  try {
    const oauthProvider = oauthService.getProvider(provider as any);
    if (!oauthProvider) {
      throw new Error(`Provider ${provider} not found`);
    }

    // Exchange code for user info
    const oauthUser = await oauthProvider.exchangeCodeForUser(code as string);

    // Validate required fields
    if (!oauthUser.email) {
      throw new Error(
        `Email is required for authentication but was not provided by ${provider}`
      );
    }

    // Generate JWT token
    const user = {
      id: oauthUser.id,
      username: oauthUser.username,
      email: oauthUser.email, // Now guaranteed to be string
      discordId:
        provider === 'discord'
          ? oauthUser.id.replace('discord_', '')
          : undefined,
    };

    const token = generateToken(user);

    // For Discord bot integration, you might want to store this token
    // associated with the Discord user ID (from state parameter)
    if (state && provider === 'discord') {
      console.log(
        `User ${user.username} authenticated for Discord user ${state}`
      );
      // TODO: Store token for Discord bot usage
      // await storeDiscordUserToken(state, token);
    }

    res.send(`
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; text-align: center;">
        <h1>✅ Authentication Successful!</h1>
        <p>Welcome, <strong>${oauthUser.username}</strong>!</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Your JWT Token:</h3>
          <textarea readonly style="width: 100%; height: 100px; font-family: monospace; font-size: 12px;">${token}</textarea>
          <p style="font-size: 12px; color: #666;">Copy this token to use with API requests</p>
        </div>
        <p>You can now close this tab and use the API with your token.</p>
        <script>
          // Auto-close after 10 seconds
          setTimeout(() => window.close(), 10000);
        </script>
      </div>
    `);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).send(`
      <h1>❌ Authentication Failed</h1>
      <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
      <p><a href="/">Back to app</a></p>
    `);
  }
});

/**
 * Simple login endpoint for testing (in real app, this would be OAuth)
 * POST /auth/login
 * Body: { username: string, email?: string }
 */
router.post('/login', (req: Request, res: Response) => {
  const { username, email } = req.body;

  if (!username) {
    res.status(400).json({ error: 'Username is required' });
    return;
  }

  // In a real app, you'd validate credentials here
  const user = {
    id: `user_${Date.now()}`, // In real app, this would be from database
    username,
    email: email || `${username}@example.com`,
  };

  try {
    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Authentication not configured',
      message:
        'Set JWT_SECRET in environment variables to enable authentication',
    });
  }
});

/**
 * Get current user info (requires authentication)
 * GET /auth/me
 */
router.get('/me', requireAuth, (req: Request, res: Response) => {
  res.json({
    user: req.user,
    message: 'You are authenticated!',
  });
});

/**
 * Test endpoint that works with or without authentication
 * GET /auth/test
 */
router.get('/test', optionalAuth, (req: Request, res: Response) => {
  if (req.isAuthenticated) {
    res.json({
      message: 'Hello authenticated user!',
      user: req.user,
      authenticated: true,
    });
  } else {
    res.json({
      message: 'Hello anonymous user!',
      authenticated: false,
      hint: 'Send a Bearer token to see authenticated content',
    });
  }
});

export { router as authRouter };
