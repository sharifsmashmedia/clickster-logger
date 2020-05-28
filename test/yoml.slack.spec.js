/* globals expect describe it beforeEach jest */

const Slack = require('../lib/yoml.slack');

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
