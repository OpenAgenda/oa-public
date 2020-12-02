'use strict';

const moment = require('moment-timezone');

module.exports = (begin, end) => moment.duration(new Date(end).getTime() - new Date(begin).getTime()).toJSON();
