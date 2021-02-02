'use strict';

const _ = require('lodash');

module.exports = services => async (uid, lang) => {
  const {
    core
  } = services;

  const schema = await core.agendas(uid).settings.get();

  if (!schema || !_.isArray(schema.fields)) {
    return null;
  }

  const locationField = _.first(schema.fields.filter(f => f.field === 'location'));
  const legacy = _.get(locationField, 'legacy', null);

  if (!legacy) {
    return null;
  }

  return legacy;
}