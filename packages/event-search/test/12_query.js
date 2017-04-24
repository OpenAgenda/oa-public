"use strict";

const should = require( 'should' );
const query = require( '../service/query' );

describe( 'event-search - unit: query.validate', function() {

  /**
   * oaq.uid ( one or more )
   * oaq.slug ( one or more )
   * oaq.search
   * oaq.keyword
   * oaq.lang
   * oaq.location_uid ( one or more )
   * oaq.region ( one or more )
   * oaq.department ( one or more )
   * oaq.city ( one or more )
   * oaq.countryCode ( one or more )
   * oaq.geo.topLeft.lat
   * oaq.geo.topLeft.lng
   * oaq.geo.bottomRight.lat
   * oaq.geo.bottomRight.lng
   * oaq.localTime.gte ( HHMMSS )
   * oaq.localTime.lte ( HHMMSS )
   * oaq.date.gte ( YYYY-MM-DDTHHmmss+tz )
   * oaq.date.lte ( YYYY-MM-DDTHHmmss+tz )
   */
  
  it( 'simple uid search dsl', () => {

    let dsl = query( { uid: 123 } );

    dsl.should.eql( {
      query: {
        term: {
          uid: 123
        }
      },
      sort: [ {
        'timings.end': {
          mode: 'min',
          order: 'asc',
          nested_path: 'timings',
          nested_filter: {
            range: {
              'timings.end': {
                gte: 'now'
              }
            }
          }
        }
      }, {
        search_internals_last_timing: {
          order: 'desc'
        }
      } ],
      _source: {
        excludes: [
          'search_internals_*',
          'timings.search_internals_*'
        ]
      }
    } );
  

  } );

  it( 'returns a deep version of query', () => {

    query.pre( {
      uid: 123,
      slug: 'the-slug',
      'date.gte' : '2017-05-21T12:00:00.000Z'
    } )

    .should.eql( {
      uid: 123,
      slug: 'the-slug',
      date: {
        gte: '2017-05-21T12:00:00.000Z'
      }
    } );

  } );
  

} );