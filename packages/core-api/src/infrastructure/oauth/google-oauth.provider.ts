import {
  OAuthProvider,
  OAuthUser,
  OAuthProviderNotConfiguredError,
} from '../../core/domain/oauth/oauth-provider.interface';

export class GoogleOAuthProvider implements OAuthProvider {
  public readonly name = 'google';

  private readonly clientId: string | undefined;
  private readonly clientSecret: string | undefined;
  private readonly redirectUri: string | undefined;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.redirectUri = process.env.GOOGLE_REDIRECT_URI;
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret && this.redirectUri);
  }

  getAuthUrl(state?: string): string {
    if (!this.isConfigured()) {
      throw new OAuthProviderNotConfiguredError('google');
    }

    // TODO: Implement Google OAuth URL generation
    throw new Error('Google OAuth not implemented yet');
  }

  async exchangeCodeForUser(code: string): Promise<OAuthUser> {
    if (!this.isConfigured()) {
      throw new OAuthProviderNotConfiguredError('google');
    }

    // TODO: Implement Google OAuth code exchange
    throw new Error('Google OAuth not implemented yet');
  }
}
