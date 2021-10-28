const contributionTypes = {
  CLOSED: 0,
  OPEN: 1,
  MEMBERS_ONLY: 2
};

function isMemberDataComplete(data) {
  const fields = Object.keys(data ?? {});
  return fields.filter(field => !!data[field]).length === fields.length;
}

function isMemberDataRequired(agenda) {
  return agenda?.settings?.contribution?.useFields ?? false;
}

function isContributionType(agenda, code) {
  return agenda.settings.contribution.type === contributionTypes[code];
}

function isMemberRole(member, role) {
  return [].concat(role).includes(member?.role);
}

export default {
  isMemberDataComplete,
  isMemberDataRequired,
  isContributionType,
  isMemberRole
};
