'use strict';

const log = require('@openagenda/logs')('services/agendaLocations/tasks/detectDuplicatesCandidates');

module.exports = async (services, option) => {
  const {
    agendas: agendasSVC,
    agendaLocations,
  } = services;
  const sets = await agendaLocations.sets.list();
  for (const set of sets) {
    log(`detection started in locationSet ${set.uid}`);
    try {
      await agendaLocations.sets(set.uid).locations.duplicates.detectAll(option);
    } catch (e) {
      log(e);
    }
    log.info(`detection finished in locationSet ${set.uid}`);
  }

  let offset = 0;
  while (offset !== null) {
    const { agendas, lastId } = await agendasSVC.list(offset, 20, {
      onlyIncludeFields: ['uid', 'locationSetUid'],
      offsetAsLastId: true,
    });
    if (!agendas || agendas.length === 0) {
      offset = null;
      continue;
    }
    offset = lastId;
    for (const agenda of agendas.filter(a => a.locationSetUid === null)) {
      log(`detection started in agenda ${agenda.uid}`);
      try {
        await agendaLocations(agenda.uid).duplicates.detectAll(option);
      } catch (e) {
        log(e);
      }
      log.info(`detection finished in agenda ${agenda.uid}`);
    }
  }
  log.info('global duplicates detection finished');
};
