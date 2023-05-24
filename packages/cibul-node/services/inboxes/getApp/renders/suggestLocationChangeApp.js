'use strict';

const labels = require('@openagenda/labels/inboxes');
const getLabel = require('@openagenda/labels')(labels);

module.exports = ({ config, render }) => (req, res, next) => {
  const agendaLink = `/${req.agenda.slug}`;

  render({
    template: 'agenda/inbox',
    baseData: {
      event: {
        backLink: agendaLink,
      },
      image: req.agenda.image,
      title: req.agenda.title,
    },
    endpoint: '/home/inbox',
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
        // maskCreationSubtitle: true,
        creationSubtitle: getLabel('titleSuggestLocationChange', req.lang),
        creationDescriptionLabel: getLabel('suggestLocationChangeDesc', req.lang),
        creationDesc: getLabel('locationName', { name: req.location.name }, req.lang),
        // creationDescriptionLabel: getLabel('wantContributeMakeRequest', req.lang),
        creationButtonLabel: getLabel('createConversation', req.lang),
        // topListForm: true, // add a conversation form on top of conversation list
        belowMessageDesc: getLabel('retrieveConversationsOnHome', { url: '/home/inbox' }, req.lang),
        onConversationCreateRedirect: agendaLink,
        onConversationCreateFlash: getLabel('conversationCreationSuccess', req.lang),
        defaultQuery: {
          type: 'suggest_location_change',
          typeIdentifier: [req.agenda.uid, req.location.uid].join(','),
          params: {
            agendaTitle: req.agenda.title,
            agendaUid: req.agenda.uid,
            locationName: req.location.name,
            locationUid: req.location.uid,
          },
          destinationInbox: {
            type: 'agenda',
            identifier: req.agenda.uid,
          },
        },
      },
      agenda: req.agenda,
    },
  })(req, res, next);
};
