'use strict';

const elasticsearch = require('@elastic/elasticsearch');

const config = require('../testconfig').elasticsearch;

describe('98 - event-search - unit: used elasticsearch api calls', () => {
  let client;

  beforeAll(() => {
    client = new elasticsearch.Client({
      node: config.node,
      ssl: config.ssl,
    });
  });

  describe('indices', () => {
    afterAll(async () => {
      try {
        await client.indices.delete({
          index: '99_elasticsearch_created_index',
        });
      } catch (e) {
        // console.log(e);
      }
      try {
        await client.indices.delete({
          index: '99_elasticsearch_index_to_delete',
        });
      } catch (e) {
        // console.log(e);
      }
    });

    it('create an index', async () => {
      const result = await client.indices.create({
        index: '99_elasticsearch_created_index',
      });

      expect(result.statusCode).toBe(200);

      expect(result.body.acknowledged).toBe(true);
      expect(result.body.index).toBe('99_elasticsearch_created_index');
    });

    it('delete an index', async () => {
      await client.indices.create({
        index: '99_elasticsearch_index_to_delete',
      });

      const result = await client.indices.delete({
        index: '99_elasticsearch_index_to_delete',
      });

      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({
        acknowledged: true,
      });
    });
  });

  describe('aliases', () => {
    beforeAll(async () => {
      await client.indices.create({
        index: '99_elasticsearch_aliased_index',
      });
      await client.indices.refresh({
        index: '99_elasticsearch_aliased_index',
      });
    });

    afterAll(async () => {
      for (const i of ['99_elasticsearch_ephemeral_aliased_index', '99_elasticsearch_aliased_index']) {
        try {
          await client.indices.delete({
            index: i,
          });
        } catch (e) {
          // console.log(e);
        }
      }
    });

    it('index exists', async () => {
      const whenExists = await client.indices.exists({
        index: '99_elasticsearch_aliased_index',
      });

      expect(whenExists.body).toBe(true);

      const whenNotExists = await client.indices.exists({
        index: 'somerandomindexname',
      });

      expect(whenNotExists.body).toBe(false);
    });

    it('create an alias with filter', async () => {
      const r = await client.indices.putAlias({
        index: '99_elasticsearch_aliased_index',
        name: '99_elasticsearch_aliased_alias',
        body: {
          filter: {
            term: { user: 'kimchy' },
          },
        },
      });

      expect(r.statusCode).toBe(200);
      expect(r.body).toEqual({ acknowledged: true });
    });

    it('get an alias with filter', async () => {
      await client.indices.putAlias({
        index: '99_elasticsearch_aliased_index',
        name: '99_elasticsearch_aliased_alias_2',
        body: {
          filter: {
            term: { user: 'kimchy' },
          },
        },
      });

      const r = await client.indices.getAlias({
        name: '99_elasticsearch_aliased_alias_2',
      });

      expect(r.statusCode).toBe(200);
      expect(r.body).toEqual({
        '99_elasticsearch_aliased_index': {
          aliases: {
            '99_elasticsearch_aliased_alias_2': {
              filter: {
                term: { user: 'kimchy' },
              },
            },
          },
        },
      });
    });

    it('an alias is deleted when index is deleted', async () => {
      let errorResponse;

      await client.indices.create({
        index: '99_elasticsearch_ephemeral_aliased_index',
      });

      await client.indices.putAlias({
        index: '99_elasticsearch_ephemeral_aliased_index',
        name: '99_elasticsearch_ghost_alias',
      });

      await client.indices.delete({
        index: '99_elasticsearch_ephemeral_aliased_index',
      });

      try {
        await client.indices.getAlias({
          name: '99_elasticsearch_ghost_alias',
        });
      } catch (e) {
        errorResponse = e;
      }

      expect(errorResponse.body).toEqual({
        error: 'alias [99_elasticsearch_ghost_alias] missing',
        status: 404,
      });

      expect(errorResponse.statusCode).toBe(404);
    });
  });

  describe('bulk', () => {
    beforeAll(async () => {
      await client.indices.create({
        index: '99_elasticsearch_bulk',
      });

      await client.create({
        index: '99_elasticsearch_bulk',
        id: 99,
        body: {
          title: 'Machine à laver',
          description: 'Ongle',
        },
      });
    });

    afterAll(async () => {
      await client.indices.delete({
        index: '99_elasticsearch_bulk',
      });
    });

    it('bulk index updates', async () => {
      await client.bulk({
        index: '99_elasticsearch_bulk',
        refresh: true,
        body: [{
          index: { _id: 99 },
        }, {
          title: 'Lombaires',
        }],
      });

      const doc = await client.get({
        index: '99_elasticsearch_bulk',
        id: 99,
      }).then(r => r.body);

      expect(doc._source).toEqual({
        title: 'Lombaires',
      });
    });
  });

  describe('document deletes', () => {
    beforeAll(async () => {
      await client.indices.create({
        index: '99_elasticsearch_doc_delete',
      });

      await client.bulk({
        index: '99_elasticsearch_doc_delete',
        refresh: true,
        body: [{
          create: { _id: 'one' },
        }, {
          title: 'I stay',
          set: '111',
        }, {
          create: { _id: 'two' },
        }, {
          title: 'I go',
          set: '123',
        }, {
          create: { _id: 'three' },
        }, {
          title: 'I stay',
          set: '111',
        }, {
          create: { _id: 'four' },
        }, {
          title: 'I go',
          set: '222',
        }],
      });
    });

    afterAll(async () => {
      await client.indices.delete({
        index: '99_elasticsearch_doc_delete',
      });
    });

    it('delete by query', async () => {
      const result = await client.deleteByQuery({
        index: '99_elasticsearch_doc_delete',
        refresh: true,
        body: {
          query: {
            bool: {
              must_not: {
                term: {
                  set: '111',
                },
              },
            },
          },
        },
      });
      expect(result.body.deleted).toBe(2);

      const docs = await client.search({
        index: '99_elasticsearch_doc_delete',
        body: {
          query: {
            match_all: {},
          },
        },
      }).then(r => r.body.hits.hits);

      expect(docs.map(d => d._id)).toEqual(['one', 'three']);
    });
  });
});
