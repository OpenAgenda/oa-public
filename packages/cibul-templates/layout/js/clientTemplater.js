"use strict";

var utils = require( '@openagenda/utils' ),

  remote = require( '../../js/lib/remote' ),

  store = require( 'store' ),

  ejs = require( 'ejs' ),

  useCache = true,

  routePrefix = '/templates/',

  storePrefix = 'templates:',

  i18n = require( './i18n' ),

  async = require( 'async' );


/**
 * load template from remote and render data
 */

module.exports = function ( templateName, options, cb ) {

  var params = {
      urls: {},          // urls to be used by genUrl
      lang: 'fr',        // language to use
      lastUpdate: false  // what is the last udpate time for templates
    },

    helpers = {},

    template,

    labels,

    init = function () {

      if ( !cb ) {

        cb = options;

        options = {};

      }

      if ( window.env == 'tpl' ) {

        routePrefix = '/';

        useCache = false;

      }

      utils.extend( params, options );

      _loadTemplate( templateName, params, function( err, t, l ) {

        if ( err ) return cb( err );

        template = t;

        labels = l;

        helpers = {
          __: i18n( labels ),
          genUrl: _loadGenUrl( params.urls )
        };

        cb( null, {
          render: render
        } );

      } );

    },

    render = function ( data ) {

      return ejs.render( template, utils.extend( data, helpers ) );

    };

  init();

};


/**
 * load template from remote or local store
 */

function _loadTemplate( name, options, cb ) {

  /*if ( options.lastUpdate ) {

    _checkAndClearTemplates( options.lastUpdate );

  }*/

  async.parallel( [
    async.apply( _loadEjs, name ),
    async.apply( _loadLabels, name, options.lang )
  ], function ( err, results ) {

    if ( err ) return cb( err );

    cb( null, results[ 0 ], results[ 1 ] );

  } );

}


/**
 * load labels from remote or local store
 */

function _loadLabels( name, lang, cb ) {

  var labels = {};

  if ( lang == 'en' ) return cb( null, labels );

  if ( store.enabled && useCache ) {

    labels = store.get( storePrefix + name + '.' + lang + '.json' );

    if ( labels ) return cb( null, labels );

  }

  _fetchAndStore( name + '.' + lang + '.json', true, cb );

}


/**
 * load ejs template
 */

function _loadEjs( name, cb ) {

  if ( store.enabled && useCache ) {

    var labels = store.get( storePrefix + name + '.ejs' );

    if ( labels ) return cb( null, labels );

  }

  _fetchAndStore( name + '.ejs', cb );

}


/**
 * fetch file from remote and store content in local storage
 */

function _fetchAndStore( filename, parse, cb ) {

  if ( !cb ) {

    cb = parse;

    parse = false;

  }

  remote.getXmlHttp( routePrefix + filename, { raw: true }, function ( responseType, content ) {

    if ( responseType !== 'success' ) return cb( responseType );

    if ( parse ) content = JSON.parse( content );

    if ( store.enabled && useCache ) {

      store.set( storePrefix + filename, content );

    }

    cb( null, content );

  } );


}


/**
 * load url generator
 */

function _loadGenUrl( urls ) {

  return function ( uri, values ) {

    if ( !urls[ uri ] ) return '#';

    return urls[ uri ];

  };

}


/**
 * check against lastUpdate value in store
 * clear all templates if outdated
 */

function _checkAndClearTemplates( lastUpdate ) {

  if ( !store.enabled ) return;

  if ( store.get( 'lastTemplateUpdate' ) >= lastUpdate ) return;

  store.forEach( function ( key, value ) {

    if ( key.indexOf( storePrefix ) !== -1 ) store.clear( key );

  } );

  store.set( 'lastTemplateUpdate', lastUpdate );

};
