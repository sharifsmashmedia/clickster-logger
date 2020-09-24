import chalk from 'chalk';

import { Message } from '../types/message';

import { Transport } from './transport';

const colors = { error: 'red', warn: 'yellow', info: 'green' };

export class Console extends Transport {
  color(message: Message) {
    const color: string | null =
      colors[message.level as 'error' | 'warn' | 'info'] || null;

    if (color) {
      // return chalk[color](message.toString({ format: 'console' }));

      return chalk.red(message.toString());
    }
    // return message.toString({ format: 'console' });
    return message.toString();
  }

  emitLog(message: Message): void {
    // eslint-disable-next-line no-console
    console.log(this.color(message));
  }
}
