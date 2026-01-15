import _ from 'lodash';
import { NotFound } from '@openagenda/verror';

import validate from '../iso/validate.js';
import * as utils from './lib/utils.js';
import validateOptions from './lib/validateOptions.js';
import postReadClean from './lib/postReadClean.js';

async function _get(client, where, options = {}) {
  const fieldList = [
    'agenda_uid',
    'event_uid',
    'user_uid',
    'source_agenda_uid',
    'state',
    'motive',
    'can_edit',
    'featured',
    'aggregated',
    'created_at',
    'updated_at',
  ];
  const { removed } = options;
  if (removed || removed === null) {
    fieldList.push('removed');
  }

  const k = client('agenda_event').first(fieldList).where(where);
  if (removed === true) k.where('removed', 1);
  if (removed === false) k.where('removed', 0);

  const entry = await k;

  if (!entry) return null;

  return postReadClean(validate(utils.fromEntry(entry)), options);
}

export default async function get(service, agendaUid, eventUid, options = {}) {
  const { client, config } = service;

  if (!agendaUid) {
    throw new NotFound('Agenda uid is missing');
  }
  if (!eventUid) {
    throw new NotFound('Event uid is missing');
  }

  const { decorate, throwOnNotFound, removed } = validateOptions(options);

  const ae = await _get(
    client,
    {
      agenda_uid: agendaUid,
      event_uid: eventUid,
    },
    { removed },
  );

  if (!ae && !throwOnNotFound) {
    return null;
  }

  if (!ae) {
    throw new NotFound({
      info: {
        objectName: 'agendaEvent',
        identifier: `${agendaUid}.${eventUid}`,
      },
    });
  }

  if (decorate.includes('member') && config.interfaces.getMembers) {
    ae.member = ae.userUid
      ? _.get(await config.interfaces.getMembers([ae]), '0')
      : null;
  }

  if (decorate.includes('user') && config.interfaces.getUsers) {
    ae.user = ae.userUid ? (await config.interfaces.getUsers(ae))?.[0] : null;
  }

  if (
    decorate.includes('sourceAgendas')
    && config.interfaces.getSourceAgendas
  ) {
    ae.sourceAgendas = await config.interfaces.getSourceAgendas(
      (ae.sourcePaths || []).map((p) => p[p.length - 1]),
    );
  }

  return ae;
}
