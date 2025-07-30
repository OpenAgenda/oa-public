import _ from 'lodash';
import logs from '@openagenda/logs';
import list from './list.js';
import search from './search.js';
import update from './update.js';
import remove from './remove.js';

const { patch } = update;

const log = logs('core/agendas/events/batch');

const getTaskName = (operation) => `batched${_.capitalize(operation)}`;

async function agendaBatchSearch(core, { agendaUid, operation, query, args }) {
  const { tasks } = core;
  const options = args[args.length - 1];
  const stream = await search(core, agendaUid, query, null, {
    ...options,
    stream: true,
  });
  for await (const event of stream) {
    await tasks.enqueue(getTaskName(operation), [
      agendaUid,
      event.uid,
      ...args,
    ]);
  }
  log('done looping');
}

async function agendaBatchList(core, { agendaUid, operation, query, args }) {
  let lastId = 0;

  const { tasks } = core;

  const options = args[args.length - 1];

  while (lastId !== -1) {
    const { events, lastId: nextLastId } = await list(
      core,
      agendaUid,
      query,
      { lastId },
      {
        ...options,
        load: {
          agendaEvent: true,
        },
        returnPayload: true,
      },
    );

    for (const event of events) {
      await tasks.enqueue(getTaskName(operation), [
        agendaUid,
        event.uid,
        ...args,
      ]);
    }

    lastId = events.length ? nextLastId : -1;
  }
}

export default (core) => {
  core.tasks.register({
    agendaBatchList: agendaBatchList.bind(null, core),
    agendaBatchSearch: agendaBatchSearch.bind(null, core),
    batchedPatch: ([agendaUid, eventUid, data, options = {}]) =>
      patch(core, agendaUid, eventUid, data, { ...options, batched: true }),
    batchedUpdate: ([agendaUid, eventUid, data, options = {}]) =>
      update(core, agendaUid, eventUid, data, { ...options, batched: true }),
    batchedRemove: ([agendaUid, eventUid, options = {}]) =>
      remove(core.services, agendaUid, eventUid, { ...options, batched: true }),
  });

  return (agendaUid, operation, query, ...args) => {
    const options = args[args.length - 1];

    const { search: useSearchIndex } = {
      search: false,
      ...options,
    };

    return core.tasks.enqueue(
      useSearchIndex ? 'agendaBatchSearch' : 'agendaBatchList',
      {
        agendaUid,
        operation,
        query,
        args,
      },
    );
  };
};
