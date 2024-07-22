import _ from 'lodash';
import logs from '@openagenda/logs';
import schema from './lib/schema.js';

const log = logs('core/users/get');

export default core => async (userUid, options = {}) => {
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

  const userSchema = {
    ...schema,
    fields: schema.fields.concat(includeSupervisorLink ? {
      field: 'supervisorLink',
      fieldType: 'link',
      label: 'Admin link',
    } : []),
  };

  if (includeSupervisorLink) {
    clean.supervisorLink = `/admin/users?userUid=${userUid}`;
  }

  if (withSchema) {
    return {
      data: clean,
      schema: userSchema,
    };
  }

  return clean;
};
