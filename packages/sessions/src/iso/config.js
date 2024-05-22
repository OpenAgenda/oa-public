'use strict';

module.exports = {
  res: '/session',
  cookies: {
    session: 'oa.user',
    writable: 'oa.rw',
  },
  notificationMaxAge: 1000 * 60 * 5,
};
