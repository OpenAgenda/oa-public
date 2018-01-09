"use strict";

const _ = require( 'lodash' );
const config = require( '../testconfig' );
const elasticsearch = require( 'elasticsearch' );
const ih = require( 'immutability-helper' );
const serviceConfig = require( '../service/config' );
const should = require( 'should' );

const service = require( '../' );

const dslSearch = require( '../service/search' ).dsl;
const moreLikeThisData = require( './service/simpleMoreLikeThis.data' );
const moreLikeThisEvents = require( './service/moreLikeThisEvents.data' );

/*
https://www.elastic.co/guide/en/elasticsearch/reference/5.3/query-dsl-mlt-query.html
GET /_search
{
  "query": {
    "more_like_this" : {
      "fields" : ["name.first", "name.last"],
      "like" : [
      {
          "_index" : "marvel",
          "_type" : "quotes",
          "doc" : {
              "name": {
                  "first": "Ben",
                  "last": "Grimm"
              },
              "tweet": "You got no idea what I'd... what I'd give to be invisible."
            }
      },
      {
          "_index" : "marvel",
          "_type" : "quotes",
          "_id" : "2"
      }
      ],
      "min_term_freq" : 1,
      "max_query_terms" : 12
    }
  }
}
*/


describe( 'event-search - unit: more like this search', function() {

  this.timeout( 10000 );

  describe( 'on simple index', () => {

    let client = new elasticsearch.Client( JSON.parse( JSON.stringify( config.elasticsearch ) ) );

    before( async () => {

      const result = await client.indices.create( {
        index: 'simple_more_like_this',
        body: {
          mappings: {
            notes: {
              properties: {
                note: {
                  type: 'text',
                },
                category: {
                  type: 'keyword'
                },
                tags: {
                  type: 'keyword'
                },
                place: {
                  properties: {
                    name: {
                      type: 'text'
                    }
                  }
                }
              }
            }
          }
        }
      } );

    } );

    before( async () => {

      for( let item of moreLikeThisData ) {

        await client.index( {
          index: 'simple_more_like_this',
          refresh: true,
          type: 'notes',
          body: item
        } );

      }

    } );

    after( async () => {

      await client.indices.delete( {
        index: 'simple_more_like_this'
      } );

    } );

    it( 'matches text field content', async () => {

      ( await client.search( {
        type: 'notes',
        index: 'simple_more_like_this',
        body: {
          query: {
            match: {
              note: 'working'
            }
          }
        }
      } ) ).hits.total.should.equal( 3 );

      ( await client.search( {
        type: 'notes',
        index: 'simple_more_like_this',
        body: {
          query: {
            mlt: {
              fields: [ 'note' ],
              like: 'This is not working.',
              min_term_freq: 1,
              max_query_terms: 12,
              min_doc_freq: 1 // WOOOHOOO!
            }
          }
        }
      } ) ).hits.total.should.equal( 3 );

    } );

    it( 'works with keyword field too', async () => {

      ( await client.search( {
        type: 'notes',
        index: 'simple_more_like_this',
        body: {
          query: {
            mlt: {
              fields: [ 'category' ],
              like: 'plant',
              min_term_freq: 1,
              min_doc_freq: 1
            }
          }
        }
      } ) ).hits.total.should.equal( 2 );

    } );

    it( 'works on keywords inside arrays', async () => {

      ( await client.search( {
        type: 'notes',
        index: 'simple_more_like_this',
        body: {
          query: {
            mlt: {
              fields: [ 'tags' ],
              like: 'tree',
              min_term_freq: 1,
              min_doc_freq: 1
            }
          }
        }
      } ) ).hits.total.should.equal( 2 );

    } );

    it( 'works on sub-objects too', async () => {

      ( await client.search( {
        type: 'notes',
        index: 'simple_more_like_this',
        body: {
          query: {
            mlt: {
              fields: [ 'tags', 'place.name' ],
              like: 'masdar',
              min_term_freq: 1,
              min_doc_freq: 1
            }
          }
        }
      } ) ).hits.total.should.equal( 3 );

    } );

  } );

  describe( 'on event mapping', () => {

    this.timeout( 10000 );

    let indiceName;

    before( () => {

      service.init( config );

    } );

    before( async () => {

      // list must be prepared to give all needed data
      // for index
      function eventsList( offset, limit ) {

        return new Promise( rs => rs( moreLikeThisEvents.slice( offset, offset + limit ) ) );

      }

      await service( 'more_like_this' ).rebuild( {
        eventsList
      } );

      indiceName = Object.keys( await serviceConfig.client.indices.getAlias( { name: 'more_like_this' } ) )[ 0 ];

    } );

    it( 'this returns nothing', async () => {

      const result = await dslSearch( 'more_like_this', {
        query: {
          more_like_this: {
            fields: [ 'search_internals_full_address_text' ],
            like: [ {
              _index : indiceName, // alias should suffice here
              _type : 'event',
              doc: {
                search_internals_full_address_text: 'Paris'
              }
            } ],
            min_term_freq: 1
          }      }
      } );
   
    } );

  } );

} );