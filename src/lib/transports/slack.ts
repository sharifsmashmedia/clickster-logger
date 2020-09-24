import {
  Block,
  KnownBlock,
  SectionBlock,
  WebAPICallResult,
  WebClient,
} from '@slack/web-api';

import type { Message } from '../types/message';

/**
 * Function to send a message using the Slack webAPI.
 */
const sendMessage = async (
  channel: string,
  message: string,
  messageBlocks: readonly (KnownBlock | Block)[],
  client: WebClient,
  hostname: string
): Promise<WebAPICallResult | Error> => {
  try {
    return client.chat.postMessage({
      text: message,
      channel,
      messageBlocks,
      username: hostname,
      icon_emoji: ':robot_face:',
    });
  } catch (e) {
    return Error(
      `Error found sending data to channel ${channel}, message: ${e.message}`
    );
  }
};

const levelIcon = (message: Message) => {
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
};

function isMessage(message: string | Message): message is Message {
  return (message as Message).level !== undefined;
}

const formatMessage = (
  message: Message,
  { code = false, addIcon = false } = {}
): string => {
  return `${addIcon ? levelIcon(message) : ''} ${
    code ? `\`\`\`${message}\`\`\`` : message
  }`;
};

const formatText = (message: string, { code = false } = {}) => {
  return code ? `\`\`\`${message}\`\`\`` : message;
};

const formatTextSection = (
  text: string | Message,
  options: { readonly code?: boolean; readonly addIcon?: boolean }
): SectionBlock => {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: isMessage(text)
        ? formatMessage(text, options)
        : formatText(text, options),
    },
  };
};

const getMessageBlocks = (
  message: string | Message
): readonly (KnownBlock | Block)[] => {
  const firstBlock = formatTextSection(message, {
    code: isMessage(message),
    addIcon: !isMessage(message),
  });

  const secondBlock =
    isMessage(message) && message.stack
      ? formatTextSection(message.stack[0], { code: true })
      : null;

  const thirdBlock =
    isMessage(message) && message.attachments instanceof Array
      ? message.attachments.reduce(
          (acc: readonly string[], attachment: string) => [
            ...acc,
            ...getMessageBlocks(attachment),
          ],
          []
        )
      : [];

  return [firstBlock, secondBlock, ...thirdBlock];
};
