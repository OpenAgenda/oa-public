'use strict';

const elasticsearch = require('@elastic/elasticsearch');

const config = require('../testconfig').elasticsearch;

const updateDynamicSettings = require('../utils/updateDynamicSettings');

const indexName = '22_update_dynamic_settings';

describe('22 - event-search - updateDynamicSettings', () => {
  let client;
  let updatedSettings;

  beforeAll(async () => {
    client = new elasticsearch.Client({
      node: config.node,
      ssl: config.ssl,
    });

    await client.indices.create({
      index: indexName,
      body: {
        settings: {
          max_result_window: 30,
          number_of_shards: 5,
        },
      },
    });
  });

  beforeAll(async () => {
    await updateDynamicSettings({ client }, indexName, {
      max_result_window: 50,
    });
  });

  beforeAll(async () => {
    const response = await client.indices.getSettings({ index: indexName });

    updatedSettings = response.body[indexName].settings.index;
  });

  afterAll(async () => {
    try {
      await client.indices.delete({ index: indexName });
    } catch (e) {
      // console.log(e);
    }
  });

  test('updated setting is updated', async () => {
    expect(updatedSettings.max_result_window).toBe('50');
  });

  test('not updated settings is not updated', async () => {
    expect(updatedSettings.number_of_shards).toBe('5');
  });

  test('if no changes are identified, settings are not updated and function returns null', async () => {
    const result = await updateDynamicSettings({ client }, indexName, {
      max_result_window: 50,
    });
    expect(result).toBeNull();
  });
});
