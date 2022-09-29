'use strict';

const _ = require('lodash');
const { Forbidden, BadRequest, GeneralError } = require('@openagenda/verror');
const FormSchema = require('@openagenda/form-schemas/iso/FormSchema');
const dispatchDataPerSchemas = require('@openagenda/form-schemas/iso/dispatchDataPerSchemas');
const getMemberSchema = require('../utils/getMemberSchema');
const getAgenda = require('../utils/getAgenda');
const format = require('./lib/format');
const canEdit = require('./lib/canEdit');

module.exports = async (services, agendaOrUid, identifiers, data, options = {}) => {
  const {
    members,
    custom
  } = services;

  const {
    userUid: actingUserUid,
    access
  } = options;

  if (!actingUserUid) {
    throw new BadRequest('userUid option is required');
  }

  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  const agenda = await getAgenda(services, agendaUid, { detailed: true });

  const patchData = {};

  const member = await members.get({
    agendaUid,
    ...identifiers
  });

  if (data.role !== undefined && (members.utils.getRoleCode(data.role) !== member.role)) {
    patchData.role = members.utils.getRoleCode(data.role);
  }

  const actingMember = await members.get({
    agendaUid,
    userUid: actingUserUid
  });

  if (!canEdit(services, {
    acting: actingMember,
    userUid: member.userUid,
    role: patchData.role
  })) {
    throw new Forbidden('Not authorized to patch member');
  }
  const schemas = await getMemberSchema(services, agenda, { access, actingMember });
  let cleanMemberData = null;

  try {
    const validate = new FormSchema(schemas.merged).getValidate();
    cleanMemberData = validate(data);
  } catch (error) {
    throw new BadRequest({
      info: { error }
    }, 'data is invalid');
  }

  const customData = format.custom(data);

  if (Object.keys(customData).length) {
    patchData.custom = customData;
  }

  try {
    if (schemas.agendaSchema) {
      const dispatchedData = dispatchDataPerSchemas(cleanMemberData, [schemas.schema, schemas.agendaSchema]);
      await custom(agenda.memberSchemaId).set(member.userUid, dispatchedData[1]);
    }
    await members.patch(member.id, patchData, {
      throwOnError: true,
      requireCustom: false,
      context: {
        sender: {
          userUid: actingUserUid,
          memberName: actingMember?.custom?.contactName
        }
      }
    });
  } catch (error) {
    throw new GeneralError(error, 'something went wrong');
  }

  return { ...cleanMemberData };
};
