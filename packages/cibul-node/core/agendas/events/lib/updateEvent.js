'use strict';

const { BadRequest } = require('@openagenda/verror');
const log = require('@openagenda/logs')('core/agendas/events/lib/updateEvent');
const processOEmbed = require('../../utils/processOEmbed');

module.exports = async function updateEvent(services, {
  clean,
  payload,
  draft,
  agendaUid,
  userUid,
  eventUid,
  privateOption,
  event,
  partial
}) {
  const {
    oembed,
    events
  } = services;

  if (clean.event.longDescription) {
    try {
      clean.event.links = await processOEmbed(oembed, clean.event.longDescription, {
        current: clean.event.links,
        includeEmbedlessLinks: true,
        filterInvalidLinks: true
      });
      log('retrieved %s links', clean.event.links.length);
    } catch (e) {
      log('error', 'could not retrieve oembeds', e);
    }
  }

  try {
    payload.setItem('event', event, await events[partial ? 'patch' : 'update'](eventUid, clean.event, {
      context: {
        agendaUid,
        userUid,
        updateSearchIndex: false
      },
      detailed: true,
      access: 'internal',
      draft,
      private: privateOption
    }));

    log('updated event %s', event.uid);
  } catch (e) {
    if (e.toString() === 'ValidationError: Invalid data') {
      log('info', 'invalid data', e);
      throw new BadRequest({ info: e.detail }, 'invalid data');
    }
    log('error', 'failed to update event', {
      agendaUid,
      eventUid,
      error: e
    });
    throw e;
  }
};
