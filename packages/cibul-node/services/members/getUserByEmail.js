import _ from 'lodash';
import logs from '@openagenda/logs';

const log = logs('services/members/getUserByEmail');

export default async (services, email, userOptions) => {
  log('processing', email, userOptions);

  return services.users
    .findOne({
      query: { email },
      ...userOptions,
    })
    .then((u) => u && _.pick(u, ['id', 'uid', 'fullName', 'culture']));
};
