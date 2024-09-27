import { promisify } from 'node:util';
import _ from 'lodash';
import agendasSvc from '@openagenda/agendas';

const removeAgenda = promisify(agendasSvc.remove);

export default async (agendaOrUid) => {
  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  const { success } = await removeAgenda({ uid: agendaUid });

  if (!success) throw new Error('could not remove agenda');
};
