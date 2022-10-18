'use strict';

module.exports = (isAdmin, { member, addMethod }) => {
  if (addMethod === 'aggregation' && !member) {
    return null;
  }

  if (addMethod === 'aggregation' && member?.organization === null) {
    return {
      organization: null,
    };
  }

  if (addMethod === 'share' && !member) {
    return null;
  }

  if (isAdmin) {
    return member;
  }

  if ([undefined, null].includes(member?.organization)) {
    return {
      organization: null,
    };
  }

  return { organization: member.organization };
};
