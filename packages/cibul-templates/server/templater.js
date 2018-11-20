"use strict";

const path = require( 'path' );

const fs = require( 'fs' );

const allLabels = require( '@openagenda/labels/all' );

const makeLabelGetter = require( '@openagenda/labels/makeLabelGetter' );


module.exports = function ( templateName, data, cb ) {

  if ( typeof data == 'function' ) {

    cb = data;
    data = {};

  }

  log( 'loading template files for %s', templateName );

  var loaders = [
    _loadTemplate( templateName ),
    _loadLabels( data.lang ),
    _loadTranslator,
    _loadHelpers,
    _loadScripts( templateName, data.scriptsBase ),
  ];

  async.waterfall( loaders, function ( err, results ) {

    if ( err ) return cb( err );

    const layoutBottom = results.layoutConfig && results.layoutConfig.base && results.layoutConfig.base.bottom || {};
    const templateBottom = results.config.base && results.config.base.bottom || {};
    const dataBottom = data.bottom || {};

    data.bottom = {
      scripts: [
        ...layoutBottom.scripts || [],
        ...templateBottom.scripts || [],
        ...dataBottom.scripts || []
      ].filter( ( v, i, a ) => a.indexOf( v ) === i ),
      scriptSources: [
        ...layoutBottom.scriptSources || [],
        ...templateBottom.scriptSources || [],
        ...dataBottom.scriptSources || []
      ].filter( ( v, i, a ) => a.indexOf( v ) === i )
    };

    if ( results.config.base ) data = cn.extend( results.config.base, data );

    if ( results.layout && results.layoutConfig.base ) {

      data = cn.extend( results.layoutConfig.base, data );

    }

    if ( data.js && data.js.length ) {

      data.js = data.js.map( function ( jsName ) {
        return data.scriptsBase + '/' + jsName;
      } );

    } else {

      if ( results.config.js ) data.js = results.config.js;

    }

    if ( data.jsVersion ) {

      Object.keys( data.js || {} ).forEach( k => {

        data.js[ k ] = data.js[ k ] + ( data.js[ k ].indexOf( '?' ) === -1 ? '?' : '&' ) + 'v=' + data.jsVersion;

      } );

    }

    if ( results.helpers ) cn.extend( data, results.helpers );

    data._esc = _escape;

    data.__ = results.__;

    var templateRender = _renderTemplate( results.template, results.templateBody, data );

    if ( results.layout ) {

      templateRender = _renderTemplate( results.layout, results.layoutBody, data ).replace( '<!-- content -->', templateRender );

    }

    if ( data.env ) templateRender = _insertEnvironment( templateRender, data.env );

    cb( null, templateRender );

  } );

};

module.exports.disableFileCache = function () {

  cachedFs.disable();

  useCache = false;

}


var ejs = require( 'ejs' ),

  useCache = true,

  cachedFs = require( './cachedFs' ),

  readFile = cachedFs.readFile,

  cn = require( '../js/lib/common/common.mod.js' ),

  async = require( 'async' ),

  debug = require( 'debug' ),

  deepExtend = require( 'deep-extend' ),

  log = debug( 'templater' ),

  helpers = {};

function _renderTemplate( filename, templateBody, data ) {

  data.filename = filename;
  data.cache = useCache;

  return ejs.render( templateBody, data );

}

/**
 * prepare translator function used for template rendering
 */

function _loadTranslator( data, cb ) {

  let labels = _getLabels( data.config.labels );
  let templateLabelsPath = data.layoutConfig && data.layoutConfig.labels || null;
  let templateLabels = templateLabelsPath ? _getLabels( templateLabelsPath ) : {};

  let getLabel = makeLabelGetter( Object.assign( {}, labels, templateLabels ), 'en', 'en' );

  data.__ = ( label, values = {} ) => {

    let translation = getLabel( label, values, data.lang );

    if ( translation ) return translation;

    translation = label;

    if ( data.labels && data.labels[ label ] ) {

      translation = data.labels[ label ];

    }

    for ( var key in values ) {

      translation = translation.replace( key, values[ key ] );

    }

    return translation;

  };

  cb( null, data );

}

