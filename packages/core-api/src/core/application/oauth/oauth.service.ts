import { OAuthProvider } from '../../domain/oauth/oauth-provider.interface';
import { DiscordOAuthProvider } from '../../../infrastructure/oauth/discord-oauth.provider';
import { GoogleOAuthProvider } from '../../../infrastructure/oauth/google-oauth.provider';

export type SupportedProvider = 'discord' | 'google';

export class OAuthService {
  private providers: Map<SupportedProvider, OAuthProvider> = new Map();

  constructor() {
    this.providers.set('discord', new DiscordOAuthProvider());
    this.providers.set('google', new GoogleOAuthProvider());
  }

  /**
   * Get available (configured) OAuth providers
   */
  getAvailableProviders(): { name: SupportedProvider; configured: boolean }[] {
    return Array.from(this.providers.entries()).map(([name, provider]) => ({
      name,
      configured: provider.isConfigured(),
    }));
  }

  /**
   * Get configured OAuth providers only
   */
  getConfiguredProviders(): SupportedProvider[] {
    return Array.from(this.providers.entries())
      .filter(([, provider]) => provider.isConfigured())
      .map(([name]) => name);
  }

  /**
   * Check if any OAuth providers are configured
   */
  hasAnyConfiguredProviders(): boolean {
    return this.getConfiguredProviders().length > 0;
  }

  /**
   * Get OAuth provider by name
   */
  getProvider(name: SupportedProvider): OAuthProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Get auth URL for a specific provider
   */
  getAuthUrl(provider: SupportedProvider, state?: string): string {
    const oauthProvider = this.getProvider(provider);
    if (!oauthProvider) {
      throw new Error(`OAuth provider '${provider}' not found`);
    }

    if (!oauthProvider.isConfigured()) {
      throw new Error(`OAuth provider '${provider}' is not configured`);
    }

    return oauthProvider.getAuthUrl(state);
  }
}
