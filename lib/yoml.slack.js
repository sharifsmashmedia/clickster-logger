const SlackNode = require('slack-node'),
  request = require('request'),
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
    this.uploadhook = 'https://slack.com/api/files.upload';
    this.hook = _.get(options, 'webhook');
    this.channel = _.get(options, 'channel');
    this.format = _.get(options, 'format');
    this.token = _.get(options, 'token');
    this.hook = _.get(options, 'webhook');
    this.topics = _.get(options, 'topics');
    this.client = new SlackNode();
    this.client.setWebhook(this.hook);
  }

  getIcon(level) {
    return Slack.icons[level] || Slack.icons.info;
  }

  getChannels(level, options) {
    const channels = [];
    if (this.channel && this.showLevel(level)) channels.push(this.channel);
    if (this.topics && _.has(this.topics, level)) channels.push(this.topics[level]);
    if (options.topic) channels.push(_.get(this.topics, options.topic));

    return _(channels)
      .compact()
      .uniq()
      .value();
  }

  emitLog(level, message, options) {
    const channelList = this.getChannels(level, options || {});

    _.each(channelList, (channel) => {
      if (_.has(options, 'attachment')) {
        this.sendAttachment(channel, level, message, options.attachment);
      } else {
        const attachments = level === 'error' ? [this.stackTraceAttachment()] : null;
        this.sendMessage(channel, level, message, attachments);
      }
    });
  }

  stackTraceAttachment() {
    return {
      color: '#aa0000',
      title: 'Stack Trace',
      text: `\`\`\`${this.stackTrace()}\`\`\``,
      mrkdwn_in: ['text']
    };
  }

  sendMessage(channel, level, message, attachments) {
    this.client.webhook({
      channel,
      text: message,
      attachments,
      username: this.hostname(),
      icon_emoji: this.getIcon(level)
    }, () => {});
  }

  sendAttachment(channel, level, message, attachment) {
    const attachmentPayload = this.fixAttachment(attachment),
      content = _.isFunction(this._format)
        ? this._format(attachmentPayload)
        : attachmentPayload.data;

    request.post({
      url: this.uploadhook,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      form: {
        token: this.token,
        channels: channel,
        content,
        filename: attachmentPayload.file_name,
        filetype: attachmentPayload.filetype,
        title: attachmentPayload.title
      }
    });
  }

  hasAttachmentStructure(data) {
    return _.isObject(data) && _.has(data, 'data');
  }

  fixAttachment(rawData) {
    const data = !this.hasAttachmentStructure(rawData) ? { data: rawData } : rawData;
    if (data.data instanceof Error) data.data = data.data.toString();
    else if (!_.isString(data.data)) data.data = JSON.stringify(data.data, null, 2);

    return _.defaults(data, {
      filename: `${Math.random().toString(36).slice(2)}.txt`,
      title: '',
      filetype: 'txt'
    });
  }
}

module.exports = Slack;
