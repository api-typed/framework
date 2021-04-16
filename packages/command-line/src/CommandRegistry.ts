export interface CommandOption {
  short?: string;
  description?: string;
  value?: 'required' | 'optional';
  default?: any;
  defaultDescription?: string;
  choices?: string[];
  variadic?: boolean;
}

export interface CommandDescription {
  target: Function;
  signature: string;
  description?: string;
  options?: Record<string, CommandOption | string>;
}

export class CommandRegistry {
  public static readonly defaultInstance = new CommandRegistry();

  private commands: CommandDescription[] = [];

  public addCommand(command: CommandDescription) {
    this.commands.push(command);
  }

  public getCommands(): CommandDescription[] {
    return this.commands;
  }
}

export default CommandRegistry.defaultInstance;
