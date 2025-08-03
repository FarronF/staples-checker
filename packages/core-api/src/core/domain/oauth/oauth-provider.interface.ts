export interface OAuthUser {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  provider: 'discord' | 'google';
}

export interface OAuthProvider {
  name: string;
  getAuthUrl(state?: string): string;
  exchangeCodeForUser(code: string): Promise<OAuthUser>;
  isConfigured(): boolean;
}

export class OAuthProviderNotConfiguredError extends Error {
  constructor(provider: string) {
    super(`OAuth provider '${provider}' is not properly configured`);
    this.name = 'OAuthProviderNotConfiguredError';
  }
}
