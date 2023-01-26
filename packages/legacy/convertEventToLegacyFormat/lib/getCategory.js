'use strict';

const _ = require('lodash');

module.exports = (agendaSettings, event) => {
  const { formSchema } = agendaSettings;
  const { categorySet } = agendaSettings.legacy;

  const categoryField = formSchema.fields.find(f => Object.keys(event).find(el => f.field === el) && f.origin === 'categories');
  if (!categoryField) return null;

  const category = categoryField.options.find(option => parseInt(option.id, 10) === parseInt(event[categoryField.field], 10));

  const result = categorySet?.categories.find(cat => cat.slug === category?.value);

  return result ? _.omit(result, ['schemaOptionId']) : result;
};
