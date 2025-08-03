// Example: import your MongoDB client/connection here
// import { getMongoCollection } from '../mongo/mongoClient';

import { Collection } from 'mongodb';
import { ItemListRepository } from '../../core/application/repositories/ItemListRepository';
import { Item } from '../../core/domain/item-list/item';
import { ItemList } from '../../core/domain/item-list/item-list';
import { ItemStatus } from '../../core/domain/item-list/item-status';
import { Participant } from '../../core/domain/item-list/participant';
import { ParticipantRole } from '../../core/domain/item-list/participant-role';
import { CreateItemListCommand } from '../../core/application/item-list/commands/create-item-list.command';
import { plainToInstance } from 'class-transformer';
import { ItemListDocument } from './documents/item-list.document';
import { ItemDocument } from './documents/item.document';
import { NotFoundError } from '../../core/domain/errors/not-found-error';
import { validateSync } from 'class-validator';
import { UpdateItemListCommand } from '../../core/application/item-list/commands/update-item-list.command';
import { ItemStatusChange } from '../../core/domain/item-list/item-status-change';

export class MongoItemListRepository implements ItemListRepository {
  constructor(private readonly collection: Collection) {}

  async getItemListById(id: string): Promise<ItemList | null> {
    const doc = await this.collection.findOne({ id: id });
    return doc
      ? plainToInstance(ItemList, doc, { excludeExtraneousValues: true })
      : null;
  }

