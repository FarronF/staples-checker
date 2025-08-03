import { ItemListService } from '../../core/application/item-list/ItemListService';
import { CreateItemListDto } from '../dtos/commands/create-item-list-dto';
import { ItemListDto } from '../dtos/queries/item-list-dtos/item-list-dto';
import { plainToInstance } from 'class-transformer';
import { CreateItemListCommand } from '../../core/application/item-list/commands/create-item-list.command';
import { ItemDto } from '../dtos/queries/item-list-dtos/item-dto';
import { Item } from '../../core/domain/item-list/item';
import { AddItemDto } from '../dtos/commands/add-items-to-list-dto';
import { UpdateItemStatusDto } from '../dtos/item-list-dtos/update-item-status-dto';
import { GetItemsByStatusQuery } from '../dtos/queries/item-list-dtos/get-items-by-status-query';

export class ItemListController {
  constructor(private readonly itemListService: ItemListService) {}

  async getItemListById(id: string): Promise<ItemListDto | null> {
    const itemList = await this.itemListService.getItemListById(id);
    return itemList ? plainToInstance(ItemListDto, itemList) : null;
  }

  async createItemList(dto: CreateItemListDto): Promise<ItemListDto> {
    const createItemListCommand = plainToInstance(CreateItemListCommand, dto);
    return this.itemListService.createItemList(createItemListCommand);
  }

  async deleteItemListById(id: string): Promise<ItemListDto | null> {
    const deletedItemList = this.itemListService.deleteItemListById(id);
    return deletedItemList
      ? plainToInstance(ItemListDto, deletedItemList)
      : null;
  }

  async getItemListItems(id: string): Promise<ItemDto[] | null> {
    const itemList = await this.itemListService.getItemListItems(id);
    if (!itemList) {
      return null;
    }

    return itemList.map((item) => plainToInstance(ItemDto, item));
  }

  async addItemsToList(
    itemListId: string,
    itemDtos: AddItemDto[]
  ): Promise<ItemDto[]> {
    const items = itemDtos.map((dto) => plainToInstance(Item, dto)); // TODO should this be command?
    if (items.length === 0) {
      throw new Error('No items provided to add to the list');
    }
    console.log('Adding items to list', itemListId, items);
    const added = await this.itemListService.addItemsToItemList(
      itemListId,
      items
    );

    return added.map((item) =>
      plainToInstance(ItemDto, item, { excludeExtraneousValues: true })
    );
  }

  async updateItemStatus(
    itemListId: string,
    itemName: string,
    dto: UpdateItemStatusDto
  ): Promise<ItemDto> {
    const updatedItem = await this.itemListService.updateItemStatusInItemList(
      itemListId,
      itemName,
      dto.status
    );

    return plainToInstance(ItemDto, updatedItem, {
      excludeExtraneousValues: true,
    });
  }

  async getItemByName(
    itemListId: string,
    itemName: string
  ): Promise<ItemDto | null> {
    const items = await this.itemListService.getItemListItems(itemListId);
    if (!items) {
      return null;
    }

    const item = items.find((item) => item.name === itemName);
    return item
      ? plainToInstance(ItemDto, item, { excludeExtraneousValues: true })
      : null;
  }

  async deleteItemFromList(
    itemListId: string,
    itemName: string
  ): Promise<ItemDto | null> {
    // You'll need to implement this in your service and repository
    const deletedItem = await this.itemListService.deleteItemFromList(
      itemListId,
      itemName
    );
    return deletedItem
      ? plainToInstance(ItemDto, deletedItem, { excludeExtraneousValues: true })
      : null;
  }

  async getItemsByStatus(
    itemListId: string,
    query: GetItemsByStatusQuery
  ): Promise<ItemDto[] | null> {
    // If no statuses provided, return all items
    if (!query.statuses || query.statuses.length === 0) {
      return this.getItemListItems(itemListId);
    }

    const items = await this.itemListService.getItemsByStatus(
      itemListId,
      query.statuses
    );

    if (items === null) {
      return null; // List not found
    }

    return items.map((item) =>
      plainToInstance(ItemDto, item, { excludeExtraneousValues: true })
    );
  }
}
