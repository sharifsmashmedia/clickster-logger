/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import { Console } from 'console';

import { Operation } from './extras/operation';
import { Timer } from './extras/timer';
import { Message } from './transports/message';
import { Redis } from './transports/redis';
import { Slack } from './transports/slack';
import { Transport } from './transports/transport';
import { ILoggerFunctions, Level } from './types';

export class Logger implements ILoggerFunctions {
  _times: Record<string, Timer> = {};

  _operations: Record<string, Operation> = {};

  _transports: (Console | Slack | Redis)[] = [];

  static get levels(): Level[] {
    return Transport.levels;
  }

  constructor(options = {}) {
    this._transports = this.configureTransports(options);
  }

  error(message: Message, options: any) {
    this.log('error', message, options);
  }

  warn(message: Message, options: any) {
    this.log('warn', message, options);
  }

  info(message: Message, options: any) {
    this.log('info', message, options);
  }

  slow(message: Message, options: any) {
    this.log('slow', message, options);
  }

  /*
  time(message: Message, options: any) {
    this.log('time', message, options);
  } */

  debug(message: Message, options: any) {
    this.log('debug', message, options);
  }

  configureTransports(options: any): (Console | Slack | Redis)[] {
    const _return: (Console | Slack | Redis)[] = [];
    const transports = options.transports
      ? options.transports
      : { console: options };

    Object.keys(transports).forEach((transport) => {
      let module;
      switch (transport) {
        case 'console':
          module = new Console(transports[transport]);
          break;
        case 'slack':
          module = new Slack(transports[transport]);
          break;
        case 'redis':
          module = new Redis(transports[transport]);
          break;
        default:
          break;
      }
      if (module) _return.push(module);
    });
    return _return;
  }

  log(level: Level, message: any, options?: any) {
    const _logged = this._transports.map((t: any) =>
      t.log(level, message, options)
    );

    if (_logged) {
      // Object.keys(this._operations).forEach((o: any) => o.add(level.toUpperCase(), message));
    }
  }

  startTimer(label: string) {
    this._times[label] = new Timer(label);
  }

  time(message: Message) {
    this.startTimer(message.toString());
  }

  durationTimer(label: string) {
    try {
      return this._times[label].duration;
    } catch (e) {
      return 0;
    }
  }

  timeEnd(label: string, options: { slow: number }) {
    const timer = this._times[label];

    if (timer && timer.duration > 0) {
      if (options.slow && timer.isSlow(options.slow)) {
        this.log('slow', timer.toString());
      } else {
        this.log('time', timer.toString());
      }
    }
  }

  op(label: string) {
    this._operations[label] = new Operation(label);
  }

  opEnd(label: string, options: { slow: number }) {
    const operation = this._operations[label];

    if (operation) {
      if (options.slow && operation.isSlow(options.slow)) {
        operation.logs().forEach((l: any) => this.log('slow', l));
        this.log('slow', operation.toString());
      }
    }

    delete this._operations[label];
  }
}
