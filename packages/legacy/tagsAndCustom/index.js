import logger from '@openagenda/logs';
import set from './lib/set.js';
import * as setAll from './lib/setAll.js';
import getTagSet from './lib/getTagSet.js';
import getCategorySet from './lib/getCategorySet.js';
import updateTagSetAndTags from './lib/updateTagSetAndTags.js';
import updateCategorySetAndCategories from './lib/updateCategorySetAndCategories.js';
import generateTagSet from './lib/utils/generateTagSet.js';
import generateCustomSet from './lib/utils/generateCustomSet.js';
import generateCategorySet from './lib/utils/generateCategorySet.js';
import legacyToFormSchemaDataTransform from './lib/utils/legacyToFormSchemaDataTransform.js';

const utils = {
  generateTagSet,
  generateCustomSet,
  generateCategorySet,
  legacyToFormSchemaDataTransform,
};

export default function TagsAndCustom({ knex, queue, interfaces }) {
  return {
    set: set.bind(null, { knex }),
    setAll: setAll.default.bind(null, { knex, queue }),
    task: setAll.task.bind(null, { knex, queue }),
    getTagSet: getTagSet.bind(null, { knex, interfaces }),
    getCategorySet: getCategorySet.bind(null, { knex, interfaces }),
    updateTags: updateTagSetAndTags.bind(null, { knex }),
    updateCategories: updateCategorySetAndCategories.bind(null, { knex }),
    utils,
  };
}

export { utils };

export function updateLoggerConfig(config) {
  logger.setModuleConfig(config);
}

TagsAndCustom.utils = utils;
TagsAndCustom.updateLoggerConfig = updateLoggerConfig;
