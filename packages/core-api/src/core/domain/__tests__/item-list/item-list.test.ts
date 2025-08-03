import { plainToInstance } from 'class-transformer';
import { Item } from '../../item-list/item';
import { ItemStatus } from '../../item-list/item-status';
import { ItemList } from '../../item-list/item-list';

describe('ItemList', () => {
  let itemList: ItemList;
  let testItem: Item;

  beforeEach(() => {
    itemList = plainToInstance(ItemList, {
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

  describe('addItems', () => {
    it('should add items to empty list', () => {
      const newItems = [testItem];

      itemList.addItems(newItems);

      expect(itemList.items).toHaveLength(1);
      expect(itemList.items[0].name).toBe('Test Item');
    });

    it('should add multiple items', () => {
      const item2 = plainToInstance(Item, {
        name: 'Test Item 2',
        status: ItemStatus.Low,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      itemList.addItems([testItem, item2]);

      expect(itemList.items).toHaveLength(2);
      expect(itemList.items[0].name).toBe('Test Item');
      expect(itemList.items[1].name).toBe('Test Item 2');
    });

    it('should throw error when adding duplicate item names', () => {
      itemList.addItems([testItem]);

      const duplicateItem = plainToInstance(Item, {
        name: 'Test Item',
        status: ItemStatus.Low,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => {
        itemList.addItems([duplicateItem]);
      }).toThrow('Item name "Test Item" already exists in the list.');
    });

    it('should prevent duplicate names within the same batch', () => {
      const duplicateItem = plainToInstance(Item, {
        name: 'Test Item',
        status: ItemStatus.Low,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => {
        itemList.addItems([testItem, duplicateItem]);
      }).toThrow('Item name "Test Item" already exists in the list.');
    });
  });

  describe('removeItem', () => {
    beforeEach(() => {
      itemList.addItems([testItem]);
    });

    it('should remove existing item', () => {
      const removedItem = itemList.removeItem('Test Item');

      expect(removedItem).toBeTruthy();
      expect(removedItem?.name).toBe('Test Item');
      expect(itemList.items).toHaveLength(0);
    });

    it('should return null when removing non-existent item', () => {
      const removedItem = itemList.removeItem('Non-existent Item');

      expect(removedItem).toBeNull();
      expect(itemList.items).toHaveLength(1);
    });
  });

  describe('creation', () => {
    it('should create ItemList with all required properties', () => {
      expect(itemList.id).toBe('test-id');
      expect(itemList.name).toBe('Test List');
      expect(itemList.description).toBe('Test Description');
      expect(itemList.items).toEqual([]);
      expect(itemList.participants).toEqual([]);
      expect(itemList.createdAt).toBeInstanceOf(Date);
      expect(itemList.updatedAt).toBeInstanceOf(Date);
    });
  });
});
