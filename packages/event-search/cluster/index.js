'use strict';

const _ = require('lodash');

module.exports = ({ client }) => {
  return {
    stats: stats.bind(null, client),
    configure: configure.bind(null, client)
  }
}


async function configure(client, persistent = {}, transient = {}) {
  const settings = {
    persistent: {
      'cluster.max_shards_per_node': 100000
    },
    transient: {}
  };

  Object.keys(persistent).forEach(k => {
    settings.persistent[k] = persistent[k];
  });
  Object.keys(transient).forEach(k => {
    settings.transient[k] = transient[k];
  });

  const currentSettings = await client.cluster.getSettings({
    flatSettings: true
  }).then(r => r.body);

  const put = Object.keys(currentSettings).reduce((put, type) => {
    const keys = _.uniq(Object.keys(currentSettings[type]).concat(Object.keys(settings[type])));
    return keys.reduce((put, key) => {
      if (put) return true;
      return _.get(currentSettings, [type, key]) !== _.get(settings, [type, key]);
    }, put);
  }, false);

  if (put) {
    await client.cluster.putSettings({
      body: settings
    });
    return {
      updated: true,
      settings
    }
  }

  return {
    updated: false,
    settings: currentSettings
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
