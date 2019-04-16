/* globals expect describe it beforeEach jest */

const request = require('request'),
  Slack = require('../lib/yoml.slack');

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
          subject.getChannels('info', {})
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
          subject.getChannels('info', {})
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
          subject.getChannels('info', { topic: 'topic' })
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
          subject.getChannels('info', { topic: 'topic' })
        ).toEqual(['dup']);
      });
    });
  });
  describe('emit', () => {
    describe('sending message', () => {
      let subject;
      beforeEach(() => {
        subject = new Slack({ channel: 'test', topics: { topic: 'test_topic' } });
      });
      it('calls webhook from slack-node', () => {
        subject.emitLog('info', 'test');
        expect(subject.client.webhook).toBeCalled();
        expect(
          subject.client.webhook.mock.calls[0][0]
        ).toEqual(expect.objectContaining({ text: 'test' }));
      });
      it('calls webhook twice with the right parameters when topic specified', () => {
        subject.emitLog('info', 'test', { topic: 'topic' });
        expect(subject.client.webhook).toBeCalled();
        expect(subject.client.webhook.mock.calls.length).toBe(2);
        expect(
          subject.client.webhook.mock.calls[0][0]
        ).toEqual(expect.objectContaining({ text: 'test' }));
      });
      it('send hostname as username', () => {
        subject.emitLog('info', 'test');
        expect(subject.client.webhook).toBeCalled();
        expect(
          subject.client.webhook.mock.calls[0][0]
        ).toEqual(expect.objectContaining({ username: subject.hostname() }));
      });
      it("sends topic even if log level doesn't match", () => {
        subject = new Slack({ logLevel: 'error', channel: 'test', topics: { topic: 'test_topic' } });
        subject.emitLog('info', 'test', { topic: 'topic' });
        expect(subject.client.webhook).toBeCalled();
        expect(subject.client.webhook.mock.calls.length).toBe(1);
      });
      it('includes stack trace as attachment when log level is error', () => {
        subject = new Slack({ logLevel: 'error', channel: 'test' });
        subject.emitLog('error', 'test');
        expect(
          subject.client.webhook.mock.calls[0][0]
        ).toEqual(expect.objectContaining({ attachments: expect.any(Array) }));
      });
    });
    describe('message format', () => {
      let subject;
      beforeEach(() => {
        subject = new Slack({ channel: 'test', topics: { topic: 'test_topic' } });
        subject.client.webhook = jest.fn();
      });
      it('send an error as string', () => {
        subject.emitLog('error', new Error('test'));
        expect(
          subject.client.webhook.mock.calls[0][0]
        ).toEqual(expect.objectContaining({ text: 'Error: test' }));
      });
      it('send an object as string with code format', () => {
        subject.emitLog('info', { test: 'test' });
        expect(
          subject.client.webhook.mock.calls[0][0]
        ).toEqual(expect.objectContaining({ text: '```{\n  "test": "test"\n}```' }));
      });
    });
    describe('sending attachment', () => {
      let subject;
      beforeEach(() => {
        subject = new Slack({ channel: 'test', token: 'test_token' });
        request.post = jest.fn();
      });
      it('calls post on request', () => {
        subject.emitLog('info', 'test', { attachment: { data: 'test' } });
        expect(request.post).toBeCalled();
        expect(
          request.post.mock.calls[0][0]
        ).toEqual(expect.objectContaining({
          form: expect.objectContaining({ content: 'test' })
        }));
      });
      it('applies a formatter if specified', () => {
        subject.format = '<%= other %>, <%= data %>';
        subject.emitLog('info', 'test', { attachment: { other: 'foo', data: 'test' } });
        expect(request.post).toBeCalled();
        expect(
          request.post.mock.calls[0][0]
        ).toEqual(expect.objectContaining({
          form: expect.objectContaining({ content: 'foo, test' })
        }));
      });
      it('sends token', () => {
        subject.emitLog('info', 'test', { attachment: { data: 'test' } });
        expect(request.post).toBeCalled();
        expect(
          request.post.mock.calls[0][0]
        ).toEqual(expect.objectContaining({
          form: expect.objectContaining({ token: 'test_token' })
        }));
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
  describe('fixAttachment', () => {
    let subject;
    const attachmentKeys = ['filename', 'filetype', 'title', 'data'];
    beforeEach(() => {
      subject = new Slack({ channel: 'test', token: 'test_token' });
    });
    it('fixes a partial object', () => {
      attachmentKeys.forEach(
        attachmentKey => expect(
          subject.fixAttachment({ data: 'test_data' })
        ).toHaveProperty(attachmentKey)
      );
    });
    it('fixes a string', () => {
      attachmentKeys.forEach(
        attachmentKey => expect(
          subject.fixAttachment('test_data')
        ).toHaveProperty(attachmentKey)
      );
    });
    it('fixes an attachment with an error object', () => {
      const result = subject.fixAttachment(new Error('test', 'lala'));
      attachmentKeys.forEach(
        attachmentKey => expect(result).toHaveProperty(attachmentKey)
      );
      expect(result.data).toEqual('Error: test');
    });
    it('fixes an random object without formating', () => {
      const result = subject.fixAttachment({ test: 'x' }, { addFormating: false });
      attachmentKeys.forEach(
        attachmentKey => expect(result).toHaveProperty(attachmentKey)
      );
      expect(result.data).toEqual('{\n  "test": "x"\n}');
    });
  });
});
