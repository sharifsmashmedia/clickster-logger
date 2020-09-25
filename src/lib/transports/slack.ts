/* eslint-disable no-underscore-dangle */
import { WebClient } from '@slack/web-api';

import { ITransport, Level } from '../types';

import { Message } from './message';
import { Transport } from './transport';

/**
 * Class to send messages using the Slack webAPI.
 */
export class Slack extends Transport implements ITransport {
  hook;

  token;

  channel;

  topics;

  client;

  _format_string = '';

  _format = '';

  static get icons() {
    return {
      error:
        'http://icons.iconarchive.com/icons/gakuseisean/ivista-2/256/Alarm-Error-icon.png',
      info:
        'http://icons.iconarchive.com/icons/gakuseisean/ivista-2/256/Alarm-Info-icon.png',
    };
  }

  set format(value) {
    this._format_string = value;
    if (value) this._format = value;
  }

  get format() {
    return this._format_string;
  }

  constructor(options: {
    webhook: string;
    channel: string;
    format: string;
    token: string;
    topics: Record<string, any>;
  }) {
    super(options as any);
    this.unfiltered = true;
    this.hook = options.webhook;
    this.token = options.token;
    this.channel = options.channel;
    this.format = options.format;
    this.topics = options.topics;
    this.client = new WebClient(this.token);
  }

  getIcon(level: Level): string {
    return level === 'info' || level === 'error'
      ? Slack.icons[level]
      : Slack.icons.info;
  }

  getChannels(level: Level, topic: string): string[] {
    const channels = [];
    if (topic) {
      if (this.showLevel(level)) channels.push(this.topics[topic]);
    } else {
      if (this.channel && this.showLevel(level)) channels.push(this.channel);
      if (this.topics && this.topics[level]) channels.push(this.topics[level]);
    }

    const set = new Set(channels.filter((channel) => !!channel));

    return [...set];
  }

  emitLog(message: Message): void {
    return this.emitToChannels(message);
  }

  emitToChannels(message: Message): void {
    const channelList = this.getChannels(message.level, message.topic);

    channelList.forEach((channel) => {
      this.sendMessage(channel, message);
    });
  }

  levelIcon(message: Message): string {
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

  formatPayload(message: Message) {
    const blocks = [];

    blocks.push(
      this.formatSection(message, {
        code: message.isObject,
        message,
        addIcon: !message.isObject,
      })
    );

    if (message.stack) {
      blocks.push(this.formatSection(message.stack, { code: true }));
    }

    if (message.attachments instanceof Array) {
      message.attachments.forEach((item) => {
        const children = this.formatPayload(item);
        children.forEach((child) => {
          blocks.push(child);
        });
      });
    }

    return blocks;
  }

  formatSection(message: Message | string, options: any) {
    return this.formatTextSection(message, options);
  }

  /*
  formatFieldsSection(message) {
    const items = [];

    Object.keys(message._item).forEach((key) => {
      items.push({ type: 'mrkdwn', text: `*${key}*` });
      items.push({ type: 'plain_text', text: `${message._item[key]}` });
    });

    return {
      type: 'section',
      fields: items,
    };
  } */

  formatTextSection(text: Message | string, options: any) {
    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: this.formatText(text, options),
      },
    };
  }

  formatText(
    message: Message | string,
    { code = false, addIcon = false } = {}
  ) {
    let response =
      message instanceof Message
        ? message.toString({ includeAttachments: false, includeStack: false })
        : message;
    if (code) {
      response = `\`\`\`${message}\`\`\``;
    }

    if (addIcon && message instanceof Message) {
      response = `${this.levelIcon(message)} ${response}`;
    }

    return response;
  }

  sendMessage(channel: string, message: Message) {
    const blocks = this.formatPayload(message);
    (async () => {
      try {
        await this.client.chat.postMessage({
          text: message.toString({
            includeAttachments: false,
            includeStack: false,
          }),
          channel,
          blocks,
          username: message.hostname,
          icon_emoji: ':robot_face:',
        });
      } catch (e) {
        throw new Error(
          `Error found sending data to channel ${channel}, message: ${e.message}`
        );
      }
    })();
  }
}
