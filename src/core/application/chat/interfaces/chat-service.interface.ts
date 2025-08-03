export interface ChatMessage {
  type: 'user' | 'system' | 'error';
  content: string;
  timestamp: Date;
}

export interface ChatCommand {
  command: string;
  description: string;
  handler: (args: string[]) => Promise<void>;
}

export interface ChatServiceInterface {
  handleCommand(command: ChatCommand): string;
}
