import { Expose } from 'class-transformer';
import { ParticipantRole } from './participant-role';

export class Participant {
  @Expose()
  userId!: string;
  @Expose()
  role!: ParticipantRole;
}
