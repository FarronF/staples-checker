export interface User {
  id: string; // Internal UUID (e.g., 'usr_123456')
  email: string; // Primary identifier for linking
  username: string; // Display name
  createdAt: Date;
  updatedAt: Date;
}

export interface UserOAuthProvider {
  userId: string; // References User.id
  provider: 'discord' | 'google';
  providerId: string; // Provider's user ID (e.g., Discord ID)
  providerUsername: string;
  providerEmail?: string;
  linkedAt: Date;
}

export type SupportedOAuthProvider = 'discord' | 'google';
