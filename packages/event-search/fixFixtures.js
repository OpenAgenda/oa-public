'use strict';

const fs = require('fs');
const ih = require('immutability-helper');

(async () => {

  for (const filepath of [
    '06_events.0.10.json'
  ].map(p => __dirname + '/test/fixtures/' + p)) {
    const {
      lastId,
      events
    } = JSON.parse(fs.readFileSync(filepath));

    const fixed = events.map(event => {
      const update = {
        '$unset': ['agenda']
      };

      if (event.state && typeof event.state === 'object') {
        update.state = { $set: event.state.code };
      }

      if (event.contributor) {
        update['$unset'].push('contributor');
        update.member = { $set: event.contributor };
      }

      if (!update.originAgenda) {
        update.originAgenda = {
          $set: event.agenda
        };
      }
      return ih(event, update);
    });

    fs.writeFileSync(filepath, JSON.stringify({ lastId, events: fixed }, null, 2));
  }

})();
