'use strict';

const _ = require('lodash');
const differenceInMinutes = require('date-fns/differenceInMinutes');
const config = require('../../config');

async function getRegistrationSlackMessageId(usersSvc, uid) {
  const rawUser = await usersSvc._get(uid, { query: { $select: ['store'] } });

  const store = rawUser.store ? JSON.parse(rawUser.store) : {};

  return store.registrationSlackMessageId;
}

async function updateUserRegistrationMessage(slackApp, messageId, agenda) {
  const result = await slackApp.client.conversations.history({
    token: config.slackApp.token,
    channel: config.slackApp.channel,
    latest: messageId,
    inclusive: true,
    limit: 1
  });

  const message = result.messages[0];

  const agendaCreatedIndex = message.blocks.findIndex(block => block.block_id === 'agendasCreated');
  let blocks = [...message.blocks];

  if (agendaCreatedIndex !== -1) {
    const block = blocks[agendaCreatedIndex];

    blocks.splice(agendaCreatedIndex, 1, {
      ...block,
      text: {
        ...block.text,
        text: `${block.text.text}\n- ${agenda.title}`
      }
    });
  } else {
    blocks.push({
      block_id: 'agendasCreated',
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Agendas créés après inscription (< 30 min.):\n- ${agenda.title}`,
        verbatim: false
      }
    });
  }

  const newMessage = {
    text: message.text,
    blocks
  };

  await slackApp.client.chat.update({
    token: config.slackApp.token,
    channel: config.slackApp.channel,
    ts: message.ts,
    ...newMessage
  });
}

function makeMessage({ user, agenda }) {
  return {
    text: `Nouvel agenda: ${agenda.title}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Nouvel agenda*: ${agenda.title} / ${user.fullName} (${user.email})`
        }
      }
    ]
  }
}

function postMessage(slackApp, services) {
  return async ({
    user,
    agenda
  }) => {
    const res = await slackApp.client.chat.postMessage({
      token: config.slackApp.token,
      channel: config.slackApp.channel,
      ...makeMessage({
        user,
        agenda
      })
    });

    if (!res.ok) {
      throw new Error('Slack message (agenda creation) can not be sent');
    }

    if (differenceInMinutes(new Date(), new Date(user.createdAt)) < 30) {
      const userRegistrationMessageId = await getRegistrationSlackMessageId(services.users, user.uid);

      if (!userRegistrationMessageId) {
        return;
      }

      await updateUserRegistrationMessage(slackApp, userRegistrationMessageId, agenda);
    }
  };
}

function registerEvents(slackApp, services) {
  //
}

module.exports = {
  postMessage,
  registerEvents
};
