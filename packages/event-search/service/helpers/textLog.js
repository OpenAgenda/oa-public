'use strict';

const fs = require('fs');

module.exports = obj => fs.writeFileSync('/var/tmp/log.json', JSON.stringify(obj, null, 2));
