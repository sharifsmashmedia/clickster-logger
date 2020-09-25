/* eslint-disable no-underscore-dangle */
import { Message } from '../transports/message';
import { Level } from '../types';

import { Timer } from './timer';

export class Operation extends Timer {
  _operations: [Level, Message][];

  constructor(name: string) {
    super(name);
    this._operations = [];
  }

  add(level: Level, message: Message): void {
    this._operations.push([level, message]);
  }

  logs(): string[] {
    return this._operations.map((op) => [this.name, ...op].join(':'));
  }
}
