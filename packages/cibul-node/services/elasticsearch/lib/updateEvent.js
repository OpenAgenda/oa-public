"use strict";

const _ = require('lodash');

const formatEvent = require('@openagenda/legacy/rebuildSearchIndex/formatEvent');
const log = require('@openagenda/logs' )( 'services/elasticsearch/updateEvent');

module.exports = ({ update, remove, knex, imageBasePath }) => {

  return async (identifier, options = {}) => {
    log('processing', identifier);

    const { removeUnreferenced, removeInvalid } = Object.assign({
      removeUnreferenced: false,
      removeInvalid: false
    }, options);

    let formatted = null, toRemoveId = null;

    try {
      formatted = await formatEvent({
        knex,
        imageBasePath
      }, identifier);
    } catch (e) {

      if (!removeInvalid) throw e;

      toRemoveId = _.isObject(identifier) ?
        await _getEventLegacyId(knex, identifier)
        : identifier;
    }

    if (!toRemoveId && removeUnreferenced && !_.get(formatted, 'articles', []).length) {
      toRemoveId = formatted.id;
    }

    if (toRemoveId) {
      log('removing event of legacy id %s from legacy index', toRemoveId);
      try {
      return remove(toRemoveId);
      }catch(e){
        console.log(e);
        throw e;
      }
    } else {
      log('updating event');
      return update(formatted);
    }

  }

}

function _getEventLegacyId(knex, identifier) {
  return knex('event').first(['id']).where(
    _.pick(identifier, ['id', 'uid'])
  ).then(r => r ? r.id : null);
}
