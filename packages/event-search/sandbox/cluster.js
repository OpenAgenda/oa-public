'use strict';

const _ = require('lodash');
const fs = require('fs');
const elasticsearch = require('@elastic/elasticsearch');

const write = (name, o) => fs.writeFileSync(__dirname + '/' + name + '.result.json', JSON.stringify(o, null, 2));

const {
  elasticsearch: config,
  ssl
} = require('../testconfig');

const health = client => client.cat.health({ format: 'json' }).then(r => r.body);
const clusterHealth = (client, level = 'cluster') => client.cluster.health({ format: 'json', level }).then(r => r.body);
const clusterSettings = client => client.cluster.getSettings({
  includeDefaults: true,
  format: 'json'
}).then(r => r.body);
const indices = client => client.cat.indices({ format: 'json' }).then(r => r.body);
const allocation = client => client.cat.allocation({ format: 'json' }).then(r => r.body);
const nodes = client => client.nodes.info().then(({ body }) => Object.keys(body.nodes).map(key => ({
  key,
  ..._.omit(body.nodes[key], ['settings','jvm','os', 'thread_pool', 'modules', 'ingest'])
})));
const nodesUsage = client => client.nodes.usage().then(r => r.body);
const shards = (client, index) => client.cat.shards({ format: 'json',index }).then(r => r.body);
const logSegment = name => console.log(`================= ${name} =====================`);
const sleep = (time = 1000) => new Promise(rs => setTimeout(rs, time));

(async () => {
  const client = new elasticsearch.Client({
    node: config.node,
    ssl: config.ssl
  });

  const result = {};

  //result.getAlias = await client.indices.getAlias().then(r => r.body);

  //result.delete = await client.indices.delete({
  //  index: ["agendas_20200719_010000", "agendas_20200820_095436"]
  //});

  /*result.putAlias = await client.indices.putAlias({
    name: 'agendas',
    index: 'agendas_20200825_121042'
  })*/

  result.indices = await indices(client).then(indices => indices.map(i => ({
    index: i.index,
    docs: i['i.docs.count']
  }).index));

  write('result', result);

  //write('health', await health(client));
  //write('cluster.health', await clusterHealth(client));
  //write('cluster.settings', await clusterSettings(client));
  //write('indices', await indices(client));
  //write('nodes', await nodes(client));
  //write('nodes.usage', await nodesUsage(client));
  //write('shards', await shards(client));
  //write('allocation', await allocation(client));
})();
