const { WebClient } = require('@slack/web-api'),
  _ = require('lodash'),

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
      channels.push(_.get(this.topics, topic));
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
    const channelList = this.getChannels(message.level, message.topic);

    _.each(channelList, (channel) => {
      this.sendMessage(channel, message);
    });
  }

  formatPayload(message) {
    const blocks = [];

    blocks.push(this.formatSection(message.toString(), message.isObject));

    if (message._stack) {
      blocks.push(this.formatSection(message._stack, true));
    }

    if (message.attachments instanceof Array) {
      message.attachments.forEach((item) => {
        const children = this.formatPayload(item);
        children.forEach((child) => { blocks.push(child); });
      });
    }

    return blocks;
  }

  formatSection(text, code = false) {
    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: code ? (`\`\`\`${text}\`\`\``) : text
      }
    };
  }

  sendMessage(channel, message) {
    const blocks = this.formatPayload(message);
    (async () => {
      this.client.chat.postMessage({
        text: message.toString({ includeAttachments: false, includeStack: false }),
        channel,
        blocks,
        username: message.hostname,
        icon_emoji: this.getIcon(message.level)
      });
    })();
  }

  hasAttachmentStructure(data) {
    return _.isObject(data) && _.has(data, 'data');
  }
}

module.exports = Slack;
