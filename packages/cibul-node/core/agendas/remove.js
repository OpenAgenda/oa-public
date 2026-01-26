import _ from 'lodash';

export default async (core, agendaOrUid) => {
  const { agendas } = core.services;

  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  const { success } = await agendas.remove({ uid: agendaUid });

  if (!success) throw new Error('could not remove agenda');

  return { success };
};
