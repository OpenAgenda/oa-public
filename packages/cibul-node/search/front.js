/**
 * site-wide event and agenda search pages
 */

var appName = 'search/front',

exposed = {
  load: load
},

routes = {
  searchEvents: [ 'get', searchEvents, '/events/search' ],
  searchAgendas: [ 'get', searchAgendas, '/agendas/search' ],
  latestEvents: [ 'get', latestEvents, '/events/latest' ],
  latestAgendas: [ 'get', latestAgendas, '/agendas/latest' ]
},

log = require( '../lib/logger' )( appName ),

async = require( 'async' ),

config = require( '../config' ),

w = require( 'when' ),

wn = require( 'when/node' ),

lib = require( '../lib/lib' ),

cmn = require( '../lib/commons-app' ),

es = require( 'ES' )( config.es ),

app,

path,

model = cmn.getCibulModel();


function init( p ) {

  log( 'initing' );

  path = p;

  cmn.registerRoutes( appName, path, routes);

  return exposed;

}


function load( main ) {

  if ( app ) {

    log( 'this app has already been loaded');

    return;

  }

  log( 'loading' );

  app = cmn.loadApp( main, path, appName );

  app.set( 'perPage', 20 );

  cmn.loadRoutes( app, routes, [
    cmn.urlGenSetter( appName, path ),
    cmn.loadSession,
    cmn.loadBaseData(),
    _cleanSearch
  ] );

  return exposed;

}


/**
 * controllers
 */

function searchEvents( req, res ) {

  if ( !req.cleanQuery || !lib.size( req.cleanQuery ) )  {

    return cmn.redirect( req, res, 'latestEvents' );

  }

  wn.call( es.events().search, req.searchParams )

  .then( _renderEvents( req, res, 'searchEvents' ) )

  .catch( _error( req, res) );

}


function latestEvents( req, res ) {

  wn.call( async.parallel, [
    async.apply( model.events().total ),
    async.apply( model.events().list, { 
      page : req.query.page ? req.query.page : 1, 
      limit : app.get( 'perPage' ) 
    } )
  ])

  .spread( function( total, data ) {

    return {
      total: total,
      data: data
    }

  } )

  .then( _renderEvents( req, res, 'latestEvents' ) )

  .catch( _error( req, res ) );

}

function searchAgendas( req, res ) {

  if ( !req.cleanQuery || !lib.size( req.cleanQuery ) )  {

    return cmn.redirect( req, res, 'latestAgendas' );

  }

  req.searchParams.deep = true;

  wn.call( es.reviews().search, req.searchParams )

  .then( _renderAgendas( req, res, 'searchAgendas' ) )

  .catch( _error( req, res ) );

}


function latestAgendas( req, res ) {

  wn.call( async.parallel, [
    async.apply( model.agendas().total, {
      upcoming : true
    } ),
    async.apply( model.agendas().list, {
      page : req.query.page ? req.query.page : 1,
      limit : app.get( 'perPage' ),
      upcoming : true
    } )
  ])

  .spread( function( total, data ) {

    return {
      total: total,
      data: data
    }

  } )

  .then( _renderAgendas( req, res, 'latestAgendas' ) )

  .catch( _error( req, res ) );

}




function _renderAgendas( req, res, uri ) {

  return function( result ) {

    result.data.forEach( function( agenda ) {

      lib.extend( agenda, {
        categories: [],
        locationInfo: ''
      });

    } );

    cmn.render( req, res, 'search/agendas', lib.extend(
      { agendas: result.data, searchRes: 'searchAgendas', search: req.cleanQuery },
      _pager( req, uri, result.total ) 
    ));

  }

}


function _renderEvents( req, res, uri ) {

  return function( result ) {

    result.data.forEach( function( event ) {

      // from db, date is loaded 

      var inst = model.events().instance( event );

      // each event item is extend with whatever is required by tem¶plate

      lib.extend( event, {
        dateRange: inst.getDateRange( true ),
        title: inst.getTitle(),
        thumbnail: inst.getThumbnail( false ),
        description: inst.getDescription(),
        placeName: event.locations ? event.locations[0].name : false
      });

    });

    cmn.render( req, res, 'search/events', lib.extend(
      { events: result.data, searchRes: 'searchEvents', search: req.cleanQuery },
      _pager( req, uri, result.total )
    ));

  };

}





/**
 * controller helpers
 */

function _error( req, res ) {

  return function( err ) {

    if ( typeof err === 'string' ) err = { message: err };

    cmn.errorResponse( req, res, err );

  };

}


function _cleanSearch( req, res, next ) {

  var possibleValues = {
    urlParams: ['what','when', 'radius', 'lng', 'lat', 'type', 'page', 'order', 'passed'],
    order: ['proximity', 'update', 'upcoming']
  };

  var query = req.query.search ? req.query.search : {},

  page = req.query.page ? parseInt( req.query.page, 10 ) : 1,

  params = {},

  error = [];

  lib.filterByAttr( query, possibleValues.urlParams );

  params.options = {
    from: ( page - 1 ) * app.get('perPage'),
    size: app.get('perPage')
  };

  params.what = query.what || null;

  if ( !query.what ) delete query.what;

  if ( query.lat || query.lng || query.distance )

    if ( query.lat && query.lng && query.distance )

      params.where = {
        distance: query.distance +'km',
        value: [parseFloat(query.lng), parseFloat(query.lat)]
      };

    else 

      error.push('request with geolocalization require "distance" param in km and also "lat" and "lon" params');  

  if ( query.when ) {

      var when = query.when.split( ',' );

      if ( when.length > 0 && when.length < 3 ) {

        if ( when.length == 1 ) {

          params.when = { 
            type: 'date',
            value: new Date(when.shift()).toJSON()
          };

        } else {

          params.when = {
            type: 'period',
            value: {
              start: new Date( when.shift() ).toJSON(),
              end: new Date( when.pop() ).toJSON()
            }
          }

        }
        
      }
  }


  if ( !params.when && !query.passed ) {

    params.when = { type:'upcoming' };
    
  }

  

  // getting Order option
   
  if ( query.order ) {

    if ( possibleValues.order.indexOf(query.order) < 0 )

      error.push('you sould specify the "order" param');

    else

      params.options.order = [query.order];

  }

  if( error.length ) return mw.errorResponse(req, res, error.join('\n'));

  req.searchParams = params;

  req.cleanQuery = query;

  next();

}

function _pager( req, routeName, totalItems ) {

  return {
    pager: {
      base: {},
      routeName: routeName,
      current: req.query.page || 1,
      total: totalItems,
      perPage: app.get( 'perPage' )
    }
  };

}


module.exports = init;