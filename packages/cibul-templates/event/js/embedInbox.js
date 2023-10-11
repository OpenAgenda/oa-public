import _ from 'lodash';
import ReactDOM from 'react-dom';
import { createMemoryHistory } from 'history';
import createApp from '@openagenda/inbox-apps/dist/app';
import { wrapApp } from '@openagenda/react-shared';
import makeLabelGetter from '@openagenda/labels';
import inboxesLabels from '@openagenda/labels/inboxes';
import du from '@openagenda/dom-utils';
import React from 'react';
import session from '@openagenda/sessions/client';
import { getLocaleValue } from '@openagenda/intl';

import 'iframe-resizer/js/iframeResizer.contentWindow';

const getInboxesLabel = makeLabelGetter(inboxesLabels);

const defaults = {
  initialState: {
    settings: {
      prefix: '',
      apiRoot: `localhost:${process.env.PORT || 3000}`,
      perPageLimit: 20,
    },
  },
};

window.asap(options => {
  const params = _.merge({}, defaults, options);

  const { role, event, agenda, lang } = params;

  console.log({ role, event, agenda, lang });

  const user = session.getUser();
  const { ownerUid } = event;

  const simpleUser = role !== 2 && role !== 3;
  const resBasePath = simpleUser ? '/home' : '/agendas/:agendaUid';

  // userRole === 'adminContributor' || 'adminmod' || 'contributor' || 'simpleUser'
  const userRole = (() => {
    if (simpleUser && user.uid === ownerUid) {
      return 'contributor';
    }
    if (user.uid === ownerUid) {
      return 'adminContributor';
    }
    return simpleUser ? 'simpleUser' : 'adminmod';
  })();

  // eventConvDescAdminmod
  // eventConvDescContributor
  // eventConvDescSimpleUser
  const creationDescriptionLabel = getInboxesLabel('eventConvDesc' + _.upperFirst(userRole), lang);

  const destinationInbox = (() => {
    switch (userRole) {
      case 'adminContributor': // admin contributor
        return;
      case 'adminmod': // admin (not contributor) -> contributor
        return {
          type: 'user',
          identifier: params.ownerUid,
        };
      case 'contributor': // contributor (not admin) -> admins/modos
        return {
          type: 'agenda',
          identifier: params.agendaUid,
        };
      case 'simpleUser': // user lambda -> admins/modos + contributor
        return [
          {
            type: 'agenda',
            identifier: params.agendaUid,
          }, {
            type: 'user',
            identifier: params.ownerUid,
          },
        ];
    }
  })();

  ReactDOM.render(
    wrapApp(
      createApp({
        initialState: {
          settings: {
            context: 'event',
            prefix: '',
            focusFistConversation: true, // force to display the first conversation if exists
            hideEmptyList: true, // redirect on creation if the list is empty
            allowCreateConversation: true, // display (or not) creation button
            allClosedForCreate: ['contributor', 'simpleUser'].includes(userRole),
            maskEventTitle: true, // useless on event page
            // maskCreationSubtitle: true, // useless on event page
            creationSubtitle: getInboxesLabel(
              userRole === 'adminmod' ? 'contactContributor' : 'contactAdministrators',
              lang,
            ),
            creationButtonLabel: getInboxesLabel(
              userRole === 'adminmod' ? 'contactContributor' : 'contactAdministrators',
              lang,
            ),
            creationDescriptionLabel,
            defaultQuery: {
              type: 'event',
              typeIdentifier: event.uid,
              destinationInbox,
              params: {
                agendaTitle: _.unescape(agenda.title),
                eventTitle: _.unescape(getLocaleValue(event.title, lang)),
                agendaUid: agenda.uid,
              },
            },
            ContentWrapper: ({ children }) => <div className="event-content padding-h-sm padding-v-md">{children}</div>,
          },
          res: {
            author: resBasePath + '/inbox/author.json',
            conversations: {
              list: resBasePath + '/inbox/conversations.json',
              create: resBasePath + '/inbox/conversations.json',
              action: resBasePath + '/inbox/conversations/:conversationId/action/:code.json',
              resume: resBasePath + '/inbox/conversations/:conversationId/resume.json',
            },
            messages: {
              list: resBasePath + '/inbox/conversations/:conversationId/messages.json',
              create: resBasePath + '/inbox/conversations/:conversationId/messages.json',
              prepareAttachment: resBasePath + '/inbox/conversations/:conversationId/prepare-attachment',
              addAttachment: resBasePath + '/inbox/conversations/:conversationId/add-attachment',
            },
          },
          agenda: {},
          event: {
            uid: event.uid,
          },
        },
        history: createMemoryHistory(),
      }),
      {
        extraProps: {
          user,
          lang: lang,
          agenda: {
            uid: agenda.uid,
            slug: agenda.slug,
          },
        },
        disableScrollToTop: true,
      },
    ),
    du.el('.js_canvas'),
  );
});
