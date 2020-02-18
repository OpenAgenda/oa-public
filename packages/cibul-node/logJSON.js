'use strict';

const fs = require('fs');

module.exports = (basename, data) => {
  const dir = '/var/tmp/search/';
  const now = new Date();
  const _fZ = n => (n<10?'0':'')+n;
  fs.writeFileSync(
    `${dir}${basename}-${now.getFullYear()}-${_fZ(now.getMonth()+1)}-${_fZ(now.getDate())}T${_fZ(now.getHours())}:${_fZ(now.getMinutes())}.json`,
    JSON.stringify(data, null, 2)
  );
}
