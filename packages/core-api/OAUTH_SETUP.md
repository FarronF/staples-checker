# OAuth Setup Guide

## Development Mode (No Authentication)

By default, authentication is **disabled** for development. Your API will work without any authentication setup.

## Enabling Discord OAuth

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name (e.g., "Staples Checker")
4. Go to "OAuth2" section
5. Copy the "Client ID" and "Client Secret"

### 2. Configure Redirects

In your Discord app's OAuth2 settings:

- Add redirect URL: `http://localhost:3000/auth/oauth/discord/callback`
- For production: `https://yourdomain.com/auth/oauth/discord/callback`

### 3. Update Environment Variables

Edit your `.env` file:

```bash
# Enable JWT tokens
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here
DISCORD_REDIRECT_URI=http://localhost:3000/auth/oauth/discord/callback
```

### 4. Test Authentication

```bash
# Check auth status
curl http://localhost:3000/auth/status

# Get Discord auth URL
curl http://localhost:3000/auth/oauth/discord

# Test with browser:
# Visit: http://localhost:3000/auth/oauth/discord
```

## Future: Enabling Google OAuth

When you're ready to add Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add to `.env`:

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/oauth/google/callback
```

## API Endpoints

- `GET /auth/status` - Check authentication status
- `GET /auth/oauth/discord` - Start Discord OAuth
- `GET /auth/oauth/google` - Start Google OAuth (when implemented)
- `GET /auth/oauth/:provider/callback` - OAuth callback handler
- `POST /auth/login` - Simple test login (development only)
- `GET /auth/me` - Get current user (requires token)
- `GET /auth/test` - Test endpoint (works with/without auth)

## Discord Bot Integration

When using with Discord bot, the flow will be:

1. User runs `/login` command in Discord
2. Bot generates auth URL with Discord user ID as `state`
3. User authenticates via browser
4. Token is associated with Discord user ID
5. Bot uses token for subsequent API calls

## Testing Without OAuth

The system gracefully handles missing OAuth configuration:

```bash
# This will work even without Discord/Google setup
curl http://localhost:3000/item-lists

# This will show auth is disabled
curl http://localhost:3000/auth/status
```
