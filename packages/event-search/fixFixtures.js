'use strict';

const fs = require('fs');
const ih = require('immutability-helper');

const file = __dirname + '/test/fixtures/16_events.10.10.json';

const data = require(file);

(async () => {

  const formatted = [];

  data.events.forEach(event => {
    formatted.push(ih(Object.assign(event, event.custom, {
      state: event.state.code,
      featured: !!event.state.featured,
      member: {
        role: 1,
        userUid: event.contributor.uid,
        custom: {
          email: 'some@email.com',
          contactName: event.contributor.name
        }
      }
    }), {
      $unset: ['custom', 'contributor']
    }));
  });

  fs.writeFileSync(file, JSON.stringify({ ...data, events: formatted }, null, 2));

})();