function _getLabels( path ) {
  if ( !path ) return null;

  let branches = path.split( '/' );
  let currentBranch;
  let currentPos = allLabels;

  while ( currentBranch = branches.shift() ) {

    if ( !branches.length ) {

      return currentPos[ currentBranch ];

    }

    currentPos = currentPos[ currentBranch ];

  }

  return null;
}


function _loadTemplate( templateName ) {

  return function ( cb ) {

    var baseTemplatePath = ( __dirname + '/../' + templateName ).replace( '.part', '' ),

      isPartial = templateName.substr( -5 ) === '.part',

      data = {
        name: templateName.replace( '.part', '' )
      };

    log( 'reading contents of %s', baseTemplatePath + '.config.json' );

    readFile( baseTemplatePath + '.config.json', function ( err, config ) {

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

      var files = [ async.apply( readFile, data.template ) ];

      if ( data.config.layout ) {

        data.layout = __dirname + '/../' + data.config.layout + '.ejs';

        files.push( async.apply( readFile, data.layout ) );

        files.push( async.apply( readFile, __dirname + '/../' + data.config.layout + '.config.json' ) );

      }

      async.parallel( files, function ( err, results ) {

        if ( err ) {

          log( 'Some template files could not be opened. Aborting' );

          return cb( err );

        }

        data.templateBody = results[ 0 ];

        if ( data.config.layout ) {

          data.layoutBody = results[ 1 ];

          data.layoutConfig = JSON.parse( results[ 2 ] );

        }

        cb( null, data );

      } );

    } );

  };

}


function _loadLabels( lang ) {

  return function ( data, cb ) {

    var files = [ data.name ];

    if ( data.config.layout ) files.push( data.config.layout );

    if ( !lang ) lang = 'fr';

    data.lang = lang;

    if ( lang === 'en' ) return cb( null, data );

    async.parallel( files.map( function ( name ) {

      const filePath = __dirname + '/../' + name + '.' + lang + '.json';

      if ( !fs.existsSync( filePath ) ) {

        log( 'File not found at %s. Ignoring.', filePath );

        return cb => cb( null, '{}' );

      }

      return async.apply( readFile, filePath );

    } ), function ( err, results ) {

      if ( err ) {

        log( 'File not found at %s. Ignoring.', err.path );

      }

      const labels = JSON.parse( results[ 0 ] || '{}' );

      if ( results.length > 1 ) cn.extend( labels, JSON.parse( results[ 1 ] || '{}' ) );

      data.labels = labels;

      cb( null, data );

    } );

  };

}


function _loadHelpers( data, cb ) {

  if ( !data.config.helpers ) return cb( null, data );

  var helpersConfig = {
    lang: data.lang ? data.lang : 'fr',
    timezone: data.timezone ? data.timezone : '+0200'
  }

  data.helpers = {};

  for ( var name in data.config.helpers ) {

    if ( !helpers[ name ] ) {

      helpers[ name ] = require( __dirname + '/../helpers/' + data.config.helpers[ name ] );

    }

    data.helpers[ name ] = helpers[ name ]( helpersConfig );

  }

  cb( null, data );

}


function _loadScripts( templateName, scriptsBase ) {

  var basePath = scriptsBase ? scriptsBase : '';

  return function ( data, cb ) {

    var isTemplateJs = data.config.js === true;

    if ( !data.config.js || data.config.js === true ) data.config.js = [];

    if ( data.layoutConfig && data.layoutConfig.js === true ) {

      data.config.js.push( basePath + '/' + cn.toCamelCase( data.config.layout.replace( /\//g, '_' ) ) + '.js' );

    }

    if ( isTemplateJs ) {

      data.config.js.push( basePath + '/' + cn.toCamelCase( templateName.replace( /\//g, '_' ) ) + '.js' );

    }

    cb( null, data );

  };

}

function _insertEnvironment( render, environment ) {

  return render.replace( '<head>', '<head><script type="text/javascript">window.env="' + environment + '"</script>' );

}

function _escape( html ) {

  return String( html )
    .replace( /&/g, '&amp;' )
    .replace( /</g, '&lt;' )
    .replace( />/g, '&gt;' )
    .replace( /'/g, '&#39;' )
    .replace( /"/g, '&quot;' );

};
