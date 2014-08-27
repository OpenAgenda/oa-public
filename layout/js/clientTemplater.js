var cn = require('../../js/lib/common/common.mod.js'),

EJS = require('../../js/lib/clientEjs/ejs'),

remote = require('../../js/lib/remote/remote.mod.js'),

store = require('store'),

routePrefix = '/templates/',

storePrefix = 'templates:',

async = require('async');

module.exports = function( templateName, options, data, cb ) {

  var params = cn.extend({
    urls: {},          // urls to be used by genUrl
    lang: 'fr',        // language to use
    lastUpdate: false  // what is the last udpate time for templates
  }, options);

  if ( window.env == 'tpl' ) routePrefix = '/';

  loadTemplate( templateName, params, function( err, template, labels ) {

    if ( err ) return cb( err );

    var decorated = cn.extend({
      __: loadTranslator( labels ),
      genUrl: loadGenUrl( params.urls )
    }, data );

    cb( null, new EJS({ text: template }).render( decorated ));

  });

};


var loadTemplate = function( name, options, cb ) {

  if ( options.lastUpdate ) checkAndClearTemplates( options.lastUpdate );

  async.parallel([
    async.apply( loadEjs, name ),
    async.apply( loadLabels, name, options.lang )
  ], function( err, results ) {

    if ( err ) return cb( err );

    cb( null, results[0], results[1] );

  });

},

loadLabels = function( name, lang, cb ) {

  var labels = {};

  if ( lang == 'en' ) return cb( null, labels );

  if ( store.enabled ) {

    labels = store.get( storePrefix + name + '.' + lang + '.json');

    if ( labels ) return cb( null, labels );

  }

  fetchAndStore( name + '.' + lang + '.json', true, cb );

},

loadEjs = function( name, cb ) {

  if ( store.enabled ) {

    labels = store.get( storePrefix + name + '.ejs');

    if ( labels ) return cb( null, labels );

  }

  fetchAndStore( name + '.ejs', cb );

},

fetchAndStore = function( filename, parse, cb ) {

  if ( !cb ) {

    cb = parse;

    parse = false;

  }

  remote.getXmlHttp( routePrefix + filename, { raw: true }, function( responseType, content ) {

    if ( responseType !== 'success' ) return cb( responseType );

    if ( parse ) content = JSON.parse( content );

    if ( store.enabled ) {

      store.set( storePrefix + filename, content );

    }

    cb( null, content );

  });

  

},

loadGenUrl = function( urls ) {

  return function( uri, values ) {

    if ( !urls[ uri ] ) return '#';

    return urls[ uri ];

  };

},

loadTranslator = function( labels ) {

  return function( label, values ) {

    if ( !values ) values = {};

    var translation = label;

    if ( labels && labels[label] ) {

      translation = labels[label];

    }

    for (var key in values) {

      translation = translation.replace(key, values[key]);

    }

    return translation;

  };

},


/**
 * check against lastUpdate value in store
 * clear all templates if outdated
 */

checkAndClearTemplates = function( lastUpdate ) {

  if ( !store.enabled ) return;

  if ( store.get('lastTemplateUpdate') >= lastUpdate ) return;

  store.forEach(function( key, value ) {

    if ( key.indexOf( storePrefix ) !== -1 ) store.clear( key );

  });

  store.set('lastTemplateUpdate', lastUpdate );

};