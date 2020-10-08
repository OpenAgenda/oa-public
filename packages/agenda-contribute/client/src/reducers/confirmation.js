import _ from 'lodash';
import { unloadWarning } from '@openagenda/react-shared';

module.exports = Object.assign(reducer, {
  redirect
});

function reducer(state = {}, action = {}) {
  return state;
}

function redirect(type) {
  return (dispatch, getState) => {
    unloadWarning.unset();
    const state = getState();

    window.location.href = _.get(state, 'config.redirects.' + type)
      .replace(':eventUid', _.get(state, 'event.uid'));
  }
}
