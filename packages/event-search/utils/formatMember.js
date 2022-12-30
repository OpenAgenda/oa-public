'use strict';

const _ = require('lodash');
const { flatten } = require('./aggregatorObjects');

const getFirstMatch = (data, namespaces, defaultValue) => {
  for (const n of namespaces) {
    const v = _.get(data, n);
    if (![undefined, null].includes(v)) {
      return v;
    }
  }
  return defaultValue;
};

module.exports = function formatMember({ member, user }) {
  const clean = {
    uid: getFirstMatch({ member, user }, ['member.uid', 'member.userUid', 'user.uid'], null),
    name: getFirstMatch({ member, user }, ['member.name', 'member.custom.contactName', 'user.fullName'], null),
    role: member?.role ?? null,
    organization: getFirstMatch(member, ['organization', 'custom.organization'], null),
    position: getFirstMatch(member, ['position', 'custom.contactPosition'], null),
    phone: getFirstMatch(member, ['phone', 'custom.contactNumber'], null),
    email: getFirstMatch(member, ['email', 'custom.email'], null),
  };

  clean._agg = flatten(clean, ['uid', 'name']);

  return {
    ...clean,
    ..._.omit(member, ['custom', 'userUid', ...Object.keys(clean)]),
  };
};
