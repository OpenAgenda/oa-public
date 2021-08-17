'use strict';

const crypto = require('crypto');

module.exports = data => crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
