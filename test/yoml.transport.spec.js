/* globals jest describe it expect beforeEach */
const Transport = require('../lib/yoml.transport'),
  Message = require('../lib/yoml.message');

describe('Transport', () => {
  describe('isRepeat', () => {
    let subject;
    beforeEach(() => {
      subject = new Transport({ logLevel: 'info' });
      subject.emit = jest.fn();
    });
    it('adds one to repeat if message is equal', () => {
      subject.isRepeat(new Message('test', { level: 'info' }));
      subject.isRepeat(new Message('test', { level: 'info' }));
      expect(subject.repeat).toEqual(1);
    });
    it('adds resets counter when different message', () => {
      subject.isRepeat(new Message('test', { level: 'info' }));
      subject.isRepeat(new Message('test', { level: 'info' }));
      subject.isRepeat(new Message('end', { level: 'info' }));
      expect(subject.repeat).toEqual(0);
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

      func(new Message('test', { level: 'info' }));

      expect(decorated).toHaveBeenCalledWith(expect.objectContaining({ level: 'info' }));
    });

    it('does not call the function if the log is lower than specified', () => {
      const decorated = jest.fn(),
        func = subject.loggable(decorated);

      func(new Message('test', { level: 'debug' }));

      expect(decorated).not.toHaveBeenCalled();
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

      func(new Message('test', { level: 'info' }));

      expect(decorated).toHaveBeenCalledWith(expect.any(Message));
    });

    it('calls the function just one time when called multiple times', () => {
      const decorated = jest.fn(),
        func = subject.repeatable(decorated);

      func(new Message('test', { level: 'info' }));
      func(new Message('test', { level: 'info' }));

      expect(decorated).toHaveBeenCalledTimes(1);
    });

    it('calls the function with repeat option set to the number of repeats, when the message changes', () => {
      const decorated = jest.fn(),
        func = subject.repeatable(decorated);

      func(new Message('test', { level: 'info' }));
      func(new Message('test', { level: 'info' }));
      func(new Message('test', { level: 'info' }));
      func(new Message('test', { level: 'info' }));
      func(new Message('end', { level: 'info' }));

      expect(decorated).toHaveBeenCalledTimes(3);
      expect(decorated.mock.calls[0][0]).toHaveProperty('repeat', undefined);
      expect(decorated.mock.calls[1][0]).toHaveProperty('repeat', 3);
      expect(decorated.mock.calls[2][0]).toHaveProperty('repeat', undefined);
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
      expect(subject.emitLog).toBeCalled();
    });
  });
});
