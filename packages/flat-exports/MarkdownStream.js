import _ from 'lodash';
import FlatTransform from './lib/FlatTransform.js';
import { head, parseEvent } from './lib/markdown/index.js';

export default class MarkdownStream extends FlatTransform {
  constructor(options = {}) {
    super({
      options,
      head: head.bind(null, _.get(options, 'format', 'md')),
      parseEvent: parseEvent.bind(null, _.get(options, 'format', 'md')),
    });
  }
}
