const _ = require('lodash'),
  os = require('os'),
  path = require('path');

class Transport {
  static get levels() {
    return ['error', 'warn', 'info', 'slow', 'op', 'time', 'debug'];
  }

  constructor(options = {}) {
    this.logLevel = options.logLevel || 'debug';
    this.unfiltered = false;
  }

  levelIndex(level) {
    return Transport.levels.indexOf(level);
  }

  showLevel(level) {
    return this.levelIndex(level) <= this.levelIndex(this.logLevel.toLowerCase());
  }

  log(level, message, options) {
    if (this.unfiltered) {
      this.emitLog(level, message, options);
      return true;
    } else if (this.showLevel(level)) {
      const lastRepeat = this.repeat,
        lastRepeatLevel = this.lastLevel,
        lastRepeatMessage = this.lastMessage,
        lastRepeatOptions = this.lastOptions,
        isRepeat = this.isRepeat(level, message);

      if (!isRepeat) {
        if (lastRepeat > 0) {
          this.emitRepeat(lastRepeatLevel, lastRepeat,
            _.merge({}, lastRepeatOptions, { originalMessage: lastRepeatMessage }));
        }
        this.emitLog(level, message, options);
      }
      return true;
    } else {
      return false;
    }
  }

  emitRepeat(level, times, options) {
    const message = options.originalMessage;
    this.emitLog(level, `${message} (repeated ${times} time${(times === 1 ? '' : 's')})`, _.omit(options, 'originalMessage'));
  }

  emitLog() { }

  hostname() {
    return os.hostname();
  }

  stackTrace() {
    let stackTrace = new Error().stack.split('\n');
    const modulePath = __dirname,
      moduleMatch = new RegExp(`${path.resolve(modulePath, '../')}.*`);
    stackTrace.shift();
    stackTrace = _.dropWhile(stackTrace, i => moduleMatch.test(i));

    return stackTrace.join('\n');
  }

  formatMessage(message) {
    if (message instanceof Error) {
      return message.toString();
    } else if (typeof message === 'string') {
      return message;
    } else {
      return JSON.stringify(message, null, 2);
    }
  }

  isRepeat(level, message, options) {
    const isRepeat = this.lastLevel === level && this.lastMessage === message;
    if (isRepeat) { this.repeat++; } else { this.repeat = 0; }
    this.lastLevel = level;
    this.lastMessage = message;
    this.lastOpetions = options;

    return isRepeat;
  }
}

module.exports = Transport;
