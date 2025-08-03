import { Expose } from 'class-transformer';

export class ParticipantDto {
  @Expose()
  userId!: string;
  @Expose()
  role?: string;
}
