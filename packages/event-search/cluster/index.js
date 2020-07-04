'use strict';

const _ = require('lodash');

module.exports = ({ client, defaultIndex }) => {
  return {
    stats: stats.bind(null, client),
    indices: index => ({
      replicas: {
        set: n => client.indices.putSettings({
          index: index || defaultIndex,
          body: {
            number_of_replicas: n
          }
        }).then(r => r.body),
        get: () => getIndexSettings({ client, defaultIndex }, index)
          .then(r => parseInt(r.number_of_replicas))
      }
    })
  }
}

async function getIndexSettings({ client, defaultIndex }, index) {
  return client.indices.getSettings({
    index: index || defaultIndex
  }).then(r => r.body[index || defaultIndex].settings.index)
}

async function stats(client) {
  const stats = await client.cluster.stats().then(r => r.body);

  return {
    status: stats.status,
    indexCount: stats.indices.count,
    documentCount: stats.indices.docs.count,
    usedCPUPercent: stats.nodes.process.cpu.percent,
    usedMemoryPercent: stats.nodes.os.mem.used_percent
  };
}
