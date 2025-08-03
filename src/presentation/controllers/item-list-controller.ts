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
import { CommandParserInterface } from '../../core/application/chat/interfaces/command-parser.interface';

export class ItemListController {
  constructor(
    private readonly itemListService: ItemListService,
    private readonly commandParser: CommandParserInterface
  ) {}

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

  async deleteItemsFromList(
    itemListId: string,
    itemNames: string[]
  ): Promise<ItemDto[] | null> {
    const deletedItems = await this.itemListService.deleteItemsFromList(
      itemListId,
      itemNames
    );
    return deletedItems
      ? deletedItems.map((item) =>
          plainToInstance(ItemDto, item, { excludeExtraneousValues: true })
        )
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

  async processChatCommand(
    itemListId: string,
    command: string
  ): Promise<string> {
    const parsedCommand = this.commandParser.parse(command);
    console.log('Parsed command:', parsedCommand);
    if (!parsedCommand) {
      throw new Error('Invalid command');
    }
    // Handle the parsed command
    switch (parsedCommand.action) {
      case 'add':
        const addedItems = await this.addItemsToList(
          itemListId,
          parsedCommand.items
        );
        return `Added items: ${addedItems.map((item) => item.name).join(', ')}`;
      case 'remove':
        const removedItems = await this.deleteItemsFromList(
          itemListId,
          parsedCommand.items.map((item) => item.name)
        );

        if (!removedItems || removedItems.length === 0) {
          return 'No items removed, list not found or no items matched';
        }
        return `Removed items: ${removedItems
          .map((item) => item.name)
          .join(', ')}`;
      case 'update':
        const updatedItems = [];
        if (!parsedCommand.items || parsedCommand.items.length === 0) {
          throw new Error('No items provided to update');
        }
        if (!parsedCommand.status) {
          throw new Error('No status provided for update');
        }
        const statusDto = new UpdateItemStatusDto();
        statusDto.status = parsedCommand.status;

        for (const item of parsedCommand.items) {
          const updatedItem = await this.updateItemStatus(
            itemListId,
            item.name,
            statusDto
          );
          updatedItems.push(updatedItem);
        }
        return `Updated items: ${updatedItems
          .map((item) => item.name)
          .join(', ')}`;
      case 'list':
        const allItems = await this.getItemListItems(itemListId);
        return `All items: ${allItems?.map((item) => item.name).join(', ')}`;
      default:
        throw new Error('Unknown command');
    }
  }
}
