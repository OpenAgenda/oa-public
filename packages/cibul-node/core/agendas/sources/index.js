import getAgenda from '../utils/getAgenda.js';

const list = (core, agendaUid) =>
  async (query, nav, options = {}) => {
    const { aggregators } = core.services;

    const agenda = await getAgenda(core.services, agendaUid, {
      detailed: true,
    });

    const resp = await aggregators.sources.list(agenda, query, nav, options);

    if (resp.sources.length >= 1 && resp.sources?.[0]?.agenda?.id) {
      resp.sources.forEach((source) => {
        delete source.agenda.id;
      });
    }

    return resp;
  };

const patch = (core, agendaUid) =>
  async (agendaSourceUid, data, options = {}) => {
    const { aggregators } = core.services;

    const agenda = await getAgenda(core.services, agendaUid);
    const agendaSource = await getAgenda(core.services, agendaSourceUid);
    const sourceId = await aggregators.sources.getId(agendaSource, agenda);

    return aggregators.sources.update(agenda, sourceId, data, options);
  };

const create = (core, agendaUid) =>
  async (agendaSourceUid, data, options = {}) => {
    const { aggregators } = core.services;

    const agenda = await getAgenda(core.services, agendaUid);
    const agendaSource = await getAgenda(core.services, agendaSourceUid);

    return aggregators.sources.add(agenda, agendaSource, data, options);
  };

export default (core, agendaUid) => ({
  list: list(core, agendaUid),
  patch: patch(core, agendaUid),
  create: create(core, agendaUid),
});
