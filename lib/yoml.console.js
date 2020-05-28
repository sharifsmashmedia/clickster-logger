const chalk = require('chalk'),

  Transport = require('./yoml.transport');

class Console extends Transport {
  static get colors() { return { error: 'red', warn: 'yellow', info: 'green' }; }

  color(message) {
    const color = Console.colors[message.level];
    if (color) { return chalk[color](message.toString({ format: 'console' })); } return message.toString({ format: 'console' });
  }

  emitLog(message) {
    // eslint-disable-next-line no-console
    console.log(this.color(message));
  }
}

module.exports = Console;
