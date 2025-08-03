import { ParsedCommand } from '../../../domain/chat/parsed-command';

export interface CommandParserInterface {
  parse(input: string): ParsedCommand | null;
}
