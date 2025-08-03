import { MongoClient, Db, Collection } from 'mongodb';
import {
  User,
  UserOAuthProvider,
  SupportedOAuthProvider,
} from '../../core/domain/user';
import { UserRepository } from '../../core/application/user/UserService';
import { UserDocument } from './documents/user.document';
import { UserOAuthProviderDocument } from './documents/user-oauth-provider.document';
import { v4 as uuidv4 } from 'uuid';

export class MongoUserRepository implements UserRepository {
  private db: Db;
  private usersCollection: Collection<UserDocument>;
  private oauthProvidersCollection: Collection<UserOAuthProviderDocument>;

  constructor(mongoClient: MongoClient, databaseName: string) {
    this.db = mongoClient.db(databaseName);
    this.usersCollection = this.db.collection<UserDocument>('users');
    this.oauthProvidersCollection =
      this.db.collection<UserOAuthProviderDocument>('user_oauth_providers');

    // Create indexes for performance
    this.createIndexes();
  }

  private async createIndexes(): Promise<void> {
    try {
      // User indexes
      await this.usersCollection.createIndex({ email: 1 }, { unique: true });
      await this.usersCollection.createIndex({ id: 1 }, { unique: true });

      // OAuth provider indexes
      await this.oauthProvidersCollection.createIndex({ userId: 1 });
      await this.oauthProvidersCollection.createIndex(
        { provider: 1, providerId: 1 },
        { unique: true }
      );
    } catch (error) {
      console.warn('Failed to create indexes:', error);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const userDoc = await this.usersCollection.findOne({ email });
    return userDoc ? this.mapDocumentToDomain(userDoc) : null;
  }

  async findByOAuthProvider(
    provider: SupportedOAuthProvider,
    providerId: string
  ): Promise<User | null> {
    const oauthDoc = await this.oauthProvidersCollection.findOne({
      provider,
      providerId,
    });

    if (!oauthDoc) {
      return null;
    }

    const userDoc = await this.usersCollection.findOne({ id: oauthDoc.userId });
    return userDoc ? this.mapDocumentToDomain(userDoc) : null;
  }

  async createUser(
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<User> {
    const now = new Date();
    const newUser: User = {
      id: `usr_${uuidv4().replace(/-/g, '').substring(0, 12)}`, // e.g., usr_a1b2c3d4e5f6
      ...user,
      createdAt: now,
      updatedAt: now,
    };

    const userDoc: UserDocument = {
      _id: '', // MongoDB will set this
      ...newUser,
    };

    const result = await this.usersCollection.insertOne(userDoc as any);
    userDoc._id = result.insertedId.toString();

    return newUser;
  }

  async linkOAuthProvider(
    userId: string,
    oauthProvider: Omit<UserOAuthProvider, 'linkedAt'>
  ): Promise<void> {
    const oauthDoc: UserOAuthProviderDocument = {
      _id: '', // MongoDB will set this
      ...oauthProvider,
      linkedAt: new Date(),
    };

    await this.oauthProvidersCollection.insertOne(oauthDoc as any);
  }

  async findOAuthProviders(userId: string): Promise<UserOAuthProvider[]> {
    const oauthDocs = await this.oauthProvidersCollection
      .find({ userId })
      .toArray();

    return oauthDocs.map((doc) => ({
      userId: doc.userId,
      provider: doc.provider,
      providerId: doc.providerId,
      providerUsername: doc.providerUsername,
      providerEmail: doc.providerEmail,
      linkedAt: doc.linkedAt,
    }));
  }

  private mapDocumentToDomain(doc: UserDocument): User {
    return {
      id: doc.id,
      email: doc.email,
      username: doc.username,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
