'use strict';

/**
 * provide a labels getter that will
 * give back labels fed at init
 */

module.exports =
  (labels) =>
  (...args) => {
    let name;
    let values;
    let lang;

    if (args.length === 3) {
      [name, values, lang] = args;
    } else if (arguments.length === 2 && typeof values === 'string') {
      [name, lang] = args;
      values = {};
    }

    if (!labels[name]) return null;

    let str = labels[name][lang || 'en'];
    let k;

    if (values) {
      for (k in values) {
        if (Object.hasOwn(values, k)) {
          str = str.replace(`%${k}%`, values[k]);
        }
      }
    }

    return str;
  };
