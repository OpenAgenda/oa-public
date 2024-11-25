import _ from 'lodash';
import create from './create.js';
import get from './get.js';
import list from './list.js';
import update from './update.js';
import remove from './remove.js';
import { init } from './config.js';

const endpoints = {
  create,
  get,
  list,
  update,
  remove,
};

const Service = (identifiers) =>
  _.mapValues(endpoints, (v, _k) => v.bind(null, identifiers));

Service.init = init;

export default Service;

export { init };
