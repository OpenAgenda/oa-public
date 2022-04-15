'use strict';

const util = require('util');
const _ = require('lodash');
const logs = require('@openagenda/logs');

const { promisify } = util;
const log = logs('core/agendas/settings/legacy/updateLegacySet');

const getAgenda = require('../../utils/getAgenda');
const getMergedSchema = require('../getMergedSchema');
const setSchemaFieldOrigins = require('./setSchemaFieldOrigins');

const Operations = services => {
  const {
    agendaTags,
    agendaCategories,
    legacy
  } = services;

  const setTags = agendaTags ? promisify(agendaTags.set) : () => log('warn', 'agendaTags was not initialized');
  const getTags = agendaTags ? promisify(agendaTags.get) : () => log('warn', 'agendaTags was not initialized');
  const generateTags = legacy ? legacy.tagsAndCustom.utils.generateTagSet : () => log('warn', 'legacy was not initialized');
  const setCategories = agendaCategories ? promisify(agendaCategories.set) : () => log('warn', 'agendaCategories was not initialized');
  const getCategories = agendaCategories ? promisify(agendaCategories.get) : () => log('warn', 'agendaCategories was not initialized');
  const generateCategories = legacy ? legacy.tagsAndCustom.utils.generateCategorySet : () => log('warn', 'legacy was not initialized');

  return {
    tags: {
      set: setTags,
      get: getTags,
      generate: generateTags
    },
    categories: {
      set: setCategories,
      get: getCategories,
      generate: generateCategories
    }
  };
};

module.exports = async (core, agendaOrUid, type) => {
  const config = core.getConfig();
  const {
    services
  } = core;

  const operations = Operations(services);

  const agenda = _.isObject(agendaOrUid) ? agendaOrUid : await getAgenda(services, agendaOrUid);

  log(`transferring from form-schema to ${type}-set and custom fields`, agenda.uid, agenda.slug);

  const schema = await getMergedSchema(services, agenda);

  if (!schema) {
    return {
      message: `No schema was found for agenda ${agenda.uid}`
    };
  }

  const { id } = await config.knex('review').first(['id']).where('uid', agenda.uid);

  const legacySet = await operations[type].get(id);

  const {
    set: updatedLegacySet,
    messages,
    fields
  } = operations[type].generate(schema, legacySet);

  const res = {
    messages,
    [type === 'tags' ? 'updatedTagSet' : 'updatedCategorySet']: updatedLegacySet
  };

  if (!updatedLegacySet) {
    res.messages.push(`no ${type} set generated`);

    return res;
  }

  if (type === 'tags') {
    log('updated tag set has %s groups', updatedLegacySet.groups.length);
  } else {
    log('updated category set has %s categories', updatedLegacySet.categories.length);
  }

  await operations[type].set(id, updatedLegacySet);

  res.messages.push(`generated ${type} set at id ${id}`);

  if (updatedLegacySet) {
    const {
      message: schemaUpdateMessage,
      schema: updatedSchema
    } = await setSchemaFieldOrigins(services, agenda, fields.map(f => f.field), type);

    res.messages.push(schemaUpdateMessage);

    res.updatedSchema = updatedSchema;
  }

  return res;
};
