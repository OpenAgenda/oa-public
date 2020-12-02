'use strict';

module.exports = (data, { access, defaultState }) => {
  const canChangeState = !['contributor', 'reader', 'public'].includes(access);

  if (data.state !== undefined && canChangeState) {
    return data.state;
  }

  return defaultState;
}
