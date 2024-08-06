import _ from 'lodash';

function addWheres(k, query) {
  if (query.agendaUid !== undefined) {
    k.where('agenda_uid', query.agendaUid);
  } else if (query.userUid !== undefined) {
    k.where('user_uid', query.userUid);
  }

  if (query.eventUid && _.isArray(query.eventUid)) {
    k.whereIn('event_uid', query.eventUid);
  } else if (query.eventUid) {
    k.where('event_uid', query.eventUid);
  }

  if (query.state !== undefined) {
    k.andWhere('state', query.state);
  }

  if (query.excludeAgendaUid) {
    k.whereNotIn('agenda_uid', [].concat(query.excludeAgendaUid));
  }

  if (![null, undefined].includes(query.aggregated)) {
    k.whereNotNull('aggregated');
  }

  if (query.canEdit !== undefined) {
    k.andWhere('can_edit', query.canEdit);
  }
}

function buildListQuery(service, query, nav, options = {}) {
  const { client } = service;

  const { decorate } = {
    decorate: [],
    ...options,
  };

  const { limit, offset, lastId } = nav;

  const fields = [
    'agenda_uid',
    'event_uid',
    'user_uid',
    'can_edit',
    'state',
    'aggregated',
    'featured',
    'updated_at',
    'legacy_id',
  ];

  if (lastId !== undefined) {
    fields.push('id');
  }

  if (decorate.includes('sourceAgendas')) {
    fields.push('source_agenda_uid');
  }

  const k = client('agenda_event').select(fields);

  if (limit !== undefined) {
    k.limit(limit);
  }

  if (lastId !== undefined) {
    k.where('id', '>', lastId);
  } else {
    k.offset(offset);
  }

  addWheres(k, query);

  return k.then(rows =>
    rows.map(r => _.mapKeys(r, (v, key) => _.camelCase(key))));
}

export default Object.assign(buildListQuery, {
  addWheres,
});
