'use strict';

const _ = require('lodash');
const moment = require('moment');
const locales = require('@openagenda/activity-apps/dist/locales-compiled');
const formatters = require('@openagenda/activity-apps/dist/notifications');
const { createIntlByLocale } = require('@openagenda/intl');
const log = require('@openagenda/logs')('services/activities/sendSummary');
const mails = require('../mails');

require('moment/locale/fr');

const intlByLocale = createIntlByLocale(locales);

module.exports = async function sendSummary(config, { user, notifications }, svcConfig) {
  if (!notifications.length) return;

  const activitiesConfig = svcConfig.activities;

  try {
    const lang = user.culture || 'fr';

    const intl = intlByLocale[lang] || intlByLocale.fr;

    const notifs = notifications.map(notif => {
      const { label, url } = formatters[notif.verb](notif, {
        intl,
        config: activitiesConfig[notif.verb],
        userUid: user.uid,
        renderHighlight: v => `<span style="color: #413a42">${v}</span>`,
        escape: true,
      });

      return {
        label,
        url: `${config.root}${url}`,
        date: _.upperFirst(moment(notif.updatedAt).locale(lang).format('LLLL'))
      };
    });

    // const formatNotification = notificationFormatMaker((...args) => {
    //   const url = notificationFormatMaker.defaultGetUrl(...args);
    //   return url ? config.root + url : null;
    // }, notifLabels, { userUid: user.uid, renderHighlight: v => `<span style="color: #413a42">${v}</span>` });
    //
    // const message = notifications.map(
    //   v => {
    //     const formatted = formatNotification(v, lang);
    //
    //     // TODO move to mail template
    //     return '<span style="font-size: 12px">' +
    //       _.upperFirst(moment(v.updatedAt).locale(lang).format('LLLL')) + '</span><br />' +
    //       '<a href="' + formatted.url + '" style="color: gray; text-decoration: none">' +
    //       formatted.content +
    //       '</a>';
    //   },
    // ).join('\n***\n');

    const res = await mails.send({
      template: 'notificationsSummary',
      to: {
        address: user.email,
        unsubscriptions: [
          {
            rule: ['receive', 'notificationsSummary'],
            dataPath: 'unsubscribeLink',
          },
        ],
      },
      lang,
      data: {
        notifications: notifs,
        nbr: notifications.length,
        date: moment(notifications[notifications.length - 1].updatedAt).locale(lang).format('LLL'),
        link: config.root,
        logo: {
          src: `${config.root}/images/openagenda.png`,
          width: '300px',
        },
      },
    });
  } catch (err) {
    log.error('Error to send daily notification email to the user %s (%s):', user.email, user.uid, err);
  }
};
