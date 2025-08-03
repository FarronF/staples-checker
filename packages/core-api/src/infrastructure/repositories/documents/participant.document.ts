import { Expose } from 'class-transformer';

export class ParticipantDocument {
  @Expose()
  userId!: string;
  @Expose()
  role!: string;
}