  async createItemList(
    createItemListCommand: CreateItemListCommand
  ): Promise<ItemList> {
    const itemListDocument = plainToInstance(ItemListDocument, {
      ...createItemListCommand,
      id: crypto.randomUUID(),
      items: [],
      participants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Creating item list document:', itemListDocument);

    await this.collection.insertOne(itemListDocument);

    const itemList = plainToInstance(ItemList, itemListDocument, {
      excludeExtraneousValues: true,
    });
    return itemList;
  }

  async updateItemList(
    id: string,
    command: UpdateItemListCommand
  ): Promise<ItemList> {
    const itemList = await this.getItemListById(id);
    if (!itemList) {
      throw new NotFoundError('Item list not found');
    }
    if (command.name) {
      itemList.name = command.name;
    }
    if (command.description) {
      itemList.description = command.description;
    }
    itemList.updatedAt = new Date();
    const errors = validateSync(itemList);
    if (errors.length > 0) {
      throw new Error('ItemList validation failed: ' + JSON.stringify(errors));
    }

    await this.collection.updateOne(
      { id: itemList.id },
      {
        $set: {
          name: itemList.name,
          description: itemList.description,
          updatedAt: itemList.updatedAt,
        },
      }
    );
    return itemList;
  }

  async deleteItemList(id: string): Promise<ItemList | null> {
    const doc = await this.collection.findOne({ id: id });
    if (!doc) {
      return null;
    }
    await this.collection.deleteOne({ id: id });
    return plainToInstance(ItemList, doc, { excludeExtraneousValues: true });
  }

  async getItemListItems(id: string): Promise<Item[] | null> {
    const itemList = await this.collection.findOne({ id: id });
    if (!itemList || !itemList.items || itemList.items.length === 0) {
      return null;
    }
    const items = itemList.items.map((item: any) =>
      plainToInstance(Item, item, { excludeExtraneousValues: true })
    );
    return items;
  }

  async addItemsToItemList(itemListId: string, items: Item[]): Promise<Item[]> {
    const itemListDocument = await this.collection.findOne({ id: itemListId });
    if (!itemListDocument) {
      throw new NotFoundError('Item list not found');
    }
    const itemList = plainToInstance(ItemList, itemListDocument, {
      excludeExtraneousValues: true,
    });

    const dateInserted = new Date();

    const addedItems = items.map((item) => {
      const itemInstance = plainToInstance(
        Item,
        {
          ...item,
          status: item.status ?? ItemStatus.Unknown,
          createdAt: dateInserted,
          updatedAt: dateInserted,
        },
        { excludeExtraneousValues: true }
      );

      const itemErrors = validateSync(itemInstance);
      if (itemErrors.length > 0) {
        throw new Error(
          'Item validation failed: ' + JSON.stringify(itemErrors)
        );
      }
      return itemInstance;
    });

    itemList.addItems(addedItems);
    itemList.updatedAt = dateInserted;

    const errors = validateSync(itemList);
    if (errors.length > 0) {
      throw new Error('ItemList validation failed: ' + JSON.stringify(errors));
    }

    await this.collection.updateOne(
      { id: itemListId },
      {
        $set: {
          items: itemList.items.map((item) =>
            plainToInstance(ItemDocument, item, {
              excludeExtraneousValues: true,
            })
          ),
          updatedAt: dateInserted,
        },
      }
    );

    // Return the added items as Item instances
    return addedItems.map((item) =>
      plainToInstance(Item, item, { excludeExtraneousValues: true })
    );
  }

  async updateItemStatusInItemList(
    itemListId: string,
    itemName: string,
    status: ItemStatus
  ): Promise<Item> {
    const updatedItems = await this.updateItemsStatusInItemList(itemListId, [
      { itemName, status },
    ]);
    return updatedItems[0];
  }

  async updateItemsStatusInItemList(
    itemListId: string,
    changes: ItemStatusChange[]
  ): Promise<Item[]> {
    const itemListDocument = await this.collection.findOne({ id: itemListId });
    if (!itemListDocument) {
      throw new NotFoundError('Item list not found');
    }

    if (!changes || changes.length === 0) {
      return [];
    }

    const updatedAt = new Date();
    const updatedItems: Item[] = [];

    // Validate all items exist before updating
    for (const update of changes) {
      const itemIndex = itemListDocument.items?.findIndex(
        (item: any) => item.name === update.itemName
      );
      if (itemIndex === -1 || itemIndex === undefined) {
        throw new NotFoundError(`Item '${update.itemName}' not found in list`);
      }
    }

    // Perform bulk update operations
    const bulkOps = changes.map((update) => ({
      updateOne: {
        filter: { id: itemListId, 'items.name': update.itemName },
        update: {
          $set: {
            'items.$.status': update.status,
            'items.$.updatedAt': updatedAt,
            updatedAt: updatedAt,
          },
        },
      },
    }));

    await this.collection.bulkWrite(bulkOps);

    // Create updated item instances for return
    for (const update of changes) {
      const item = itemListDocument.items.find(
        (item: any) => item.name === update.itemName
      );

      const updatedItem = plainToInstance(
        Item,
        {
          ...item,
          status: update.status,
          updatedAt: updatedAt,
        },
        { excludeExtraneousValues: true }
      );

      const itemErrors = validateSync(updatedItem);
      if (itemErrors.length > 0) {
        throw new Error(
          `Updated item validation failed for ${
            update.itemName
          }: ${JSON.stringify(itemErrors)}`
        );
      }

      updatedItems.push(updatedItem);
    }

    return updatedItems;
  }

  async deleteItemFromList(
    itemListId: string,
    itemName: string
  ): Promise<Item | null> {
    const deletedItems = await this.deleteItemsFromList(itemListId, [itemName]);
    return deletedItems.length > 0 ? deletedItems[0] : null;
  }

  async deleteItemsFromList(
    itemListId: string,
    itemNames: string[]
  ): Promise<Item[]> {
    const itemListDocument = await this.collection.findOne({ id: itemListId });
    if (!itemListDocument) {
      throw new NotFoundError('Item list not found');
    }

    if (!itemNames || itemNames.length === 0) {
      return [];
    }

    // Find items to delete
    const itemsToDelete: Item[] = [];
    if (itemListDocument.items) {
      for (const itemName of itemNames) {
        const item = itemListDocument.items.find(
          (item: any) => item.name === itemName
        );
        if (item) {
          const itemInstance = plainToInstance(Item, item, {
            excludeExtraneousValues: true,
          });

          const itemErrors = validateSync(itemInstance);
          if (itemErrors.length > 0) {
            throw new Error(
              `Item validation failed for ${itemName}: ${JSON.stringify(
                itemErrors
              )}`
            );
          }

          itemsToDelete.push(itemInstance);
        }
      }
    }

    if (itemsToDelete.length === 0) {
      return []; // No items found to delete
    }

    const updatedAt = new Date();

    // Remove the items from the array using $in operator
    await this.collection.updateOne(
      { id: itemListId },
      {
        $pull: { items: { name: { $in: itemNames } } } as any,
        $set: { updatedAt: updatedAt },
      }
    );

    return itemsToDelete;
  }

  async getItemsByStatus(
    itemListId: string,
    statuses: ItemStatus[]
  ): Promise<Item[] | null> {
    const itemListDocument = await this.collection.findOne({ id: itemListId });
    if (!itemListDocument) {
      return null;
    }

    if (!itemListDocument.items || itemListDocument.items.length === 0) {
      return [];
    }

    // Filter items by status
    const filteredItems = itemListDocument.items.filter((item: any) =>
      statuses.includes(item.status as ItemStatus)
    );

    return filteredItems.map((item: any) =>
      plainToInstance(Item, item, { excludeExtraneousValues: true })
    );
  }

  async addParticipantToItemList(
    itemListId: string,
    participant: Participant
  ): Promise<Participant> {
    // Implement logic to add participant to item list in MongoDB
    throw new Error('Method not implemented.');
  }

  async updateParticipantRoleInItemList(
    userId: string,
    itemListId: string,
    role: ParticipantRole
  ): Promise<Participant> {
    // Implement logic to update participant role in MongoDB
    throw new Error('Method not implemented.');
  }

  async removeParticipantFromItemList(
    userId: string,
    itemListId: string
  ): Promise<void> {
    // Implement logic to remove participant from item list in MongoDB
    throw new Error('Method not implemented.');
  }

  async getListsByUserId(userId: string): Promise<ItemList[]> {
    // Implement logic to get item lists by user ID in MongoDB
    throw new Error('Method not implemented.');
  }
}
