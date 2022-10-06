'use strict';

const _ = require('lodash');
const { Forbidden, NotFound } = require('@openagenda/verror');

const validateNav = require('./lib/validateNav');
const format = require('./lib/format');
const canRead = require('./lib/canRead');

module.exports = async (core, agendaOrUid, nav, options = {}) => {
  const { services } = core;
  const {
    members: membersSvc,
    agendas,
  } = services;

  const {
    userUid: actingUserUid,
    access = null,
  } = options;

  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  const agenda = await agendas.get({ uid: agendaUid }, {
    internal: true,
    private: null,
  });

  if (!agenda) {
    throw new NotFound({ info: { uid: agendaUid } }, 'agenda not found');
  }

  const actingMember = actingUserUid ? await membersSvc.get({
    agendaUid: agenda.uid,
    userUid: actingUserUid,
  }) : null;

  if (!canRead(services, {
    access,
    actingMember,
    list: true,
  })) {
    throw new Forbidden('Not authorized to access member');
  }

  return membersSvc.list({
    agendaUid: agenda.uid,
  }, validateNav(nav), {
    total: true,
  }).then(({ members, total }) => ({
    total,
    after: _.get(_.last(members), 'order', null),
    items: members.map(m => format(membersSvc, m)),
  }));
};
