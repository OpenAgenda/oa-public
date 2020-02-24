'use strict';

const _ = require('lodash');

module.exports = ({ client }) => {
  return {
    stats: stats.bind(null, client)
  }
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
