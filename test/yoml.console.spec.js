/* globals console jest beforeEach describe it expect */
const Console = require('../lib/yoml.console');

describe('yoml.console', () => {
  let subject;
  describe('emit', () => {
    beforeEach(() => {
      subject = new Console();
      global.console = { log: jest.fn() };
    });

    it('writes to the console', () => {
      subject.emitLog('info', 'test');
      // eslint-disable-next-line no-console
      expect(console.log).toBeCalledWith(expect.stringMatching('test'));
    });
    it('logs info with the right log level', () => {
      subject.emitLog('info', 'test');
      // eslint-disable-next-line no-console
      expect(console.log).toBeCalledWith(expect.stringMatching('INFO'));
    });
    it('logs warn with the right log level', () => {
      subject.emitLog('warn', 'test');
      // eslint-disable-next-line no-console
      expect(console.log).toBeCalledWith(expect.stringMatching('WARN'));
    });
    it('logs error with the right log level', () => {
      subject.emitLog('error', 'test');
      // eslint-disable-next-line no-console
      expect(console.log).toBeCalledWith(expect.stringMatching('ERROR'));
    });

    it('logs an error and sends the stack trace', () => {
      subject.stackTrace = jest.fn();
      subject.emitLog('error', 'test');
      // eslint-disable-next-line no-console
      expect(console.log.mock.calls).toHaveLength(2);
      expect(subject.stackTrace).toBeCalled();
    });
  });
});
