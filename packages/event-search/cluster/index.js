async function nodesInfo(client) {
  return client.nodes.info().then(({ body }) =>
    Object.keys(body.nodes).map((key) => ({
      key,
      ...body.nodes[key],
    })));
}

async function getIndexSettings({ client, defaultIndex }, index) {
  return client.indices
    .getSettings({
      index: index || defaultIndex,
    })
    .then((r) => Object.values(r.body)[0].settings.index);
}

async function stats(client) {
  const stats1 = await client.cluster.stats().then((r) => r.body);

  return {
    status: stats1.status,
    indexCount: stats1.indices.count,
    documentCount: stats1.indices.docs.count,
    usedCPUPercent: stats1.nodes.process.cpu.percent,
    usedMemoryPercent: stats1.nodes.os.mem.used_percent,
  };
}

export default ({ client, defaultIndex }) => ({
  stats: stats.bind(null, client),
  nodes: nodesInfo.bind(null, client),
  indices: (index) => ({
    replicas: {
      set: (n) =>
        client.indices
          .putSettings({
            index: index || defaultIndex,
            body: {
              number_of_replicas: n,
            },
          })
          .then((r) => r.body),
      get: () =>
        getIndexSettings({ client, defaultIndex }, index).then((r) =>
          parseInt(r.number_of_replicas, 10)),
    },
  }),
});
