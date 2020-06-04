const { WebClient } = require('@slack/web-api'),
  _ = require('lodash'),
  Message = require('./yoml.message'),
  Transport = require('./yoml.transport');

class Slack extends Transport {
  static get icons() {
    return {
      error: 'http://icons.iconarchive.com/icons/gakuseisean/ivista-2/256/Alarm-Error-icon.png',
      info: 'http://icons.iconarchive.com/icons/gakuseisean/ivista-2/256/Alarm-Info-icon.png'
    };
  }

  set format(value) {
    this._format_string = value;
    if (value) this._format = _.template(value);
  }

  get format() {
    return this._format_string;
  }

  constructor(options) {
    super(options);
    this.unfiltered = true;
    this.hook = _.get(options, 'webhook');
    this.token = _.get(options, 'token');
    this.channel = _.get(options, 'channel');
    this.format = _.get(options, 'format');
    this.token = _.get(options, 'token');
    this.hook = _.get(options, 'webhook');
    this.topics = _.get(options, 'topics');
    this.client = new WebClient(this.token);
  }

  getIcon(level) {
    return Slack.icons[level] || Slack.icons.info;
  }

  getChannels(level, topic) {
    const channels = [];
    if (topic) {
      if (this.showLevel(level)) channels.push(_.get(this.topics, topic));
    } else {
      if (this.channel && this.showLevel(level)) channels.push(this.channel);
      if (this.topics && _.has(this.topics, level)) channels.push(this.topics[level]);
    }

    return _(channels)
      .compact()
      .uniq()
      .value();
  }

  emitLog(message) {
    return this.emitToChannels(message);
  }

  emitToChannels(message) {
    const channelList = this.getChannels(message.level, message.topic);

    _.each(channelList, (channel) => {
      this.sendMessage(channel, message);
    });
  }

  levelIcon(message) {
    switch (message.level) {
      case 'error':
        return ':no_entry:';
      case 'warn':
        return ':warning:';
      case 'debug':
        return ':space_invader:';
      case 'time':
      case 'slow':
        return ':timer_clock:';
      default:
        return ':information_source:';
    }
  }

  formatPayload(message) {
    const blocks = [];

    blocks.push(
      this.formatSection(
        message,
        { code: message.isObject, message, addIcon: !message.isObject }
      )
    );

    if (message.stack) {
      blocks.push(this.formatSection(message.stack, { code: true }));
    }

    if (message.attachments instanceof Array) {
      message.attachments.forEach((item) => {
        const children = this.formatPayload(item);
        children.forEach((child) => { blocks.push(child); });
      });
    }

    return blocks;
  }

  formatSection(message, options) {
    if (message.isSimpleObject && message.length < 5) {
      return this.formatFieldsSection(message, options);
    } else {
      return this.formatTextSection(message, options);
    }
  }

  formatFieldsSection(message) {
    const items = [];

    Object.keys(message._item).forEach((key) => {
      items.push({ type: 'mrkdwn', text: `*${key}*` });
      items.push({ type: 'plain_text', text: `${message._item[key]}` });
    });

    return {
      type: 'section',
      fields: items
    };
  }

  formatTextSection(text, options) {
    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: this.formatText(text, options)
      }
    };
  }

  formatText(message, { code = false, addIcon = false } = {}) {
    let response = (this.isMessage(message)
      ? message.toString({ includeAttachments: false, includeStack: false })
      : message);
    if (code) {
      response = `\`\`\`${message}\`\`\``;
    }

    if (addIcon && this.isMessage(message)) {
      response = `${this.levelIcon(message)} ${response}`;
    }

    return response;
  }

  isMessage(item) {
    return item instanceof Message;
  }

  sendMessage(channel, message) {
    const blocks = this.formatPayload(message);
    (async () => {
      try {
        this.client.chat.postMessage({
          text: message.toString({ includeAttachments: false, includeStack: false }),
          channel,
          blocks,
          username: message.hostname,
          icon_emoji: this.getIcon(message.level)
        });
      } catch (e) {
        throw new Error(`Error found sending data to channel ${channel}, message: ${e.message}`);
      }
    })();
  }

  hasAttachmentStructure(data) {
    return _.isObject(data) && _.has(data, 'data');
  }
}

module.exports = Slack;
