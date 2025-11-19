import logs from '@openagenda/logs';
import { NotFound, Forbidden } from '@openagenda/verror';
import preCleanSearchQuery from '../utils/preCleanSearchQuery.js';
import formatExtIds from '../locations/formatExtIds.js';
import * as convertLongDescription from './lib/convertLongDescription.js';
import convertToDateHoursMinutesTimings from './lib/convertToDateHoursMinutesFormat.js';
import loadSearchAccess from './lib/loadSearchAccess.js';
import filterEventByRole from './lib/filterEventByRole.js';
import filterAuthorizedSearchFields from './lib/filterAuthorizedSearchFields.js';

const log = logs('core/agendas/events/search');

async function doSearch(core, agendaUid, query, nav, options = {}) {
  const {
    returnAgenda = false,
    stream = false,
    useAfterKey = false,
    longDescriptionFormat = null,
    useDateHoursMinutesFormat = false,
    includeEmbedScripts = true,
    cspNonce = null,
    includeLocationLegacyAdminLevels = true,
    ...searchOptions
  } = options;

  const agenda = await core.agendas(agendaUid).get({
    detailed: true,
    includeEvent: true,
    includeMember: true,
    includeMemberSchema: true,
    includeDateRange: true,
    includeAgendaEvent: true,
    includeOriginAgenda: true,
    includeSourceAgendas: true,
    access: 'internal',
    private: null,
    useCache: true,
    includeLocationLegacyAdminLevels,
  });

  if (!agenda) {
    throw new NotFound(
      {
        info: { uid: agendaUid },
      },
      'agenda not found',
    );
  }

  const access = await loadSearchAccess(core, agendaUid, options);

  const authorizedQuery = filterAuthorizedSearchFields(
    core,
    preCleanSearchQuery(query),
    access,
    options.userUid,
  );

  if (authorizedQuery.locationExtId) {
    authorizedQuery.locationExtId = formatExtIds.searchQuery(authorizedQuery);
  }

  const parsers = [
    (e) => ({ ...e, location: formatExtIds.afterRead(e.location) }),
  ];

  log(
    'search with access "%s" on %s events with query %s, nav %s and options %s',
    access,
    agendaUid,
    authorizedQuery,
    nav,
    options,
  );

  if (
    longDescriptionFormat
    && convertLongDescription.conversions.includes(longDescriptionFormat)
  ) {
    parsers.push(
      convertLongDescription.load({
        services: core.services,
        conversion: longDescriptionFormat,
        includeEmbedScripts,
        cspNonce,
      }),
    );
  }

  if (useDateHoursMinutesFormat) {
    parsers.push(convertToDateHoursMinutesTimings(core.services.events));
  }

  const { search: agendaIndexSearch } = core.services.eventSearch.agendas(agenda);

  Object.assign(searchOptions, {
    parser: (e) => parsers.reduce((event, parser) => parser(event), e),
    useAdminLevels: includeLocationLegacyAdminLevels === false ? true : null,
  });

  const result = stream
    ? agendaIndexSearch.stream(authorizedQuery, {
      ...searchOptions,
      access,
    })
    : await agendaIndexSearch(authorizedQuery, nav, {
      ...searchOptions,
      useAfterKey,
      access,
    });

  return returnAgenda ? { agenda, result } : result;
}

export async function get(core, agendaUid, identifier, options = {}) {
  const { userUid } = options;

  const { agenda, result } = await doSearch(
    core,
    agendaUid,
    {
      ...identifier,
      state: null,
    },
    { size: 1 },
    {
      ...options,
      access: 'internal',
      returnAgenda: true,
    },
  );

  if (!agenda) {
    throw new NotFound(
      {
        info: { uid: agendaUid },
      },
      'agenda not found',
    );
  }

  const event = result?.events.pop();

  if (!event) {
    throw new NotFound(
      {
        info: identifier,
      },
      'event not found',
    );
  }

  const isPublished = event.state === 2;

  if (!userUid && (event.private || agenda.private || !isPublished)) {
    throw new Forbidden('not authorized to read event');
  }

  const context = userUid
    && await core
      .users(options.userUid)
      .agendas(agenda.uid)
      .events(event)
      .getContext({
        userUid,
        includes: ['me.authorizations', 'me.member'],
      });

  if (context?.me && !context.me.authorizations.canRead) {
    throw new Forbidden('not authorized to read event');
  } else if (!context?.me && !isPublished) {
    throw new Forbidden('not authorized to read event');
  }

  const filtered = await filterEventByRole(agenda, event, context);

  return { ...filtered, valid: event?.valid };
}

export default async function search(
  core,
  agendaUid,
  query,
  nav,
  options = {},
) {
  return doSearch(core, agendaUid, query, nav, options);
}

export async function rebuild(core, agendaUid) {
  const agenda = await core.agendas(agendaUid).get({
    detailed: true,
    access: 'internal',
    private: null,
  });

  if (!agenda) {
    throw new NotFound(
      {
        info: { uid: agendaUid },
      },
      'agenda not found',
    );
  }

  return core.services.eventSearch.agendas(agenda).rebuild();
}

export async function resyncEvent(core, agendaUid, eventUid, options = {}) {
  const { throwOnError } = {
    throwOnError: true,
    ...options,
  };

  try {
    const eventPayload = await core.agendas(agendaUid).events.get(eventUid, {
      access: 'internal',
      detailed: true,
      returnPayload: true,
    });

    if (!eventPayload.event && throwOnError) {
      throw new NotFound(
        {
          info: { uid: eventUid },
        },
        'event not found',
      );
    }

    if (!eventPayload) {
      log(
        'warn',
        'could not resync event %s of agenda %s as it was not found',
        eventUid,
        agendaUid,
      );
      return;
    }

    log('resyncing event %s on index of agenda %s', eventUid, agendaUid);

    const result = await core.services.eventSearch.update(eventPayload, {
      updateOtherIndices: false,
    });

    return result;
  } catch (err) {
    if (throwOnError) throw err;
    log('error', err);
  }
}

async function batchResyncEvents(core, { agendaUid, query, options = {} }) {
  const stream = await search(core, agendaUid, query, null, {
    ...options,
    stream: true,
  });

  for await (const event of stream) {
    await resyncEvent(core, agendaUid, event.uid, { throwOnError: false });
  }
}

export function resyncEvents(core) {
  core.tasks.register({
    batchResyncEvents: batchResyncEvents.bind(null, core),
  });

  return (agendaUid, query, options = {}) =>
    core.tasks.enqueue('batchResyncEvents', { agendaUid, query, options });
}
