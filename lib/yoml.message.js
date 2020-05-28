const os = require('os');

class Message {
  constructor(item, {
    attachments, level, repeat, topic
  } = {}) {
    this.level = level || 'info';
    this.item = item;
    this.repeat = repeat;
    this.topic = topic;
    this.date = new Date();
    this.hostname = os.hostname();
    this.attachments = this.processAttachments(attachments);
  }

  set item(item) {
    this._item = item;

    if (item instanceof Error) {
      this._message = item.message;
      this._stack = item.stack;
    } else if (typeof item === 'string') {
      this._message = item;
    } else {
      this._message = JSON.stringify(item, null, 2);
      this.isObject = true;
    }
  }

  processAttachments(items) {
    if (items) {
      return items.map(a => new Message(a, { level: this.level }));
    }

    return [];
  }

  isEqual(message) {
    return (message
      && message instanceof Message
      && this.level === message.level
      && this._message === message._message
    );
  }

  formatedMessage(format) {
    if (format === 'console') {
      return [
        this.date.toISOString(),
        this.level.toUpperCase(),
        this._message
      ].join(':');
    }

    // clean
    return this._message;
  }

  toString({
    format = 'clean',
    includeStack = true,
    includeAttachments = true
  } = {}) {
    const message = [this.formatedMessage(format)];

    if (includeStack && this._stack) {
      message.push(this._stack);
    }

    if (includeAttachments) {
      this.attachments.forEach((attachment) => {
        message.push(attachment.toString({ format, includeStack }));
      });
    }

    return message.join('\n');
  }

  toJson({ format = 'clean' }) {
    return {
      message: this.formattedMessage(format),
      level: this.level,
      date: this.date.toISOString(),
      attachments: this.attachments.map(attachment => attachment.toJson({ format }))
    };
  }
}

module.exports = Message;
