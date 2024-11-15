import FlatTransform from './lib/FlatTransform.js';
import { head, parseEvent, tail } from './lib/ics/index.js';

export default class ICSStream extends FlatTransform {
  constructor(options = {}) {
    super({
      options,
      head,
      parseEvent,
      tail,
    });
  }
}
