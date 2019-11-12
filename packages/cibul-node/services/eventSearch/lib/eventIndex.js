'use strict';

const log = require('@openagenda/logs')('services/eventSearch/eventIndex');

module.exports = ({ eventSearch, queue }) => {
  queue.register({
    eventIndexAdd: add.bind(null, { eventSearch }),
    eventIndexUpdate: update.bind(null, { eventSearch }),
    eventIndexRemove: remove.bind(null, { eventSearch })
  });
}

async function add({ eventSearch }, data) {

}

async function update({ eventSearch }, data) {

}

async function remove({ eventSearch }) {

}
