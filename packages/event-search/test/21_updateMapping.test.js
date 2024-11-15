import elasticsearch from '@elastic/elasticsearch';
import updateMapping from '../utils/updateMapping.js';
import config from '../testconfig.js';

const indexName = '21_update_mapping';

describe('21 - event-search - updateMapping', () => {
  let client;
  let updateResponse;

  beforeAll(async () => {
    client = new elasticsearch.Client({
      node: config.elasticsearch.node,
      ssl: config.elasticsearch.ssl,
    });

    await client.indices.create({
      index: indexName,
      body: {
        mappings: {
          dynamic: false,
          properties: {
            uid: { type: 'integer' },
            location: {
              properties: {
                uid: {
                  type: 'integer',
                },
              },
            },
          },
        },
      },
    });
  });

  beforeAll(async () => {
    updateResponse = await updateMapping({ client }, indexName, {
      uid: { type: 'integer' },
      slug: { type: 'keyword' },
      location: {
        properties: {
          uid: {
            type: 'integer',
          },
          region: {
            type: 'keyword',
          },
        },
      },
    });
  });

  afterAll(async () => {
    try {
      await client.indices.delete({ index: indexName });
    } catch (e) {
      // console.log(e);
    }
  });

  it('response is elasticsearch body', () => {
    expect(updateResponse).toEqual({ acknowledged: true });
  });

  it('mapping is updated', async () => {
    const updated = await client.indices.getMapping({ index: indexName });

    expect(Object.keys(updated.body[indexName].mappings.properties)).toEqual([
      'location',
      'slug',
      'uid',
    ]);
  });
});
