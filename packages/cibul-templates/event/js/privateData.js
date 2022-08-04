import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import debug from 'debug';
import { createMemoryHistory } from 'history';
import du from '@openagenda/dom-utils';
import { wrapApp } from '@openagenda/react-shared';
import createInboxApp from '@openagenda/inbox-apps/dist/app';
import sessions from '@openagenda/sessions/client';
import makeLabelGetter from '@openagenda/labels';
import inboxesLabels from '@openagenda/labels/inboxes';
import remote from '../../js/lib/remote';
import activities from './activities';

const getInboxesLabel = makeLabelGetter(inboxesLabels);

const defaults = {
  uid: false,
  agendaUid: false,
  env: 'production',
  url: {
    production: '/agendas/{agendaUid}/events/{eventUid}/private',
    development: '/agendas/{agendaUid}/events/{eventUid}/private',
    tpl: '/server/testdata/privateeventdata.json'
  },
  activitiesSelector: '.js_activities',
  activitiesUrl: {
    production: '/agendas/{agendaUid}/events/{eventUid}/activities',
    development: '/agendas/{agendaUid}/events/{eventUid}/activities',
    tpl: '/server/testdata/eventactivitiesdata.json'
  },
  customTemplate: require('../custom.part.ejs'),
  className: 'private'
};

let log;

module.exports = options => {

  var params = _.extend({
    roles: []
  }, defaults, options ? options : {});

  if (window.env) params.env = window.env;

  if (['development', 'tpl'].indexOf(params.env) !== -1) {

    debug.enable('*');

  }

  log = debug('customData');

  return {
    displayMenus,
    activities: displayActivities,
    inbox
  }

  function displayMenus({
    me
  }) {
    log('displaying menus', me);

    if (me.authorizations?.canEditEvent) {
      log('can edit event, displaying status change controls');
      for (const el of du.els('.js_status')) {
        du.removeClass(el, 'display-none');
      }
    } else {
      log('cannot edit event, displaying disabled status change message');
      du.removeClass(du.el('.js_request_edition_rights'), 'display-none');
      du.removeClass(du.el('.js_disabled_status'), 'display-none');
    }

    if (me.authorizations?.canChangeState) {
      du.removeClass(du.el('.js_can_change_state'), 'display-none');
    } else {
      du.removeClass(du.el('.js_cannot_change_state'), 'display-none');
    }

    if (me.authorizations?.canPublish) {
      du.removeClass(du.el('.js_can_publish_event'), 'display-none');
    }
  }

  function displayActivities(agendaUid, eventUid, lang) {
    activities({
      canvas: du.el(params.activitiesSelector),
      res: params.activitiesUrl[params.env].replace('{agendaUid}', agendaUid).replace('{eventUid}', eventUid),
      fetch: _fetch,
      lang
    });
  }

  function renderInboxApp({ initialState, extraProps, selector }) {
    ReactDOM.render(wrapApp(createInboxApp({
      initialState,
      history: createMemoryHistory()
    }), {
      extraProps,
      disableScrollToTop: true
    }), du.el(selector));
  }

  function inbox(params, { roles, ROLES }) {
    if (!document.querySelector('.js_inbox_event_canvas')) {
      return;
    }

    const simpleUser = !roles.some(r => r == ROLES.AGENDAMODERATOR || r == ROLES.AGENDAADMIN);
    const resBasePath = simpleUser ? '/home' : '/agendas/:agendaUid';

    const user = sessions.getUser();

    // userRole === 'adminContributor' || 'adminmod' || 'contributor' || 'simpleUser'
    const userRole = (() => {
      if (simpleUser && user.uid === params.ownerUid) {
        return 'contributor';
      }
      if (user.uid === params.ownerUid) {
        return 'adminContributor'
      }
      return simpleUser ? 'simpleUser' : 'adminmod';
    })();

    // eventConvDescAdminmod
    // eventConvDescContributor
    // eventConvDescSimpleUser
    const creationDescriptionLabel = getInboxesLabel('eventConvDesc' + _.upperFirst(userRole), params.lang);

    const destinationInbox = (() => {
      switch (userRole) {
        case 'adminContributor': // admin contributor
          return;
        case 'adminmod': // admin (not contributor) -> contributor
          return {
            type: 'user',
            identifier: params.ownerUid
          };
        case 'contributor': // contributor (not admin) -> admins/modos
          return {
            type: 'agenda',
            identifier: params.agendaUid
          };
        case 'simpleUser': // user lambda -> admins/modos + contributor
          return [{
            type: 'agenda',
            identifier: params.agendaUid
          }, {
            type: 'user',
            identifier: params.ownerUid
          }];
      }
    })();

    renderInboxApp({
      selector: params.selectors.inbox,
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
            params.lang
          ),
          creationButtonLabel: getInboxesLabel(
            userRole === 'adminmod' ? 'contactContributor' : 'contactAdministrators',
            params.lang
          ),
          creationDescriptionLabel,
          defaultQuery: {
            type: 'event',
            typeIdentifier: params.uid,
            destinationInbox,
            params: {
              agendaTitle: _.unescape(params.agendaTitle),
              eventTitle: _.unescape(params.title),
              agendaUid: params.agendaUid
            }
          },
          ContentWrapper: ({ children }) => <div className="event-content padding-h-sm padding-v-md">{children}</div>,
        },
        res: {
          author: resBasePath + '/inbox/author.json',
          conversations: {
            list: resBasePath + '/inbox/conversations.json',
            create: resBasePath + '/inbox/conversations.json',
            action: resBasePath + '/inbox/conversations/:conversationId/action/:code.json',
            resume: resBasePath + '/inbox/conversations/:conversationId/resume.json'
          },
          messages: {
            list: resBasePath + '/inbox/conversations/:conversationId/messages.json',
            create: resBasePath + '/inbox/conversations/:conversationId/messages.json',
            prepareAttachment: resBasePath + '/inbox/conversations/:conversationId/prepare-attachment',
            addAttachment: resBasePath + '/inbox/conversations/:conversationId/add-attachment'
          }
        },
        agenda: {},
        event: {
          uid: params.uid
        }
      },
      extraProps: {
        user,
        lang: params.lang,
        agenda: {
          uid: params.agendaUid,
          slug: params.agendaSlug
        }
      }
    });

    const canvasElem = document.querySelector('.js_inbox_event_canvas');

    canvasElem.classList.remove('display-none');
  }

  function _fetch(res, cb) {
    log('fetching %s', res);

    remote.get(res, { timeout: 30000 }, (responseType, data) => {
      if (responseType == 'success') {
        cb(null, data);
      } else {
        cb(data.responseType);
      }
    }, true);
  }
}
