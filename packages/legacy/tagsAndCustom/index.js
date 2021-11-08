'use strict';

const logger = require('@openagenda/logs');

const set = require('./lib/set');
const setAll = require('./lib/setAll');
const getTagSet = require('./lib/getTagSet');
const getCategorySet = require('./lib/getCategorySet');

const utils = {
  generateTagSet: require('./lib/utils/generateTagSet'),
  generateCustomSet: require('./lib/utils/generateCustomSet'),
  generateCategorySet: require('./lib/utils/generateCategorySet'),
  legacyToFormSchemaDataTransform: require('./lib/utils/legacyToFormSchemaDataTransform'),
};

module.exports = ({ knex, queue, interfaces }) => ({
  set: set.bind(null, { knex }),
  setAll: setAll.bind(null, { knex, queue }),
  task: setAll.task.bind(null, { knex, queue }),
  getTagSet: getTagSet.bind(null, { knex, interfaces }),
  getCategorySet: getCategorySet.bind(null, { knex, interfaces }),
  utils
});

module.exports.utils = utils;

module.exports.updateLoggerConfig = config => {
  logger.setModuleConfig(config);
};
