'use strict';

const _ = require('lodash');

module.exports = fieldLabel => typeof fieldLabel === 'string' ? fieldLabel : _.get(fieldLabel, _.first(_.keys(fieldLabel)));
