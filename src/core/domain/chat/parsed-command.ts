import { ItemDto } from '../../../presentation/dtos/queries/item-list-dtos/item-dto';
import { ItemStatus } from '../item-list/item-status';

export interface ParsedCommand {
  action:
    | 'add'
    | 'update'
    | 'remove'
    | 'list'
    | 'show'
    | 'filter'
    | 'got'
    | 'need'
    | 'out';
  items: ItemDto[];
  status?: ItemStatus;
}
