/* globals jest describe it beforeEach expect */

const Logger = require('../lib/yoml'),
  Console = require('../lib/yoml.console'),
  Redis = require('../lib/yoml.redis'),
  Slack = require('../lib/yoml.slack');

describe('yoml', () => {
  describe('functions', () => {
    let subject;
    beforeEach(() => {
      subject = new Logger();
    });
    it('should have a console transport initialized by default', () => {
      expect(subject._transports[0]).toBeInstanceOf(Console);
    });
    it('should have an info function', () => {
      expect(typeof subject.info).toBe('function');
    });
    it('should have an error function', () => {
      expect(typeof subject.error).toBe('function');
    });
    it('should have an warn function', () => {
      expect(typeof subject.warn).toBe('function');
    });
    describe('comodity functions call log with proper log level', () => {
      beforeEach(() => {
        subject.log = jest.fn();
      });
      it('info calls log with proper log level', () => {
        subject.info('test');
        expect(subject.log).toBeCalledWith('info', 'test', undefined);
      });
      it('error calls log with proper log level', () => {
        subject.error('test');
        expect(subject.log).toBeCalledWith('error', 'test', undefined);
      });
      it('warn calls log with proper log level', () => {
        subject.warn('test');
        expect(subject.log).toBeCalledWith('warn', 'test', undefined);
      });
    });
    describe('comodity functions pass options', () => {
      beforeEach(() => {
        subject.log = jest.fn();
      });
      it('info calls log with proper log level', () => {
        subject.info('test', { attachment: '' });
        expect(subject.log).toBeCalledWith('info', 'test', { attachment: '' });
      });
      it('error calls log with proper log level', () => {
        subject.error('test', { attachment: '' });
        expect(subject.log).toBeCalledWith('error', 'test', { attachment: '' });
      });
      it('warn calls log with proper log level', () => {
        subject.warn('test', { attachment: '' });
        expect(subject.log).toBeCalledWith('warn', 'test', { attachment: '' });
      });
    });
  });

  describe('configureTransports', () => {
    let subject;
    beforeEach(() => {
      subject = new Logger();
    });
    it('instantiate a console transport by default', () => {
      const transports = subject.configureTransports();
      expect(transports[0]).toBeInstanceOf(Console);
    });
    it('instantiate a console transport', () => {
      const transports = subject.configureTransports({ transports: { console: {} } });
      expect(transports[0]).toBeInstanceOf(Console);
    });
    it('instantiate a slack transport', () => {
      const transports = subject.configureTransports({ transports: { slack: {} } });
      expect(transports[0]).toBeInstanceOf(Slack);
    });
    it('instantiate a redis transport', () => {
      const transports = subject.configureTransports({ transports: { redis: {} } });
      expect(transports[0]).toBeInstanceOf(Redis);
    });
  });

  describe('log', () => {
    let subject;
    beforeEach(() => {
      subject = new Logger();
      subject.log = jest.fn();
    });
    it('has one transport with default values', () => {
      expect(subject._transports).toHaveLength(1);
    });
    it('logs when calling with info', () => {
      subject.info('test');
      expect(subject.log).toBeCalledWith('info', 'test', undefined);
    });
    it('logs when calling with debug', () => {
      subject.debug('test');
      expect(subject.log).toBeCalledWith('debug', 'test', undefined);
    });
  });

  describe('timer', () => {
    let subject;
    beforeEach(() => {
      subject = new Logger({ logLevel: 'time' });
      subject.log = jest.fn();
    });
    it('starts a timer', () => {
      subject.time('test');
      expect(subject._times).toHaveProperty('test');
      expect(subject._times.test.name).toEqual('test');
    });
    it('emits when ending the timer', () => {
      subject.time('test');
      // Fake time
      subject._times.test._start = new Date((new Date()).getTime() - 1000);
      subject.timeEnd('test');
      expect(subject.log).toHaveBeenCalledTimes(1);
      expect(subject.log.mock.calls[0]).toEqual(['time', expect.stringMatching(/test:\d+ms/)]);
    });
    it('emits time when ending timer before tolerance', () => {
      subject.time('test');
      // Fake time
      subject._times.test._start = new Date((new Date()).getTime() - 1000);
      subject.timeEnd('test', { slow: 3000 });
      expect(subject.log).toHaveBeenCalledTimes(1);
      expect(subject.log.mock.calls[0]).toEqual(['time', expect.stringMatching(/test:\d+ms/)]);
    });
    it('emits slow when ending the timer after tolerance', () => {
      subject.time('test');
      // Fake time
      subject._times.test._start = new Date((new Date()).getTime() - 5000);
      subject.timeEnd('test', { slow: 3000 });
      expect(subject.log).toHaveBeenCalledTimes(1);
      expect(subject.log.mock.calls[0]).toEqual(['slow', expect.stringMatching(/test:\d+ms/)]);
    });
  });

  describe('op', () => {
    let subject,
      subjectTransport;
    beforeEach(() => {
      subject = new Logger({ logLevel: 'slow' });
      jest.spyOn(subject, 'log');
      subjectTransport = jest.spyOn(subject._transports[0], 'emitLog');
    });
    it('starts an operation', () => {
      subject.op('test');
      expect(subject._operations).toHaveProperty('test');
      expect(subject._operations.test.name).toEqual('test');
    });
    it('emits if slow', () => {
      subject.op('test');
      // Fake time
      subject._operations.test._start = new Date((new Date()).getTime() - 5000);
      subject.debug('test debug');
      subject.opEnd('test', { slow: 1000 });
      expect(subjectTransport.mock.calls[0]).toEqual(['slow', expect.stringMatching(/test:DEBUG:test debug/), undefined]);
      expect(subjectTransport.mock.calls[1]).toEqual(['slow', expect.stringMatching(/test:\d+ms/), undefined]);
    });
    it('does not emit if not slow', () => {
      subject.op('test');
      subject._operations.test._start = new Date((new Date()).getTime() - 1000);
      subject.debug('test debug');
      subject.opEnd('test', { slow: 5000 });

      expect(subjectTransport).not.toHaveBeenCalled();
    });
  });
});
