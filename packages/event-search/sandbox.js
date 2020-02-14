'use strict';

const fs = require('fs');
const ih = require('immutability-helper');
const axios = require('axios');

(async () => {

  // get json export data of bdx to test legacy lib
  //axios.get('https://d.openagenda.com/...')

})();

async function fixFixtures(fxFile) {
  const data = JSON.parse(fs.readFileSync(fxFile));

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
}
