'use strict';

const _ = require('lodash');
const NotFoundError = require('../utils/NotFoundError');
const formatMember = require('../agendas/members/lib/format');
const validateIdentifier = require('./lib/validateIdentifier');
const validateNav = require('./lib/validateNav');

module.exports = async (services, identifier, nav = {}) => {
  const {
    users,
    members: membersSvc
  } = services;

  const user = await users.findOne({
    query: validateIdentifier(identifier, { pickOne: true })
  });

  if (!user) {
    throw new NotFoundError('user', identifier);
  }

  return membersSvc.list({
    userUid: user.uid
  }, validateNav(nav), {
    detailed: true,
    total: true
  }).then(({ members, total }) => ({
    total,
    after: _.get(_.last(members), 'order', null),
    items: members.map(item => ({
      ..._.pick(item.agenda, ['uid', 'slug', 'title']),
      member: formatMember(membersSvc, item)
    }))
  }));
};
