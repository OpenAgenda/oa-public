"use strict";

const _ = require( 'lodash' );
const config = require( '../testconfig' );
const elasticsearch = require( 'elasticsearch' );
const ih = require( 'immutability-helper' );
const serviceConfig = require( '../service/config' );
const should = require( 'should' );

const service = require( '../' );
const getMoreLikeThis = require( '../service/helpers/dsl/getMoreLikeThis' );
const wrapInMoreLikeThis = require( '../service/helpers/dsl/wrapInMoreLikeThis' );

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
          id: item.id,
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
              min_doc_freq: 1 // WOOOHOOO! Tests on small datasets need this
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
      } ) ).hits.total.should.greaterThanOrEqual( 2 );

    } );

    describe( 'like with docs', () => {

      const _searchNotes = _getSearchResult.bind( null, client, 'simple_more_like_this', 'notes' );

      it( 'array of keywords does not match in doc search', async () => {

        const result = await _searchNotes( {
          query: {
            mlt: {
              fields: [ 'tags' ],
              min_term_freq: 1,
              min_doc_freq: 1,
              like: [ {
                doc: {
                  tags: 'masdar'
                }
              } ]
            }
          }
        } )

        _getIds( result ).should.eql( [] );

      } );

      it( 'array of keywords matches plain text', async () => {

        const result = await _searchNotes( {
          query: {
            mlt: {
              fields: [ 'tags' ],
              min_term_freq: 1,
              min_doc_freq: 1,
              like: [ 'masdar' ]
            }
          }
        } );

        _getIds( result ).should.eql( [ 2 ] );

      } );

      it( 'mixture of input docs bring more results', async () => {

        const result = await _searchNotes( {
          query: {
            mlt: {
              fields: [ 'tags', 'note', 'place.name' ],
              min_term_freq: 1,
              min_doc_freq: 1,
              like: [ {
                doc: {
                  note: 'masdar',
                  place: {
                    name: 'masdar'
                  }
                }
              }, 'masdar' ]
            }
          }
        } );

        _getIds( result, true ).forEach( id => {

          // results vary.
          id.should.equalOneOf( [ 1, 2, 3, 4 ] )

        } );

      } );

      it( 'boosting terms in mlt', async () => {

        const mltQuery = {
          query: {
            dis_max: {
              queries: [ {
                mlt: {
                  fields: [ 'note' ],
                  min_term_freq: 1,
                  min_doc_freq: 1,
                  like: 'masdar'
                }
              }, {
                mlt: {
                  boost: 20,
                  fields: [ 'place.name' ],
                  min_term_freq: 1,
                  min_doc_freq: 1,
                  like: 'masdar'
                }
              }, {
                mlt: {
                  boost: 30,
                  fields: [ 'tags' ],
                  min_term_freq: 1,
                  min_doc_freq: 1,
                  like: 'masdar'
                }
              } ]
            }
          }
        };

        _getIds( await _searchNotes( mltQuery ) ).should.eql( [ 2, 4, 3, 1 ] );

      } );


      it( 'mlt query can be filtered', async () => {

        const result = await _searchNotes( {
          query: {
            bool: {
              must: {
                mlt: {
                  fields: [ 'tags', 'note', 'place.name' ],
                  min_term_freq: 1,
                  min_doc_freq: 1,
                  like: [ {
                    doc: {
                      note: 'masdar',
                      place: {
                        name: 'masdar'
                      }
                    }
                  }, 'masdar' ]
                }
              },
              filter: {
                term: {
                  category: 'one'
                }
              }
            }
          }
        } );

        _getIds( result, true ).should.eql( [ 1, 2 ] );

      } );


      // this does not return constant result orders
      /*it( 'mlt query returns results sorted by scoring', async () => {

        // 5 has yup all over it
        _getIds( await _searchNotes( {
          query: {
            mlt: {
              fields: [ 'tags', 'place.name', 'note' ],
              min_term_freq: 1,
              min_doc_freq: 1,
              like: 'yup'
            }
          }
        } ) )[ 0 ].should.equal( 5 );

      } );*/


      it( 'mlt result count is limited to 10 by default', async () => {

        _getIds( await _searchNotes( {
          query: {
            mlt: {
              fields: [ 'tags', 'place.name', 'note' ],
              min_term_freq: 1,
              min_doc_freq: 1,
              like: 'yup'
            }
          }
        } ) ).length.should.equal( 10 );

      } );



      it( 'mlt can be filtered', async () => {

        _getIds( await _searchNotes( {
          query: {
            bool: {
              must: {
                mlt: {
                  fields: [ 'note' ],
                  min_term_freq: 1,
                  min_doc_freq: 1,
                  like: 'yup'
                }
              },
              filter: {
                term: {
                  category: 'one'
                }
              }
            }
          }
        } ), true ).should.eql( [ 1, 2 ] )

      } );


      it( 'mlt can be retrieved based on given document ids', async () => {

        ( await _searchNotes( {
          query: {
            mlt: {
              fields: [ 'place.name' ],
              min_term_freq: 1,
              min_doc_freq: 1,
              like: [ {
                _id: 1
              } ]
            }
          }
        } ) ).hits.hits[ 0 ]._source.id.should.equal( 2 );

      } );


    } );

  } );


  describe( 'on event-like mapping', () => {

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
        eventsList,
        extensions: {
          custom: {
            multichoicefield: {
              type: 'integer'
            },
            singlechoicefield: {
              type: 'integer'
            },
            sometextfield: {
              type: 'text'
            }
          }
        }
      } );

      indiceName = Object.keys( await serviceConfig.client.indices.getAlias( { name: 'more_like_this' } ) )[ 0 ];

    } );

    it( 'this returns events with Paris in internal full address field', async () => {

      const result = await dslSearch( 'more_like_this', {
        query: {
          more_like_this: {
            fields: [ 'search_internals_full_address_text' ],
            min_term_freq: 1,
            min_doc_freq: 1,
            like: [ {
              doc: {
                search_internals_full_address_text: 'Paris'
              }
            } ]
          }
        }
      } );

      result.events[ 0 ].search_internals_full_address_text.indexOf( 'Paris' ).should.not.equal( -1 );

    } );


    it( 'custom optioned type can be more liked this as a keyword', async () => {

      const { events } = await dslSearch( 'more_like_this', {
        query: {
          more_like_this: {
            fields: [ 'custom.search_internals_keywords' ],
            min_word_length: 3,
            min_term_freq: 1,
            min_doc_freq: 1,
            like: [ {
              doc: {
                custom: {
                  search_internals_keywords: 'key4'
                }
              }
            } ]
          }
        }
      } );

      events.length.should.equal( 1 );

      events[ 0 ].uid.should.equal( 1111 );

    } );


    it( 'custom optioned type doesn\'t match for different option ids', async () => {

      const { events } = await dslSearch( 'more_like_this', {
        query: {
          more_like_this: {
            fields: [ 'custom.search_internals_keywords' ],
            min_term_freq: 1,
            min_doc_freq: 1,
            like: [ {
              doc: {
                custom: {
                  search_internals_keywords: 'id-40'
                }
              }
            } ]
          }
        }
      } );

      events.length.should.equal( 0 );

    } );

    it( 'custom optioned type doesn\'t match for different option ids', async () => {

      const { events } = await dslSearch( 'more_like_this', {
        query: {
          mlt: {
            fields: [ 'custom.search_internals_keywords' ],
            min_term_freq: 1,
            min_doc_freq: 1,
            min_word_length: 3,
            like: [ {
              doc: {
                custom: {
                  // more like this workds with texts and integers only
                  // so when an event is given as basis of mlt,
                  // with custom data, the schema must be known
                  // and the custom data must be mltd with search_internals_keywords
                  // of custom extension.
                  search_internals_keywords: [ 'key4', 'key12', 'key10' ]
                }
              }
            } ]
          }
        }
      } );

      events.length.should.equal( 2 );

      events.map( e => e.uid ).should.eql( [ 1111, 2222 ] );

    } );


    it( 'this returns upcoming events with Paris in full address field', async () => {

      // All events Meuse are in the past
      ( await dslSearch( 'more_like_this', {
        query: {
          bool: {
            must: {
              more_like_this: {
                fields: [ 'search_internals_full_address_text' ],
                min_term_freq: 1,
                min_doc_freq: 1,
                like: [ {
                  doc: {
                    search_internals_full_address_text: 'Meuse'
                  }
                } ]
              }
            },
            filter: {
              range: {
                search_internals_last_timing: {
                  gte: 'now-1d/d'
                }
              }
            }
          }
        }
      } ) ).events.length.should.equal( 0 );

      // one event in paris is in the future
      ( await dslSearch( 'more_like_this', {
        query: {
          bool: {
            must: {
              more_like_this: {
                fields: [ 'search_internals_full_address_text' ],
                min_term_freq: 1,
                min_doc_freq: 1,
                like: [ {
                  doc: {
                    search_internals_full_address_text: 'Paris'
                  }
                } ]
              }
            },
            filter: {
              range: {
                search_internals_last_timing: {
                  gte: 'now-1d/d'
                }
              }
            }
          }
        }
      } ) ).events.length.should.equal( 1 );

    } );


    it( 'get an event given another.', async () => {

      const { events } = await dslSearch( 'more_like_this', {
        query: {
          mlt: {
            fields: [ 'location.department' ],
            min_term_freq: 1,
            min_doc_freq: 1,
            like: [ {
              _id: 1111 // the uid
            } ]
          }
        }
      } );

      events.length.should.equal( 1 );

      events[ 0 ].uid.should.equal( 2222 );

    } );


    it( 'sort and source keys belong on the root', async () => {

      const moreLikeThisQuery = {
        query: {
          bool: {
            must: {
              more_like_this: {
                fields: [ 'search_internals_full_address_text' ],
                min_term_freq: 1,
                min_doc_freq: 1,
                like: [ {
                  doc: {
                    search_internals_full_address_text: 'Paris'
                  }
                } ]
              }
            },
            filter: {
              /*range: {
                search_internals_last_timing: {
                  gte: 'now-1d/d'
                }
              }*/
            }
          }
        },
        _source: {
          excludes: [ 'search_internals_*', 'timings.search_internals_*' ],
          includes: [ 'uid' ]
        }
      };

      const { events } = await dslSearch( 'more_like_this', moreLikeThisQuery );

      events.map( e => e.uid ).should.eql( [ 1111, 2222 ] );

      Object.keys( events[ 0 ] ).should.eql( [ 'uid' ] );

      const { events: sortedEvents } = await dslSearch( 'more_like_this', ih( moreLikeThisQuery, {
        sort: {
          $set: [ {
            uid: {
              order: 'desc'
            }
          } ]
        }
      } ) );

      sortedEvents.map( e => e.uid ).should.eql( [ 2222, 1111 ] );

    } );


  } );

  describe( 'getMoreLikeThis parsing function', () => {

    it( 'keywords search maps to search_internals_keywords_text', () => {

      const mlt = getMoreLikeThis( {
        keywords: {
          fr: [ 'vin chaud' ]
        }
      } );

      mlt.should.eql( {
        fields: [ 'search_internals_keywords_text' ],
        min_word_length: 3,
        min_term_freq: 1,
        min_doc_freq: 1,
        like: [ {
          doc: {
            search_internals_keywords_text: 'vin chaud'
          }
        } ]
      } );

    } );

    it( 'custom optioned data maps to a single array of internal custom keywords or text fields', () => {

      const mlt = getMoreLikeThis( {
        custom: {
          multichoicefield: [ 12, 13 ],
          singlechoicefield: 4,
          sometextfield: 'compteur de flotte numérique'
        }
      } );

      mlt.should.eql( {
        "fields": [
          "custom.search_internals_keywords",
          "custom.sometextfield"
        ],
        "min_word_length": 3,
        "min_term_freq": 1,
        "min_doc_freq": 1,
        "like": [
          {
            "doc": {
              "custom": {
                "search_internals_keywords": [
                  'key12', 'key13', 'key4'
                ],
                "sometextfield": "compteur de flotte numérique"
              }
            }
          }
        ]
      } );

    } );


    it( 'multilingual keywords maps to multiple like statements', () => {

      const mlt = getMoreLikeThis( {
        keywords: {
          fr: [ 'vin chaud' ],
          en: [ 'hot wine' ]
        }
      } );

      mlt.like.length.should.equal( 2 );

    } );


    it( 'department distributes over all likes', () => {

      const mlt = getMoreLikeThis( {
        title: {
          fr: 'Un titre',
          en: 'A title'
        },
        location: {
          department: 'Meuse'
        }
      } );

       mlt.like.forEach( l => {

         l.doc.search_internals_full_address_text.should.equal( 'Meuse' );

       } );

    } );


    it( 'location fields pile up in same like field', () => {

      const mlt = getMoreLikeThis( {
        location: {
          region: 'Grand Est',
          department: 'Meuse',
          city: 'Verdun'
        }
      } );

      mlt.like[ 0 ].doc.search_internals_full_address_text.should.equal( 'Verdun Meuse Grand Est' );

    } );

  } );


  describe( 'wrapInMoreLikeThis parsing function', () => {

    it( 'keywords search maps to search_internals_keywords_text', () => {

      const dsl = wrapInMoreLikeThis( {
        keywords: {
          fr: [ 'vin chaud' ],
          en: []
        }
      } );

      dsl.query.should.eql( {
        mlt: {
          fields: [ 'search_internals_keywords_text' ],
          min_word_length: 3,
          min_term_freq: 1,
          min_doc_freq: 1,
          like: [ {
            doc: {
              search_internals_keywords_text: 'vin chaud'
            }
          } ]
        }
      } );

    } );


    it( 'custom optioned data maps to a single array of internal custom keywords or text fields', () => {

      const dsl = wrapInMoreLikeThis( {
        custom: {
          multichoicefield: [ 12, 13 ],
          singlechoicefield: 4,
          sometextfield: 'compteur de flotte numérique'
        }
      } );

      dsl.query.should.eql( {
        mlt: {
          fields: [
            "custom.search_internals_keywords",
            "custom.sometextfield"
          ],
          "min_word_length": 3,
          "min_term_freq": 1,
          "min_doc_freq": 1,
          "like": [
            {
              "doc": {
                "custom": {
                  "search_internals_keywords": [
                    'key12', 'key13', 'key4'
                  ],
                  "sometextfield": "compteur de flotte numérique"
                }
              }
            }
          ]
        }
      } );

    } );

    it( 'custom optioned data with field boost spreads query on a dis_max', () => {

      const dsl = wrapInMoreLikeThis( {
        custom: {
          multichoicefield: [ 12, 13 ],
          singlechoicefield: 4,
          sometextfield: 'compteur de flotte numérique'
        }
      }, {
        boost: {
          "custom.multichoicefield": 10,
          "custom.singlechoicefield": 20
        }
      }, {} );

      dsl.query.should.eql( {
        "dis_max": {
          "queries": [
            {
              "mlt": {
                "fields": [
                  "custom.search_internals_keywords"
                ],
                "min_word_length": 3,
                "min_term_freq": 1,
                "min_doc_freq": 1,
                "like": [
                  {
                    "doc": {
                      "custom": {
                        "search_internals_keywords": [
                          "key12",
                          "key13"
                        ]
                      }
                    }
                  }
                ],
                "boost": 10
              }
            },
            {
              "mlt": {
                "fields": [
                  "custom.search_internals_keywords"
                ],
                "min_word_length": 3,
                "min_term_freq": 1,
                "min_doc_freq": 1,
                "like": [
                  {
                    "doc": {
                      "custom": {
                        "search_internals_keywords": [
                          "key4"
                        ]
                      }
                    }
                  }
                ],
                "boost": 20
                }
              },
              {
                "mlt": {
                  "fields": [
                    "custom.search_internals_keywords",
                    "custom.sometextfield"
                  ],
                  "min_word_length": 3,
                  "min_term_freq": 1,
                  "min_doc_freq": 1,
                  "like": [
                    {
                      "doc": {
                        "custom": {
                          "search_internals_keywords": [
                            "key12",
                            "key13",
                            "key4"
                          ],
                          "sometextfield": "compteur de flotte numérique"
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
      } );

    } );

  } );


} );


function _getIds( result, sort = false ) {

  const ids = result.hits.hits.map( h => h._source.id );

  if ( !sort ) return ids;

  return ids.sort( ( a, b ) => a > b );

}

function _getSearchResult( client, index, type, body ) {

  // getMoreLikeThis

  return client.search( { type, index, body } );

}
