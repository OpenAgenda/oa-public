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
    custom,
  } = services;

  const {
    userUid: actingUserUid,
    actingMember: preloadedActingMember,
    access = null,
    detailed = false,
  } = options;

  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  const actingMember = preloadedActingMember || (
    actingUserUid ? await membersSvc.get({
      agendaUid,
      userUid: actingUserUid,
    }) : null
  );

  if (!canRead(services, {
    access,
    actingMember,
    list: true,
  })) {
    throw new Forbidden('Not authorized to access member');
  }

  const agenda = _.isObject(agendaOrUid) ? agendaOrUid : await agendas.get({ uid: agendaUid }, {
    internal: true,
    private: null,
  });

  if (!agenda) {
    throw new NotFound({ info: { uid: agendaUid } }, 'agenda not found');
  }

  const { total, members } = await membersSvc.list({
    agendaUid: agenda.uid,
  }, validateNav(nav), {
    total: true,
    detailed,
  });

  const membersUids = members.map(e => e.userUid);
  const customs = agenda.memberSchemaId ? (await custom(agenda.memberSchemaId).list({
    identifier: membersUids,
  })).items : [];

  return {
    total,
    after: _.get(_.last(members), 'order', null),
    items: members.map(e => ({ ...format(membersSvc, e, { detailed }), ...customs.find(a => a.identifier === e.userUid)?.custom ?? {} })),
  };
};
