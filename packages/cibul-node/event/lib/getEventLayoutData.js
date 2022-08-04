'use strict';

const _ = require('lodash');
const utils = require('@openagenda/utils');

module.exports = function getEventLayoutData(req) {
  const {
    indexedEvent: event
  } = req;

  const {
    core
  } = req.app.services;

  const config = core.getConfig();

  const descriptionParts = [
    event.description,
    event.dateRange
  ];

  if (event.location) {
    descriptionParts.push(event.location.name);
  }

  const hasOwnershipTransfer = req.agenda.credentials.eventOwnershipTransfer;

  return {
    ..._.pick(req.agenda, ['uid', 'slug', 'title', 'description', 'url', 'image']),
    metas: {
      title: utils.escape(event.title, false),
      keywords: utils.escape(event.keywords, false),
      ogSiteName: {
        property: 'og:site_name',
        content: 'OpenAgenda'
      },
      ogTitle: {
        property: 'og:title',
        content: utils.escape(event.title, false)
      },
      ogDescription: {
        property: 'og:description',
        content: utils.escape(descriptionParts.join(' - '))
      },
      ogLocale: {
        property: 'og:locale',
        content: req.lang
      },
      ogUrl: `${config.root}${req.originalUrl.split('?').shift()}?lang=${req.lang}`,
      'twitter:card': event.image ? 'summary_large_image' : 'summary',
      'twitter:title': utils.escape(event.title, false),
      'twitter:description': utils.escape(descriptionParts.join(' - '), false),
      'twitter:domain': config.domain,
      ...(event.image ? {
        ogImage: {
          property: 'og:image',
          content: `${event.image.base}${event.image.filename}`
        },
        'twitter:image': `${event.image.base}${event.image.filename}`
      } : {})
    },
    headLinks: event.languages.filter(l => l.code !== req.lang).map(l => ({
      rel: 'alternate',
      href: `${config.root}${req.originalUrl.split('?').shift()}?lang=${l.code}`,
      hreflang: l.code
    })),
    indexed: !!req.agenda.indexed && !req.agenda.private,
    mailto: req.agenda.settings.inbox?.mailto,
    useDetailedStatusActions: req.agenda.settings.lab?.status,
    scriptParams: {
      uid: event.uid,
      title: utils.escape(event.title, false),
      agendaUid: req.agenda.uid,
      agendaTitle: req.agenda.title,
      ownerUid: req.indexedEvent.ownerUid,
      lang: req.lang,
      hasOwnershipTransfer,
      moderatorCanPublish: (req.agenda.settings.contribution?.canPublish ?? ['moderators', 'administrators']).includes('moderators'),
      GDPRInformation: req.agenda.settings.contribution?.messages?.GDPRInformation,
      googleAnalyticsID: req.agenda.settings.tracking?.googleAnalytics
    },
    settings: req.agenda.settings,
    hasOwnershipTransfer
  };
};
