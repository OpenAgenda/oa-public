import _ from 'lodash';
import { Forbidden, BadRequest } from '@openagenda/verror';
import canCreate from './lib/canCreate.js';

export default async (core, agendaOrUid, { role, emails }, options = {}) => {
  const { services } = core;
  const { members } = services;

  const { userUid: actingUserUid, access = null, context } = options;

  if (!actingUserUid && access !== 'internal') {
    throw new BadRequest('userUid option is required');
  }

  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  const actingMember = actingUserUid
    ? await members.get({
      agendaUid,
      userUid: actingUserUid,
    })
    : null;

  const agenda = agendaOrUid?.constructor.name === 'Object'
    ? agendaOrUid
    : await core.agendas(agendaUid).get({
      detailed: true,
      includeMemberSchema: true,
      includeSplitMemberSchema: true,
      access,
      actingMember,
    });

  if (
    !canCreate(services, {
      agenda,
      acting: actingMember,
      actingUserUid,
      userUid: null,
      role,
      access,
    })
  ) {
    throw new Forbidden('Not authorized to add a member');
  }

  return members.set.byEmail.bulk(
    {
      agendaUid,
      role,
    },
    emails,
    {
      requireCustom: false,
      context,
    },
  );
};
