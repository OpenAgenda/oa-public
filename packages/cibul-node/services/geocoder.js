'use strict';

const OpenCage = require('@openagenda/geocoder/Opencage');

module.exports.init = config => OpenCage(config.opencage);
