const redis = require('redis'),
  _ = require('lodash'),
  Transport = require('./yoml.transport');

class Redis extends Transport {
  constructor(options) {
    super(options);
    this.client = redis.createClient(_.get(options, 'url'));
    this.cap = _.get(options, 'cap', 1000);
    this.channel = _.get(options, 'channel');
  }

  emitLog(level, message) {
    const payload = `${level}:${this.formatMessage(message)}`;
    this.client.lpush(this.channel, payload);
    this.client.ltrim(this.channel, 0, this.cap - 1);
    this.client.publish(this.channel, payload);
  }
}

module.exports = Redis;
