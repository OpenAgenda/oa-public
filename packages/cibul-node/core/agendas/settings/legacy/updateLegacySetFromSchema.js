'use strict';

const _ = require('lodash');
const logs = require('@openagenda/logs');

const getAgenda = require('../../utils/getAgenda');
const getMergedSchema = require('../getMergedSchema');
const setSchemaFieldOrigins = require('./setSchemaFieldOrigins');

const Operations = (services, log) => {
  const {
    legacy,
  } = services;

  const getTags = legacy?.tagsAndCustom?.getTagSet ?? (() => log('warn', 'agendaTags was not initialized'));
  const generateTags = legacy ? legacy.tagsAndCustom.updateTags : () => log('warn', 'legacy was not initialized');
  const getCategories = legacy?.tagsAndCustom?.getCategorySet ?? (() => log('warn', 'agendaCategories was not initialized'));
  const generateCategories = legacy ? legacy.tagsAndCustom.updateCategories : () => log('warn', 'legacy was not initialized');

  return {
    tags: {
      get: getTags,
      generate: generateTags,
    },
    categories: {
      get: getCategories,
      generate: generateCategories,
    },
  };
};

module.exports = (core, type) => {
  const log = logs(`core/agendas/settings/legacy/updateLegacySet:${type}`);

  return async (agendaOrUid, options = {}) => {
    const config = core.getConfig();
    const {
      services,
    } = core;

    const {
      lang,
    } = options;

    const operations = Operations(services, log);

    const agenda = _.isObject(agendaOrUid) ? agendaOrUid : await getAgenda(services, agendaOrUid);

    log('transferring from form-schema to %s-set and custom fields on agenda %s (%s)', type, agenda.uid, agenda.slug);

    const schema = await getMergedSchema(services, agenda);

    if (!schema) {
      return {
        message: `No schema was found for agenda ${agenda.uid}`,
      };
    }

    const { id } = await config.knex('review').first(['id']).where('uid', agenda.uid);

    const legacySet = await operations[type].get(agenda.uid);

    log('%sretrieved set for agenda %s', legacySet ? '' : 'did not ', agenda.uid);

    const {
      set: updatedLegacySet,
      messages,
      fields,
    } = await operations[type].generate(id, schema, legacySet, {
      lang: agenda.settings.contribution.defaultLang ?? lang,
    });

    const res = {
      messages,
      [type === 'tags' ? 'updatedTagSet' : 'updatedCategorySet']: updatedLegacySet,
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

    res.messages.push(`generated ${type} set at id ${id}`);

    if (updatedLegacySet) {
      const {
        message: schemaUpdateMessage,
        schema: updatedSchema,
      } = await setSchemaFieldOrigins(services, agenda, fields.map(f => f.field), type);

      res.messages.push(schemaUpdateMessage);

      res.updatedSchema = updatedSchema;
    }

    return res;
  };
};
