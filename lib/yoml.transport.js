const _ = require('lodash'),
  Message = require('./yoml.message');

class Transport {
  static get levels() {
    return ['error', 'warn', 'info', 'slow', 'time', 'debug'];
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

  loggable(func) {
    return (message) => { // eslint-disable-line func-names
      if (this.showLevel(message.level)) {
        return func(message);
      }

      return false;
    };
  }

  repeatable(func) {
    return (message) => {
      const lastRepeat = this.repeat,
        lastRepeatMessage = this.lastMessage,
        isRepeat = this.isRepeat(message);

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

  isRepeat(message) {
    const isRepeat = message.isEqual(this.lastMessage);

    if (isRepeat) { this.repeat++; } else { this.repeat = 0; }
    this.lastMessage = message;

    return isRepeat;
  }

  log(level, message, options) {
    const messageObject = new Message(message, { level, ...options });

    if (this.unfiltered) {
      this.emitLog(messageObject);
      return true;
    } else {
      return this.loggable(this.repeatable(this.emitLog.bind(this)))(messageObject);
    }
  }

  emitRepeat(level, times, options) {
    const message = options.originalMessage;
    this.emitLog(level, `${message} (repeated ${times} time${(times === 1 ? '' : 's')})`, _.omit(options, 'originalMessage'));
  }

  emitLog() {}
}

module.exports = Transport;
