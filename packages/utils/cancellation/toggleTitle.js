'use strict';

const determineCancellationFromTitle = require('../cancellation/determineFromTitle');
const injectCancellationInTitle = require('../cancellation/injectInTitle');
const stripCancellationFromTitle = require('../cancellation/stripFromTitle');

module.exports = title => {
  if (determineCancellationFromTitle(title)) {
    return stripCancellationFromTitle(title);
  } else {
    return injectCancellationInTitle(title);
  }
}
