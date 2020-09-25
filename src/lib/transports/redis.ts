import redis, { RedisClient } from 'redis';

import { ITransport } from '../types';

import { Message } from './message';
import { Transport } from './transport';

export class Redis extends Transport implements ITransport {
  client: RedisClient;

  cap: number;

  channel: string;

  constructor(options: { url: string; cap?: number; channel: string }) {
    super(options as any);
    this.client = redis.createClient(options.url);
    this.cap = options.cap || 1000;
    this.channel = options.channel;
  }

  emitLog(message: Message) {
    const payload = `${message.level}:${message.toString()}`;
    this.client.lpush(this.channel, payload);
    this.client.ltrim(this.channel, 0, this.cap - 1);
    this.client.publish(this.channel, payload);
  }
}
