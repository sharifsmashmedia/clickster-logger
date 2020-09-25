import type { Message } from '../transports/message';

export type Level = 'error' | 'warn' | 'info' | 'slow' | 'time' | 'debug';

export interface ITransport {
  emitLog: (message: Message) => void;
}

export type Colors = Record<string, 'green' | 'red' | 'yellow'>;

export type ILoggerFunctions = Record<
  Level,
  (message: Message, options: any) => void
>;
