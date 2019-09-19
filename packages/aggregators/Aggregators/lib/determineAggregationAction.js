'use strict';

const _ = require('lodash');
const deepDiff = require('deep-diff');
const log = require('@openagenda/logs')('determineAggregationAction');

module.exports = (type, eventBefore, eventNow) => {
  log('processing %s for %s: %s->%s', type, _.get(eventNow, 'slug', null), _.get(eventBefore, 'state', null), _.get(eventNow, 'state', null));

  if (type === 'remove') return 'remove';

  if (_isPublish(eventBefore, eventNow)) {
    log('event was published');
    return 'evaluate';
  } else if (_isUnpublish(eventBefore, eventNow)) {
    log('event was unpublished');
    return 'remove';
  }

  const diff = deepDiff(_.omit(
    eventBefore, ['updatedAt', 'state']
  ), _.omit(
    eventNow, ['updatedAt', 'state']
  ));

  if (diff && eventNow.state ===2) return 'evaluate';

  return null;
}

function _isUnpublish(before, now) {
  if (!before || before.state !== 2) {
    return false;
  } else if (now.state === 2) {
    return false;
  }
  return true;
}

function _isPublish(before, now) {
  if (before && before.state === 2) {
    return false;
  } else if (now.state !== 2) {
    return false;
  }
  return true;
}
