/* globals expect describe it beforeEach jest */

// const rewire = require('rewire'),
const Redis = require('../lib/yoml.redis'),
  Message = require('../lib/yoml.message');

describe('Redis', () => {
  describe('constructor', () => {
    it('has a client', () => {
      const subject = new Redis({ channel: 'test_channel' });
      expect(subject.client).not.toBeUndefined();
      expect(subject.channel).toEqual('test_channel');
    });
  });
  describe('emitLog', () => {
    let subject;

    beforeEach(() => {
      subject = new Redis({ channel: 'test_channel', cap: 10 });
      jest.spyOn(subject.client, 'lpush');
      jest.spyOn(subject.client, 'ltrim');
      jest.spyOn(subject.client, 'publish');
    });
    it('calls push on client', () => {
      subject.emitLog(new Message('test_log', { level: 'info' }));
      expect(subject.client.lpush).toBeCalled();
      expect(subject.client.lpush).toBeCalledWith('test_channel', 'info:test_log');
      expect(subject.client.ltrim).toBeCalledWith('test_channel', 0, 9);
      expect(subject.client.publish).toBeCalledWith('test_channel', 'info:test_log');
    });
  });
});
