import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ItemStatus } from '../../item-list/item-status';
import { Item } from '../../item-list/item';

describe('Item', () => {
  describe('creation', () => {
    it('should create a valid item with all required fields', () => {
      const itemData = {
        name: 'Test Item',
        status: ItemStatus.Ok,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const item = plainToInstance(Item, itemData);

      expect(item.name).toBe('Test Item');
      expect(item.status).toBe(ItemStatus.Ok);
      expect(item.createdAt).toBeInstanceOf(Date);
      expect(item.updatedAt).toBeInstanceOf(Date);
    });

    it('should validate successfully with valid data', () => {
      const item = plainToInstance(Item, {
        name: 'Valid Item',
        status: ItemStatus.Low,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const errors = validateSync(item);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid status', () => {
      const item = plainToInstance(Item, {
        name: 'Invalid Item',
        status: 'InvalidStatus' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const errors = validateSync(item);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('status');
    });
  });

  describe('status enum', () => {
    it('should accept all valid ItemStatus values', () => {
      const validStatuses = [
        ItemStatus.Out,
        ItemStatus.Low,
        ItemStatus.Ok,
        ItemStatus.Unknown,
      ];

      validStatuses.forEach((status) => {
        const item = plainToInstance(Item, {
          name: 'Test Item',
          status,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const errors = validateSync(item);
        expect(errors).toHaveLength(0);
      });
    });
  });
});
