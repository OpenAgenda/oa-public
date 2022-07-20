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
  ownerUid: false, // uid of the owner
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
});

window.asap(async options => {
  const params = utils.extend({
    agendaUid: null,
    hasCustomFields: false,
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

  displayAdditionalFields({
    lang: params.lang,
    agendaUid: params.agendaUid,
    eventUid: params.uid
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

    displayContributorSection({
      me: params.me,
      member: params.member,
      lang: params.lang,
      agendaUid: params.agendaUid,
      GDPRInformation: params.GDPRInformation
    });

    if (['administrator', 'moderator'].includes(params.me?.member?.role)) {
      const elem = du.el('.js_edit_location');
      if (elem) du.removeClass(elem, 'display-none');
    }
  }

  const roles = defineRoles(params);

  log('roles: [%s]', roles.join(','));

  let showControls = adminControls(session, {
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

  prv.load(params.agendaUid, params.uid, params.lang);

  if (roles.includes(ROLES.EVENTEDITOR)) {
    prv.activities(params.agendaUid, params.uid, params.lang);
  }

  if (params.user) {
    prv.inbox(params, { roles, ROLES });
  }
});


function defineRoles(params) {
  if (!params.user) {
    return [];
  }

  const roles = [];

  if (params.me?.authorizations?.canEditEvent) {
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
