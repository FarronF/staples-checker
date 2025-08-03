import { Item } from '../../domain/item-list/item';
import { ItemList } from '../../domain/item-list/item-list';
import { ItemStatus } from '../../domain/item-list/item-status';
import { Participant } from '../../domain/item-list/participant';
import { ParticipantRole } from '../../domain/item-list/participant-role';
import { ItemListRepository } from '../repositories/ItemListRepository';
import { CreateItemListCommand } from './commands/create-item-list.command';
import { UpdateItemListCommand } from './commands/update-item-list.command';

export class ItemListService {
  constructor(private readonly repo: ItemListRepository) {}

  // Generic methods for item list management
  async getItemListById(id: string): Promise<ItemList | null> {
    return this.repo.getItemListById(id);
  }

  async createItemList(
    createItemListCommand: CreateItemListCommand
  ): Promise<ItemList> {
    return this.repo.createItemList(createItemListCommand);
  }

  async updateItemList(
    itemListId: string,
    updateItemListCommand: UpdateItemListCommand
  ): Promise<ItemList | null> {
    return this.repo.updateItemList(itemListId, updateItemListCommand);
  }

  async deleteItemListById(id: string): Promise<ItemList | null> {
    return this.repo.deleteItemList(id);
  }

  // Item operations
  async getItemListItems(id: string): Promise<Item[] | null> {
    const itemList = await this.repo.getItemListItems(id);
    return itemList ? itemList : null;
  }

  async addItemsToItemList(itemListId: string, items: Item[]): Promise<Item[]> {
    return this.repo.addItemsToItemList(itemListId, items);
  }

  async updateItemStatusInItemList(
    itemListId: string,
    itemName: string,
    status: ItemStatus
  ): Promise<Item> {
    return this.repo.updateItemStatusInItemList(itemListId, itemName, status);
  }

  async deleteItemFromList(
    itemListId: string,
    itemName: string
  ): Promise<Item | null> {
    return this.repo.deleteItemFromList(itemListId, itemName);
  }

  async getItemsByStatus(
    itemListId: string,
    statuses: ItemStatus[]
  ): Promise<Item[] | null> {
    return this.repo.getItemsByStatus(itemListId, statuses);
  }

  // Participant operations
  async addParticipantToItemList(
    itemListId: string,
    participant: Participant
  ): Promise<Participant> {
    return this.repo.addParticipantToItemList(itemListId, participant);
  }

  async updateParticipantRoleInItemList(
    itemListId: string,
    userId: string,
    role: ParticipantRole
  ): Promise<Participant> {
    return this.repo.updateParticipantRoleInItemList(itemListId, userId, role);
  }

  async removeParticipantFromItemList(
    itemListId: string,
    userId: string
  ): Promise<void> {
    return this.repo.removeParticipantFromItemList(itemListId, userId);
  }

  async getListsByUserId(userId: string): Promise<ItemList[]> {
    return this.repo.getListsByUserId(userId);
  }
}
