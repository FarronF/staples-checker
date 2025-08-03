import { Item } from '../../domain/item-list/item';
import { ItemList } from '../../domain/item-list/item-list';
import { ItemStatus } from '../../domain/item-list/item-status';
import { Participant } from '../../domain/item-list/participant';
import { ParticipantRole } from '../../domain/item-list/participant-role';
import { CreateItemListCommand } from '../item-list/commands/create-item-list.command';
import { UpdateItemListCommand } from '../item-list/commands/update-item-list.command';

export interface ItemListRepository {
  getItemListById(id: string): Promise<ItemList | null>;
  createItemList(command: CreateItemListCommand): Promise<ItemList>;
  updateItemList(
    id: string,
    command: UpdateItemListCommand
  ): Promise<ItemList | null>;
  deleteItemList(id: string): Promise<ItemList | null>;

  // Item operations
  getItemListItems(id: string): Promise<Item[] | null>;
  addItemsToItemList(itemListId: string, item: Item[]): Promise<Item[]>;
  updateItemStatusInItemList(
    itemListId: string,
    itemName: string,
    status: ItemStatus
  ): Promise<Item>;
  getItemsByStatus(
    itemListId: string,
    statuses: ItemStatus[]
  ): Promise<Item[] | null>;

  deleteItemFromList(
    itemListId: string,
    itemName: string
  ): Promise<Item | null>;

  // Participant operations
  addParticipantToItemList(
    itemListId: string,
    participant: Participant
  ): Promise<Participant>;
  updateParticipantRoleInItemList(
    itemListId: string,
    userId: string,
    role: ParticipantRole
  ): Promise<Participant>;
  removeParticipantFromItemList(
    itemListId: string,
    userId: string
  ): Promise<void>;

  getListsByUserId(userId: string): Promise<ItemList[]>;
}
