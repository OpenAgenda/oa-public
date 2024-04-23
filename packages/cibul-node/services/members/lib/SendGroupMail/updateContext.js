'use strict';

module.exports = function updateContext(context, member, options = {}) {
  const {
    role,
  } = member;

  const {
    setSentToMe = false,
  } = options;

  const {
    recipientRoles = {},
  } = context;

  const update = {
    ...context,
    after: member.id,
    recipientRoles: {
      ...recipientRoles,
      [role]: (recipientRoles[role] ?? 0) + 1,
    },
  };

  if (setSentToMe) {
    update.isSentToMe = true;
  }

  return update;
};
