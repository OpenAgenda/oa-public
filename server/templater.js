module.exports = function( templateName, data, cb ) {

  if ( typeof data == 'function' ) {

    cb = data;
    data = {};

  }

  log('loading template files for %s', templateName);

  var loaders = [
    _loadTemplate( templateName ),
    _loadLabels( data.lang ),
    _loadHelpers,
    _loadScripts( templateName, data.scriptsBase ),
  ];

  async.waterfall(loaders, function( err, results ) {

    if (err) throw err; // because fuck it.

    var template = results.template, labels = results.labels;

    if ( results.config.base ) data = cn.extend(results.config.base, data);

    if ( results.layout && results.layoutConfig.base ) {

      data = cn.extend( results.layoutConfig.base, data );

    }

    if ( data.js ) {

      data.js = data.js.map( function( jsName ) { return data.scriptsBase + '/' + jsName; });

    } else {

      if ( results.config.js ) data.js = results.config.js;

    }

    if (results.helpers) cn.extend(data, results.helpers);

    data.__ = _loadTranslator( labels );

    data._esc = _escape;

    var templateRender = _renderTemplate( results.template, results.templateBody, data );

    if ( results.layout ) {

      templateRender = _renderTemplate(results.layout, results.layoutBody, data).replace( '<!-- content -->', templateRender );

    }

    if ( data.env ) templateRender = _insertEnvironment( templateRender, data.env );

    cb( null, templateRender );

  });

};


var ejs = require('ejs'),

fs = require('fs'),

cn = require('../js/lib/common/common.mod.js'),

async = require('async'),

debug = require('debug'),

deepExtend = require('deep-extend'),

log = debug('templater'),

helpers = {},

_renderTemplate = function( filename, templateBody, data ) {

  data.filename = filename;

  return ejs.render( templateBody, data );

},


/**
 * prepare translator function used for template rendering
 */

_loadTranslator = function( labels ) {

  return function(label, values) {

    if (!values) values = {};

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


_loadTemplate = function( templateName ) {

  return function( cb ) {

    var baseTemplatePath = ( __dirname + '/../' + templateName ).replace('.part', ''),

    isPartial = templateName.substr( -5 ) === '.part',

    data = {
      name: templateName.replace('.part', '')
    };

    log( 'reading contents of %s', baseTemplatePath + '.config.json' );

    fs.readFile( baseTemplatePath + '.config.json', 'utf-8', function( err, config ) {

      if ( err ) {

        log( 'could not read file at %s. Ignoring', baseTemplatePath + '.config.json' );

        data.config = {};

      } else {

        try {

          data.config = JSON.parse( config );
         
        } catch ( err ) {

          log( 'trouble parsing config file contents: %s', config );

          data.config = {};

        }

      }

      log( 'reading template file' );

      data.template = baseTemplatePath + ( isPartial ? '.part' : '' ) + '.ejs';

      if ( isPartial ) {

        data.config.layout = false;

      }

      var files = [async.apply( fs.readFile, data.template, 'utf-8' ) ];

      if ( data.config.layout ) {

        data.layout = __dirname + '/../' + data.config.layout + '.ejs';

        files.push( async.apply( fs.readFile, data.layout, 'utf-8') );

        files.push( async.apply( fs.readFile, __dirname + '/../' + data.config.layout + '.config.json', 'utf-8' ) );

      }

      async.parallel( files, function( err, results ) {

        if ( err ) {

          log( 'Some template files could not be opened. Aborting' );

          return cb( err );

        }

        data.templateBody = results[0];

        if ( data.config.layout ) {

          data.layoutBody = results[1];

          data.layoutConfig = JSON.parse( results[2] );

        }

        cb(null, data);

      });

    });

  };

},


_loadLabels = function( lang ) {

  return function( data, cb ) {

    var files = [ data.name ];

    if ( data.config.layout ) files.push( data.config.layout );

    if ( !lang ) lang = 'fr';

    data.lang = lang;

    if ( lang === 'en' ) return cb( null, data );

    async.parallel( files.map( function ( name ) { 

      return async.apply( fs.readFile, __dirname + '/../' + name + '.' + lang + '.json', 'utf-8' ); 

    }), function ( err, results ) {

      var labels = {};

      if ( err ) {

        log( 'File not found at %s. Ignoring.', err.path );

      } else {

        labels = JSON.parse( results[0] );

      }

      console.log( results );

      if ( results.length > 1 ) cn.extend(labels, JSON.parse( results[1] ) );

      data.labels = labels;

      cb( null, data );

    });

  };

},

_loadHelpers = function( data, cb ) {

  if ( !data.config.helpers ) return cb( null, data );

  var helpersConfig = {
    lang: data.lang ? data.lang : 'fr',
    timezone: data.timezone ? data.timezone : '+0200'
  }

  data.helpers = {};

  for ( var name in data.config.helpers ) {

    if ( !helpers[ name ] ) {

      helpers[name] = require( __dirname + '/../helpers/' + data.config.helpers[name] );

    }

    data.helpers[name] = helpers[name]( helpersConfig );

  }

  cb( null, data );

},


_loadScripts = function( templateName, scriptsBase ) {

  var basePath = scriptsBase ? scriptsBase : '';

  return function( data, cb ) {

    if ( !data.config.js ) data.config.js = [];

    if ( data.layoutConfig && data.layoutConfig.templateJs ) {

      data.config.js.push( basePath + '/' + cn.toCamelCase( data.config.layout.replace(/\//g, '_') ) + '.js' );

    }

    if ( data.config.templateJs ) {

      data.config.js.push( basePath + '/' + cn.toCamelCase( templateName.replace(/\//g, '_') ) + '.js' );

    }

    cb( null, data );

  };

},

_insertEnvironment = function( render, environment ) {

  return render.replace( '<head>', '<head><script type="text/javascript">window.env="' + environment + '"</script>' );

},

_escape = function( html ) {

  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');

};