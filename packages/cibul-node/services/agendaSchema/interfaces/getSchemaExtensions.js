'use strict';

const _ = require('lodash');
const eventSchema = require('@openagenda/event-form/build/schema');

const log = require('@openagenda/logs')('events/interfaces/getSchemaExtensions');

module.exports = async (services, agenda) => {
  const {
    networks,
    formSchemas
  } = services;

  const networkUid = _.get(agenda, 'networkUid');
  const network = networkUid ? (await networks.get(networkUid)) : null;
  const networkFormSchemaId = _.get(network, 'formSchemaId');

  return {
    event: { id: -1, ...eventSchema({}) },
    network: networkFormSchemaId ? await formSchemas.get(networkFormSchemaId) : null
  };

}
