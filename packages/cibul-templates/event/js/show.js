"use strict";

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

window.asap(options => {
  const params = utils.extend({
    agendaUid: null,
    hasCustomFields: false,
    hasOwnershipTransfer: false,
    res: {
      detailedSession: '/session?detailed=1'
    }
  }, defaults, options);

  log = debug('event');

  if (window.env === 'tpl') {
    params.res.detailedSession = 'detailedsession.json';
  }

  displayReferences(params.agendaUid, params.uid);

  permalink();

  trackConsent(options, {
    onConsentConfirmed: () => addGoogleAnalyticsTracker({
      agendaUID: params.agendaUid,
      googleAnalyticsID: params.googleAnalyticsID
    })
  });

  get(window.env === 'tpl' ? '/server/testdata/eventusercontext.json' : `/api/me/agendas/${params.agendaUid}/events/${params.uid}/context`, (err, res) => {
    if (!res) return;

    const { me, member } = res;

    displayContributorSection({
      me,
      member,
      lang: params.lang,
      agendaUid: params.agendaUid
    });
  });

  _defineRoles(params, (err, roles) => {
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

    const user = session.getUser();

    if (user) {
      prv.inbox(params, { roles, ROLES });
    }

  });

  displayShareButtons(params, !!session.getUser());
  eventMap();
});


function _defineRoles(params, cb) {
  if (!session.isLogged()) return cb(null, []);

  const user = session.getUser();
  const roles = [];

  // user is owner
  if (user.uid == params.ownerUid) {
    roles.push(ROLES.EVENTEDITOR);
  }

  get(params.res.detailedSession, (err, res) => {
    if (err) return cb(err);

    if (params.adminAgendaUids
      .filter(uid => res.agendas.map(a => a.uid).indexOf(uid) !== -1)
      .map(uid => res.agendas.filter(a => a.uid === uid)[0].role)
      .filter(r => ['administrator', 'moderator'].indexOf(r) !== -1)
      .length) {
      roles.push(ROLES.EVENTEDITOR);
    }

    if (!params.agendaUid) return cb(null, roles);

    const matches = res.agendas.filter(a => a.uid === params.agendaUid);

    if (!matches.length) return cb(null, roles);

    if (matches.filter(a => a.role === 'administrator').length) {
      roles.push(ROLES.AGENDAADMIN);
    }

    if (matches.filter(a => a.role === 'moderator').length) {
      roles.push(ROLES.AGENDAMODERATOR);
    }

    cb(null, roles);
  });

}
