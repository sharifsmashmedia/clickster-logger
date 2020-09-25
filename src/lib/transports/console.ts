import chalk from 'chalk';

import { Colors, ITransport } from '../types';

import { Message } from './message';
import { Transport } from './transport';

const colors: Colors = { error: 'red', warn: 'yellow', info: 'green' };

export class Console extends Transport implements ITransport {
  color(message: Message) {
    const color: 'red' | 'yellow' | 'green' | null =
      colors[message.level as 'error' | 'warn' | 'info'] || null;

    if (color) {
      return chalk[color](message.toString({ format: 'console' }));
    }
    return message.toString({ format: 'console' });
  }

  emitLog(message: Message): void {
    // eslint-disable-next-line no-console
    console.log(this.color(message));
  }
}
