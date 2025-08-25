import logs from '@openagenda/logs';

const log = logs('services/agendaLocations/detectDuplicateCandidates');

export default async (services, options) => {
  const { agendas: agendasSVC, agendaLocations } = services;

  const sets = await agendaLocations.sets.list();
  for (const set of sets.filter(
    (s) => !options.ignoredUids.setUids.includes(s.uid),
  )) {
    log('info', `detection started in locationSet ${set.uid}`);
    let count = 0;
    try {
      count = await agendaLocations
        .sets(set.uid)
        .locations.duplicates.detectAll(options);
    } catch (e) {
      log(e);
    }
    log('info', 'processed', {
      locationSetUid: set.uid,
      detectedDuplicates: count,
    });
  }

  let offset = 9999999999;
  while (offset !== null) {
    const { agendas, lastId } = await agendasSVC.list(
      { order: 'id.desc' },
      offset,
      20,
      {
        onlyIncludeFields: ['uid', 'locationSetUid'],
        offsetAsLastId: true,
      },
    );

    if (!agendas || agendas.length === 0) {
      offset = null;
      continue;
    }
    offset = lastId;
    for (const agenda of agendas.filter(
      (a) =>
        a.locationSetUid === null
        && !options.ignoredUids.agendaUids.includes(a.uid),
    )) {
      log('info', `detection started in agenda ${agenda.uid}`);
      let count = 0;
      try {
        count = await agendaLocations(agenda.uid).duplicates.detectAll({
          sleep: options.sleep,
        });
      } catch (e) {
        log(e);
      }
      log('info', 'processed', {
        locationAgendaUid: agenda.uid,
        detectedDuplicates: count,
      });
    }
  }
  log.info('global duplicates detection finished');
};
