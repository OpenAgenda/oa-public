'use strict';

const _ = require('lodash');
const getAgenda = require('../utils/getAgenda');

const is = async (requested, services, agendaOrUid) => _.get(
  await getAgenda(services, agendaOrUid),
  'settings.contribution.type'
) === services.agendas.contributionTypes[requested];

module.exports.isOpen = is.bind(null, 'OPEN');
module.exports.isClosed = is.bind(null, 'CLOSED');
module.exports.isMembersOnly = is.bind(null, 'MEMBERS_ONLY');

module.exports.isMemberDataRequired = async function isMemberDataRequired(services, agendaOrUid) {
  return getAgenda(services, agendaOrUid)
    .then(agenda => !!agenda?.settings?.contribution?.useFields);
};
