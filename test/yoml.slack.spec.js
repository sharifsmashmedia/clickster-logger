/* globals expect describe it beforeEach jest */

const Slack = require('../lib/yoml.slack'),
  Message = require('../lib/yoml.message');

global.console = { log: jest.fn() };

describe('Slack', () => {
  describe('constructor', () => {
    it('has a client', () => {
      const subject = new Slack();
      expect(subject.client).not.toBeUndefined();
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

  describe('formatSection', () => {
    let subject;
    beforeEach(() => {
      subject = new Slack({ channel: 'test', token: 'test_token' });
    });
    it('returns text section if text', () => {
      const message = new Message('test'),
        response = subject.formatSection(message);

      expect(response).toHaveProperty('text', expect.any(Object));
      expect(response.text).toHaveProperty('text', 'test');
    });
    it('returns field section if simple object', () => {
      const message = new Message({ a: 1 }),
        response = subject.formatSection(message);

      expect(response).toHaveProperty('fields', expect.any(Array));
    });
  });
  describe('formatText', () => {
    let subject;
    beforeEach(() => {
      subject = new Slack({ channel: 'test', token: 'test_token' });
    });
    it('returns plain text', () => {
      const response = subject.formatText('text');
      expect(response).toBe('text');
    });
    it('returns formatted code if requested', () => {
      const response = subject.formatText('text', { code: true });
      expect(response).toBe('```text```');
    });

    it('returns text with icon if addIcon', () => {
      const message = new Message('text', { level: 'error' }),
        response = subject.formatText(message, { addIcon: true });
      expect(response).toBe(':no_entry: text');
    });
  });
  describe('formatFieldsSection', () => {
    let subject;
    beforeEach(() => {
      subject = new Slack({ channel: 'test', token: 'test_token' });
    });
    it('returns a formatted section', () => {
      const message = new Message({ a: 1 }),
        response = subject.formatFieldsSection(message);

      expect(response).toHaveProperty('type', 'section');
      expect(response).toHaveProperty('fields', expect.any(Array));
      expect(response.fields).toHaveLength(2);
      expect(response.fields[0]).toHaveProperty('type', 'mrkdwn');
      expect(response.fields[0]).toHaveProperty('text', '*a*');
      expect(response.fields[1]).toHaveProperty('type', 'plain_text');
      expect(response.fields[1]).toHaveProperty('text', '1');
    });
  });
  describe('formatTextSection', () => {
    let subject;
    beforeEach(() => {
      subject = new Slack({ channel: 'test', token: 'test_token' });
    });
    it('returns a formatted section', () => {
      const response = subject.formatTextSection('text');
      expect(response).toHaveProperty('type', 'section');
      expect(response).toHaveProperty('text', expect.any(Object));
      expect(response.text).toHaveProperty('type', 'mrkdwn');
      expect(response.text).toHaveProperty('text', 'text');
    });
    it('returns a formatted section', () => {
      const response = subject.formatTextSection(new Message('text'));
      expect(response).toHaveProperty('type', 'section');
      expect(response).toHaveProperty('text', expect.any(Object));
      expect(response.text).toHaveProperty('type', 'mrkdwn');
      expect(response.text).toHaveProperty('text', 'text');
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
