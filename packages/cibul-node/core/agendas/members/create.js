'use strict';

const _ = require('lodash');
const { Forbidden, BadRequest, GeneralError } = require('@openagenda/verror');
const FormSchema = require('@openagenda/form-schemas/iso/FormSchema');
const dispatchDataPerSchemas = require('@openagenda/form-schemas/iso/dispatchDataPerSchemas');
const format = require('./lib/format');
const canCreate = require('./lib/canCreate');

module.exports = async (core, agendaOrUid, userUid, role, data, options = {}) => {
  const { services } = core;
  const {
    members,
    users,
    custom,
  } = services;

  const {
    userUid: actingUserUid,
    access = null,
  } = options;

  if (!actingUserUid && access !== 'internal') {
    throw new BadRequest('userUid option is required');
  }

  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  const actingMember = actingUserUid ? await members.get({
    agendaUid,
    userUid: actingUserUid,
  }) : null;

  const agenda = agendaOrUid?.constructor.name === 'Object'
    ? agendaOrUid
    : await core.agendas(agendaOrUid).get({ detailed: true, includeMemberSchema: true, includeSplitedMemberSchema: true, access, actingMember });
  const { memberSchema: schemas } = agenda;

  if (!canCreate(services, {
    agenda,
    acting: actingMember,
    actingUserUid,
    userUid,
    role,
    access,
  })) {
    throw new Forbidden('Not authorized to add a member');
  }

  const memberData = {
    ...data || {},
  };

  if (options.useAccountEmail) {
    memberData.email = await users.get(userUid).then(u => u.email);
  }

  let cleanMemberData = null;
  try {
    const validate = new FormSchema(schemas.merged).getValidate();
    cleanMemberData = validate(memberData);
  } catch (error) {
    throw new BadRequest({
      info: { error },
    }, 'data is invalid');
  }

  try {
    if (agenda.memberSchemaId) {
      const dispatchedData = dispatchDataPerSchemas(memberData, [schemas.schema, schemas.agendaSchema]);
      await custom(agenda.memberSchemaId).set(userUid, dispatchedData[1]);
    }
    await members.create({
      agendaUid,
      userUid,
      role: members.utils.getRoleCode(role ?? 'contributor'),
      custom: format.custom(memberData),
    }, { requireCustom: false });
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
