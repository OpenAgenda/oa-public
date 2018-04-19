"use strict";

var moment = require('moment');
var log = require('@openagenda/logs')('activities/notifications/tasks/sendSummary');
var queue = require('@openagenda/queue');
var mailer = require('@openagenda/mailer');
var notiflabels = require('@openagenda/labels/activities/notifications');
var emailLabels = require('@openagenda/labels/activities/summaryEmail');
var makeLabelGetter = require('@openagenda/labels');
var unsubscribed = require('@openagenda/unsubscribed');
var notificationFormatMaker = require('../../../formatNotification');

var _require = require('../../../formatNotification'),
    defaultGetUrl = _require.defaultGetUrl;

require('moment/locale/fr');

var config = void 0;
var knex = void 0;
var service = void 0;
var q = void 0;

var ucfirst = function ucfirst(s) {
  return s.substr(0, 1).toUpperCase() + s.substring(1);
};

module.exports = Object.assign(sendSummary, { init: init, task: task, core: _sendSummary });

function init(_ref) {
  var c = _ref.config,
      k = _ref.knex,
      s = _ref.service;


  config = c;
  knex = k;
  service = s;

  q = queue(config.queue.names.sendSummary, { redis: config.queue.redis });
}

async function task() {

  var summary = void 0;

  while (summary = await q.pop()) {

    try {

      await _sendSummary(summary);
    } catch (e) {

      log('error', 'Canno\'t send summary of notifications:', e);
    }
  }
}

function sendSummary(summary, cb) {

  q(summary, cb);
}

async function _sendSummary(_ref2) {
  var user = _ref2.user,
      notifications = _ref2.notifications;


  if (Math.abs(moment().diff(moment(notifications[notifications.length - 1].createdAt), 'days', true)) > 2) {

    await knex(config.schemas.feed_notification).where('feed_id', notifications[0].feedId).whereIn('id', notifications.map(function (v) {
      return v.id;
    })).update({ sent: 1 });

    return log('warn', 'Attempt to send too old summary at %s', user.email, { notifications: notifications });
  }

  if (!notifications.length) return;

  await knex(config.schemas.feed_notification).where('feed_id', notifications[0].feedId).whereIn('id', notifications.map(function (v) {
    return v.id;
  })).update({ sent: 1 });

  var lang = user.culture || 'fr';

  var formatNotification = notificationFormatMaker(function () {
    var url = defaultGetUrl.apply(undefined, arguments);
    return url ? config.root + url : null;
  }, notiflabels, user.uid);
  var getLabel = makeLabelGetter(emailLabels, lang);

  var message = notifications.map(function (v) {
    var formatted = formatNotification(v, lang);

    return '<span style="color: gray"><span style="font-size: 12px">' + ucfirst(moment(v.createdAt).locale(lang).format('LLLL')) + '</span><br />' + '<a href="' + formatted.url + '" style="color: gray">' + formatted.content.replace(/class="notif-highlight"/g, 'style="color: #413a42"') + '</a></span>';
  }).join('\n***\n');

  mailer({
    recipient: user.email,
    source: '"OpenAgenda" <' + (lang === 'fr' ? 'ne-pas-repondre' : 'no-reply') + '@openagenda.com>',
    subject: getLabel('subject', {
      nbr: notifications.length,
      date: moment(notifications[notifications.length - 1].createdAt).locale(lang).format('LLL')
    }, lang),
    data: {
      logo: 'https://openagenda.com/images/openagenda.png',
      title: {
        text: getLabel('dailySummary', lang),
        link: 'https://openagenda.com/'
      },
      action: {
        label: getLabel('goToOA', lang),
        link: 'https://openagenda.com/'
      },
      description: message,
      footerActions: [{
        link: config.root + unsubscribed.app.genUrl('add', {
          userUid: user.uid,
          subject: 'notifications',
          type: 'notifications_summary'
        }),
        text: getLabel('unsubsribe', lang)
      }]
    }
  }, function (err, result) {

    if (err) return log('error', 'Error to send daily notification email to the user %s: %s', user.uid, err.message || err);
  });
}
//# sourceMappingURL=sendSummary.js.map