/* globals expect describe it beforeEach jest */

const Slack = require('../lib/yoml.slack');

global.console = { log: jest.fn() };
jest.mock('slack-node',
  () => jest.fn().mockImplementation(() => ({
    setWebhook: jest.fn(),
    webhook: jest.fn()
  })));

// let request = jest.mock('request',
//   () => jest.fn().mockImplementation(() => ({ post: jest.fn() })));


jest.mock('request');

describe('Slack', () => {
  describe('constructor', () => {
    it('has a client', () => {
      const subject = new Slack();
      expect(subject.client).not.toBeUndefined();
    });
    it('sets the webhook to the client', () => {
      const subject = new Slack({ webhook: 'http://testhook' }); // eslint-disable-line no-unused-vars

      expect(subject.client.setWebhook).toBeCalledWith('http://testhook');
    });
  });
  describe('getChannels', () => {
    describe('with channel configured', () => {
      let subject;
      beforeEach(() => {
        subject = new Slack({ channel: 'test_channel' });
      });
      it('returns channel', () => {
        expect(
          subject.getChannels('info', null)
        ).toEqual(['test_channel']);
      });
    });
    describe('with topics configured for level', () => {
      let subject;
      beforeEach(() => {
        subject = new Slack({ topics: { info: 'info_channel' } });
      });
      it('returns channel', () => {
        expect(
          subject.getChannels('info', null)
        ).toEqual(['info_channel']);
      });
    });
    describe('with topic specified', () => {
      let subject;
      beforeEach(() => {
        subject = new Slack({ topics: { topic: 'topic_channel' } });
      });
      it('returns channel', () => {
        expect(
          subject.getChannels('info', 'topic')
        ).toEqual(['topic_channel']);
      });
    });
    describe('with duplicate channels', () => {
      let subject;
      beforeEach(() => {
        subject = new Slack({ channel: 'dup', topics: { topic: 'dup' } });
      });
      it('returns channel', () => {
        expect(
          subject.getChannels('info', 'topic')
        ).toEqual(['dup']);
      });
    });
  });
  describe('hasAttachmentStructure', () => {
    let subject;
    beforeEach(() => {
      subject = new Slack({ channel: 'test', token: 'test_token' });
    });
    it('detects attachment structure', () => {
      expect(subject.hasAttachmentStructure('')).toBeFalsy();
      expect(subject.hasAttachmentStructure({})).toBeFalsy();
      expect(subject.hasAttachmentStructure({ data: '' })).toBeTruthy();
    });
  });
});
