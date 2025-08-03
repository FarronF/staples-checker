import { Expose } from 'class-transformer';

export class UserDocument {
  @Expose()
  _id!: string; // MongoDB ObjectId

  @Expose()
  id!: string; // Internal UUID (e.g., 'usr_abc123')

  @Expose()
  email!: string; // Primary identifier

  @Expose()
  username!: string; // Display name

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
