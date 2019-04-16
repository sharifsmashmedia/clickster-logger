const chalk = require('chalk'),

  Transport = require('./yoml.transport');

class Console extends Transport {
  static get colors() { return { error: 'red', warn: 'yellow', info: 'green' }; }

  color(level, message) {
    const color = Console.colors[level];
    if (color) { return chalk[color](message); } return message;
  }

  emitLog(level, message) {
    // eslint-disable-next-line no-console
    console.log(this.color(level, [new Date().toISOString(), level.toUpperCase(), this.formatMessage(message)].join(':')));

    // eslint-disable-next-line no-console
    if (level === 'error') console.log(this.stackTrace());
  }
}

module.exports = Console;
