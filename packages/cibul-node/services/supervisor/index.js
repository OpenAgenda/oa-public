import * as announcements from './announcements.js';
import * as elasticsearch from './elasticsearch.js';
import * as bullboard from './bullboard/index.js';
import * as users from './users/index.js';

function plugApp(app, base = '/supervisor') {
  announcements.plugApp(app, `${base}/announcement`);
  elasticsearch.plugApp(app, `${base}/elasticsearch`);
  bullboard.plugApp(app, `${base}/bullboard`);
  users.plugApp(app, `${base}/users`);
}

export function init(config, services) {
  return {
    announcements: announcements.init(config, services),
    elasticsearch: elasticsearch.init(config, services),
    users: users.init(config, services),
    plugApp,
  };
}
