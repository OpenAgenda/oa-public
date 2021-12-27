import debug from 'debug';
import { Base64 } from 'js-base64';
import { matchPath } from 'react-router';
import qs from 'qs';

const log = debug('utils');

const contributionTypes = {
  CLOSED: 0,
  OPEN: 1,
  MEMBERS_ONLY: 2
};

function replaceWithStep(history, prefix, step) {
  const pathname = `${prefix}/${step}`;
  log('going from %s to %s', history.location.pathname, pathname);
  history.replace({
    ...history.location,
    pathname
  });
}

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

function matchStepPath(location, prefix, matchedSteps) {
  return !![].concat(matchedSteps).map(s => `${prefix}/${s}`)
    .filter(path => matchPath(location.pathname, { path }))
    .length;
}

function doRedirect(history, redirectTo) {
  const {
    search
  } = history.location;

  const { redirect } = qs.parse(search, { ignoreQueryPrefix: true });

  if (!window) {
    return;
  }

  if (redirect) {
    const redirectURL = Base64.decode(redirect);
    log('redirecting to %s', redirectURL);
    const isInAppRedirect = /\/home|\/.+\/admin\/events/.test(redirectURL);
    if (isInAppRedirect) {
      history.push(redirectURL);
    } else {
      window.location.href = redirectURL;
    }
    return;
  }

  window.location.href = redirectTo;
}

function removeEventFieldsFromSchema(schema) {
  return {
    ...schema,
    fields: schema.fields.filter(field => field.schemaType !== 'event')
  };
}

export default {
  isMemberDataComplete,
  isMemberDataRequired,
  isContributionType,
  isMemberRole,
  matchStepPath,
  doRedirect,
  removeEventFieldsFromSchema,
  replaceWithStep
};
