'use strict';

const uuidV4 = require('uuid/v4');

module.exports = () => uuidV4().replace(/\-/g, '');