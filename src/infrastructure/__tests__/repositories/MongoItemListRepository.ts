import { Collection } from 'mongodb';
import { plainToInstance } from 'class-transformer';
import { MongoItemListRepository } from '../../repositories/MongoItemListRepository';
import { CreateItemListCommand } from '../../../core/application/item-list/commands/create-item-list.command';
import { NotFoundError } from '../../../core/domain/errors/not-found-error';
import { Item } from '../../../core/domain/item-list/item';
import { ItemList } from '../../../core/domain/item-list/item-list';
import { ItemStatus } from '../../../core/domain/item-list/item-status';

describe('MongoItemListRepository', () => {
  let repository: MongoItemListRepository;
  let mockCollection: jest.Mocked<Collection>;
  let testItemListDocument: any;
  let testItem: Item;

  beforeEach(() => {
    mockCollection = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
    } as any;

    repository = new MongoItemListRepository(mockCollection);

    testItemListDocument = {
      id: 'test-id',
      name: 'Test List',
      description: 'Test Description',
      items: [],
      participants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    testItem = plainToInstance(Item, {
      name: 'Test Item',
      status: ItemStatus.Ok,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  describe('getItemListById', () => {
    it('should return ItemList when document exists', async () => {
      mockCollection.findOne.mockResolvedValue(testItemListDocument);

      const result = await repository.getItemListById('test-id');

      expect(result).toBeInstanceOf(ItemList);
      expect(result?.id).toBe('test-id');
      expect(mockCollection.findOne).toHaveBeenCalledWith({ id: 'test-id' });
    });

    it('should return null when document does not exist', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await repository.getItemListById('non-existent');

      expect(result).toBeNull();
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        id: 'non-existent',
      });
    });
  });

  describe('createItemList', () => {
    it('should create and return new ItemList', async () => {
      const command = plainToInstance(CreateItemListCommand, {
        name: 'New List',
        description: 'New Description',
      });
      mockCollection.insertOne.mockResolvedValue({
        insertedId: 'test-id',
      } as any);

      const result = await repository.createItemList(command);

      expect(result).toBeInstanceOf(ItemList);
      expect(result.name).toBe('New List');
      expect(result.description).toBe('New Description');
      expect(mockCollection.insertOne).toHaveBeenCalled();
    });
  });

  describe('addItemsToItemList', () => {
    it('should add items to existing list', async () => {
      mockCollection.findOne.mockResolvedValue(testItemListDocument);
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 } as any);

      const result = await repository.addItemsToItemList('test-id', [testItem]);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Item);
      expect(mockCollection.updateOne).toHaveBeenCalled();
    });

    it('should throw NotFoundError when list does not exist', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      await expect(
        repository.addItemsToItemList('non-existent', [testItem])
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getItemsByStatus', () => {
    it('should return filtered items by status', async () => {
      const documentWithItems = {
        ...testItemListDocument,
        items: [
          {
            name: 'Item 1',
            status: ItemStatus.Ok,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Item 2',
            status: ItemStatus.Low,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Item 3',
            status: ItemStatus.Ok,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };
      mockCollection.findOne.mockResolvedValue(documentWithItems);

      const result = await repository.getItemsByStatus('test-id', [
        ItemStatus.Ok,
      ]);

      expect(result).toHaveLength(2);
      expect(result?.[0].status).toBe(ItemStatus.Ok);
      expect(result?.[1].status).toBe(ItemStatus.Ok);
    });

    it('should return null when list does not exist', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await repository.getItemsByStatus('non-existent', [
        ItemStatus.Ok,
      ]);

      expect(result).toBeNull();
    });

    it('should return empty array when no items match', async () => {
      const documentWithItems = {
        ...testItemListDocument,
        items: [
          {
            name: 'Item 1',
            status: ItemStatus.Low,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };
      mockCollection.findOne.mockResolvedValue(documentWithItems);

      const result = await repository.getItemsByStatus('test-id', [
        ItemStatus.Ok,
      ]);

      expect(result).toEqual([]);
    });
  });

  describe('deleteItemFromList', () => {
    it('should delete item and return it', async () => {
      const documentWithItems = {
        ...testItemListDocument,
        items: [
          {
            name: 'Test Item',
            status: ItemStatus.Ok,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };
      mockCollection.findOne.mockResolvedValue(documentWithItems);
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 } as any);

      const result = await repository.deleteItemFromList(
        'test-id',
        'Test Item'
      );

      expect(result).toBeInstanceOf(Item);
      expect(result?.name).toBe('Test Item');
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { id: 'test-id' },
        expect.objectContaining({
          $pull: { items: { name: 'Test Item' } },
        })
      );
    });

    it('should return null when item not found', async () => {
      mockCollection.findOne.mockResolvedValue(testItemListDocument);

      const result = await repository.deleteItemFromList(
        'test-id',
        'Non-existent Item'
      );

      expect(result).toBeNull();
    });
  });
});
