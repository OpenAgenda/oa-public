exports.buildEsQuery = buildEsQuery;
exports.cleanSearch = cleanSearch;

// in-controller promise functions
exports.prepareEvents = prepareEvents;


var lib = require( '../lib' ),

cmn = require( '../commons-app' ),

model = cmn.getCibulModel(),

w = require( 'when' ),

async = require( 'async' );


/**
 * clean request search parameters to make things neat and tidy for elasticsearch
 */

function cleanSearch( req, res, next ) {

  if ( !req.query.search ) {

    next();

    return;

  }

  // clean request search parameters

  req.cleanSearch = lib.filterByAttr( 
    req.query.search ? req.query.search : {}, 
    [ 'what', 'when', 'radius', 'lng', 'lat', 'type', 'page', 'order', 'passed', 'neLat', 'neLng', 'swLat', 'swLng', 'tags', 'category', 'location', 'org' ]
  );

  if ( !req.cleanSearch.what ) {

    delete req.cleanSearch.what;

  }

  if ( req.cleanSearch.when ) {

    req.cleanSearch.when = req.cleanSearch.split( ',' );

  } else if ( req.query.search.from ) {

    req.cleanSearch.when = [ req.query.search.from ];

    if ( req.query.search.to && ( req.query.search.to !== req.query.search.from ) ) {

      req.cleanSearch.when.push( req.query.search.to );

    }

  }

  if ( req.cleanSearch.tags && ( typeof req.cleanSearch.tags == 'string' ) ) {

    req.cleanSearch.tags = [ req.cleanSearch.tags ];

  }

  if ( req.cleanSearch.order && ( [ 'proximity', 'update', 'upcoming' ].indexOf() == -1 ) ) {

    delete req.cleanSearch.order;

  }

  next();

}



/**
 * from clean search, build elasticsearch queru
 */

function buildEsQuery( limit ) {

  return function( req, res, next ) {

    var page, when;

    req.esQuery = {
      options : {
        from : 0,
        size : limit,
        order : [ 'upcoming' ]
      },
      when : {
        type : 'upcoming'
      }
    }

    page = req.query.page ? parseInt( req.query.page, 10 ) : 1;

    req.esQuery.options.from = ( page - 1 ) * limit;

    if ( !req.query.search ) {

      next();

      return;

    }

    when = req.cleanSearch.when ? req.cleanSearch.when : [];

    // prepare elasticsearch query, first 'what'

    if ( req.cleanSearch.what ) {

      req.esQuery.what = req.cleanSearch.what;

    }


    // then "when"

    if ( when.length == 1 ) {

      req.esQuery.when = {
        type: 'date',
        value: new Date( when[0] ).toJSON()
      };

    } else if ( when.length == 2 ) {

      req.esQuery.when = {
        type: 'period',
        value: {
          start: new Date( when[0] ).toJSON(),
          end: new Date( when[1] ).toJSON()
        }
      };

    } else if ( req.cleanSearch.passed == '1' ) {

      delete req.esQuery.when;

    }


    // agenda tags
    
    if ( req.cleanSearch.tags ) {

      req.esQuery.tags = req.cleanSearch.tags;

    }


    // agenda category
    
    if ( req.cleanSearch.category ) {

      req.esQuery.category = req.cleanSearch.category;

    }

    // agenda organizer
    
    if ( req.cleanSearch.org ) {

      req.esQuery.org = req.cleanSearch.org;

    }


    // then "where"

    if ( req.cleanSearch.location ) {

      req.esQuery.location = req.cleanSearch.location;

    } else if ( req.cleanSearch.lat && req.cleanSearch.lng && req.cleanSearch.radius ) {

      req.esQuery.where = {
        distance: req.cleanSearch.radius + 'km',
        value: [
          parseFloat( req.cleanSearch.lng ),
          parseFloat( req.cleanSearch.lat )
        ]
      };

    } else if ( req.cleanSearch.neLat && req.cleanSearch.neLng && req.cleanSearch.swLat && req.cleanSearch.swLng ) {

      req.esQuery.where = {
        neLat: req.cleanSearch.neLat,
        neLng: req.cleanSearch.neLng,
        swLat: req.cleanSearch.swLat,
        swLng: req.cleanSearch.swLng
      }

    }


    // then "order"
    
    if ( req.cleanSearch.order ) {

      req.esQuery.order = [ req.cleanSearch.order ];

    }

    next();

  }

}


/**
 * format events resulting of a search to be all prettied up for a render
 *
 * @param result   result of the search or query preceding this
 */

function prepareEvents( result ) {

  if ( lib.isArray( result ) ) {

    result = {
      data: result[0],
      total: result[1]
    };

  }

  return w.promise( function( resolve, reject ) {

    async.eachSeries( result.data, function( event, ecb ) {

      var inst = model.events().instance( event );

      if ( inst.reviewId ) {

        inst.getAgendaTags( function( err, tags ) {

          if ( err ) return ecb( err );

          _prepareEventItem( event, inst, tags, ecb );

        } );

      } else {

        _prepareEventItem( event, inst, false, ecb );

      }
      

    }, function( err ) {

      if ( err ) return reject( err );

      resolve( [ result.data, result.total ] );

    });

  });
      
}

function _prepareEventItem( event, inst, tags, ecb ) {

  lib.extend( event, {
    dateRange: inst.getDateRange( true ),
    closestDate: inst.getClosestDate(),
    title: inst.getTitle(),
    image: inst.getImage( false ),
    thumbnail: inst.getThumbnail( false ),
    description: inst.getDescription(),
    placeName: event.locations ? event.locations[0].name : false,
    organization: event.organization ? { slug: event.organizationSlug, label: event.organization } : false
  });

  event.tags = tags ? tags : [];

  ecb();

}