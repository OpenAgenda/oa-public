'use strict';

const labels = require('@openagenda/labels/inboxes');
const getLabel = require('@openagenda/labels')(labels);

module.exports = ({ services, config, render }) => (req, res, next) => {
  const { sessions } = services;

  if (req.member) {
    sessions.setFlash(req, res, getLabel('youreAlreadyContributor', req.lang));
    return res.redirect(302, `/${req.agenda.slug}`);
  }

  render({
    template: 'agenda/requestContribute',
    baseData: {
      event: {
        backLink: `/${req.agenda.slug}`
      },
      image: req.agenda.image,
      title: req.agenda.title
    },
    endpoint: '/home/inbox',
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
        creationSubtitle: getLabel('titleContributionRequest', req.lang),
        // creationDescriptionLabel: getLabel('wantContributeMakeRequest', req.lang),
        creationButtonLabel: getLabel('createConversation', req.lang),
        // topListForm: true, // add a conversation form on top of conversation list
        creationDesc: getLabel('youWantToContribute', req.lang),
        belowMessageDesc: getLabel('retrieveConversationsOnHome', { url: '/home/inbox' }, req.lang),
        onConversationCreateRedirect: `/${req.agenda.slug}`,
        onConversationCreateFlash: getLabel('conversationCreationSuccess', req.lang),
        defaultQuery: {
          type: 'request_contribute',
          typeIdentifier: req.agenda.uid,
          params: {
            agendaTitle: req.agenda.title,
            agendaUid: req.agenda.uid
          },
          destinationInbox: {
            type: 'agenda',
            identifier: req.agenda.uid
          }
        }
      },
      agenda: req.agenda
    }
  })(req, res, next);
};
