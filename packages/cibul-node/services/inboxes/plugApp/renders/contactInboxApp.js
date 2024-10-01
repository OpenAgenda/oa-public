import labels from '@openagenda/labels/inboxes/index.js';
import makeLabelGetter from '@openagenda/labels';

const getLabel = makeLabelGetter(labels);

export default ({ config, render }) =>
  (req, res, next) => {
    render({
      template: 'agenda/inbox',
      baseData: {
        event: {
          backLink: `/${req.agenda.slug}`,
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
          creationSubtitle: getLabel('contactForm', req.lang),
          topListForm: true, // add a conversation form on top of conversation list
          creationDesc: getLabel('sendMessageToAdmin', req.lang),
          belowMessageDesc: getLabel(
            'retrieveConversationsOnHome',
            { url: '/home/inbox' },
            req.lang,
          ),
          onConversationCreateRedirect: `/${req.agenda.slug}`,
          onConversationCreateFlash: getLabel(
            'conversationCreationSuccess',
            req.lang,
          ),
          defaultQuery: {
            type: 'contact_form',
            typeIdentifier: req.agenda.uid,
            params: {
              agendaTitle: req.agenda.title,
              agendaUid: req.agenda.uid,
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
