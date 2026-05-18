import _ from 'lodash';
import labels from '@openagenda/labels/inboxes/index.js';
import makeLabelGetter from '@openagenda/labels';
import { getLocaleValue } from '@openagenda/intl';

const getLabel = makeLabelGetter(labels);

export default ({ render, config }) =>
  (req, res, next) => {
    const eventShowLink = `/${req.agenda.slug}/events/${req.event.uid}_${req.event.slug}`;

    render({
      template: 'event/inbox',
      baseData: {
        event: {
          ...req.event,
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
          creationSubtitle: getLabel(
            'contactAdministratorsOf',
            {
              title: _.escape(getLocaleValue(req.agenda.title, req.lang)),
              link: eventShowLink,
            },
            req.lang,
          ),
          maskCreationSubtitle: false,
          topListForm: false, // add a conversation form on top of conversation list
          belowMessageDesc: getLabel(
            'retrieveConversationsOnHome',
            { url: '/home/inbox' },
            req.lang,
          ),
          onConversationCreateRedirect: eventShowLink,
          onConversationCreateFlash: getLabel(
            'conversationCreationSuccess',
            req.lang,
          ),
          defaultQuery: {
            type: 'event',
            typeIdentifier: req.event.uid,
            params: {
              agendaTitle: _.unescape(req.agenda.title),
              agendaUid: req.agenda.uid,
              eventTitle: _.unescape(getLocaleValue(req.event.title, req.lang)),
            },
            destinationInbox: {
              type: 'agenda',
              identifier: req.agenda.uid,
            },
          },
        },
        agenda: req.agenda,
        event: req.event,
      },
    })(req, res, next);
  };
