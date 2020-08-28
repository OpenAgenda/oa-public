'use strict';

const { Router } = require('express');
const { createMessageAdapter } = require('@slack/interactive-messages');
const config = require('../config');

function getInteractionsListener(app) {
  const slackInteractions = createMessageAdapter(config.auth.registrationSlackSecret);

  slackInteractions.action({ type: 'button', actionId: 'activate' }, (payload, respond) => {
    Promise.resolve()
      .then(async () => {
        const action = payload.actions[0];
        const userUid = parseInt(action.value, 10);

        const { users: usersSvc, mails } = app.services;

        try {
          const user = await usersSvc.get(userUid, { removed: null, detailed: true });

          if (user && !user.isActivated) {
            await usersSvc.patch(
              userUid,
              { isActivated: true },
              { internal: true }
            );

            await mails.send( {
              template: 'activatedAccount',
              to: user.email,
              lang: user.culture,
              data: {
                activateLink: config.root,
              },
              queue: false,
            } );
          }

          const newMessage = {
            text: payload.message.text,
            blocks: payload.message.blocks
              .map(block => {
                if (block.block_id !== action.block_id) {
                  return block;
                }

                return {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `:heavy_check_mark: L\'utilisateur a été activé. <${config.root}/admin/users?userUid=${userUid}|Voir>`
                  }
                }
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
      });
  });

  slackInteractions.action({ type: 'button', actionId: 'blacklist' }, (payload, respond) => {
    Promise.resolve()
      .then(async () => {
        const action = payload.actions[0];
        const userUid = parseInt(action.value, 10);

        const { users: usersSvc, sessions } = app.services;

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
            text: payload.message.text,
            blocks: payload.message.blocks
              .map(block => {
                if (block.block_id !== action.block_id) {
                  return block;
                }

                return {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `:x: L\'utilisateur a été bloqué. <${config.root}/admin/users?userUid=${userUid}|Voir>`
                  }
                }
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
      });
  });

  return slackInteractions.requestListener();
}

module.exports = app => Router({ mergeParams: true })
  .use('/interactive/user-registration', getInteractionsListener(app));
