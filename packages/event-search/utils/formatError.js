'use strict';

const {
  BadRequest,
} = require('@openagenda/verror');

const isInvalidSortKeyCount = error => !!(
  error.meta.body.error.root_cause?.[0].reason ?? ''
).match(/search_after\shas\s[0-9]\svalue\(s\)\sbut\ssort\shas\s[0-9]/);

module.exports = function formatError(error) {
  if (error?.meta?.body?.status === 400) {
    if (isInvalidSortKeyCount(error)) {
      return new BadRequest('invalid after value');
    }
  }

  return error;
};
