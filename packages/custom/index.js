import _ from 'lodash';
import get from './service/get.js';
import list from './service/list.js';
import create from './service/create.js';
import update from './service/update.js';
import set from './service/set.js';
import remove from './service/remove.js';
import searchByValue from './service/searchByValue.js';
import config from './service/config.js';

const endpoints = {
  get,
  list,
  create,
  update,
  set,
  remove,
};

export default _.assign(
  (formSchemaId) => _.mapValues(endpoints, (v) => v.bind(null, formSchemaId)),
  _.pick(config, ['init', 'shutdown', 'getConfig']),
  { searchByValue },
);
