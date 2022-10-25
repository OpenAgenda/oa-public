'use strict';

const _ = require('lodash');
const { NotFound } = require('@openagenda/verror');
const formatMember = require('../agendas/members/lib/format');
const validateIdentifier = require('./lib/validateIdentifier');
const validateNav = require('./lib/validateNav');
const validateOptions = require('./lib/validateOptions');
const assignDetailedAgendaInfo = require('./lib/assignDetailedAgendaInfo');

module.exports = (core, identifier) => async (nav = {}, options = {}) => {
  const {
    users,
    members: membersSvc,
  } = core.services;

  const {
    detailed,
  } = validateOptions(options);

  const user = await users.findOne({
    query: validateIdentifier(identifier, { pickOne: true }),
  });

  if (!user) {
    throw new NotFound({
      info: { uid: identifier },
    }, 'user not found');
  }

  const result = await membersSvc.list({
    userUid: user.uid,
  }, validateNav(nav), {
    detailed: true,
    total: true,
  }).then(({ members, total }) => ({
    total,
    after: _.get(_.last(members), 'order', null),
    items: members.map(item => ({
      ..._.pick(item.agenda, ['uid', 'slug', 'title']),
      member: _.omit(formatMember(membersSvc, item, {}), 'updatedAt'),
    })),
  }));

  if (detailed) {
    await assignDetailedAgendaInfo(core, result);
  }

  return result;
};
