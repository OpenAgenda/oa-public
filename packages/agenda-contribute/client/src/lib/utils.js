import { matchPath } from 'react-router';

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
  return [].concat(code).map(c => contributionTypes[c]).includes(agenda.settings.contribution.type);
}

function isMemberRole(member, role) {
  return [].concat(role).includes(member?.role);
}

function matchStepPath(history, prefix, matchedSteps) {
  return !![].concat(matchedSteps).map(s => `${prefix}/${s}`)
    .filter(path => matchPath(history.location.pathname, { path }))
    .length;
}

export default {
  isMemberDataComplete,
  isMemberDataRequired,
  isContributionType,
  isMemberRole,
  matchStepPath
};
