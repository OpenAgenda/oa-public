"use strict";

const _ = require('lodash');
const { promisify } = require( 'util' );

const agendaTags = require('@openagenda/agenda-tags');
const agendaCategories = require('@openagenda/agenda-categories');

const getAgenda = require('../../utils/getAgenda');
const getMergedSchema = require('../getMergedSchema');
const setSchemaFieldOrigins = require('./setSchemaFieldOrigins');

const operations = {
  tags: {
    set: promisify(agendaTags.set),
    get: promisify(agendaTags.get),
    generate: require('@openagenda/legacy/tagsAndCustom').utils.generateTagSet
  },
  categories: {
    set: promisify(agendaCategories.set),
    get: promisify(agendaCategories.get),
    generate: require('@openagenda/legacy/tagsAndCustom').utils.generateCategorySet
  }
}

const log = require('@openagenda/logs')('core/agendas/settings/legacy/updateLegacySet');

module.exports = async (config, agendaOrUid, type, force = false) => {

  const agenda = _.isObject(agendaOrUid) ? agendaOrUid : await getAgenda(agendaOrUid);

  log(`transferring from form-schema to ${type}-set and custom fields`, agenda.uid, agenda.slug);

  const schema = await getMergedSchema(agenda);

  if (!schema) return {
    message: `No schema was found for agenda ${agenda.uid}`
  };

  const { id } = await config.knex('review').first(['id']).where('uid', agenda.uid);

  const legacySet = await operations[type].get(id);

  const {
    set: updatedLegacySet,
    messages,
    fields
  } = operations[type].generate(schema, legacySet)

  const res = {
    messages,
    [type === 'tags' ? 'updatedTagSet' : 'updatedCategorySet'] : updatedLegacySet
  }

  if (!updatedLegacySet) {
    res.messages.push(`no ${type} set generated`);

    return res;
  }

  if (type === 'tags') {
    log('updated tag set has %s groups', updatedLegacySet.groups.length);
  } else {
    log('updated category set has %s categories', updatedLegacySet.categories.length);
  }

  const result = await operations[type].set(id, updatedLegacySet);

  res.messages.push(`generated ${type} set at id ${id}`);

  if (updatedLegacySet) {
    const {
      message: schemaUpdateMessage,
      schema: updatedSchema
    } = await setSchemaFieldOrigins(agenda, fields.map(f => f.field), type);

    res.messages.push(schemaUpdateMessage);

    res.updatedSchema = updatedSchema;
  }

  return res;
}
