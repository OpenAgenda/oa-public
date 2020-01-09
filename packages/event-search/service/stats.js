'use strict';

module.exports = async ({ client }) => {
  const stats = await client.cluster.stats().then(r => r.body);

  console.log(JSON.stringify(stats, null, 2));

  return {
    status: stats.status,
    indexCount: stats.indices.count,
    documentCount: stats.indices.docs.count,
    usedCPUPercent: stats.nodes.process.cpu.percent,
    usedMemoryPercent: stats.nodes.os.mem.used_percent
  };
}
