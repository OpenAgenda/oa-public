'use strict';

const _ = require('lodash');
const labels = require('@openagenda/labels/inboxes');
const getLabel = require('@openagenda/labels')(labels);

module.exports = ({ services, config, render }) => (req, res, next) => {
  const { members } = services;

  const targetIsAdminMod = members.utils.compareRoles.isSuperiorToOrEqual(
    req.targetMember.role,
    'moderator'
  );

  const userName = _.get(
    req.targetMember,
    'custom.contactName',
    req.targetMember.user.fullName
  );

  render({
    template: 'agenda/inbox',
    baseData: {
      event: {
        backLink: `/${req.agenda.slug}`
      },
      image: req.agenda.image,
      title: req.agenda.title
    },
    endpoint: targetIsAdminMod ? '/home' : `/agendas/${req.agenda.uid}`,
    initialState: {
      user: req.user,
      settings: {
        context: 'agenda',
        prefix: req.baseUrl,
        lang: req.lang,
        apiRoot: `http://localhost:${config.port}`,
        perPageLimit: 20,
        focusFistConversation: true, // force to display the first conversation if exists
        hideEmptyList: true, // redirect on creation if the list is empty
        allowCreateConversation: true, // show creation button
        // maskCreationSubtitle: true,
        // topListForm: true, // add a conversation form on top of conversation list
        creationSubtitle: getLabel('contactName', { name: userName }, req.lang),
        // creationDesc: getLabel( 'sendMessageToName', { name: req.stakeholder.user.fullName }, req.lang ),
        belowMessageDesc: getLabel('retrieveConversationsOnHome', { url: '/home/inbox' }, req.lang),
        onConversationCreateRedirect: `/agendas/${req.agenda.uid}/admin/members`,
        onConversationCreateFlash: getLabel('conversationCreationSuccess', req.lang),
        defaultQuery: {
          type: 'contact_member',
          typeIdentifier: req.targetMember.id,
          params: {
            agendaTitle: req.agenda.title,
            agendaUid: req.agenda.uid,
            userUid: req.targetMember.user.uid,
            userName
          },
          destinationInbox: targetIsAdminMod ? {
            type: 'user',
            identifier: req.targetMember.user.uid
          } : []
        }
      },
      agenda: req.agenda
    }
  })(req, res, next);
};
