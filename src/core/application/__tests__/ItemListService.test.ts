import { Item } from '../../domain/item-list/item';
import { ItemList } from '../../domain/item-list/item-list';
import { ItemStatus } from '../../domain/item-list/item-status';
import { CreateItemListCommand } from '../item-list/commands/create-item-list.command';
import { ItemListService } from '../item-list/ItemListService';
import { ItemListRepository } from '../repositories/ItemListRepository';
import { plainToInstance } from 'class-transformer';

describe('ItemListService', () => {
  let service: ItemListService;
  let mockRepository: jest.Mocked<ItemListRepository>;
  let testItemList: ItemList;
  let testItem: Item;

  beforeEach(() => {
    mockRepository = {
      getItemListById: jest.fn(),
      createItemList: jest.fn(),
      updateItemList: jest.fn(),
      deleteItemList: jest.fn(),
      getItemListItems: jest.fn(),
      addItemsToItemList: jest.fn(),
      updateItemStatusInItemList: jest.fn(),
      deleteItemFromList: jest.fn(),
      deleteItemsFromList: jest.fn(),
      getItemsByStatus: jest.fn(),
      addParticipantToItemList: jest.fn(),
      updateParticipantRoleInItemList: jest.fn(),
      removeParticipantFromItemList: jest.fn(),
      getListsByUserId: jest.fn(),
    };

    service = new ItemListService(mockRepository);

    testItemList = plainToInstance(ItemList, {
      id: 'test-id',
      name: 'Test List',
      description: 'Test Description',
      items: [],
      participants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    testItem = plainToInstance(Item, {
      name: 'Test Item',
      status: ItemStatus.Ok,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  describe('getItemListById', () => {
    it('should return item list when found', async () => {
      mockRepository.getItemListById.mockResolvedValue(testItemList);

      const result = await service.getItemListById('test-id');

      expect(result).toBe(testItemList);
      expect(mockRepository.getItemListById).toHaveBeenCalledWith('test-id');
    });

    it('should return null when not found', async () => {
      mockRepository.getItemListById.mockResolvedValue(null);

      const result = await service.getItemListById('non-existent');

      expect(result).toBeNull();
      expect(mockRepository.getItemListById).toHaveBeenCalledWith(
        'non-existent'
      );
    });
  });

  describe('createItemList', () => {
    it('should create item list successfully', async () => {
      const command = plainToInstance(CreateItemListCommand, {
        name: 'New List',
        description: 'New Description',
      });
      mockRepository.createItemList.mockResolvedValue(testItemList);

      const result = await service.createItemList(command);

      expect(result).toBe(testItemList);
      expect(mockRepository.createItemList).toHaveBeenCalledWith(command);
    });
  });

  describe('addItemsToItemList', () => {
    it('should add items to list successfully', async () => {
      const items = [testItem];
      mockRepository.addItemsToItemList.mockResolvedValue(items);

      const result = await service.addItemsToItemList('test-id', items);

      expect(result).toBe(items);
      expect(mockRepository.addItemsToItemList).toHaveBeenCalledWith(
        'test-id',
        items
      );
    });
  });

  describe('updateItemStatusInItemList', () => {
    it('should update item status successfully', async () => {
      const updatedItem = { ...testItem, status: ItemStatus.Low };
      mockRepository.updateItemStatusInItemList.mockResolvedValue(updatedItem);

      const result = await service.updateItemStatusInItemList(
        'test-id',
        'Test Item',
        ItemStatus.Low
      );

      expect(result).toBe(updatedItem);
      expect(mockRepository.updateItemStatusInItemList).toHaveBeenCalledWith(
        'test-id',
        'Test Item',
        ItemStatus.Low
      );
    });
  });

  describe('getItemsByStatus', () => {
    it('should return filtered items by status', async () => {
      const filteredItems = [testItem];
      mockRepository.getItemsByStatus.mockResolvedValue(filteredItems);

      const result = await service.getItemsByStatus('test-id', [ItemStatus.Ok]);

      expect(result).toBe(filteredItems);
      expect(mockRepository.getItemsByStatus).toHaveBeenCalledWith('test-id', [
        ItemStatus.Ok,
      ]);
    });

    it('should return null when list not found', async () => {
      mockRepository.getItemsByStatus.mockResolvedValue(null);

      const result = await service.getItemsByStatus('non-existent', [
        ItemStatus.Ok,
      ]);

      expect(result).toBeNull();
    });
  });

  describe('deleteItemsFromList', () => {
    it('should delete items successfully', async () => {
      mockRepository.deleteItemsFromList.mockResolvedValue([testItem]);

      const result = await service.deleteItemsFromList('test-id', [
        'Test Item',
      ]);

      expect(result).toStrictEqual([testItem]);
      expect(mockRepository.deleteItemsFromList).toHaveBeenCalledWith(
        'test-id',
        ['Test Item']
      );
    });
  });
});
