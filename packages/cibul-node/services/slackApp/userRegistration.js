'use strict';

const config = require('../../config');

async function getRecaptchaScore(usersSvc, uid) {
  const rawUser = await usersSvc._get(uid, { query: { $select: ['store'] } });

  const store = rawUser.store ? JSON.parse(rawUser.store) : {};

  return store.registrationCaptchaScore || NaN;
}

function makeMessage({ user, reCaptchaScore, automaticActivation }) {
  return {
    "text": `Un nouvel utilisateur s'est inscrit sur OpenAgenda: ${user.email} - ${user.fullName}`,
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Un nouvel utilisateur s'est inscrit sur OpenAgenda:\n\nEmail: *${user.email}*\nPrénom Nom: *${user.fullName}*\nScore reCaptcha: *${reCaptchaScore}*/1`
        }
      },
      {
        "type": "actions",
        "block_id": "actions",
        "elements": [
          {
            "type": "button",
            "action_id": "show",
            "text": {
              "type": "plain_text",
              "text": "Voir",
              "emoji": true
            },
            "value": "show",
            "url": `${config.root}/admin/users?userUid=${user.uid}`
          }
        ].concat(automaticActivation ? [] : [
          {
            "type": "button",
            "action_id": "activate",
            "text": {
              "type": "plain_text",
              "text": "Activer",
              "emoji": true
            },
            "value": String(user.uid),
            "style": "primary",
            // "url": `${config.root}/admin/users/activate?uid=${user.uid}`
          }
        ]).concat([
          {
            "type": "button",
            "action_id": "blacklist",
            "text": {
              "type": "plain_text",
              "text": "Bloquer",
              "emoji": true
            },
            "value": String(user.uid),
            "style": "danger",
            // "url": `${config.root}/admin/users/blacklist?uid=${user.uid}`
          }
        ])
      },
      {
        "type": "context",
        "elements": [
          {
            "type": "mrkdwn",
            "text": `Environnement: *${config.env === 'production' ? 'production' : 'développement'}*`
          },
          {
            "type": "mrkdwn",
            "text": `Mode d'activation: *${automaticActivation ? 'Automatique' : 'Manuel'}*`
          }
        ]
      }
    ]
  };
}

function postMessage(slackApp, services) {
  return async ({
    user,
    automaticActivation
  }) => {
    const { users } = services;
    const reCaptchaScore = await getRecaptchaScore(users, user.uid);

    const res = await slackApp.client.chat.postMessage({
      token: config.slackApp.token,
      channel: config.slackApp.channel,
      ...makeMessage({
        user,
        reCaptchaScore,
        automaticActivation
      })
    });

    if (!res.ok) {
      throw new Error('Slack message (user registration) can not be sent');
    }

    // TODO save `ts` in the user store

    console.log(res);
  };
}

function registerEvents(slackApp, services) {
  slackApp.action(
    { type: 'block_actions', action_id: 'activate' },
    async ({ payload, ack, body, respond }) => {
      await ack();

      const userUid = parseInt(payload.value, 10);
      const { users: usersSvc, mails } = services;

      try {
        const user = await usersSvc.get(userUid, { removed: null, detailed: true });

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
              activateLink: config.root,
            },
            queue: false,
          });
        }

        const newMessage = {
          text: body.message.text,
          blocks: body.message.blocks
            .map(block => {
              if (block.block_id !== payload.block_id) {
                return block;
              }

              return {
                type: 'section',
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
        const user = await usersSvc.get(userUid, { removed: null, detailed: true });

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
          blocks: body.message.blocks
            .map(block => {
              if (block.block_id !== payload.block_id) {
                return block;
              }

              return {
                type: 'section',
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
