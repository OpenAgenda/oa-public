import model from '../model/index.mjs';
import getSocialLinks from './lib/getSocialLinks.mjs';
import instanciate from './instance/index.mjs';
import { head as getIcsHead } from './instance/ics.mjs';
import middleware from './middleware/index.mjs';
import * as exports from './exportLib.mjs';

function get(params, cb) {
  model.events().get(params, (err, result) => {
    if (err) return cb(err);

    cb(null, result ? instanciate(result) : null);
  });
}

const service = {
  search: () => new Error('event.search is no longer available'),
  getSocialLinks,
  list: model.events().list,
  get,
  instanciate,
  STATETYPES: model.events().STATETYPES,
  getIcsHead,
  exports,
};

export const mw = middleware(service);

export { instanciate, get, getSocialLinks, exports };
