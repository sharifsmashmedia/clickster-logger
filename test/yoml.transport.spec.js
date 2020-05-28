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
  describe('loggable', () => {
    let subject;
    beforeEach(() => {
      subject = new Transport({ logLevel: 'info' });
    });

    it('calls the function if the log is greater or equal', () => {
      const decorated = jest.fn(),
        func = subject.loggable(decorated);

      func('info', 'test');

      expect(decorated).toHaveBeenCalledWith('info', 'test');
    });

    it('does not call the function if the log is lower than specified', () => {
      const decorated = jest.fn(),
        func = subject.loggable(decorated);

      func('debug', 'test');

      expect(decorated).not.toHaveBeenCalledWith('info', 'test');
    });
  });

  describe('repeatable', () => {
    let subject;
    beforeEach(() => {
      subject = new Transport({ logLevel: 'info' });
    });

    it('calls the function the first time', () => {
      const decorated = jest.fn(),
        func = subject.repeatable(decorated);

      func('info', 'test');

      expect(decorated).toHaveBeenCalledWith('info', 'test', undefined);
    });

    it('calls the function just one time when called multiple times', () => {
      const decorated = jest.fn(),
        func = subject.repeatable(decorated);

      func('info', 'test');
      func('info', 'test');

      expect(decorated).toHaveBeenCalledTimes(1);
    });

    it('calls the function with repeat option set to the number of repeats, when the message changes', () => {
      const decorated = jest.fn(),
        func = subject.repeatable(decorated);

      func('info', 'test');
      func('info', 'test');
      func('info', 'test');
      func('info', 'test');
      func('info', 'end');

      expect(decorated).toHaveBeenCalledTimes(3);
      expect(decorated.mock.calls[0]).toEqual(['info', 'test', undefined]);
      expect(decorated.mock.calls[1]).toEqual(['info', 'test', { repeat: 3 }]);
      expect(decorated.mock.calls[2]).toEqual(['info', 'end', undefined]);
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
    it.only('emit if level correspond', () => {
      subject.log('info', 'test');
      expect(subject.emitLog).toBeCalledWith(
        expect.objectContaining({
          level: 'info',
          _message: expect.stringMatching(/test/)
        })
      );
    });
    it('calls emit if prefilter disabled', () => {
      subject.unfiltered = true;
      subject.log('debug', 'test');
      expect(subject.emitLog).toBeCalledWith('debug', 'test', undefined);
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
