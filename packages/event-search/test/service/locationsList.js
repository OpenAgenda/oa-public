'use strict';

const fs = require('node:fs');

const locations = JSON.parse(
  fs.readFileSync(`${__dirname}/location.data.json`, 'utf-8'),
);

module.exports = (uids, options, cb) => {
  // lazy test list func
  // if ( arguments.length === 3 ) return options( null, locations );

  cb(
    null,
    locations.filter((l) => uids.includes(l.uid)),
  );
};
