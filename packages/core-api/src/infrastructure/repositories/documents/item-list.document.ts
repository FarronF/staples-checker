import { Expose } from 'class-transformer';
import { ItemDocument } from './item.document';
import { ParticipantDocument } from './participant.document';

export class ItemListDocument {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  description!: string;

  @Expose()
  items!: ItemDocument[];

  @Expose()
  participants!: ParticipantDocument[];

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
