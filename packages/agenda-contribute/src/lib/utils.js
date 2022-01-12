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

function hasAdditionalFields(schema) {
  return (
    schema?.fields ?? []
  ).filter(
    field => ['network', 'agenda'].includes(field.schemaType)
  ).length;
}

function hasAdditionalFieldsWithoutDependencies(schema) {
  if (!hasAdditionalFields(schema)) {
    return false;
  }

  const withs = schema.fields
    .filter(field => ['network', 'agenda'].includes(field.schemaType))
    .filter(field => field.enableWith || field.optionalWith);

  return !withs.length;
}

function replaceWithStep(history, location, prefix, step) {
  const pathname = `${prefix}/${step}`;
  log('going from %s to %s', location.pathname, pathname);
  history.replace({
    ...location,
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

const evaluateAndRedirect = (history, redirectURL) => {
  if (/\/home|\/.+\/admin\/events/.test(redirectURL)) {
    history.push(redirectURL);
  } else {
    if (!window) {
      return;
    }
    window.location.href = redirectURL;
  }
};

function doRedirect(history, redirectTo, options = {}) {
  const {
    search
  } = history.location;

  const {
    ignoreURLRedirect = false
  } = options;

  const { redirect } = qs.parse(search, { ignoreQueryPrefix: true });

  if (redirect && !ignoreURLRedirect) {
    const redirectURL = Base64.decode(redirect);
    log('redirecting to %s', redirectURL);
    return evaluateAndRedirect(history, redirectURL);
  }

  evaluateAndRedirect(history, redirectTo);
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
  replaceWithStep,
  hasAdditionalFields,
  hasAdditionalFieldsWithoutDependencies
};
