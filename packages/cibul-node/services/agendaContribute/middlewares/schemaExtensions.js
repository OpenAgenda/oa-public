'use strict';

const _ = require('lodash');

require('@openagenda/logs')('services/agendaContribute/middlewares/schemas');

module.exports = async (req, res, next) => {
  const {
    networks,
    formSchemas
  } = req.app.services;

  req.schemaExtensions = [];

  if (_.get(req, 'agenda.networkUid')) {
    const network = await networks.get(_.get(req, 'agenda.networkUid'));

    if (network.formSchemaId) {
      req.schemaExtensions.push(await formSchemas.get(network.formSchemaId));
    }
  }

  if (_.get(req, 'agenda.formSchemaId')) {
    req.schemaExtensions.push(await formSchemas.get(_.get(req, 'agenda.formSchemaId')));
  }

  next();
};
