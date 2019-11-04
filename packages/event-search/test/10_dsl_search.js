"use strict";

const _ = require('lodash');
const should = require( 'should' );

const config = require( '../testconfig' );
const runDSLQuery = require('../service/helpers/runDSLQuery');
const events = require( '@openagenda/events/test/service' );
const moment = require( 'moment-timezone' );
const Service = require( '../' );


describe( 'event-search - unit: dsl search', function() {

  describe( 'simple search', function() {

    let service, dslSearch;

    this.timeout(30000);

    before( done => {

      events.initAndLoad( config.eventService, [ {
        table: 'event',
        src: __dirname + '/service/event.data.sql'
      } ], { reset: true }, done );

    } );

    before( async () => {

      service = Service(config);

      dslSearch = runDSLQuery.bind(null, _.pick(service.getConfig(), ['client', 'type']));

      // list must be prepared to give all needed data
      // for index
      function eventsList( offset, limit ) {

        return events.list( offset, limit, {
          internal: true,
          detailed: true
        } ).then( r => r.events );

      }

      await service( 'simple_search' ).rebuild( {
        eventsList
      } );

    } );

    it( 'an event can be retrieved by uid', async () => {

      let dsl = {
        query: {
          term: {
            uid: 6
          }
        }
      };

      let { events, total } = await dslSearch( 'simple_search', dsl );

      total.should.equal( 1 );

      events[ 0 ].slug.should.equal( 'decouverte-du-handball-et-valorisation-du-mondial-de-handball' );

    } );

    it( 'several events can be retrieved by uid at once', async () => {

      let dsl = {
        query: {
          in: {
            uid: [ 6, 11 ]
          }
        }
      };

      let { events, total } = await dslSearch( 'simple_search', dsl );

      total.should.equal( 2 );

      events.map( e => e.slug ).should.eql( [
        'decouverte-du-handball-et-valorisation-du-mondial-de-handball',
        'serres-la-claranda-cafe-citoyen'
      ] );

    } );

    it( 'simple title search', async () => {

      let dsl = {
        query: {
          match: {
            search_internals_title: 'valorisation'
          }
        },
        _source: {
          excludes: [ 'search_internals_*' ]
        }
      };

      let { events, total } = await dslSearch( 'simple_search', dsl );

      total.should.equal( 1 );

      events[ 0 ].slug.should.equal( 'decouverte-du-handball-et-valorisation-du-mondial-de-handball' );

    } );

    it( 'simple english title search', async () => {

      let dsl = {
        query: {
          match: {
            search_internals_title: 'discovery'
          }
        },
        _source: {
          excludes: [ 'search_internals_*' ]
        }
      };

      let { events, total } = await dslSearch( 'simple_search', dsl );

      total.should.equal( 1 );

      events[ 0 ].slug.should.equal( 'decouverte-du-handball-et-valorisation-du-mondial-de-handball' );

    } );


    it( 'sorting can order by update timestamp', async () => {

      let dsl = {
        query: {
          match: {
            search_internals_title: 'Trié'
          }
        },
        sort: [ {
          updatedAt: {
            order: 'desc'
          }
        } ]
      };

      let { events, total } = await dslSearch( 'simple_search', dsl );

      total.should.equal( 5 );

      events.forEach( ( e, i ) => {

        if ( i > 0 ) {
          events[ i - 1 ].updatedAt.should.greaterThan( events[ i ].updatedAt );

        }

      } );

    } )


    it( 'sorting can show in order upcoming first and past second, then nearest from now first', async () => {

      let dsl = {
        query: {
          match: {
            search_internals_title: 'Trié'
          }
        },
        sort: [ {
          'timings.end' : {
            mode: 'min',
            order: 'asc',
            nested_path: 'timings',
            nested_filter: {
              range: { 'timings.end' : { gte: 'now' } }
            }
          }
        }, {
          search_internals_last_timing: { order: 'desc' }
        } ],
        _source: {
          excludes: [ 'search_internals_*' ]
        }
      };

      let { events, total } = await dslSearch( 'simple_search', dsl );

      total.should.equal( 5 );

      events.map( e => e.slug ).should.eql( [
        'nearest_in_the_future_0',
        'almost_furthest_in_the_future_1',
        'furthest_in_the_future_2',
        'nearest_past_event_3',
        'furthest_past_event_4'
      ] );

    } );


    it( 'match on title, description and keywords fields', async () => {

      let dsl = {
        query: {
          multi_match: {
            query: 'mississipi',
            fields: [ 'search_internals_title', 'search_internals_description', 'search_internals_keywords_text' ]
          }
        }
      };

      let { events, total } = await dslSearch( 'simple_search', dsl );

      events.map( e => e.slug ).should.eql( [ 'multi_1', 'multi_2', 'multi_3' ] );

    } );



    it( 'filtering by timing to show only events starting within a certain time bracket ( independant of date )', async () => {

      let dsl = {
        query: {
          bool: {
            must: [ {
              match: {
                search_internals_title: 'Horaires'
              },
            }, ],
            // doc: https://www.elastic.co/guide/en/elasticsearch/reference/current/query-filter-context.html
            filter: [ {
              nested: {
                path: 'timings',
                score_mode: 'min',
                query: {
                  range: {
                    'timings.search_internals_begin_from_midnight' : {
                      gte: 13*60*60,
                      lte: 17*60*60
                    }
                  }
                }
              }
            } ]
          }
        },
        _source: {
          // excludes does not go deep.
          excludes: [ 'search_internals_*', 'timings.search_internals_*' ]
        }
      };

      let { events, total } = await dslSearch( 'simple_search', dsl );

      total.should.equal( 1 );

      events.map( e => e.slug ).should.eql( [ 'one_timing_fits_within bracket' ] );

    } );


    it( 'date range is displayed in local time', async () => {

      let dsl = {
        query: {
          match: {
            search_internals_title: 'OtherTimezoneHoraires'
          }
        }
      };

      let { events, total } = await dslSearch( 'simple_search', dsl );

      events[ 0 ].dateRange.should.eql( {
        fr: 'Lundi 24 octobre 2016, 08h00',
        ar: 'الإثنين ٢٤ أكتوبر ٢٠١٦, 08:00',
        en: 'Monday 24 October 2016, 08:00'
      } );

    } );


    it( 'filtering by timing for a different timezone', async () => {

      // new york event happens at 2016-10-24T12:00:00.000Z
      // so thats -4 hours, should be 8 in the morning

      let dsl = {
        query: {
          bool: {
            must: [ {
              match: {
                search_internals_title: 'OtherTimezoneHoraires'
              },
            }, ],
            // doc: https://www.elastic.co/guide/en/elasticsearch/reference/current/query-filter-context.html
            filter: [ {
              nested: {
                path: 'timings',
                score_mode: 'min',
                query: {
                  range: {
                    'timings.search_internals_begin_from_midnight' : {
                      gte: 8*60*60,
                      lte: 8*60*60
                    }
                  }
                }
              }
            } ]
          }
        },
        _source: {
          // excludes does not go deep.
          excludes: [ 'search_internals_*', 'timings.search_internals_*' ]
        }
      };

      let { events, total } = await dslSearch( 'simple_search', dsl );

      total.should.equal( 1 );

      events.map( e => e.slug ).should.eql( [ 'new_york_event' ] );

    } );


    it( 'filtering by region ( same for location.department, city, countryCode )', async () => {

      let dsl = {
        query: {
          term: {
            "location.region" : "Auvergne-Rhône-Alpes"
          }
        }
      };

      let { events, total } = await dslSearch( 'simple_search', dsl );

      total.should.equal( 1 );

      events.map( e => e.slug ).should.eql( [ 'rhone_region_event' ] );

    } );


    it( 'filtering by geolocation', async () => {

      let dsl = {
        query: {
          geo_bounding_box: {
            search_internals_location: {
              top_left: {
                lat: 50,
                lon: 5
              },
              bottom_right: {
                lat: 49,
                lon: 5.5
              }
            }
          }
        }
      };

      let { events, total } = await dslSearch( 'simple_search', dsl )

      total.should.equal( 1 );

      events.map( e => e.slug ).should.eql( [ 'verdun_bound_box' ] );

    } );


    it( 'filtering by language', async () => {

      let dsl = {
        query: {
          term: {
            "search_internals_languages" : "de"
          }
        }
      }

      let { events, total } = await dslSearch( 'simple_search', dsl );

      total.should.equal( 1 );

      events.map( e => e.slug ).should.eql( [ 'german_event' ] );

    } );


    it( 'filtering by keyword', async () => {

      let dsl = {
        query: {
          term: {
            "search_internals_keywords" : "word"
          }
        }
      }

      let { events, total } = await dslSearch( 'simple_search', dsl );

      total.should.equal( 1 );

      events.map( e => e.slug ).should.eql( [ 'keyword_event' ] );

    } );

    it( 'filtering by multiple keywords', async () => {

      let dsl = {
        query: {
          bool: {
            must: [ {
              term: {
                search_internals_keywords: 'autre'
              }
            }, {
              term: {
                search_internals_keywords: 'clé'
              }
            } ]
          }
        }
      }

      let { events, total } = await dslSearch( 'simple_search', dsl );

      total.should.equal( 1 );

      events.map( e => e.slug ).should.eql( [ 'keyword_event_2' ] );

    } );


    it( 'filtering to keep events in between a timestamp bracket', async () => {

      const dsl = {
        query: {
          bool: {
            // doc: https://www.elastic.co/guide/en/elasticsearch/reference/current/query-filter-context.html
            filter: [ {
              nested: {
                path: 'timings',
                score_mode: 'min',
                query: {
                  range: {
                    'timings.begin' : {
                      gte: new Date( '2013-02-01' ),
                      lte: new Date( '2013-02-28' )
                    }
                  }
                }
              }
            } ]
          }
        }
      }

      let { events, total } = await dslSearch( 'simple_search', dsl );

      events.map( e => e.slug ).should.eql( [ 'bracketed_timestamp_1', 'bracketed_timestamp_2', 'bracketed_timestamp_3' ] );

    } );


    it( 'trasverse using scroll', async () => {

      let dsl = {
        query: {
          match_all: {}
        }
      }

      let fetchedCount = 0;

      let cacheFor = '1m';

      let { events, scrollId } = await dslSearch( 'simple_search', dsl, { scroll: cacheFor } );

      fetchedCount += events.length;

      events = ( await service('simple_search').search.scroll( scrollId, cacheFor ) ).events;

      fetchedCount += events.length;

      let result = await service('simple_search').search.scroll( scrollId, cacheFor );

      fetchedCount += result.events.length;

      fetchedCount.should.equal( result.total );

    } );


    it( 'search_after fails when nested sort is done on date ( BIGINT ERROR )', async () => {

      // minutes from beginning of time would suffice.

      let dsl = {
        query: {
          match_all: {}
        },
        sort: [ {
          'timings.end' : {
            mode: 'min',
            order: 'asc',
            nested_path: 'timings',
            nested_filter: {
              range: { 'timings.end' : { gte: 'now' } }
            }
          }
        }, {
          search_internals_last_timing: { order: 'desc' }
        } ]
      }

      let { events, total, searchAfter } = await dslSearch( 'simple_search', dsl );

      dsl[ 'search_after' ] = searchAfter;

      try {

        await dslSearch( 'simple_search', dsl );

      } catch ( err ) {

        err.message.should.equal( '[illegal_state_exception] No matching token for number_type [BIG_INTEGER]' );

      }

    } );


    it( 'from/size navigation works fine', async () => {

      let dsl = {
        from: 0,
        size: 5,
        query: {
          match_all: {}
        },
        sort: [ {
          'timings.end' : {
            mode: 'min',
            order: 'asc',
            nested_path: 'timings',
            nested_filter: {
              range: { 'timings.end' : { gte: 'now' } }
            }
          }
        }, {
          search_internals_last_timing: { order: 'desc' }
        } ]
      }

      let { events } = await dslSearch( 'simple_search', dsl );

      let fourth = events[ 3 ].uid;

      dsl.from = 3;

       events = ( await dslSearch( 'simple_search', dsl ) ).events;

      events[ 0 ].uid.should.equal( fourth );

    } );


  } );

} )
