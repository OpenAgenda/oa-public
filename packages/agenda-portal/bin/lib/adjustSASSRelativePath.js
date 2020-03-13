'use strict';

const fs = require('fs');

module.exports = () => fs.writeFileSync(
  `${process.cwd()}/sass/main.scss`,
  fs.readFileSync(`${process.cwd()}/sass/main.scss`, 'utf-8').replace(
    '@import "../../node_modules/bootstrap/scss/bootstrap";',
    '@import "../node_modules/bootstrap/scss/bootstrap";'
  )
);
