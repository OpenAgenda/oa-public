'use strict';

const logger = require('@openagenda/logs');

const set = require('./lib/set');
const setAll = require('./lib/setAll');
const getTagSet = require('./lib/getTagSet');
const getCategorySet = require('./lib/getCategorySet');
const updateTagSetAndTags = require('./lib/updateTagSetAndTags');
const updateCategorySetAndCategories = require('./lib/updateCategorySetAndCategories');
const generateTagSet = require('./lib/utils/generateTagSet');
const generateCustomSet = require('./lib/utils/generateCustomSet');
const generateCategorySet = require('./lib/utils/generateCategorySet');
const legacyToFormSchemaDataTransform = require('./lib/utils/legacyToFormSchemaDataTransform');

const utils = {
  generateTagSet,
  generateCustomSet,
  generateCategorySet,
  legacyToFormSchemaDataTransform,
};

module.exports = ({ knex, queue, interfaces }) => ({
  set: set.bind(null, { knex }),
  setAll: setAll.bind(null, { knex, queue }),
  task: setAll.task.bind(null, { knex, queue }),
  getTagSet: getTagSet.bind(null, { knex, interfaces }),
  getCategorySet: getCategorySet.bind(null, { knex, interfaces }),
  updateTags: updateTagSetAndTags.bind(null, { knex }),
  updateCategories: updateCategorySetAndCategories.bind(null, { knex }),
  utils,
});

module.exports.utils = utils;

module.exports.updateLoggerConfig = config => {
  logger.setModuleConfig(config);
};
