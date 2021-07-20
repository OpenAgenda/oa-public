'use strict';

module.exports = async services => {
  const {
    agendas: agendasSVC,
    agendaLocations,
  } = services;
  const sets = await agendaLocations.sets.list();
  for (const set of sets) {
    await agendaLocations.sets(set.uid).locations.duplicates.clearCandidates();
  }
  let Offset = 0;
  while (Offset !== null) {
    const { agendas, lastId } = await agendasSVC.list(Offset, 20, {
      onlyIncludeFields: ['uid', 'locationSetUid'],
      offsetAsLastId: true,
    });
    if (!agendas || agendas.length === 0) {
      Offset = null;
      continue;
    }
    Offset = lastId;
    for (const agenda of agendas.filter(a => a.locationSetUid === null)) {
      await agendaLocations(agenda.uid).duplicates.clearCandidates();
    }
  }
};
