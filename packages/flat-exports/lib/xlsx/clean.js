'use strict';

const _ = require('lodash');
const { cleanString } = require('@openagenda/utils');

module.exports = (event) =>
  _.mapValues(event, (v) => {
    if (typeof v === 'string') {
      return cleanString(
        v

          .replace(/\v/g, ' ')

          .replace(/\n/g, '\r\n'),
      );
    }

    return v;
  });
