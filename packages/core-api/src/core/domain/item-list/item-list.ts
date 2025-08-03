import { Expose, Type } from 'class-transformer';
import { Item } from './item';
import { Participant } from './participant';
import { IsOptional } from 'class-validator';

export class ItemList {
  @Expose()
  id!: string;
  @Expose()
  name!: string;
  @Expose()
  description?: string;
  @Expose()
  creatorId!: string;

  @Type(() => Item)
  @Expose()
  items!: Item[];

  @Type(() => Participant)
  @Expose()
  @IsOptional() //TODO: Make not optional when participants are required
  participants!: Participant[];

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  addItems(newItems: Item[]): void {
    const existingNames = new Set(this.items.map((item) => item.name));
    for (const item of newItems) {
      if (existingNames.has(item.name)) {
        throw new Error(`Item name "${item.name}" already exists in the list.`);
      }
      existingNames.add(item.name);
      this.items.push(item);
    }
  }

  removeItem(itemName: string): Item | null {
    const itemIndex = this.items.findIndex((item) => item.name === itemName);
    if (itemIndex === -1) {
      return null;
    }

    const removedItem = this.items[itemIndex];
    this.items.splice(itemIndex, 1);
    return removedItem;
  }
}
