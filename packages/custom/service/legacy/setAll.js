'use strict';

const log = require('@openagenda/logs')('legacy/setAll');

const serviceGet = require('../get');
const loopThroughRefs = require('./lib/loopThroughRefs');
const getFormSchemaIds = require('./lib/getFormSchemaIds');

const legacySet = require('./set');

module.exports = async (config, agendaId) => {
  log('pushing to legacy dataset for agendaId', agendaId);

  const formSchemaIds = await getFormSchemaIds(config.knex, agendaId);

  return loopThroughRefs(config.knex, agendaId, async (ref) => {
    for (const formSchemaId of formSchemaIds) {
      await legacySet(
        formSchemaId,
        ref.uid,
        await serviceGet(formSchemaId, ref.uid),
        { agendaId },
      );
    }
  });
};
