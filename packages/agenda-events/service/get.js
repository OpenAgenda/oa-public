import _ from 'lodash';
import { NotFound } from '@openagenda/verror';
import NotFoundError from '@openagenda/utils/errors/NotFoundError.js';

import validate from '../iso/validate.js';
import * as utils from './lib/utils.js';
import validateOptions from './lib/validateOptions.js';

async function _get(client, where) {
  const entry = await client('agenda_event')
    .first([
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
      'legacy_id',
    ])
    .where(where);

  if (!entry) return null;

  return validate(utils.fromEntry(entry));
}

function byLegacyId(service, agendaId, eventId) {
  const { client } = service;

  return _get(client, {
    legacy_id: `${agendaId}.${eventId}`,
  });
}

export default Object.assign(
  async function get(service, agendaUid, eventUid, options = {}) {
    const { client, config } = service;

    if (!agendaUid) {
      throw new NotFound('Agenda uid is missing');
    }
    if (!eventUid) {
      throw new NotFound('Event uid is missing');
    }

    const { decorate, throwOnNotFound } = validateOptions(options);

    const ae = await _get(client, {
      agenda_uid: agendaUid,
      event_uid: eventUid,
    });

    if (!ae && !throwOnNotFound) {
      return null;
    }

    if (!ae) {
      throw new NotFoundError('agendaEvent', [agendaUid, eventUid].join('.'));
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
  },
  {
    byLegacyId,
  },
);
