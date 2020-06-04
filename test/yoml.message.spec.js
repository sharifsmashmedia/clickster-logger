/* global beforeEach describe it expect */

const Message = require('../lib/yoml.message.js');

describe(Message, () => {
  describe('constructor', () => {
    it('returns an object', () => {
      expect(new Message()).not.toBeNull();
    });

    it('sets the item', () => {
      const subject = new Message('test message');

      expect(subject._item).toBe('test message');
      expect(subject._message).toBe('test message');
    });

    it('sets the level', () => {
      const subject = new Message('test message', { level: 'error' });

      expect(subject.level).toBe('error');
    });

    it('sets the stack trace if the object is an error', () => {
      const subject = new Message(new Error('test error'), { level: 'info' });

      expect(subject._stack).toBeTruthy();
    });

    it('sets default level as info if not received', () => {
      const subject = new Message('test message');

      expect(subject.level).toBe('info');
    });
  });
  describe('length', () => {
    it('returns the length of the object', () => {
      const subject = new Message({ a: 1 });

      expect(subject.length).toBe(1);
    });
    it('returns the length of the object when multiple items', () => {
      const subject = new Message({ a: 1, b: 2, c: 3 });

      expect(subject.length).toBe(3);
    });
    it('returns the length of the string', () => {
      const subject = new Message('this string is 33 characters long');

      expect(subject.length).toBe(33);
    });
  });
  describe('isSimpleObject', () => {
    it('returns true if message was created with an object', () => {
      const subject = new Message({ a: 1 });

      expect(subject.isSimpleObject).toBeTruthy();
    });

    it('returns false if message was created with an object with nested objects', () => {
      const subject = new Message({ a: 1, b: { c: 1 } });

      expect(subject.isSimpleObject).toBeFalsy();
    });

    it('returns false if message was created with an object with string', () => {
      const subject = new Message('test');

      expect(subject.isSimpleObject).toBeFalsy();
    });

    it('returns false if message was created with an object with error', () => {
      const subject = new Message(new Error());

      expect(subject.isSimpleObject).toBeFalsy();
    });
  });
  describe('isObject', () => {
    it('returns true if message was created with an object', () => {
      const subject = new Message({ a: 1 });

      expect(subject.isObject).toBeTruthy();
    });

    it('returns false if message was created with a string', () => {
      const subject = new Message('test');

      expect(subject.isObject).toBeFalsy();
    });

    it('returns false if message was created with an error', () => {
      const subject = new Message(new Error());

      expect(subject.isObject).toBeFalsy();
    });
  });

  describe('processAttachments', () => {
    let subject;
    beforeEach(() => {
      subject = new Message('test', { level: 'info' });
    });

    it('creates an array of messages', () => {
      const response = subject.processAttachments(['attachment1', 'attachment2']);
      expect(response).toBeInstanceOf(Array);
      expect(response).toHaveLength(2);
      expect(response.every(i => i instanceof Message)).toBe(true);
    });

    it('has messagess with the same log level', () => {
      const response = subject.processAttachments(['attachment1', 'attachment2']);
      expect(response.every(i => i.level === 'info')).toBe(true);
    });
  });

  describe('formatMessage', () => {
    let subject;

    beforeEach(() => {
      subject = new Message('test message');
    });

    it('returns the string if no format specified', () => {
      expect(subject.formatedMessage()).toBe('test message');
    });

    it('returns the string with the level if format is console', () => {
      expect(subject.formatedMessage('console')).toMatch(/:INFO:test message/);
    });
  });

  describe('toString', () => {
    it('returns a string if the message is just a string', () => {
      const subject = new Message('test message');

      expect(subject.toString()).toBe('test message');
    });

    it('returns a string and a stack trace if stack trace is set', () => {
      const subject = new Message(new Error('test message')),
        output = subject.toString();

      expect(output).toContain('test message');
      // to have multiple lines
      expect(output.split('\n').length).toBeGreaterThan(1);
      expect(output).toContain('yoml.message.spec');
    });

    describe('with attachment', () => {
      let subject;

      beforeEach(() => {
        subject = new Message('test message', { attachments: ['attachment'] });
      });
      it('returns the attachments', () => {
        expect(subject.toString()).toMatch(/test message/);
        expect(subject.toString()).toMatch(/attachment/);
      });
    });
  });
});
