'use strict';

const _ = require('lodash');
const { Forbidden, BadRequest, GeneralError } = require('@openagenda/verror');
const FormSchema = require('@openagenda/form-schemas/iso/FormSchema');
const dispatchDataPerSchemas = require('@openagenda/form-schemas/iso/dispatchDataPerSchemas');
const getMemberSchema = require('../utils/getMemberSchema');
const getAgenda = require('../utils/getAgenda');
const format = require('./lib/format');
const canCreate = require('./lib/canCreate');

module.exports = async (services, agendaOrUid, userUid, role, data, options = {}) => {
  const {
    members,
    users,
    custom
  } = services;

  const {
    userUid: actingUserUid,
    access = null
  } = options;

  if (!actingUserUid && access !== 'internal') {
    throw new BadRequest('userUid option is required');
  }

  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  const agenda = await getAgenda(services, agendaUid, { detailed: true });

  const memberData = {
    ...(data || {}),
  };

  if (options.useAccountEmail) {
    memberData.email = await users.get(userUid).then(u => u.email);
  }

  const actingMember = actingUserUid ? await members.get({
    agendaUid,
    userUid: actingUserUid
  }) : null;

  if (!canCreate(services, {
    agenda,
    acting: actingMember,
    actingUserUid,
    userUid,
    role,
    access
  })) {
    throw new Forbidden('Not authorized to add a member');
  }

  const schemas = await getMemberSchema(services, agenda, { access, actingMember });
  let cleanMemberData = null;
  try {
    const validate = new FormSchema(schemas.merged).getValidate();
    cleanMemberData = validate(memberData);
  } catch (error) {
    throw new BadRequest({
      info: { error }
    }, 'data is invalid');
  }

  try {
    if (schemas.agendaSchema) {
      const dispatchedData = dispatchDataPerSchemas(memberData, [schemas.schema, schemas.agendaSchema]);
      await custom(agenda.memberSchemaId).set(userUid, dispatchedData[1]);
    }
    await members.create({
      agendaUid,
      userUid,
      role: members.utils.getRoleCode(role ?? 'contributor'),
      custom: format.custom(memberData)
    }, { requireCustom: false });
  } catch (error) {
    throw new GeneralError(error, 'something went wrong');
  }

  return {
    ...cleanMemberData,
    deletedUser: false,
    userUid,
    role
  };
};
