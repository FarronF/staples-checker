import { Expose } from 'class-transformer';
import { SupportedOAuthProvider } from '../../../core/domain/user';

export class UserOAuthProviderDocument {
  @Expose()
  _id!: string;

  @Expose()
  userId!: string;

  @Expose()
  provider!: SupportedOAuthProvider;

  @Expose()
  providerId!: string;

  @Expose()
  providerUsername!: string;

  @Expose()
  providerEmail?: string;

  @Expose()
  linkedAt!: Date;
}
