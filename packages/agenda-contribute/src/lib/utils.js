import debug from 'debug';
import { Base64 } from 'js-base64';
import { matchPath } from 'react-router';
import { produce } from 'immer';
import qs from 'qs';

const log = debug('utils');

const contributionTypes = {
  CLOSED: 0,
  OPEN: 1,
  MEMBERS_ONLY: 2
};

const listLinkedToFields = (fields, schema) => {
  const fieldsWiths = schema.fields
    .filter(field => !!field.enableWith || !!field.optionalWith)
    .map(field => {
      const withType = field.enableWith ? 'enableWith' : 'optionalWith';

      return {
        field,
        withName: typeof field[withType] === 'string' ? field[withType] : field[withType].field
      };
    });

  return fields.filter(field => fieldsWiths.find(f => f.withName === field.field));
};

const distributeBySchemaType = (fieldNames, schema) => fieldNames.reduce(
  (distributed, fieldName) => {
    const field = schema.fields.find(f => f.field === fieldName);

    if (!field) {
      distributed.otherFieldNames.push(fieldName);
    } else if (field.schemaType === 'event') {
      distributed.standardFields.push(field);
    } else {
      distributed.extendedFields.push(field);
    }

    return distributed;
  }, {
    standardFields: [],
    extendedFields: [],
    otherFieldNames: []
  }
);

function filterState(agendaContext, event) {
  const canChangeState = agendaContext?.me?.authorizations?.canChangeState;

  if (event?.state === undefined) {
    return event;
  }

  if (canChangeState) {
    return event;
  }

  delete event.state;

  return event;
}

function filterEventData({
  event,
  canEditEvent,
  canChangeState,
  schema,
  displayEventFields
}) {
  const {
    standardFields: usedStandardFields,
    otherFieldNames: usedOtherFieldNames
  } = distributeBySchemaType(Object.keys(event), schema);

  const {
    extendedFields
  } = distributeBySchemaType(schema.fields.map(f => f.field), schema);

  // which standard field values are linked to extended schema
  const standardFieldsLinkedTo = listLinkedToFields(usedStandardFields, {
    fields: extendedFields
  });

  return produce(event, draft => {
    if (!canChangeState) {
      delete draft.state;
    }

    if (!canEditEvent || !displayEventFields) {
      usedStandardFields
        .filter(field => !standardFieldsLinkedTo.length || !standardFieldsLinkedTo.find(f => f.field === field.field))
        .forEach(field => {
          delete draft[field.field];
        });
      usedOtherFieldNames.forEach(fieldName => {
        delete draft[fieldName];
      });
    }
  });
}

function hasAdditionalFields(schema) {
  return (
    schema?.fields ?? []
  ).filter(
    field => ['network', 'agenda'].includes(field.schemaType)
  ).length;
}

function hasAdditionalFieldsWithDependencies(schema) {
  if (!hasAdditionalFields(schema)) {
    return false;
  }

  const withs = schema.fields
    .filter(field => ['network', 'agenda'].includes(field.schemaType))
    .filter(field => field.enableWith || field.optionalWith);

  return !!withs.length;
}

function replaceWithStep(history, location, prefix, step) {
  const pathname = `${prefix}/${step}`;
  log('going from %s to %s', location.pathname, pathname);
  history.replace({
    ...location,
    pathname
  });
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

function doRedirect(history, location, redirectTo, options = {}) {
  const {
    search
  } = location;

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

function schemaWithoutEventFields(schema) {
  const {
    extendedFields,
    standardFields
  } = distributeBySchemaType(schema.fields.map(f => f.field), schema);

  // standard fields that are linked to from extended schema fields
  const standardFieldsLinkedToNames = listLinkedToFields(standardFields, {
    fields: extendedFields
  }).map(f => f.field);

  return {
    ...schema,
    fields: schema.fields
      .map(field => {
        if (field.schemaType !== 'event') {
          return field;
        }

        if (standardFieldsLinkedToNames.includes(field.field)) {
          return {
            ...field,
            enable: false
          };
        }

        return false;
      })
      .filter(f => !!f)
  };
}

function shouldTriggerImmediateShare({ schema, agendaContext }) {
  const role = agendaContext.me?.member?.role;

  if (!hasAdditionalFields(schema) && (role === 'contributor')) {
    log('should trigger immediate share');
    return true;
  }

  log('should not trigger immediate share');
  return false;
}

function shouldShowFullEventFormLink({ schema, eventContext, requestedDisplayEventFields }) {
  const canEditEvent = eventContext.me?.authorizations?.canEditEvent;

  if (!canEditEvent) {
    log('cannot edit event, show full event link not displayed');
    return false;
  }

  if (requestedDisplayEventFields) {
    log('requested to display event fields, show event fields is no longer needed');
    return false;
  }

  if (hasAdditionalFieldsWithDependencies(schema)) {
    log('has additional fields with dependencies, event fields should be shown. link not needed');
    return false;
  }

  return true;
}

function shouldDisplayEventFields({ schema, eventContext, requestedDisplayEventFields }) {
  const canEditEvent = eventContext.me?.authorizations?.canEditEvent;

  if (shouldShowFullEventFormLink({ schema, eventContext, requestedDisplayEventFields })) {
    return false;
  }
  if (hasAdditionalFieldsWithDependencies(schema) && canEditEvent) {
    return true;
  }
  return !!requestedDisplayEventFields;
}

export default {
  isMemberDataRequired,
  isContributionType,
  isMemberRole,
  matchStepPath,
  doRedirect,
  schemaWithoutEventFields,
  replaceWithStep,
  hasAdditionalFields,
  shouldTriggerImmediateShare,
  shouldShowFullEventFormLink,
  shouldDisplayEventFields,
  filterState,
  filterEventData
};
