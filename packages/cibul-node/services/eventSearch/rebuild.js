import logs from '@openagenda/logs';

const log = logs('services/eventSearch/rebuild');

export default async (services, rebuildQueue) => {
  const { agendas: agendasSvc } = services;

  let lastId = 9999999999999;
  let count = 0;

  do {
    const { agendas, lastId: newLastId } = await agendasSvc.list(
      {
        order: 'id.desc',
      },
      lastId,
      100,
      {
        offsetAsLastId: true,
        internal: null,
      },
    );

    for (const agenda of agendas) {
      log('%s: queuing rebuild', agenda.slug);
      await rebuildQueue.add('agenda', agenda);
      count += 1;
    }

    lastId = newLastId;
  } while (lastId > -1);

  log('info', 'completed rebuild queueing for %s agendas', count);

  await rebuildQueue.add('transverse');
};
