"use strict";

const _ = require('lodash');
const VError = require('@openagenda/verror');

const log = require('@openagenda/logs')('legacyTransfer');

const validate = require('../iso/validate');
const getLegacyState = require('./lib/getLegacyState');
const toLegacyState = require('./lib/toLegacyState');

module.exports.to = async (service, ae) => {
  const { client } = service;

  const legacyState = toLegacyState(ae.state);
  log('legacy state %s', legacyState);

  const data = {
    state: legacyState.state,
    is_published: legacyState.isPublished,
    featured: ae.featured,
    updated_at: new Date
  }

  if (ae.userUid) {
    log('adding reference to user uid %s', ae.userUid);
    data.user_id = _.get(await client('user')
      .first('id')
      .where('uid', ae.userUid),
      'id'
    );
  }

  const q = client('review_article');

  const legacyId = await _getLegacyId(client, ae);

  const updatedAgendaEvent = {...ae};

  let eventId, agendaId;

  if (legacyId) {
    log('legacy agenda-event reference found, updating');

    agendaId = _.get(legacyId.split('.'), '0');
    eventId = _.get(legacyId.split('.'), '1');

    if (!agendaId || !eventId) {
      throw new VError('legacyId for ref %s.%s is incomplete', ae.agendaUid, ae.eventUid, legacyId);
    }

    try {
      await q.update(data).where({
        event_id: eventId,
        review_id: agendaId
      });
    } catch (e) {
      throw new VError(e, 'failed to update %s.%s based on legacy id %s', ae.agendaUid, ae.eventUid, legacyId);
    }
  } else {
    log('legacy agenda-event reference not found, creating');

    eventId = _.get(await client('event').first('id').where('uid', ae.eventUid), 'id');
    agendaId = _.get(await client('review').first('id').where('uid', ae.agendaUid), 'id');

    const result = await q.insert({
      review_id: agendaId,
      event_id: eventId,
      created_at: new Date,
      ...data
    });

    if (result.length) {
      const newLegacyId = [agendaId, eventId].join('.');

      await client('agenda_event').update({
        legacy_id: newLegacyId
      }).where({
        agenda_uid: ae.agendaUid,
        event_uid: ae.eventUid
      });

      updatedAgendaEvent.legacyId = newLegacyId;
    }
  }

  const hasLegacyEventEditorRef = await client('event_editor')
      .first('event_id')
      .where({
        event_id: eventId,
        review_id: agendaId
      }).then(r => !!r);

  if (ae.canEdit && !hasLegacyEventEditorRef) {
    await client('event_editor').insert({
      event_id: eventId,
      review_id: agendaId,
      type: 1,
      created_at: new Date(),
      updated_at: new Date()
    });
  } else if (!ae.canEdit && hasLegacyEventEditorRef) {
    await client('event_editor').delete().where({
      event_id: eventId,
      review_id: agendaId
    });
  }

  return updatedAgendaEvent;
}

module.exports.remove = async (service, ae) => {
  const { client, getByLegacyId } = service;
  const legacyId = await _getLegacyId(client, ae);

  if (!legacyId) return;

  return client('review_article').delete().where({
    review_id: legacyId.split('.')[0],
    event_id: legacyId.split('.')[1]
  });
}

module.exports.from = async (service, origin, options = {}) => {
  const {
    client,
    getByLegacyId,
    removeByLegacyId,
    create,
    update
  } = service;

  if (typeof origin === 'object') {
    if (!origin.agendaId) {
      throw new Error('agendaId must be defined for legacy transfer');
    }

    if (!origin.eventId) {
      throw new Error('eventId must be defined for legacy transfer');
    }
  }

  const where = typeof origin === 'object' ? {
    'ra.review_id': origin.agendaId,
    'ra.event_id': origin.eventId
  } : { 'ra.id': origin };

  let data = await client('agenda_event')
    .first([
      'a.uid as agendaUid',
      'e.uid as eventUid',
      'a.id as agendaId',
      'e.id as eventId',
      'ra.is_published as isPublished',
      'ra.state as state',
      'ra.featured as featured',
      'ra.updated_at as updatedAt',
      'ra.created_at as createdAt',
      'u.uid as userUid',
      'ee.event_id as canEdit'
   ]).from('review_article as ra')
    .leftJoin('review as a', 'ra.review_id', 'a.id')
    .leftJoin('event as e', 'ra.event_id', 'e.id')
    .leftJoin('user as u', 'ra.user_id', 'u.id')
    .leftJoin('event_editor' + ' as ee', function() {
      this.on('ra.event_id', '=', 'ee.event_id')
        .andOn('ra.review_id', '=', 'ee.review_id');
    }).where(where);

  let result = null;

  data.canEdit = !!data.canEdit;

  const current = await getByLegacyId(origin.agendaId, origin.eventId);

  const values = {
    state: getLegacyState(data.state, data.isPublished),
    featured: data.featured,
    legacyId: data.agendaId + '.' + data.eventId,
    createdAt: data.createdAt,
    userUid: data.userUid,
    canEdit: data.canEdit,
    updatedAt: data.updatedAt
  };

  if (!data && current) {
    result = await removeByLegacyId(origin.agendaId, origin.eventId);

    result.operation = 'delete';
  } else if (data && !current) {
    result = await create(data.agendaUid, data.eventUid, values, {
      protected: false,
      ...options
    });
    result.operation = 'create';
  } else if (data && (_.get(options, 'force') || (current.updatedAt < new Date(data.updatedAt )))) {
    result = await update(data.agendaUid, data.eventUid, values, {
      protected: false,
      ...options
    }, options);

    result.operation = 'update';
  } else {
    result = { operation: null }
  }

  return result;
}

async function _getLegacyId(client, ae) {
  if (ae.legacyId) {
    return ae.legacyId;
  }

  const agendaId = _.get(await client('review')
    .first('id')
    .where('uid', ae.agendaUid),
    'id'
  );
  log('agenda id %s', agendaId);

  const eventId = _.get(await client('event')
    .first('id')
    .where('uid', ae.eventUid),
    'id'
  );
  log('legacy event id %s', eventId);

  return _.get(await client('review_article')
    .first('id')
    .where({
      event_id: eventId,
      review_id: agendaId
    }),
    'id'
 ) ? agendaId + '.' + eventId : null;
}
