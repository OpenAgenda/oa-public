import logs from '@openagenda/logs';
import formSchemas from '@openagenda/form-schemas';
import eventFormSchema from '@openagenda/event-form/schema';
import tagSetToFormSchema from '@openagenda/legacy/tagSetToFormSchema/index.js';
import agendaLocations from '@openagenda/agenda-locations';
import getAddMethod from './getAddMethod.js';
import eventLoadOptions from './eventLoadOptions.js';

const log = logs('core/agendas/utils/merge');

const {
  utils: { merge },
} = formSchemas;
const {
  utils: { getSchema: getLocationSchema },
} = agendaLocations;

function mergeEvent(
  event,
  agendaEvent,
  networkCustom,
  agendaCustom,
  options = {},
) {
  const { originAgenda, includeFields, member, user } = {
    includeFields: null,
    originAgenda: null,
    member: null,
    user: null,
    ...options,
  };

  const load = eventLoadOptions.get(options);

  const logBundle = {
    eventUid: event?.uid ?? agendaEvent?.eventUid,
    agendaUid: agendaEvent?.agendaUid,
  };

  const compiled = {};

  if (event && load.event) {
    Object.keys(event).forEach((eventField) => {
      if (includeFields && !includeFields.includes(eventField)) {
        return;
      }
      compiled[eventField] = event[eventField];
    });
  }

  if (event === null && load.event) {
    return null;
  }

  if (event && load.event && agendaEvent) {
    compiled.addMethod = getAddMethod(event, agendaEvent);
  }

  let updatedAtOrigin = 'event';

  if (
    event?.location?.updatedAt
    && event.updatedAt < event.location?.updatedAt
  ) {
    compiled.updatedAt = event.location.updatedAt;
    updatedAtOrigin = 'location';
  }

  [networkCustom, agendaCustom]
    .filter((d) => !!d)
    .forEach((data) => {
      Object.keys(data).forEach((field) => {
        if (includeFields && !includeFields.includes(field)) {
          return;
        }
        compiled[field] = data[field];
      });
    });

  if (agendaEvent && load.agendaEvent) {
    [
      'state',
      'featured',
      'sourcePaths',
      'aggregated',
      'canEdit',
      'motive',
      'removed',
    ].forEach((aeField) => {
      compiled[aeField] = agendaEvent[aeField];
    });

    if (agendaEvent.updatedAt > compiled.updatedAt) {
      compiled.updatedAt = agendaEvent.updatedAt;
      updatedAtOrigin = 'agendaEvent';
    }
  }

  log('using %s updatedAt', updatedAtOrigin, logBundle);

  if (agendaEvent && agendaEvent.sourceAgendas) {
    compiled.sourceAgendas = agendaEvent.sourceAgendas;
  }

  if (originAgenda) {
    compiled.originAgenda = originAgenda;
  }

  if (member) {
    compiled.member = member;
  }

  if (load.user && agendaEvent) {
    compiled.user = agendaEvent.user;
  }

  if (!compiled.user && user) {
    compiled.user = user;
  }

  return compiled;
}

function appendLocationSchema(schema, options = {}) {
  const locationField = schema.fields.find((f) => f.field === 'location');

  const locationSchema = getLocationSchema({
    includeLegacyAdminLevels: options.includeLocationLegacyAdminLevels,
  });

  if (locationField?.legacy?.tagSet) {
    locationField.schema = merge(
      locationSchema,
      Object.assign(tagSetToFormSchema(locationField.legacy?.tagSet), {
        id: 'location',
      }),
    );
  } else if (locationField) {
    locationField.schema = locationSchema;
  }

  return schema;
}

function schemas(...args) {
  const mergeOptions = args && args.length ? args[args.length - 1] : {};
  const { includeLocationLegacyAdminLevels } = mergeOptions;
  return appendLocationSchema(merge(...args), {
    includeLocationLegacyAdminLevels,
  });
}

function schemasWithEvent(...args) {
  const schemaExtensions = [...args];
  const {
    access,
    includeNonDataFields,
    memberSchema = null,
    includeAgendaEvent = false,
    includeLocationLegacyAdminLevels,
  } = schemaExtensions.pop();

  if (memberSchema) {
    schemaExtensions.push({
      fields: [
        {
          field: 'member',
          read: ['administrator', 'moderator', 'internal'],
          fieldType: 'abstract',
          schema: memberSchema,
        },
      ],
    });
  }

  if (includeAgendaEvent) {
    schemaExtensions.push({
      fields: [
        {
          field: 'state',
          fieldType: 'abstract',
        },
        {
          field: 'featured',
          fieldType: 'abstract',
        },
        {
          field: 'motive',
          fieldType: 'abstract',
        },
      ],
    });
  }

  return appendLocationSchema(
    eventFormSchema({
      schemaExtensions,
      access: access?.read === 'internal' ? null : access,
      excludeNonDataFields: !includeNonDataFields,
    }),
    { includeLocationLegacyAdminLevels },
  );
}

function eventFromObject({ event, agendaEvent, custom }, options = {}) {
  return mergeEvent(
    event,
    agendaEvent,
    custom ? custom.network : null,
    custom ? custom.agenda : null,
    options,
  );
}

export { mergeEvent as event, schemas, schemasWithEvent, eventFromObject };
