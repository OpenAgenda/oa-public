"use strict";
import du from '@openagenda/dom-utils';
import displayShareButtons from './displayShareButtons';
import displayContributorSection from './displayContributorSection';
import trackConsent from '../../agenda/js/trackConsent';
import addGoogleAnalyticsTracker from '../../agenda/js/addGoogleAnalyticsTracker';

const debug = require('debug');

const  eventMap = require('./map');

const utils = require('@openagenda/utils');

const get = require('@openagenda/utils/get');

const session = require('@openagenda/sessions/client');

const adminControls = require('./adminControls');

const ownershipTransfer = require('./ownershipTransfer');

const displayReferences = require('./displayReferences');

const displayAdditionalFields = require('./displayAdditionalFields');

const privateData = require('./privateData');

const hours = require('./hours');

const permalink = require('./permalink');

const portalTimings = require('./portalTimings');


let log;

const ROLES = {
  EVENTEDITOR: 2,     // owner or admin/moderator of agenda having edition rights over event
  AGENDAMODERATOR: 3, // moderator of current agenda env
  AGENDAADMIN: 4      // admin of current agenda env
};

const defaults = {
  selectors: {
    shareOa: '.js_shareOnOa',
    shareAll: '.js_shareAll',
    shareEmail: '.js_shareEmail',
    [ROLES.EVENTEDITOR]: '.js_role_event_editor',
    [ROLES.AGENDAMODERATOR]: '.js_role_agenda_moderator',
    [ROLES.AGENDAADMIN]: '.js_role_agenda_admin',
    inbox: '.js_inbox_event'
  },
  agendaUid: false, // uid of the current agenda environment
  adminAgendaUids: [], // uids of agendas with admin rights on event
};

if (['tpl', 'development'].indexOf(window.env) !== -1) {
  debug.enable('*');
}

window.hook(options => {
  adminControls.init();

  hours(utils.extend({}, options, {
    selectors: {
      origin: '.js_timings_canvas',
      destination: '.js_hours',
      right: '.js_right',
      left: '.js_left',
      months: '.js_months',
    }
  }));

  portalTimings();
});

window.asap(async options => {
  const params = utils.extend({
    agendaUid: null,
    hasOwnershipTransfer: false,
    me: null,
    member: null,
  }, defaults, options);

  params.user = session.getUser();

  log = debug('event');

  displayReferences(params.agendaUid, params.uid);

  permalink();

  trackConsent(options, {
    onConsentConfirmed: () => addGoogleAnalyticsTracker({
      agendaUID: params.agendaUid,
      googleAnalyticsID: params.googleAnalyticsID
    })
  });

  displayShareButtons(params, !!params.user);
  eventMap();

  if (params.user) {
    try {
      ({
        me: params.me,
        member: params.member
      } = await get.promise(window.env === 'tpl'
        ? '/server/testdata/eventusercontext.json'
        : `/api/me/agendas/${params.agendaUid}/events/${params.uid}`));
    } catch (e) {
      console.error('Failed to get event context data', e);
      return;
    }

    try {
      ({
        merged: params.schema
      } = await get.promise(window.env === 'tpl'
        ? '/server/testdata/memberSchema.json'
        : `/api/agendas/${params.agendaUid}/settings/memberSchema`));
    } catch (e) {
      console.error('Failed to get member schema', e);
      return;
    }
    // console.log(params.schema);
    displayContributorSection({
      me: params.me,
      member: params.member,
      lang: params.lang,
      agendaUid: params.agendaUid,
      GDPRInformation: params.GDPRInformation,
      schema: params.schema
    });

    if (['administrator', 'moderator'].includes(params.me?.member?.role)) {
      const elem = du.el('.js_edit_location');
      if (elem) du.removeClass(elem, 'display-none');
    }
  }

  const roles = defineRoles(params);

  log('roles: [%s]', roles.join(','));

  adminControls(session, {
    lang: params.lang,
    eventUid: params.uid,
    agendaUid: params.agendaUid,
    agendaSlug: params.agendaSlug,
    agendaTitle: params.agendaTitle,
    agendaImage: params.agendaImage,
    testFunc: () => roles.length,
    displaySelectors: roles.map(r => params.selectors[r])
  });

  const prv = privateData();

  if (params.hasOwnershipTransfer) {
    ownershipTransfer({
      lang: params.lang
    });
  }

  prv.displayMenus({
    me: params.me
  });

  get.promise(
    window.env === 'tpl'
      ? '/server/testdata/agendawithadditionalfields.json'
      : `/api/agendas/${params.agendaUid}?detailed=1`,
  )
    .then(agenda => {
      get.promise(
        window.env === 'tpl'
          ? '/server/testdata/eventdatawithadditionalfields.json'
          : `/api/agendas/${params.agendaUid}/events/${params.uid}`,
      )
        .then(({ event }) => {
          displayAdditionalFields({
            lang: params.lang,
            agenda,
            event
          });

          if (roles.includes(ROLES.EVENTEDITOR)) {
            prv.activities(params.agendaUid, params.uid, event.location?.uid, params.lang);
          }
        }, err => {
          log('error when trying to load event data');
          log(err);
        });
    }, err => {
      log('error when trying to load agenda schema');
      log(err);
    });

  if (params.user) {
    prv.inbox(params, { roles, ROLES });
  }
});


function defineRoles(params) {
  if (!params.user) {
    return [];
  }

  const roles = [];

  const isEventContributor = (params?.me?.member?.userUid === params?.member?.userUid)

  if ((params.member?.role === 'contributor') && isEventContributor) {
    roles.push(ROLES.EVENTEDITOR);
  }

  if (params.me?.member?.role === 'administrator') {
    roles.push(ROLES.EVENTEDITOR);
    roles.push(ROLES.AGENDAADMIN);
  }

  if (params.me?.member?.role === 'moderator') {
    roles.push(ROLES.EVENTEDITOR);
    roles.push(ROLES.AGENDAMODERATOR);
  }

  return roles;
}
