import _ from 'lodash';
import logs from '@openagenda/logs';

const log = logs('services/members/getUsersByUid');

export default async (services, userUids, userOptions = {}) => {
  log('processing', {
    userUids: [].concat(userUids).join(','),
    userOptions,
  });

  const uids = [].concat(userUids);

  const { data } = await services.users.find({
    query: {
      uid: {
        $in: uids,
      },
      $limit: uids.length,
    },
    ...userOptions,
  });

  // For agenda-admin
  if (userOptions.detailed) {
    return data;
  }

  return data.map((d) => _.pick(d, ['id', 'uid', 'fullName', 'culture']));
};
