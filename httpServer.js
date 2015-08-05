var http = require( 'http' ),

url = require( 'url' ),

st = require( 'st' ),

sass = require( 'node-sass' ),

sassDestFile = '/build/sass/tmp.css',

templater = require( './server/templater.js' ),

p = require( './server/promises' ),

mountStatic = st( { path: __dirname , url: '/', cache: false } ),

cn = require('./js/lib/common/common.mod.js'),

async = require( 'async' ),

deepExtend = require( 'deep-extend' ),

browserify = require( 'browserify' ),

stringify = require( 'stringify' ),

reactify = require( 'reactify' ),

fs = require( 'fs' ),

debug = require( 'debug' ),

map = JSON.parse( fs.readFileSync( __dirname + '/map.json', 'utf-8' ) );

debug.enable( '*' );

templater.disableFileCache();

var log = debug( 'httpServer' );


http.createServer( function ( req, res ) {

  log('processing request %s', req.url );

  req.query = url.parse(req.url, true ).query;

  p.w( { req: req, res: res, data: {} } )

  .then( _loadUri )

  .then( p.ife( { uri: false }, _renderMap ) )

  .then( p.ifl( { responded: false }, _checkStatic ) )

  .done( function( v ) {

    if ( !v.responded ) _prepareRender( v );

  });

} ).listen( 3000 );


function _prepareRender( v ) {

  p.w( v )

  // load config file
  .then( _load( 'config', 'uri', '.config.json' ) )

  // load layout config file
  .then( p.ifl( { 'config.layout' : true }, _load( 'layoutConfig', 'config.layout', '.config.json' ) ) )

  // load mock data
  .then( _load( 'data', 'uri', '.mock.json' ) )

  // load layout mock data
  .then( p.ifl( { 'config.layout' : true }, _load( 'layoutData', 'config.layout', '.mock.json' ) ) )

  // browserify js data
  .then( p.ifl( { 'config.js' : true }, _browserifyFiles( 'uri', 'config.js' ) ) )

  // browserify layout js data
  .then( p.ifl( { 'layoutConfig.js' : true }, _browserifyFiles( 'config.layout', 'layoutConfig.js' ) ) )

  // compile template data
  .then( _compileTemplateData )

  // append css links
  .then( _listCssFiles )

  // compile it all
  .then( _compileSass )

  // define js files root
  .then( _jsRoot )

  // define url generator
  .then( _fakeGenUrl )

  // language
  .then( _defineLanguage )

  // environment
  .then( _defineEnvironment )

  // render template
  .then( _render )

  .done( function( v ) {

    _respond( v.res, 200, v.render );

  }, function( err ) {

    _respond( v.res, 500, err );

  });

}


function _loadUri( v ) {

  log( 'loading uri' );

  var parsed = url.parse( v.req.url, true ),

  uri = parsed.pathname.substr(1);

  v.uri = uri.length ? uri : false;

  return v;

}

function _checkStatic( v ) {

  log( 'checking static file' );

  if ( cn.contains( ['.js'], v.uri.substr( -3 ) ) ||

  cn.contains( ['.css', '.jpg', '.png', '.ico', '.ttf', '.svg', '.eot', '.otf', '.ejs'], v.uri.substr( -4 ) ) ||

  cn.contains( ['.woff2'], v.uri.substr( -6 ) ) ||

  cn.contains( ['.woff', '.json', '.html'], v.uri.substr( -5 ) ) ) {

    log( 'handling as static resource request' );

    mountStatic( v.req, v.res );

    v.responded = true;

  }

  return v;

}

log( 'IMPORTANT: if nodemon is to be used, use it with proper exclusions' );

function _load( key, pathKey, suffix, throwError ) {

  return function( v ) {

    return p.w.promise( function( rs, rj ) {

      fs.readFile( __dirname + '/' + p.getSubObject( pathKey, v ) + suffix, 'utf-8', function( err, content ) {

        if ( err ) {

          log( 'could not read file %s', __dirname + '/' + p.getSubObject( pathKey, v ) + suffix );

          if ( throwError ) return rj( err );

          rs( v );

          return;

        }

        v[ key ] = ( p.getSubObject( pathKey, v ) + suffix ).indexOf( '.json' ) !== -1 ? JSON.parse( content ) : content;

        rs( v );

      });

    });

  }

}


function _jsIncludeMainPath( uri ) {

  var parts = uri.split( '/' ),

  name = parts.pop();

  parts.push( 'js' );

  return {
    src: { 
      path: parts.join('/'), 
      name: name 
    },
    dest: { 
      path: '/js/browserified', 
      name: cn.toCamelCase( uri.replace('/', '_' ) ) + '.js' 
    }
  };

}


