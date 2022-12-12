'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('services/members/getUsersByUid');

module.exports = async (services, userUids, userOptions = {}) => {
  log('processing', [].concat(userUids).join(','), userOptions);

  const { data } = await services.users.find({
    query: {
      uid: {
        $in: [].concat(userUids),
      },
    },
    ...userOptions,
  });

  // For agenda-admin
  if (userOptions.detailed) {
    return data;
  }

  return data.map(d => _.pick(d, ['id', 'uid', 'fullName', 'culture']));
};
