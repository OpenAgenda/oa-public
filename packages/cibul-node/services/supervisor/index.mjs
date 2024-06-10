import * as announcements from './announcements.mjs';
import * as elasticsearch from './elasticsearch.mjs';
import * as bullboard from './bullboard/index.mjs';

function plugApp(app, base = '/supervisor') {
  announcements.plugApp(app, `${base}/announcement`);
  elasticsearch.plugApp(app, `${base}/elasticsearch`);
  bullboard.plugApp(app, `${base}/bullboard`);
}

export function init(config, services) {
  return {
    announcements: announcements.init(config, services),
    elasticsearch: elasticsearch.init(config, services),
    plugApp,
  };
}
