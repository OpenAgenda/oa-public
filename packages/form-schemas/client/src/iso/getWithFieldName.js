'use strict';

module.exports = withParams => {
  if (!withParams) return;
  return typeof withParams === 'string' ? withParams : withParams.field;
};
