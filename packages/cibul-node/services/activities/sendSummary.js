import _ from 'lodash';
import moment from 'moment';
import * as locales from '@openagenda/activity-apps/locales-compiled/index';
import formatters from '@openagenda/activity-apps/notifications';
import { createIntlByLocale } from '@openagenda/intl';
import logs from '@openagenda/logs';

import 'moment/locale/fr.js';

const log = logs('services/activities/sendSummary');

const intlByLocale = createIntlByLocale(locales);

export default async function sendSummary(
  config,
  services,
  { user, notifications },
  svcConfig,
) {
  if (!notifications.length) return;

  const { mails } = services;

  const activitiesConfig = svcConfig.activities;

  try {
    const lang = user.culture || 'fr';

    const intl = intlByLocale[lang] || intlByLocale.fr;

    const notifs = notifications.map((notif) => {
      const { label, url } = formatters[notif.verb](notif, {
        intl,
        config: activitiesConfig[notif.verb],
        userUid: user.uid,
        renderHighlight: (v) => `<span style="color: #413a42">${v}</span>`,
        escape: true,
      });

      return {
        label,
        url: `${config.root}${url}`,
        date: _.upperFirst(moment(notif.updatedAt).locale(lang).format('LLLL')),
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

    await mails.send({
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
        date: moment(notifications[notifications.length - 1].updatedAt)
          .locale(lang)
          .format('LLL'),
        link: config.root,
        logo: {
          src: `${config.root}/images/openagenda.png`,
          width: '300px',
        },
      },
    });
  } catch (err) {
    log.error(
      'Error to send daily notification email to the user %s (%s):',
      user.email,
      user.uid,
      err,
    );
  }
}
