import _ from 'lodash';
import logs from '@openagenda/logs';
import getAgenda from '../utils/getAgenda.js';
import * as merge from '../utils/merge.js';
import eventLoadOptions from '../utils/eventLoadOptions.js';
import cleanEvent from '../utils/cleanEvent/index.js';
import convertLocationAdditionalFields from '../utils/convertLocationAdditionalFields.js';
import Stopwatch from '../utils/Stopwatch.js';
import formatLocationExtIds from '../locations/formatExtIds.js';
import formatLegacyTags from '../locations/formatLegacyTags.js';

function formatEventLocationsTagsAndExtIds(events, { detailed, formSchema }) {
  if (!detailed) {
    return events;
  }

  return events.map((event) => {
    if (!event.location) {
      return event;
    }
    event.location = formatLocationExtIds.afterRead(event.location);
    event.location = formatLegacyTags(event.location, formSchema);
    return event;
  });
}

const log = logs('core/agendas/events/list');

// this will be slower for bigger sets
// keep it fast with a last id nav on agendaEvents
export default async (core, agendaUid, query = {}, nav = {}, options = {}) => {
  const stopwatch = Stopwatch();
  const times = {};
  const {
    agendaEvents: agendaEventsSvc,
    events: eventsSvc,
    custom,
    agendas,
    users,
  } = core.services;

  const { lastId, limit } = {
    limit: 20,
    lastId: 0,
    ...nav,
  };

  eventLoadOptions.getValid(options);

  const { returnPayload, access, detailed, removed } = {
    returnPayload: false,
    access: 'public',
    detailed: false,
    removed: false,
    ...options,
  };

  const load = eventLoadOptions.get(options);

  const fetched = {};

  const agenda = await getAgenda(core.services, agendaUid, { detailed: true });

  times.agenda = stopwatch();

  const formSchema = merge.schemasWithEvent(
    agenda?.network?.formSchema ?? null,
    agenda.formSchema,
    {
      access: access !== null ? { read: access } : null,
    },
  );

  const { lastId: newLastId, items: agendaEvents } = await agendaEventsSvc(
    agendaUid,
  ).listByLastId(query, lastId, limit, {
    decorate: detailed ? ['sourceAgendas'] : [],
    removed,
  });

  times.agendaEvents = stopwatch();

  if (load.agendaEvent) {
    fetched.agendaEvents = agendaEvents;
  }

  const eventUids = agendaEvents.map((ae) => ae.eventUid);

  if (load.event) {
    log('loading %s events', eventUids.length);
    const events = await eventsSvc.list(
      {
        uid: eventUids,
      },
      { limit: eventUids.length },
      {
        detailed,
        private: null, // needed to reindex private agendas
        access: access === 'internal' ? 'internal' : 'public',
      },
    );

    times.events = stopwatch();

    fetched.events = formatEventLocationsTagsAndExtIds(
      convertLocationAdditionalFields(formSchema, events),
      { detailed, formSchema },
    );
  }

  if (load.custom && agenda.formSchemaId) {
    log('loading custom data');
    fetched.custom = (
      await custom(agenda.formSchemaId).list({
        identifier: eventUids,
      })
    ).items;

    times.custom = stopwatch();
  }

  if (load.custom && agenda.network && agenda.network.formSchemaId) {
    fetched.networkCustom = (
      await custom(agenda.network.formSchemaId).list({
        identifier: eventUids,
      })
    ).items;

    times.networkCustom = stopwatch();
  }

  if (detailed && load.event) {
    fetched.originAgendas = (
      await agendas.list(
        {
          uid: fetched.events.map((e) => e.agendaUid),
        },
        {
          private: null,
        },
      )
    ).agendas.map((a) => _.omit(a, ['id', 'indexed']));

    times.originAgendas = stopwatch();
  }

  const userUids = detailed && agendaEvents.length
    ? agendaEvents.map((ae) => ae.userUid).filter((userUid) => !!userUid)
    : [];

  if (detailed && load.member && agendaEvents.length) {
    fetched.members = await core
      .agendas(agenda)
      .members.list(
        { userUid: userUids },
        { limit },
        { detailed, access, roleAsSlug: false },
      )
      .then(({ items }) =>
        items.map((m) =>
          _.omit(m, ['deletedUser', 'createdAt', 'updatedAt', 'eventCount'])));

    times.members = stopwatch();
  }

  if (detailed && load.user && agendaEvents.length) {
    fetched.users = await users
      .find({
        query: {
          uid: {
            $in: userUids,
          },
          $limit: agendaEvents.length,
        },
        detailed: false,
      })
      .then(({ data }) =>
        data.map((d) => _.pick(d, ['uid', 'fullName', 'culture'])));

    times.users = stopwatch();
  }

  const compiledEvents = eventUids
    .map((uid, index) => {
      const event = _.find(fetched.events, { uid });
      if (load.event && !event) {
        log('warn', 'event uid %s was not found', uid);
        return null;
      }
      return {
        uid,
        ...merge.eventFromObject(
          {
            agendaEvent: fetched.agendaEvents?.[index],
            event: load.event ? event : null,
            custom: load.custom
              ? {
                agenda: (_.find(fetched.custom, { identifier: uid }) || {})
                  .custom,
                network: (
                  _.find(fetched.networkCustom, { identifier: uid }) || {}
                ).custom,
              }
              : null,
          },
          {
            includeFields: formSchema.fields.map((f) => f.field),
            originAgenda: load.event
              ? _.find(fetched.originAgendas, { uid: event.agendaUid })
              : null,
            member: load.member
              ? _.find(
                fetched.members,
                { userUid: fetched.agendaEvents[index].userUid },
                null,
              )
              : null,
            user:
              load.user && fetched.users
                ? fetched.users.find(
                  (u) => u.uid === fetched.agendaEvents[index].userUid,
                )
                : null,
            load,
          },
        ),
      };
    })
    .filter((event) => !!event);

  if (load.valid) {
    for (const event of compiledEvents) {
      event.valid = await cleanEvent.getIsValid(core, agenda, event, {
        verifyLocationExists: false,
      });
    }
    times.valid = stopwatch();
  }

  return returnPayload
    ? {
      lastId: newLastId,
      events: compiledEvents,
      success: true,
      agenda,
      formSchema,
      times,
    }
    : compiledEvents;
};
