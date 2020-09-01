'use strict';

const { App } = require('@slack/bolt');

function init(config, services) {
  const slackApp = new App({
    signingSecret: config.slackApp.signingSecret,
    token: config.slackApp.token,
    endpoints: '/'
  });

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

  return slackApp
}

function plugApp(app) {
  const { slackApp } = app.services;

  app.use('/slack/events', slackApp.receiver.router);
}

module.exports = {
  init,
  plugApp
};
