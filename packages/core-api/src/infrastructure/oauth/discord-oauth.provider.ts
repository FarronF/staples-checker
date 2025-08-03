import axios from 'axios';
import {
  OAuthProvider,
  OAuthUser,
  OAuthProviderNotConfiguredError,
} from '../../core/domain/oauth/oauth-provider.interface';

export class DiscordOAuthProvider implements OAuthProvider {
  public readonly name = 'discord';

  private readonly clientId: string | undefined;
  private readonly clientSecret: string | undefined;
  private readonly redirectUri: string | undefined;

  constructor() {
    this.clientId = process.env.DISCORD_CLIENT_ID;
    this.clientSecret = process.env.DISCORD_CLIENT_SECRET;
    this.redirectUri = process.env.DISCORD_REDIRECT_URI;
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret && this.redirectUri);
  }

  getAuthUrl(state?: string): string {
    if (!this.isConfigured()) {
      throw new OAuthProviderNotConfiguredError('discord');
    }

    const params = new URLSearchParams({
      client_id: this.clientId!,
      redirect_uri: this.redirectUri!,
      response_type: 'code',
      scope: 'identify email',
    });

    if (state) {
      params.append('state', state);
    }

    return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  }

  async exchangeCodeForUser(code: string): Promise<OAuthUser> {
    if (!this.isConfigured()) {
      throw new OAuthProviderNotConfiguredError('discord');
    }

    try {
      // Exchange code for access token
      const tokenResponse = await axios.post(
        'https://discord.com/api/oauth2/token',
        new URLSearchParams({
          client_id: this.clientId!,
          client_secret: this.clientSecret!,
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri!,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token } = tokenResponse.data;

      // Get user information
      const userResponse = await axios.get(
        'https://discord.com/api/users/@me',
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const discordUser = userResponse.data;

      return {
        id: `discord_${discordUser.id}`,
        username: discordUser.username,
        email: discordUser.email,
        avatar: discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : undefined,
        provider: 'discord',
      };
    } catch (error) {
      console.error('Discord OAuth error:', error);
      throw new Error('Failed to authenticate with Discord');
    }
  }
}
