import { ItemDto } from '../../../presentation/dtos/queries/item-list-dtos/item-dto';
import { ParsedCommand } from '../../domain/chat/parsed-command';
import { CommandParserInterface } from './interfaces/command-parser.interface';

export class CommandParser implements CommandParserInterface {
  private patterns = [
    // "Add milk, eggs, butter"
    { regex: /^add\s+(.+)$/i, action: 'add', status: 'Ok' },

    // "Update milk to low" or "Set milk to low"
    {
      regex: /^(?:update|set)\s+(.+?)\s+to\s+(ok|low|out|unknown)$/i,
      action: 'update',
    },

    // "Remove milk, eggs"
    { regex: /^(?:remove|delete)\s+(.+)$/i, action: 'remove' },

    // "Got milk, eggs, butter" (implies items are now Ok/available)
    { regex: /^got\s+(.+)$/i, action: 'update', status: 'Ok' },

    // "Need milk, eggs" (implies items are Low/needed)
    { regex: /^need\s+(.+)$/i, action: 'update', status: 'Low' },
    { regex: /^low\s+(?:on\s+)?(.+)$/i, action: 'update', status: 'Low' },

    // "Out of milk, eggs" (implies items are Out)
    { regex: /^out\s+(?:of\s+)?(.+)$/i, action: 'update', status: 'Out' },

    // "Show low items" or "List out items"
    {
      regex: /^(?:show|list)\s+(ok|low|out|unknown)\s+items?$/i,
      action: 'filter',
    },

    // "Show items" or "List items"
    { regex: /^(?:show|list)\s+items?$/i, action: 'list' },
  ];

  parse(input: string): ParsedCommand | null {
    const trimmed = input.trim();
    if (!trimmed) return null;

    for (const pattern of this.patterns) {
      const match = trimmed.match(pattern.regex);
      if (match) {
        const command: ParsedCommand = {
          action: pattern.action as any,
          items: [],
        };

        if (pattern.status) {
          command.status = pattern.status as any;
        }

        if (
          match[2] &&
          ['ok', 'low', 'out', 'unknown'].includes(match[2].toLowerCase())
        ) {
          command.status = this.capitalizeFirst(match[2]) as any;
        }

        if (match[1]) {
          if (pattern.action === 'filter') {
            command.status = this.capitalizeFirst(match[1]) as any;
          } else {
            const itemNames = this.parseItems(match[1]);
            command.items = itemNames.map((name) => ({ name } as ItemDto));
          }
        }

        return command;
      }
    }

    return null;
  }

  private parseItems(itemsText: string): string[] {
    return itemsText
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
