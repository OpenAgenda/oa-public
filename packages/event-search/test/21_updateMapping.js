'use strict';

const assert = require('assert');
const elasticsearch = require('@elastic/elasticsearch');

const config = require('../testconfig').elasticsearch;

const updateMapping = require('../utils/updateMapping');

const indexName = '21_update_mapping';

describe('21 - event-search - updateMapping', function() {
  this.timeout(20000);

  let client;
  let updateResponse;

  before(async () => {
    client = new elasticsearch.Client({
      node: config.node,
      ssl: config.ssl
    });

    await client.indices.create({
      index: indexName,
      body: {
        mappings: {
          dynamic: false,
          properties: {
            uid: { type: 'integer' }
          }
        }
      }
    });
  });

  before(async () => {
    updateResponse = await updateMapping({ client }, indexName, {
      uid: { type: 'integer' },
      slug: { type: 'keyword' }
    });
  });

  after(async () => {
    try {
      await client.indices.delete({ index: indexName });
    } catch(e) {}
  });

  it('response is elasticsearch body', () => {
    assert.deepEqual(updateResponse, { acknowledged: true });
  });

  it('mapping is updated', async () => {
    const updated = await client.indices.getMapping({ index: indexName });

    assert.deepEqual(
      Object.keys(updated.body[indexName].mappings.properties),
      ['slug', 'uid']
    );
  });
});
