'use strict';

const _ = require('lodash');

const validateNav = require('./lib/validateNav');
const format = require('./lib/format');

module.exports = async (services, agendaOrUid, nav) => {
  const {
    members: membersSvc,
    agendas
  } = services;

  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  const agenda = await agendas.get({ uid: agendaUid }, {
    internal: true,
    private: null
  });

  if (!agenda) {
    throw new Error('Not found')
  }

  return membersSvc.list({
    agendaUid: agenda.uid
  }, validateNav(nav), {
    total: true
  }).then(({ members, total }) => ({
    total,
    after: _.get(_.last(members), 'order', null),
    items: members.map(m => format(membersSvc, m))
  }));
}