function _browserifyFiles( pathKey, fileObjPath ) {

  return function( v ) {

    return p.w.promise( function( rs, rj ) {

      var jsPaths,

      jsFiles = v, 

      mainPath;

      fileObjPath.split( '.' ).forEach( function( part ) {

        jsFiles = jsFiles[ part ];

      });

      if ( jsFiles === true ) {

        jsPaths = [ _jsIncludeMainPath( p.getSubObject( pathKey, v ) ) ];

      } else {

        jsPaths = jsFiles.map( _jsIncludePath( p.getSubObject( pathKey, v ) ) );
        
      }

      if ( !v.js ) v.js = [];

      v.js = jsPaths.map( function( path ) { return path.dest.name; } ).concat( v.js );

      async.each( jsPaths, _browserify, function( err ) {

        if ( err ) return rj( err );
        
        rs( v );

      });

    });

  }

}


function _compileTemplateData( v ) {

  var base = v.data.base ? v.data.base : {},

  state = v.req.query ? v.req.query.state : false;

  if ( v.js ) {

    cn.extend( base, { js: v.js } )

  }

  if ( state && v.data[ state ] ) {

    state = v.req.query.state;

  } else {

    for( var state in v.data ) {

      if ( state !== 'base' ) break;

    }

  }

  if ( state ) {

    deepExtend( base, v.data[ state ] );

  }

  if ( v.layoutData ) {

    base = deepExtend( v.layoutData, base );

  }

  v.compiled = base;

  return v;

}


function _oldCompileSass( v ) {

  // what if you integrate sass with the current system.
  // like for live compile, you squeeze the whole thing
  // into one css file either way
  // and process sass where it needs to be processed only
  // better

  

  if ( !v.compiled.head ) v.compiled.head = {};

  return p.w.promise( function( rs, rj ) {

    var scss, // collection of file to compile

    content = '',

    paths = [];

    for ( var c in v.config ) {

      if ( [ 'scss' ].indexOf( c ) !== -1 ) break;

    }

    scss = _absolutePath( v.uri, v.config[ c ] );

    // add layout stuff if it exists
    if ( v.layoutConfig && v.layoutConfig[ c ] ) {

      scss = cn.extend( 
        _absolutePath( v.config.layout, v.layoutConfig[ c ] ), 
        scss
      );

    }

    // compile the files

    for ( var i in scss ) {

      content += fs.readFileSync( __dirname + scss[ i ], 'utf-8' );

    }

    sass.render( { data: content }, function( err, result ) {

      fs.writeFile( __dirname + sassDestFile, result.css.toString(), function( err ) {

        deepExtend( v.compiled, {
          head: {
            css: { 
              processedSass: sassDestFile
            }
          }
        } );

        rs( v );

      } );

    });

  });

}


function _listCssFiles( v ) {

  if ( !v.compiled.head ) v.compiled.head = {};

  var c, ccs;

  [ 'css', 'embedCss', 'oaCss', 'oaeCss' ].forEach( function( name ) {

    if ( v.config[ name ] ) {

      css = v.config[ name ];

      c = name;

    }

  });

  if ( v.layoutConfig && v.layoutConfig[ c ] ) {

    css = cn.extend( 
      _absolutePath( v.config.layout, v.layoutConfig[ c ] ), 
      _absolutePath( v.uri, css )
    );

  }

  v.css = css;

  return v;

}

function _compileSass( v ) {

  return p.w.promise( function( rs, rj ) {

    var aggregated = '', cssArr = [];

    for ( var i in v.css ) {

      cssArr.push( v.css[ i ] );

    }

    async.eachSeries( cssArr, function( cssFile, ecb ) {

      fs.readFile( __dirname + cssFile, 'utf-8', function( err, content ) {

        content = _fixFontAwesomeRelativePath( cssFile, content );

        if ( err ) {

          log( 'could not read file %s' + cssFile );

          return ecb( err );

        }

        aggregated += content;

        ecb();

      } );

    }, function( err ) {

      if ( err ) return rj( err );

      sass.render( { data: aggregated }, function( err, result ) {

        if ( err ) {

          console.log( 'could not process sass: %s', err );

          return rj( err );

        }

        fs.writeFile( __dirname + sassDestFile, result.css.toString(), function( err ) {

          if ( err ) {

            console.log( 'could not write file %s', __dirname + sassDestFile );

            return rj( err );

          }

          v.compiled.head.css = {
            aggregated: sassDestFile
          }

          rs( v );

        });

      });

    } );

  });

}


