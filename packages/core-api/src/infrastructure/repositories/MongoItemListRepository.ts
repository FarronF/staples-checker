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
    itemName: string, // Using name as unique identifier
    status: ItemStatus
  ): Promise<Item> {
    const itemListDocument = await this.collection.findOne({ id: itemListId });
    if (!itemListDocument) {
      throw new NotFoundError('Item list not found');
    }

    const itemIndex = itemListDocument.items?.findIndex(
      (item: any) => item.name === itemName
    );
    if (itemIndex === -1 || itemIndex === undefined) {
      throw new NotFoundError('Item not found in list');
    }

    const updatedAt = new Date();

    await this.collection.updateOne(
      { id: itemListId, 'items.name': itemName },
      {
        $set: {
          'items.$.status': status,
          'items.$.updatedAt': updatedAt,
          updatedAt: updatedAt,
        },
      }
    );

    // Return the updated item
    const updatedItem = plainToInstance(
      Item,
      {
        ...itemListDocument.items[itemIndex],
        status: status,
        updatedAt: updatedAt,
      },
      { excludeExtraneousValues: true }
    );

    const itemErrors = validateSync(updatedItem);
    if (itemErrors.length > 0) {
      throw new Error(
        'Updated item validation failed: ' + JSON.stringify(itemErrors)
      );
    }

    return updatedItem;
  }

  async deleteItemFromList(
    itemListId: string,
    itemName: string
  ): Promise<Item | null> {
    const itemListDocument = await this.collection.findOne({ id: itemListId });
    if (!itemListDocument) {
      throw new NotFoundError('Item list not found');
    }

    const itemIndex = itemListDocument.items?.findIndex(
      (item: any) => item.name === itemName
    );
    if (itemIndex === -1 || itemIndex === undefined) {
      return null; // Item not found
    }

    // Get the item to return before deletion
    const itemToDelete = plainToInstance(
      Item,
      itemListDocument.items[itemIndex],
      { excludeExtraneousValues: true }
    );

    const updatedAt = new Date();

    // Remove the item from the array
    await this.collection.updateOne(
      { id: itemListId },
      {
        $pull: { items: { name: itemName } } as any,
        $set: { updatedAt: updatedAt },
      }
    );

    const itemErrors = validateSync(itemToDelete);
    if (itemErrors.length > 0) {
      throw new Error(
        'Deleted item validation failed: ' + JSON.stringify(itemErrors)
      );
    }

    return itemToDelete;
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
