/* eslint-disable no-underscore-dangle */
/* eslint-disable import/prefer-default-export */
import os from 'os';

import { Level } from '../constants/level';

export class Message {
  private level: Level;

  private _item: any;

  private _message = '';

  private repeat: unknown;

  private topic: unknown;

  private date: Date;

  private hostname: string;

  private attachments: Message[];

  private _stack: null | string = null;

  constructor(item: any, { attachments, level, repeat, topic } = {}) {
    this.level = level || 'info';
    this.item = item;
    this.repeat = repeat;
    this.topic = topic;
    this.date = new Date();
    this.hostname = os.hostname();
    this.attachments = this.processAttachments(attachments);
  }

  get stack() {
    return this._stack;
  }

  set item(item: any) {
    this._item = item;

    if (item instanceof Error) {
      this._message = item.message;
      this._stack = item.stack ? item.stack : null;
    } else if (typeof item === 'string') {
      this._message = item;
    } else {
      this._message = JSON.stringify(item, null, 2);
    }
  }

  get isObject() {
    return this._item instanceof Object;
  }

  get isSimpleObject() {
    return (
      this.isObject &&
      Object.keys(this._item).reduce(
        (previousValue: boolean, currentKey: string) =>
          previousValue &&
          (typeof currentKey === 'number' || typeof currentKey === 'string') &&
          (typeof this._item[currentKey] === 'number' ||
            typeof this._item[currentKey] === 'string'),
        true
      )
    );
  }

  get length(): number {
    if (this.isObject) {
      return Object.keys(this._item).length;
    }
    if (_.isString(this._item)) {
      return this._item.length;
    }
    return 0;
  }

  processAttachments(items) {
    if (items) {
      return items.map((item) => new Message(item, { level: this.level }));
    }

    return [];
  }

  isEqual(message) {
    return (
      message &&
      message instanceof Message &&
      this.level === message.level &&
      this._message === message._message
    );
  }

  formatedMessage(format) {
    if (format === 'console') {
      return [
        this.date.toISOString(),
        this.level.toUpperCase(),
        this._message,
      ].join(':');
    }

    // clean
    return this._message;
  }

  toString({
    format = 'clean',
    includeStack = true,
    includeAttachments = true,
  } = {}) {
    const message = [this.formatedMessage(format)];

    if (includeStack && this._stack) {
      message.push(this._stack);
    }

    if (includeAttachments) {
      this.attachments.forEach((attachment) => {
        message.push(attachment.toString({ format, includeStack }));
      });
    }

    return message.join('\n');
  }

  toJson({ format = 'clean' }) {
    return {
      message: this.formattedMessage(format),
      level: this.level,
      date: this.date.toISOString(),
      attachments: this.attachments.map((attachment) =>
        attachment.toJson({ format })
      ),
    };
  }
}
