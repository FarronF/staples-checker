import { ItemStatus } from './item-status';

export class ItemStatusChange {
  constructor(
    public readonly itemName: string,
    public readonly status: ItemStatus
  ) {
    if (!itemName?.trim()) {
      throw new Error('Item name cannot be empty');
    }
  }
}
