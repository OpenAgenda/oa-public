import logs from '@openagenda/logs';
import { loadAndSet } from './set.js';

const log = logs('setAll');

export default async ({ knex: _knex, queue }, agendaUid) => {
  queue('loop', agendaUid);
};

async function loop({ knex, queue }, agendaUid) {
  const agenda = await knex('review')
    .first(['id', 'uid'])
    .where('uid', agendaUid);

  if (!agenda) throw new Error('agenda not found');

  return new Promise((rs, rj) => {
    const stream = knex('agenda_event')
      .select(['event_uid as eventUid'])
      .where('agenda_uid', agendaUid)
      .stream();

    stream.on('data', ({ eventUid }) => {
      queue('loadAndSet', agenda.id, eventUid);
    });

    stream.on('error', rj);

    stream.on('end', () => rs());
  });
}

export async function task({ knex, queue }) {
  queue.register({
    loop: loop.bind(null, { knex, queue }),
    loadAndSet: loadAndSet.bind(null, { knex }),
  });

  queue.on('error', (fn, args, error) => {
    log('error', fn, args, error);
  });

  queue.run();
}
