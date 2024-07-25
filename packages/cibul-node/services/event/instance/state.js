/* eslint-disable no-param-reassign */

import async from 'async';
import logs from '@openagenda/logs';
import utils from '@openagenda/utils';
import model from '../../model/index.js';
import instanceLoader from '../../lib/instanceLoader.js';

const log = logs('event state');

const TYPES = model.events().STATETYPES;

function _publish(instance, cb) {
  if (!instance.isInAgendaContext()) {
    log('undrafting event %s', instance.id);

    return instance.undraft(true, cb);
  }

  log('publishing event on agenda');

  async.series([
    async.apply(instance.undraft, true),
    async.apply(instance.setPublished, true),
  ], cb);
}

function _refuse(instance, cb) {
  async.series([
    async.apply(instance.setRefused, true),
  ], cb);
}

function _validate(instance, cb) {
  async.series([
    async.apply(instance.setValidated, true),
  ], cb);
}

function _unvalidate(instance, cb) {
  async.series([
    async.apply(instance.setNotValidated, true),
  ], cb);
}

export default instanceLoader((loaded, instance) => {
  let onStateChange;

  function _labelize(state) {
    const labels = {};

    labels[TYPES.REFUSED] = 'refused';
    labels[TYPES.NOTVALIDATED] = 'tocontrol';
    labels[TYPES.VALIDATED] = 'controlled';
    labels[TYPES.PUBLISHED] = 'published';

    return labels[state];
  }

  function getState(options, cb) {
    if (arguments.length === 1) {
      cb = options;
      options = {};
    }

    const params = utils.extend({
      labelized: true,
    }, options);

    if (!instance.isInAgendaContext()) {
      return cb(null, instance.getIsDraft() ? 'draft' : _labelize(TYPES.PUBLISHED));
    }

    instance.getState((err, state) => {
      if (err) return cb(err);

      cb(null, params.labelized ? _labelize(state) : state);
    });
  }

  function setState(newState, user, cb) {
    if (arguments.length === 2) {
      cb = user;
      user = null;
    }

    getState({ labelized: false }, (err, oldState) => {
      log('setting event %s state to %s', instance.id, newState);

      const stateModifiers = {};

      stateModifiers[TYPES.REFUSED] = _refuse;
      stateModifiers[TYPES.PUBLISHED] = _publish;
      stateModifiers[TYPES.VALIDATED] = _validate;
      stateModifiers[TYPES.NOTVALIDATED] = _unvalidate;

      if (![TYPES.NOTVALIDATED, TYPES.VALIDATED, TYPES.PUBLISHED, TYPES.REFUSED].includes(parseInt(newState, 10))) {
        return cb('this state is unknown');
      }

      stateModifiers[newState](instance, (err2, result) => {
        if (err2) return cb(err2);

        if (onStateChange) onStateChange(_labelize(oldState), _labelize(newState), user);

        cb(null, result, { oldState, newState });
      });
    });
  }

  function setOnStateChange(cb) {
    onStateChange = cb;
  }

  return {
    setState,
    getState,
    setOnStateChange,
  };
});
