'use strict';

const _ = require('lodash');
const labels = require('@openagenda/labels/inboxes');
const getLabel = require('@openagenda/labels')(labels);
const { getLocaleValue } = require('@openagenda/intl');

module.exports = ({ config, render }) => (req, res, next) => {
  const eventShowLink = `/${req.agenda.slug}/events/${req.event.slug}`;

  render({
    template: 'event/inbox',
    baseData: {
      event: {
        ...req.event,
        backLink: `/${req.agenda.slug}`
      },
      image: req.agenda.image,
      title: req.agenda.title
    },
    endpoint: `/agendas/${req.agenda.uid}/inbox`,
    initialState: {
      user: req.user,
      settings: {
        context: 'agenda',
        prefix: req.baseUrl,
        apiRoot: `http://localhost:${config.port}`,
        perPageLimit: 20,
        focusFistConversation: true, // force to display the first conversation if exists
        hideEmptyList: true, // redirect on creation if the list is empty
        allowCreateConversation: true, // show creation button
        creationSubtitle: getLabel(
          'requestEditionCreationTitle',
          { title: _.escape(getLocaleValue(req.event.title, req.lang)), link: eventShowLink },
          req.lang
        ),
        maskCreationSubtitle: false,
        topListForm: false, // add a conversation form on top of conversation list
        belowMessageDesc: getLabel('retrieveConversationsOnHome', { url: '/home/inbox' }, req.lang),
        onConversationCreateRedirect: eventShowLink,
        onConversationCreateFlash: getLabel('conversationCreationSuccess', req.lang),
        defaultQuery: {
          type: 'edition_request',
          typeIdentifier: req.event.uid,
          params: {
            agendaTitle: _.unescape(req.agenda.title),
            agendaUid: req.agenda.uid,
            eventTitle: _.unescape(getLocaleValue(req.event.title, req.lang))
          },
          destinationInbox: {
            type: 'user',
            identifier: req.event.ownerUid
          }
        }
      },
      agenda: req.agenda,
      event: req.event
    }
  })(req, res, next);
};
