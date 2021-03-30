"use strict";

const path = require('path');
const getLabelFiles = require('./getLabelFiles');

module.exports = getAllLabels();

function getAllLabels() {
  let result = {};
  let files = getLabelFiles();

  for (let file of files) {

    let branches = path.dirname(file).split('/');
    let currentBranch;
    let currentPos = result;

    while (currentBranch = branches.shift()) {

      currentPos[currentBranch] = Object.assign(
        currentPos[currentBranch] || {},
        { [path.basename(file).replace('.js', '')]: require('./' + file) }
      );

      currentPos = currentPos[currentBranch];

    }

  }

  return result;
}
