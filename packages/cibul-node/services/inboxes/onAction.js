'use strict';

const { default: inboxes, Conversation } = require('@openagenda/inboxes');
const agendaEventsSvc = require('@openagenda/agenda-events');
const log = require('@openagenda/logs')('services/inboxes');
const membersSvc = require('../members');

module.exports = async function onAction(conversation, action) {

  if (action.code === 'involveTechnicalSupport') {
    const supportInbox = await inboxes({
      type: 'support',
      identifier: 1
    }).get();

    await Conversation.link({ conversationId: conversation.id, inboxId: supportInbox.data.id });
  }

  if (action.code === 'removeTechnicalSupport') {
    const supportInbox = await inboxes({
      type: 'support',
      identifier: 1
    }).get();

    await Conversation.unlink({ conversationId: conversation.id, inboxId: supportInbox.data.id });
  }

  switch (conversation.type) {
    case 'request_contribute': {

      if (action.code === 'accept') {

        if (conversation.creatorInbox && conversation.creatorInbox.type === 'user') {

          try {

            const userUid = conversation.creatorInbox.identifier;
            const agendaUid = conversation.typeIdentifier;

            const sh = await membersSvc.get({
              userUid,
              agendaUid
            });

            if (!sh) {

              const newMember = await membersSvc.create(
                {
                  agendaUid,
                  userUid,
                  role: 'contributor'
                },
                { requireCustom: false }
              );

              log('info', 'Contribution request accepted', { member: newMember });

            }

          } catch (err) {

            log('error', 'Cannot accept a contribution request', err);

          }

        }

      }

    }
    case 'edition_request': {

      if (action.code === 'accept') {

        try {

          await agendaEventsSvc(conversation.store.params.agendaUid)
            .update(
              conversation.typeIdentifier,
              { canEdit: true },
              { transferToLegacy: true }
            );

          log('info', 'Edition rights request accepted', {
            agendaUid: conversation.store.params.agendaUid,
            eventUid: conversation.typeIdentifier
          });

        } catch (err) {

          log('error', 'Cannot accept an edition rights request', err);

        }

      }

    }
  }
};
