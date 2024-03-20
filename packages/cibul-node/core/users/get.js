'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('core/users/get');
const schema = require('./lib/schema');

module.exports = core => async (userUid, options = {}) => {
  log('getting user %s', userUid);
  const {
    users: usersSvc,
  } = core.services;

  const {
    detailed = false,
    withSchema = false,
    includeSupervisorLink = false,
    access,
  } = options;

  const user = await usersSvc.findOne({ query: { uid: userUid }, detailed });

  const clean = access === 'internal' ? user : _.omit(user, ['id', 'isNew', 'username', 'hasSocialAccount', 'hasLocalAccount']);

  if (includeSupervisorLink) {
    clean.supervisorLink = `/admin/users?userUid=${userUid}`;
    schema.fields.push({
      field: 'supervisorLink',
      fieldType: 'link',
      label: 'Admin link',
    });
  }

  if (withSchema) {
    return {
      data: clean,
      schema,
    };
  }

  return clean;
};
