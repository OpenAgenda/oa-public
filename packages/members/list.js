'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('list');
const addListFilters = require('./lib/addListFilters');
const getRoleSlug = require('./lib/getRoleSlug');
const { fromDB } = require('./lib/transformDBEntry');
const cleanListOptions = require('./lib/cleanListOptions');
const addPaginationAndOrder = require('./lib/addPaginationAndOrder');

async function _getTotal(knex, k, includeTotal = false, detailed = false) {
  if (!includeTotal) {
    return {
      total: null,
      totalPerRole: null
    };
  }

  const query = k.clone();

  if (!detailed) {
    return query.count('id as total').then(r => ({
      total: _.get(r, '0.total'),
      totalPerRole: null
    }));
  }
  return query
    .select(knex.raw('credential as role, count( id ) as total'))
    .groupBy('role')
    .then(rows => rows.reduce(
      ({ total, totalPerRole }, row) => ({
        totalPerRole: _.set(
          totalPerRole,
          getRoleSlug(row.role),
          _.get(totalPerRole, getRoleSlug(row.role), 0) + row.total
        ),
        total: total + row.total
      }),
      {
        total: 0,
        totalPerRole: {}
      }
    ));
}

module.exports = async (
  { knex, schema, interfaces },
  query,
  nav = {},
  options = {}
) => {
  log('processing', query, nav);

  const { detailed, total: includeTotal, legacy } = cleanListOptions(options);

  const k = knex(schema);

  addListFilters(k, query);

  const { total, totalPerRole } = await _getTotal(
    knex,
    k,
    includeTotal,
    detailed
  );

  const { orderField } = addPaginationAndOrder(k, nav);

  const members = await k.then(rows => rows.map(
    fromDB.bind(null, {
      includeLegacyFields: legacy,
      orderField
    })
  ));

  if (detailed) {
    members.forEach(m => Object.assign(m, { eventCount: 0 }));
  }

  if (detailed && _.get(interfaces, 'getUsersByUid')) {
    const users = await interfaces.getUsersByUid(
      members.map(m => m.userUid).filter(m => !!m)
    );
    members.forEach(m => {
      m.user = _.find(users, { uid: m.userUid });
    });
  }

  if (detailed && _.get(interfaces, 'getAgendasByUid') && members.length) {
    const agendas = await interfaces.getAgendasByUid(
      members.map(m => m.agendaUid).filter(m => !!m)
    );
    members.forEach(m => {
      m.agenda = _.find(agendas, { uid: m.agendaUid });
    });
  }

  if (
    detailed
    && members.length
    && _.get(interfaces, 'getEventCountByUserUid')
  ) {
    (await interfaces.getEventCountByUserUid(
      query.agendaUid,
      members.map(m => m.userUid)
    )).forEach(stat => {
      _.find(members, { userUid: stat.userUid }).eventCount = stat.count;
    });
  }

  return includeTotal || legacy
    ? {
      [legacy ? 'stakeholders' : 'members']: members,
      ...(total ? { total } : {}),
      ...(totalPerRole ? { totalPerRole } : {})
    }
    : members;
};