function _fixFontAwesomeRelativePath( filename, content ) {

  var version = '4.3.0';

  if ( filename.indexOf( 'font-awesome-' + version ) == -1 ) return content;

  return content.replace( /..\/fonts\//g, '/css/font-awesome-' + version + '/fonts/' );

}


function _jsRoot( v ) {

  v.compiled.scriptsBase = '/js/browserified';

  return v;

}


function _fakeGenUrl( v ) {

  v.compiled.genUrl = _genUrl( v.compiled );

  return v;

}


function _defineLanguage( v ) {

  if ( !v.req.query || !v.req.query.lang ) {

    v.compiled.lang = 'fr';

  } else {

    v.compiled.lang = v.req.query.lang

  }

  return v;

}


function _defineEnvironment( v ) {

  v.compiled.env = 'tpl';

  return v;

}


function _render( v ) {

  return p.w.promise( function( rs, rj ) {

    templater( v.uri, v.compiled, function( err, render ) {

      if ( err ) return rj( err );

      v.render = render;

      rs( v );

    });

  });

}


/**
 * render a template link map
 */

function _renderMap( v ) {

  log( 'rendering map' );

  _respond( v.res, 200, '<ul>' + map.map( function( mapItem ) {

    var uri = typeof mapItem == 'string' ? mapItem : mapItem.uri ;

    return '<li><a href="/' + uri + '">' + uri + '</a></li>';

  } ).join('') + '</ul>' );

  v.responded = true;

  return v;

}


/**
 * respond with given body
 */

function _respond( res, code, body, responseType ) {

  if ( responseType === undefined ) responseType = "text/html; charset=utf-8";

  res.writeHead(code, {
    "Content-Type": responseType,
    'Cache-Control': 'no-cache'
  });

  res.write( body );
  res.end();

}


function _jsIncludePath( name ) {

  return function( jsRelativePath ) {

    var paths = {
      src: {},
      dest: { path: '/js/browserified' }
    },

    templatePath = name.split('/'),

    pathParts = jsRelativePath.split('/');

    templatePath.pop();

    paths.src.path = [];

    pathParts.forEach( function( pathPart ) {

      if ( pathPart !== '..' ) {

        paths.src.path.push( pathPart );

      } else {

        templatePath.pop();

      }

    });

    paths.src.path = templatePath.concat( paths.src.path );

    paths.dest.name = cn.toCamelCase( paths.src.path.join('_') );

    paths.src.name = paths.src.path.pop();

    paths.src.path = paths.src.path.join('/');

    return paths;

  }

}


function _browserify( paths, cb ) {

  log( 'browserificationization' );

  // run browserify_browserify

  var b = browserify();

  b.transform(stringify(['.ejs', '.css', '.html', '.tblr' ]));

  b.transform(reactify);

  b.add( __dirname + '/' + paths.src.path + '/' + paths.src.name );

  var bundle = b.bundle();

  bundle.pipe( fs.createWriteStream( __dirname + '/' + paths.dest.path + '/' + paths.dest.name ) );

  bundle.on( 'end', cb );

}


function _genUrl( data ) {

  return function ( name ) {

    var values = {};

    if (arguments.length > 1) {

      for (var i = 1; i < arguments.length; i++) {

        cn.extend(values, arguments[i]);

      }

    }

    if ( data.devUrls && data.devUrls[name] ) {

      return data.devUrls[name] + '#' + name + encodeURI(JSON.stringify(values));

    }

    return '#' + name + encodeURI(JSON.stringify(values));

  };

}

function _readFile( filename, cb ) {

  fs.readFile(__dirname + '/' + filename, 'utf-8', function( err, content ) {

    if ( err ) return cb( err );

    if ( filename.indexOf('.json') !== -1 ) return cb( null, JSON.parse( content ) );

    cb( null, content );

  });

}

/**
 * define the absolute path of the css file
 */

function _absolutePath( uri, css ) {

  var templatePath = uri.split('/');

  templatePath.pop();

  var absCss = {};

  for( var c in css ) {

    var path = css[c].split('/'),

    isSub = true; // if is a subfolder of current uri

    while ( path[0] == '..' ) {

      path.splice( 0, 1 );

      isSub = false;
      
    }

    absCss[c] = ( isSub ? '/' + templatePath : '' ) + '/' + path.join('/');

  }

  return absCss;

};