/* globals jest describe it expect beforeEach */
const Transport = require('../lib/yoml.transport');

describe('Transport', () => {
  describe('hostname', () => {
    let subject;
    beforeEach(() => {
      subject = new Transport();
    });
    it('returns a string', () => {
      expect(typeof subject.hostname()).toBe('string');
    });
  });
  describe('isRepeat', () => {
    let subject;
    beforeEach(() => {
      subject = new Transport({ logLevel: 'info' });
      subject.emit = jest.fn();
    });
    it('adds one to repeat if message is equal', () => {
      subject.isRepeat('info', 'test');
      subject.isRepeat('info', 'test');
      expect(subject.repeat).toEqual(1);
    });
    it('adds resets counter when different message', () => {
      subject.isRepeat('info', 'test');
      subject.isRepeat('info', 'test');
      subject.isRepeat('info', 'end');
      expect(subject.repeat).toEqual(0);
    });
  });
  describe('stackTrace', () => {
    let subject;
    beforeEach(() => {
      subject = new Transport();
    });
    it('returns a string', () => {
      expect(typeof subject.stackTrace()).toBe('string');
    });
    it('returns the caller as the first line in stack trace', () => {
      expect(subject.stackTrace()).toMatch(/^\s+at new Promise/);
    });
  });
  describe('emit', () => {
    let subject;
    beforeEach(() => {
      subject = new Transport({ logLevel: 'info' });
      subject.emitLog = jest.fn();
    });
    it("doesn't emit if level doesn't correspond", () => {
      subject.log('debug', 'test');
      expect(subject.emitLog).not.toBeCalled();
    });
    it('emit if level correspond', () => {
      subject.log('info', 'test');
      expect(subject.emitLog).toBeCalledWith('info', 'test', undefined);
    });
    it('calls emit if prefilter disabled', () => {
      subject.unfiltered = true;
      subject.log('debug', 'test');
      expect(subject.emitLog).toBeCalledWith('debug', 'test', undefined);
    });
    describe('repeat', () => {
      it('keep equal messages from displaying', () => {
        [...Array(5)].forEach(() => subject.log('info', 'test'));
        subject.log('info', 'end');

        expect(subject.emitLog.mock.calls[0]).toEqual(['info', 'test', undefined]);
        expect(subject.emitLog.mock.calls[1]).toEqual(['info', 'test (repeated 4 times)', {}]);
        expect(subject.emitLog.mock.calls[2]).toEqual(['info', 'end', undefined]);
      });
    });
  });
  describe('formatMessage', () => {
    let subject;
    beforeEach(() => {
      subject = new Transport({ logLevel: 'info' });
    });
    it('formats an error', () => {
      expect(
        subject.formatMessage(new Error('testing'))
      ).toEqual('Error: testing');
    });
    it('formats an object', () => {
      expect(
        subject.formatMessage({ test: 'test' })
      ).toEqual('{\n  "test": "test"\n}');
    });
    it('leaves a string alone', () => {
      expect(
        subject.formatMessage('test string')
      ).toEqual('test string');
    });
  });
});
