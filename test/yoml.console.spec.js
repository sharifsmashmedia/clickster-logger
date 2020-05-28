/* globals console jest beforeEach describe it expect */
const Console = require('../lib/yoml.console'),
  Message = require('../lib/yoml.message');

describe('yoml.console', () => {
  let subject;
  describe('emit', () => {
    beforeEach(() => {
      subject = new Console();
      global.console = { log: jest.fn() };
    });

    it('writes to the console', () => {
      subject.emitLog(new Message('test', { level: 'info' }));
      // eslint-disable-next-line no-console
      expect(console.log).toBeCalledWith(expect.stringMatching('test'));
    });
    it('logs info with the right log level', () => {
      subject.emitLog(new Message('test', { level: 'info' }));
      // eslint-disable-next-line no-console
      expect(console.log).toBeCalledWith(expect.stringMatching('INFO'));
    });
    it('logs warn with the right log level', () => {
      subject.emitLog(new Message('test', { level: 'warn' }));
      // eslint-disable-next-line no-console
      expect(console.log).toBeCalledWith(expect.stringMatching('WARN'));
    });
    it('logs error with the right log level', () => {
      subject.emitLog(new Message('test', { level: 'error' }));
      // eslint-disable-next-line no-console
      expect(console.log).toBeCalledWith(expect.stringMatching('ERROR'));
    });

    it('logs an error and sends the stack trace', () => {
      subject.emitLog(new Message('test', { level: 'error' }));
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledTimes(1);
    });
  });
});
