'use strict';

async function getRecaptchaScore(usersSvc, uid) {
  const rawUser = await usersSvc._get(uid, { query: { $select: ['store'] } });

  const store = rawUser.store ? JSON.parse(rawUser.store) : {};

  return store.registrationCaptchaScore || NaN;
}

async function saveSlackMessageId(usersSvc, uid, messageId) {
  const rawUser = await usersSvc._get(uid, { query: { $select: ['store'] } });

  const store = rawUser.store ? JSON.parse(rawUser.store) : {};
  store.registrationSlackMessageId = messageId;

  await usersSvc._patch(
    uid,
    { store: JSON.stringify(store) },
    { query: { $select: ['store'] } }
  );
}

function makeMessage({ root, user, reCaptchaScore, automaticActivation }) {
  return {
    text: `Nouvel utilisateur: ${user.email} | ${user.fullName}`,
    blocks: [
      {
        type: 'section',
        block_id: 'user',
        text: {
          type: 'mrkdwn',
          text: `*Nouvel utilisateur*: ${user.email} | ${user.fullName} | ${reCaptchaScore}/1`
        }
      },
      {
        type: 'actions',
        block_id: 'actions',
        elements: [
          {
            type: 'button',
            action_id: 'show',
            text: {
              type: 'plain_text',
              text: 'Voir',
              emoji: true
            },
            value: 'show',
            url: `${root}/admin/users?userUid=${user.uid}`
          }
        ]
          .concat(
            automaticActivation
              ? []
              : [
                {
                  type: 'button',
                  action_id: 'activate',
                  text: {
                    type: 'plain_text',
                    text: 'Activer',
                    emoji: true
                  },
                  value: String(user.uid),
                  style: 'primary'
                  // "url": `${root}/admin/users/activate?uid=${user.uid}`
                }
              ]
          )
          .concat([
            {
              type: 'button',
              action_id: 'blacklist',
              text: {
                type: 'plain_text',
                text: 'Bloquer',
                emoji: true
              },
              value: String(user.uid),
              style: 'danger'
              // "url": `${root}/admin/users/blacklist?uid=${user.uid}`
            }
          ])
      }
    ]
  };
}

function postMessage(slackApp, services, config) {
  return async ({ user, automaticActivation }) => {
    const { users } = services;
    const reCaptchaScore = await getRecaptchaScore(users, user.uid);

    const res = await slackApp.client.chat.postMessage({
      token: config.token,
      channel: config.channel,
      ...makeMessage({
        root: config.root,
        user,
        reCaptchaScore,
        automaticActivation
      })
    });

    if (!res.ok) {
      throw new Error('Slack message (user registration) can not be sent');
    }

    await saveSlackMessageId(users, user.uid, res.ts);
  };
}

function registerEvents(slackApp, services, config) {
  slackApp.action(
    { type: 'block_actions', action_id: 'activate' },
    async ({ payload, ack, body, respond }) => {
      await ack();

      const userUid = parseInt(payload.value, 10);
      const { users: usersSvc, mails } = services;

      try {
        const user = await usersSvc.get(userUid, {
          removed: null,
          detailed: true
        });

        if (user && !user.isActivated) {
          await usersSvc.patch(
            userUid,
            { isActivated: true },
            { internal: true }
          );

          await mails.send({
            template: 'activatedAccount',
            to: user.email,
            lang: user.culture,
            data: {
              activateLink: config.root
            },
            queue: false
          });
        }

        const newMessage = {
          text: body.message.text,
          blocks: body.message.blocks.map(block => {
            if (block.block_id !== payload.block_id) {
              return block;
            }

            return {
              type: 'section',
              block_id: 'actions',
              text: {
                type: 'mrkdwn',
                text: `:heavy_check_mark: L\'utilisateur a été activé. <${config.root}/admin/users?userUid=${userUid}|Voir>`
              }
            };
          })
        };

        await respond({ replace_original: true, ...newMessage });
      } catch (error) {
        await respond({
          text: 'Désolé, il y a eu une erreur. Réessayez plus tard.',
          blocks: [
            {
              type: 'section',
              block_id: 'error',
              text: {
                type: 'mrkdwn',
                text: `Désolé, il y a eu une erreur. Réessayez plus tard.\nMessage d'erreur: *${error.message}*`
              }
            }
          ],
          response_type: 'ephemeral',
          replace_original: false
        });
      }
    }
  );

  slackApp.action(
    { type: 'block_actions', action_id: 'blacklist' },
    async ({ payload, ack, body, respond }) => {
      await ack();

      const userUid = parseInt(payload.value, 10);
      const { users: usersSvc, sessions } = services;

      try {
        const user = await usersSvc.get(userUid, {
          removed: null,
          detailed: true
        });

        if (user && !user.isBlacklisted) {
          await usersSvc.patch(
            userUid,
            { isBlacklisted: true },
            { internal: true }
          );

          await sessions.close.byUid(userUid);
        }

        const newMessage = {
          text: body.message.text,
          blocks: body.message.blocks.map(block => {
            if (block.block_id !== payload.block_id) {
              return block;
            }

            return {
              type: 'section',
              block_id: 'actions',
              text: {
                type: 'mrkdwn',
                text: `:x: L\'utilisateur a été bloqué. <${config.root}/admin/users?userUid=${userUid}|Voir>`
              }
            };
          })
        };

        await respond({ replace_original: true, ...newMessage });
      } catch (error) {
        await respond({
          text: 'Désolé, il y a eu une erreur. Réessayez plus tard.',
          blocks: [
            {
              type: 'section',
              block_id: 'error',
              text: {
                type: 'mrkdwn',
                text: `Désolé, il y a eu une erreur. Réessayez plus tard.\nMessage d'erreur: *${error.message}*`
              }
            }
          ],
          response_type: 'ephemeral',
          replace_original: false
        });
      }
    }
  );
}

module.exports = {
  postMessage,
  registerEvents
};
