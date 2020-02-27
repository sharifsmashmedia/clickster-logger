const _ = require('lodash'),

  Console = require('./yoml.console'),
  Slack = require('./yoml.slack'),
  Redis = require('./yoml.redis');

class Timer {
  constructor(name) {
    this.name = name;
    this._start = Date.now();
  }

  toString() {
    return `${this.name}:${this.duration}ms`;
  }

  get duration() {
    return Date.now() - this._start;
  }

  isSlow(slow) {
    return this.duration > slow;
  }
}

class Operation extends Timer {
  constructor(name) {
    super(name);
    this._operations = [];
  }

  add(level, message) {
    this._operations.push([level, message]);
  }

  logs() {
    return _.map(this._operations, op => [this.name, ...op].join(':'));
  }
}

class Logger {
  static get levels() {
    return Console.levels;
  }

  constructor(options = {}) {
    this._times = {};
    this._operations = {};
    this._transports = this.configureTransports(options);

    this.initLogLevelFunctions();
  }

  initLogLevelFunctions() {
    Logger.levels.forEach((lvl) => {
      if (!_.isFunction(Logger.prototype[lvl])) {
        // eslint-disable-next-line func-names
        this[lvl] = function (message, options) { this.log(lvl, message, options); }
      }
    });
  }

  configureTransports(options) {
    const _return = [],
      transports = _.has(options, 'transports')
        ? options.transports
        : { console: options };

    _.each(transports, (transportOptions, transport) => {
      let module;
      switch (transport) {
        case 'console':
          module = new Console(transportOptions);
          break;
        case 'slack':
          module = new Slack(transportOptions);
          break;
        case 'redis':
          module = new Redis(transportOptions);
          break;
        default:
          break;
      }
      if (module) _return.push(module);
    });
    return _return;
  }

  log(level, message, options) {
    const _logged = _.map(this._transports, t => t.log(level, message, options));

    if (level !== 'op' && !_.every(_logged, Boolean)) {
      _.each(this._operations, o => o.add(level.toUpperCase(), message));
    }
  }

  startTimer(label) {
    this._times[label] = new Timer(label);
  }

  time(label) {
    this.startTimer(label);
  }

  durationTimer(label) {
    try {
      return this._times[label].duration;
    } catch (e) {
      return 0;
    }
  }

  timeEnd(label, options) {
    const timer = this._times[label];

    if (timer && timer.duration > 0) {
      if (_.has(options, 'slow') && timer.isSlow(_.get(options, 'slow', 0))) {
        this.log('slow', timer.toString());
      } else {
        this.log('time', timer.toString());
      }
    }
  }

  op(label) {
    this._operations[label] = new Operation(label);
  }

  opEnd(label, options) {
    const operation = this._operations[label];

    if (operation) {
      if (_.has(options, 'slow') && operation.isSlow(_.get(options, 'slow', 0))) {
        _.each(operation.logs(), l => this.log('slow', l));
        this.log('slow', operation.toString());
      }
    }

    delete this._operations[label];
  }
}


module.exports = Logger;
