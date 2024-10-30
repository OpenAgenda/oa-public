'use strict';

const { BadRequest } = require('@openagenda/verror');

const isInvalidSortKeyCount = (error) =>
  !!(error.meta.body.error.root_cause?.[0].reason ?? '').match(
    /search_after\shas\s[0-9]\svalue\(s\)\sbut\ssort\shas\s[0-9]/,
  );
const isInvalidAggregation = (error) =>
  (error.meta.body.error.reason ?? '').indexOf('Invalid aggregation name')
  === 0;

module.exports = function formatError(error) {
  if (error?.meta?.body?.status === 400) {
    let message = 'malformed request';
    if (isInvalidSortKeyCount(error)) {
      message = 'invalid after value';
    }
    if (isInvalidAggregation(error)) {
      message = 'invalid aggregation';
    }

    return new BadRequest(message);
  }

  return error;
};
