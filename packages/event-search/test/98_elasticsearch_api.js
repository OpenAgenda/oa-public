'use strict';

const should = require('should');
const elasticsearch = require('@elastic/elasticsearch');

const config = require('../testconfig').elasticsearch;

describe('98 - event-search - unit: used elasticsearch api calls', function() {
  this.timeout(20000);

  let client;

  before(() => {
    client = new elasticsearch.Client({
      node: config.node,
    });
  });

  describe('indices', () => {
    after(async () => {
      try {
        await client.indices.delete({
          index: '99_elasticsearch_created_index'
        });
      } catch(e) {}
      try {
        await client.indices.delete({
          index: '99_elasticsearch_index_to_delete'
        });
      } catch(e) {}
    });

    it('create an index', async () => {
      const result = await client.indices.create({
        index: '99_elasticsearch_created_index'
      });

      result.statusCode.should.equal(200);

      result.body.acknowledged.should.equal(true);
      result.body.index.should.equal('99_elasticsearch_created_index');
    });

    it('delete an index', async () => {
      await client.indices.create({
        index: '99_elasticsearch_index_to_delete'
      });

      const result = await client.indices.delete({
        index: '99_elasticsearch_index_to_delete'
      });

      result.statusCode.should.equal(200);
      result.body.should.eql({
        acknowledged: true
      });
    });
  });

  describe('aliases', () => {

    before(async () => {
      await client.indices.create({
        index: '99_elasticsearch_aliased_index'
      });
      await client.indices.refresh({
        index: '99_elasticsearch_aliased_index'
      });
    });

    after(async () => {
      for (const i of ['99_elasticsearch_ephemeral_aliased_index', '99_elasticsearch_aliased_index']) {
        try {
          await client.indices.delete({
            index: i
          });
        } catch(e) {}
      }
    });

    it('index exists', async () => {
      const whenExists = await client.indices.exists({
        index: '99_elasticsearch_aliased_index'
      });

      whenExists.body.should.equal(true);

      const whenNotExists = await client.indices.exists({
        index: 'somerandomindexname'
      });

      whenNotExists.body.should.equal(false);
    });

    it('create an alias with filter', async () => {
      const r = await client.indices.putAlias({
        index: '99_elasticsearch_aliased_index',
        name: '99_elasticsearch_aliased_alias',
        body: {
          filter: {
            term: { user : 'kimchy' }
          }
        }
      });

      r.statusCode.should.equal(200);
      r.body.should.eql({ acknowledged: true });
    });

    it('get an alias with filter', async () => {
      await client.indices.putAlias({
        index: '99_elasticsearch_aliased_index',
        name: '99_elasticsearch_aliased_alias_2',
        body: {
          filter: {
            term: { user : 'kimchy' }
          }
        }
      });

      const r = await client.indices.getAlias({
        name: '99_elasticsearch_aliased_alias_2'
      });

      r.statusCode.should.equal(200);
      r.body.should.eql({
        '99_elasticsearch_aliased_index': {
          aliases: {
            '99_elasticsearch_aliased_alias_2': {
              filter: {
                term: { user : 'kimchy' }
              }
            }
          }
        }
      });
    });

    it('an alias is deleted when index is deleted', async () => {
      let errorResponse;

      await client.indices.create({
        index: '99_elasticsearch_ephemeral_aliased_index'
      });

      await client.indices.putAlias({
        index: '99_elasticsearch_ephemeral_aliased_index',
        name: '99_elasticsearch_ghost_alias',
      });

      await client.indices.delete({
        index: '99_elasticsearch_ephemeral_aliased_index'
      });

      try {
        const r = await client.indices.getAlias({
          name: '99_elasticsearch_ghost_alias',
        });
      } catch (e) {
        errorResponse = e;
      }

      errorResponse.body.should.eql({
        error: 'alias [99_elasticsearch_ghost_alias] missing',
        status: 404
      });

      errorResponse.statusCode.should.equal(404);
    });

  });

  describe('bulk', () => {

    before(async () => {
      await client.indices.create({
        index: '99_elasticsearch_bulk'
      });

      await client.create({
        index: '99_elasticsearch_bulk',
        id: 99,
        body: {
          title: 'Machine à laver',
          description: 'Ongle'
        }
      });
    });

    after(async () => {
      await client.indices.delete({
        index: '99_elasticsearch_bulk'
      });
    });

    it('bulk index updates', async () => {
      await client.bulk({
        index: '99_elasticsearch_bulk',
        refresh: true,
        body: [{
          index: { _id: 99 }
        }, {
          title: 'Lombaires'
        }]
      });

      const doc = await client.get({
        index: '99_elasticsearch_bulk',
        id: 99
      }).then(r => r.body);

      doc._source.should.eql({
        title: 'Lombaires'
      });
    });

  });

  describe('document deletes', () => {

    before(async () => {
      await client.indices.create({
        index: '99_elasticsearch_doc_delete'
      });

      await client.bulk({
        index: '99_elasticsearch_doc_delete',
        refresh: true,
        body: [{
          create: { _id: 'one' }
        }, {
          title: 'I stay',
          set: '111'
        }, {
          create: { _id: 'two' }
        }, {
          title: 'I go',
          set: '123'
        }, {
          create: { _id: 'three' }
        }, {
          title: 'I stay',
          set: '111'
        }, {
          create: { _id: 'four' }
        }, {
          title: 'I go',
          set: '222'
        }]
      });
    });

    after(async () => {
      await client.indices.delete({
        index: '99_elasticsearch_doc_delete'
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
                  set: '111'
                }
              }
            }
          }
        }
      });
      result.body.deleted.should.equal(2);

      const docs = await client.search({
        index: '99_elasticsearch_doc_delete',
        body: {
          query: {
            match_all: {}
          }
        }
      }).then(r => r.body.hits.hits);

      docs.map(d => d._id).should.eql(['one', 'three'])

    });

  });

});
