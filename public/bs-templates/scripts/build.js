'use strict';

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const sassifyCb = require('./sassify');

const files = fs.readdirSync(path.join(__dirname, '/../compiled'));

const sassify = promisify(sassifyCb);

Promise.all(files.map(f => sassify(path.join(__dirname, '/../compiled/', f))))
  .then(
    () => console.log('done'),
    (err) => console.log(err),
  );
