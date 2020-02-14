'use strict';

const _ = require('lodash');
const validateIdentifier = require('./lib/validateIdentifier');
const validateNav = require('./lib/validateNav');
const formatMember = require('../agendas/members/lib/format');

module.exports = async (services, identifier, nav = {}) => {
  const {
    users,
    members: membersSvc
  } = services;

  const user = await users.findOne(validateIdentifier(identifier));

  if (!user) {
    throw new Error('Not found');
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
}
