"use strict";

const _ = require('lodash');
const async = require('async');
const fs = require('fs');
const VError = require('verror');

const { promisify } = require('util');

const log = require('@openagenda/logs')('services/elasticsearch/resync');
const loopThroughTable = require('@openagenda/legacy/rebuildSearchIndex/loopThroughTable');

const { knex, aws: { imageBucketPath: imageBasePath } } = require('../../../config');

const knownBuildErrors = [
  'no event record',
  'no review_article record',
  'no location record',
  'invalid timings',
  'invalid location store',
  'invalid reviewer store',
  'invalid title',
  'invalid description',
  'invalid freeText',
  'invalid article store'
];

module.exports = async function(services, ES, options, cb) {

  if (arguments.length == 1) {
    cb = options;
    options = {};
  }

  const params = _.assign({
    agendaId: false,
    isPublished: null,
    interval: 0,
    reset: false,
    showAll: true,
    since: null,
    removeZombies: true,
    logEveryUpdate: false
  }, options);

  if (params.reset) {
    delete params.agendaId;
    await ES.resetIndex();
  }

  const agendaId = params.agendaId || params.reviewId;

  if (!agendaId) {
    await _updateReviews(ES, _.pick(params, ['since', 'logEveryUpdate']));
  }

  if (params.removeZombies) {
    await _removeEventZombies(services, ES, agendaId);
  }

  await _updateEvents(services, ES, agendaId, _.pick(params, ['since', 'logEveryUpdate']));

  await ES.refreshIndex();

  if (cb) cb();

}


async function _updateReviews(ES, { since, logEveryUpdate }) {

  const count = { processed: 0, errors: 0 };

  await loopThroughTable(knex, 'review', async id => {

    await ES.updateReview(id);
    if (logEveryUpdate) log('updated agenda of id %s', id);

    count.processed++;

    if (!(count.processed % 20)) {
      log('info', 'updated %s reviews', count.processed);
    }

  }, { since });

}

async function _updateEvents(services, ES, agendaId, { since, logEveryUpdate }) {
  const {
    knex
  } = services;

  const count = { processed: 0, errors: 0 };

  await loopThroughTable(knex, agendaId ? 'review_article' : 'event', async id => {
    if (!await knex('agenda_event').first('id').where('legacy_id', `${agendaId}.${id}`)) {
      log(`no matching agenda_event for legacy ref ${agendaId}.${id}. skipping`);
      return;
    }

    try {
      const result = await ES.updateEvent(id);
      if (logEveryUpdate) log('updated event of id %s', id);
    } catch(e) {
      if (knownBuildErrors.includes(e.message)) {
        log('warn', e.message, { eventId: id });
      } else if (e.statusCode) {
        log('warn', 'failed to index event of id %s', id, e);
        console.log(JSON.stringify(e.items, null, 2));
      } else {
        log('error', e);
        throw new VError('failed to build event of id %s', id);
      }
    }

    count.processed++;

    if (!(count.processed % 20)) {
      log('info', 'updated %s events', count.processed);
    }

  }, {
    query: agendaId ? { review_id: agendaId } : null,
    field: agendaId ? 'event_id' : 'id',
    since
  });

}


function _defineGetQuery(type, params, obj) {

  const q = { id: obj[type=='reviews' ? 'reviewId' : 'eventId'] };

  if (type == 'events' && params.reviewId) {
    q.reviewId = params.reviewId;
  }

  return q;

}

async function _removeEventZombies(services, ES, agendaId) {
  const {
    agendaEvents
  } = services;

  log('info', agendaId ? 'removing zombie events of agenda id %s' : 'removing zombie events of entire index', agendaId);

  const agendaUid = await knex('review').first('uid').where('id', agendaId).then(r => r ? r.uid : null);

  const limit = 20;

  let offset = 0;
  let indexedEvents;
  let totalRemoved = 0;

  while ((indexedEvents = await ES.searchEvents({ passed: 1 }, { offset, limit, showAll: true, agendaId }).then(r => r.events)).length) {

    log('info', 'Checking %s events in index for zombies (offset %s)', indexedEvents.length, offset);

    const serviceEventUids = await agendaEvents(agendaUid).list({
      eventUid: indexedEvents.map(e => e.uid)
    }, 0, limit).then(({ items }) => items.map(ae => ae.eventUid));

    let removed = 0;

    const zombieEvents = indexedEvents.filter(e => !serviceEventUids.includes(e.uid));

    for (const zombieEvent of zombieEvents) {
      try {
        await ES.updateEvent(zombieEvent.eventId);
        removed++;
      } catch (e) {
        if (['no legacy event record', 'no review_article record'].includes(e.message)) {
          try {
            await ES.removeEvent(zombieEvent.eventId);
          } catch (e) {
            log('error', 'failed to completely removed event %s (legacy id: %s)', zombieEvent.slug, zombieEvent.eventId);
            log('error', e);
          }
        } else {
          log('error', 'failed to remove event %s (legacy id: %s)', zombieEvent.slug, zombieEvent.eventId);
          log('error', e);
        }
      }
    }

    offset += limit - removed;

    if (removed > 0) log('removed %s zombies', removed);

    totalRemoved += removed;

  }

  log('info', agendaId ? 'removed %s zombies in agenda id %s' : 'removed %s zombies in all index', totalRemoved, agendaId);

}
