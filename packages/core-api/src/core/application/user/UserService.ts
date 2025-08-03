import {
  User,
  UserOAuthProvider,
  SupportedOAuthProvider,
} from '../../domain/user';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findByOAuthProvider(
    provider: SupportedOAuthProvider,
    providerId: string
  ): Promise<User | null>;
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  linkOAuthProvider(
    userId: string,
    oauthProvider: Omit<UserOAuthProvider, 'linkedAt'>
  ): Promise<void>;
  findOAuthProviders(userId: string): Promise<UserOAuthProvider[]>;
}

export interface OAuthUserInfo {
  id: string;
  username: string;
  email: string;
  provider: SupportedOAuthProvider;
}

export class UserService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Find or create user from OAuth authentication
   * This handles linking multiple OAuth providers to same user via email
   */
  async findOrCreateUserFromOAuth(oauthInfo: OAuthUserInfo): Promise<User> {
    const { provider, id: providerId, username, email } = oauthInfo;

    // Remove provider prefix if present (e.g., 'discord_123' -> '123')
    const cleanProviderId = providerId.replace(`${provider}_`, '');

    // First, check if this specific OAuth provider is already linked
    let user = await this.userRepository.findByOAuthProvider(
      provider,
      cleanProviderId
    );

    if (user) {
      return user;
    }

    // If not found by OAuth provider, check if user exists by email
    user = await this.userRepository.findByEmail(email);

    if (user) {
      // User exists but hasn't linked this OAuth provider yet
      await this.userRepository.linkOAuthProvider(user.id, {
        userId: user.id,
        provider,
        providerId: cleanProviderId,
        providerUsername: username,
        providerEmail: email,
      });
      return user;
    }

    // Create new user
    const newUser = await this.userRepository.createUser({
      email,
      username,
    });

    // Link the OAuth provider
    await this.userRepository.linkOAuthProvider(newUser.id, {
      userId: newUser.id,
      provider,
      providerId: cleanProviderId,
      providerUsername: username,
      providerEmail: email,
    });

    return newUser;
  }

  /**
   * Get all OAuth providers linked to a user
   */
  async getUserOAuthProviders(userId: string): Promise<UserOAuthProvider[]> {
    return this.userRepository.findOAuthProviders(userId);
  }
}
