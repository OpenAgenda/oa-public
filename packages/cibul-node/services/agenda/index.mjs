import logs from '@openagenda/logs';
import * as cache from '../cache/index.mjs';
import config from '../../config/index.mjs';
import model from '../model/index.mjs';
import middleware from './middleware.mjs';
import * as exports from './exportLib.mjs';
import instanciate from './instance.mjs';

const log = logs('agenda service');

function get(queryParams, options, cb) {
  const callback = arguments.length === 2 ? options : cb;
  const opts = arguments.length === 2 ? {} : options;

  log('getting agenda data %s', JSON.stringify(queryParams));

  let { get: getAgenda } = model.agendas();

  if (opts.cache) {
    getAgenda = cache.func('agendas', 'get', getAgenda, config.agendaCacheExpire);
  }

  getAgenda(queryParams, (err, result) => {
    log('retrieved agenda data %s', JSON.stringify(queryParams));

    if (err) return callback(err);

    if (!result) return callback('agenda not found');

    callback(null, instanciate(result));
  });
}

const service = {
  list: model.agendas().list,
  search: () => { throw new Error('legacy search is no longer available'); },
  get,
  instanciate,
  exports,
};

export const mw = middleware(service);

export {
  instanciate,
  get,
  exports,
};
