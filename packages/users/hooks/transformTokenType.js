'use strict';

const _ = require('lodash');

module.exports = function transformTokenType(key) {
  return context => {
    const obj = _.get(context, key, {});

    switch (obj.type) {
      case 'activateAccount':
        obj.type = 'aa';
        break;
      case 'lostPassword':
        obj.type = 'lp';
        break;
      default:
        break;
    }

    _.set(context, key, obj);
  };
};
