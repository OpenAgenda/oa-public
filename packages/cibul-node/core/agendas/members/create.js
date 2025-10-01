import _ from 'lodash';
import { Forbidden, BadRequest, GeneralError } from '@openagenda/verror';
import FormSchema from '@openagenda/form-schemas/iso/FormSchema.js';
import dispatchDataPerSchemas from '@openagenda/form-schemas/iso/dispatchDataPerSchemas.js';
import getMemberSchema from '../utils/getMemberSchema.js';
import * as format from './lib/format.js';
import canCreate from './lib/canCreate.js';

export default async (core, agendaOrUid, userUid, role, data, options = {}) => {
  const { services } = core;
  const { members, users, custom } = services;

  const { userUid: actingUserUid, access = null } = options;

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

  const schemas = await getMemberSchema(services, agenda, {
    access,
    actingMember,
  });

  if (
    !canCreate(services, {
      agenda,
      acting: actingMember,
      actingUserUid,
      userUid,
      role,
      access,
    })
  ) {
    throw new Forbidden('Not authorized to add a member');
  }

  const memberData = {
    ...data || {},
  };

  if (options.useAccountEmail) {
    memberData.email = await users.get(userUid).then((u) => u.email);
  }

  let cleanMemberData = null;
  console.log('this', data, agenda.settings.contribution);
  if (data || agenda.settings.contribution.useFields) {
    try {
      const validate = new FormSchema(schemas.merged).getValidate();
      cleanMemberData = validate(memberData);
    } catch (error) {
      throw new BadRequest(
        {
          info: { error },
        },
        'data is invalid',
      );
    }
  }

  try {
    if (agenda.memberSchemaId) {
      const dispatchedData = dispatchDataPerSchemas(memberData, [
        schemas.schema,
        schemas.agendaSchema,
      ]);
      await custom(agenda.memberSchemaId).set(userUid, dispatchedData[1]);
    }
    await members.create(
      {
        agendaUid,
        userUid,
        role: members.utils.getRoleCode(role ?? 'contributor'),
        custom: format.custom(memberData, {}),
      },
      { requireCustom: false },
    );
  } catch (error) {
    throw new GeneralError(error, 'something went wrong');
  }

  return {
    ...cleanMemberData,
    deletedUser: false,
    userUid,
    role,
  };
};
