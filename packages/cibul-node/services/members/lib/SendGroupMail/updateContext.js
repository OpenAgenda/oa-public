export default function updateContext(context, member, options = {}) {
  const { role } = member;

  const {
    setSentToMe = false,
  } = options;

  const {
    recipientRoles = {},
    sendCount = 0,
  } = context;

  const update = {
    ...context,
    after: member.id,
    sendCount: sendCount + 1,
    recipientRoles: {
      ...recipientRoles,
      [role]: (recipientRoles[role] ?? 0) + 1,
    },
  };

  if (setSentToMe) {
    update.isSentToMe = true;
  }

  return update;
}
