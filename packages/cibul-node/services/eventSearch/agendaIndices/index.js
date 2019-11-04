"use strict"

const _ = require('lodash');

const log = require('@openagenda/logs')('services/eventSearch/agendaIndices');
const schema = require('@openagenda/validators/schema');

const Assemble = require('./assemble');
const rebuild = require('./rebuild');
const agendaIndexSearch = require('./search');

const defaultSearchOptions = {
  detailed: false,
  private: false,
  includeCustom: false
};

schema.register({
  boolean: require('@openagenda/validators/boolean')
});

const validateOptions = schema({
  refresh: {
    type: 'boolean',
    default: true
  }
});

module.exports = (eventSearch, config) => {

  const assemble = Assemble(config);

  return agendaUid => {
    const searchIndex = eventSearch(`agendas:${agendaUid}`);

    return Object.assign({}, searchIndex, {
      exists: searchIndex.exists,
      stream: agendaIndexSearch.stream.bind(null, searchIndex, agendaUid),
      search: agendaIndexSearch.bind(null, searchIndex, agendaUid),
      moreLikeThis: agendaIndexSearch.moreLikeThis.bind(null, searchIndex),
      rebuild: rebuild.bind(null, { assemble }, searchIndex, agendaUid),
      add: _add.bind(null, { assemble }, searchIndex, agendaUid),
      update: _update.bind(null, { assemble }, searchIndex, agendaUid),
      remove: _remove.bind(null, searchIndex)
    });
  }
}

async function _add({ assemble }, searchIndex, agendaUid, agendaEvent, options = {}) {
  if (!await searchIndex.exists()) {
    log('info', 'adding event %s to agenda index %s: index does not exist', agendaEvent.eventUid, searchIndex.name);
    return;
  }

  log('info', 'adding event %s to agenda index %s', agendaEvent.eventUid, searchIndex.name);

  const decorated = await assemble.item(agendaEvent);

  const cleanOptions = validateOptions(options);

  return searchIndex.add(decorated, cleanOptions).then(result => {
    if (result.success) {
      log('event %s was added to agenda %s', agendaEvent.eventUid, searchIndex.name, cleanOptions);
    } else {
      log('error', 'event %s could not be added to agenda %s', agendaEvent.eventUid, searchIndex.name, cleanOptions);
    }
    return result;
  });
}

async function _update({ assemble }, searchIndex, agendaUid, agendaEvent, options = {}) {

  if (!await searchIndex.exists()) {
    log('info', 'updating event %s to agenda index %s: index does not exist', agendaEvent.eventUid, searchIndex.name);
    return;
  }

  log('info', 'updating event %s on agenda index %s', agendaEvent.eventUid, searchIndex.name);

  const decorated = await assemble.item(agendaEvent);

  return searchIndex.update({ uid: agendaEvent.eventUid }, decorated, validateOptions(options));
}

async function _remove(searchIndex, agendaEvent, options = {}) {
  if (!await searchIndex.exists()) {
    log('info', 'removing event %s from agenda index %s: index does not exist', agendaEvent.eventUid, searchIndex.name);
    return;
  }

  log('info', 'removing event %s from agenda index %s', agendaEvent.eventUid, searchIndex.name);

  return searchIndex.remove({ uid: agendaEvent.eventUid }, validateOptions( options ));
}
