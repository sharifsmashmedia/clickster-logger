/* eslint-disable @typescript-eslint/no-unused-vars */
import { ITransport, Level } from '../types';

import { Message } from './message';

export class Transport implements ITransport {
  logLevel: Level = 'debug';

  unfiltered = false;

  repeat = 0;

  lastMessage: any = null;

  static get levels(): Level[] {
    return ['error', 'warn', 'info', 'slow', 'time', 'debug'];
  }

  constructor(options: { logLevel?: Level } = {}) {
    this.logLevel = options.logLevel || 'debug';
  }

  emitLog(_message: Message) {}

  levelIndex(level: Level) {
    return Transport.levels.indexOf(level);
  }

  showLevel(level: Level) {
    return this.levelIndex(level) <= this.levelIndex(this.logLevel);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  loggable(func: Function) {
    return (message: Message) => {
      if (this.showLevel(message.level)) {
        return func(message);
      }

      return false;
    };
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  repeatable(func: Function) {
    return (message: Message) => {
      const lastRepeat = this.repeat;
      const lastRepeatMessage = this.lastMessage;
      const isRepeat = this.isRepeat(message);

      if (!isRepeat) {
        if (lastRepeat > 0) {
          lastRepeatMessage.repeat = lastRepeat;
          func(lastRepeatMessage);
        }
        return func(message);
      }

      return false;
    };
  }

  isRepeat(message: Message) {
    const isRepeat = message.isEqual(this.lastMessage);

    if (isRepeat) {
      // eslint-disable-next-line no-plusplus
      this.repeat++;
    } else {
      this.repeat = 0;
    }
    this.lastMessage = message;

    return isRepeat;
  }

  log(level: Level, message: any, options: any) {
    const messageObject = new Message(message, { level, ...options });

    if (this.unfiltered) {
      this.emitLog(messageObject);
      return true;
    }
    return this.loggable(this.repeatable(this.emitLog.bind(this)))(
      messageObject
    );
  }

  emitRepeat(level: Level, times: number, options: any) {
    const message = options.originalMessage;
    this.emitLog(
      new Message(
        `${message} (repeated ${times} time${times === 1 ? '' : 's'})`,
        { ...options, level }
      )
    );
  }
}
