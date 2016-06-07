var ugly = require( 'uglify-js' ),

  fs = require( 'fs' ),

  path = require( 'path' ),

  files = require( './files.js' ).files, // ye olde prodify reference

  destPath = require( './files.js' ).destPath,

  destCssPath = require( './files.js' ).destCssPath,

  destEmbedCssPath = require( './files.js' ).destEmbedCssPath,

  destAdminCssPath = require( './files.js' ).destAdminCssPath,

  destOACssPath = require( './files.js' ).destOACssPath,

  destOAECssPath = require( './files.js' ).destOAECssPath,

  destOAETCssPath = require( './files.js' ).destOAETCssPath,

  destPublicTemplatePath = require( './files.js' ).destPublicTemplatePath,

  sass = require( 'node-sass' ),

  map = JSON.parse( fs.readFileSync( __dirname + '/../map.json', "utf8" ) ),

  cn = require( '../js/lib/common/common.mod.js' ),

  async = require( 'async' ),

  debug = require( 'debug' ),

  labels = false,

  changeLine = false,

  production = true,

  log,

  webpack = require( 'webpack' ),

  webpackConfigProd = require( './config.prod.js' ),

  webpackConfigDev = require( './config.dev.js' ),

  browserify = require( 'browserify' ),

  stringify = require( 'stringify' ),

  reactify = require( 'reactify' ),

  browserified = [],

  run = function () {

    debug.enable( 'prodify' );

    log = debug( 'prodify' );

    async.series( [
      async.apply( prodifyCss, map, 'css', destCssPath ),
      async.apply( prodifyCss, map, 'embedCss', destEmbedCssPath ),
      async.apply( prodifyCss, map, 'adminCss', destAdminCssPath ),
      async.apply( prodifyCss, map, 'oaCss', destOACssPath ),
      async.apply( prodifyCss, map, 'oaeCss', destOAECssPath ),
      async.apply( prodifyCss, map, 'oaetCss', destOAETCssPath ),
      async.apply( prodifyPublicTemplates, map ),
      async.apply( prodifyTemplateJs, map ),
      async.apply( prodifyJs, map ),
      _copyBsCss,
      legacyProdify,
    ], function ( err ) {

      if ( err ) throw err;

      log( 'done.' );

    } );

  },


  _copyBsCss = function ( cb ) {

    var src = fs.createReadStream( __dirname + '/../node_modules/bs-templates/compiled/main.css' ),

      dest = fs.createWriteStream( __dirname + '/../../cibul-symfony/web/css/oasfmain.css' );

    src.pipe( dest );

    src.on( 'end', () => cb() );

  },


  /**
   * prodify scripts for legacy site scripts
   */

  legacyProdify = function () {

    log( 'legacy prodify' );

    forEachDestinationFile( function ( destFile, inputEntries ) {

      log( 'creating %s', destFile );

      var content = '';

      forEachInputFile( inputEntries, function ( path, filename ) {

        try {

          content += (labels ? '/*' + filename + '*/' : '') + (production ? ugly.minify( __dirname + '/' + path + filename, { mangle: true } ).code : fs.readFileSync( __dirname + '/' + path + filename ) ) + (changeLine ? '\n' : ';');

        } catch ( e ) {

          console.log( 'error', e );

          throw e;

        }

      } );

      fs.writeFile( destPath + destFile, content, function ( err ) {

        if ( err ) console.log( err );

      } );

    } );

  },

  forEachDestinationFile = function ( callback ) {

    for ( var index in files ) {
      callback( index, files[ index ] );
    }

  },

  forEachInputFile = function ( entries, callback ) {

    for ( var i = 0; i < entries.length; i++ ) {

      var folderPath = entries[ i ][ 0 ];

      for ( var j = 1; j < entries[ i ].length; j++ ) {
        callback( folderPath, entries[ i ][ j ] );
      }

    }

  },


  prodifyPublicTemplates = function ( map, cb ) {

    // clear destination folder

    async.each( map, function ( mapItem, ecb ) {

      if ( typeof mapItem == 'string' ) return ecb(); // do nothing

      if ( !mapItem.public ) return ecb(); // do nothing if it is not a public template

      if ( !mapItem.uri ) return ecb(); // do nothing if no uri is defined

      async.series( [
        async.apply( checkOrCreateDir, mapItem.uri ),
        async.apply( copyFile, __dirname + '/../' + mapItem.uri + '.ejs', destPublicTemplatePath + mapItem.uri + '.ejs' ),
        async.apply( copyFile, __dirname + '/../' + mapItem.uri + '.fr.json', destPublicTemplatePath + mapItem.uri + '.fr.json' )
      ], ecb );

    }, cb );

  },

  checkOrCreateDir = function ( uri, cb ) {

    var dirs = uri.split( '/' );

    dirs.pop();

    dirs[ 0 ] = destPublicTemplatePath + dirs[ 0 ];

    for ( var i = 1; i < dirs.length; i++ ) {

      dirs[ i ] = dirs[ i - 1 ] + '/' + dirs[ i ];

    }

    async.eachSeries( dirs, function ( dir, escb ) {

      fs.stat( dir, function ( err ) {

        if ( !err ) return escb(); // dir exists

        fs.mkdir( dir, "0754", escb );

      } );

    }, cb );

  },

  copyFile = function ( source, target, cb ) {

    var cbCalled = false;

    var rd = fs.createReadStream( source );
    rd.on( "error", function ( err ) {
      done( err );
    } );
    var wr = fs.createWriteStream( target );
    wr.on( "error", function ( err ) {
      done( err );
    } );
    wr.on( "close", function ( ex ) {
      done();
    } );
    rd.pipe( wr );

    function done( err ) {
      if ( !cbCalled ) {
        cb( err );
        cbCalled = true;
      }
    }

  },


  /**
   * compile css files
   */

  prodifyCss = function ( map, cssKey, destFile, cb ) {

    log( 'compiling css %s to %s', cssKey, destFile );

    listCss( map, cssKey, function ( err, cssFiles ) {

      // make array

      var csses = [];

      for ( var c in cssFiles ) {

        csses.push( cssFiles[ c ] );

      }

      // concatenate

      async.reduce( csses, '', function ( compiled, cssFilename, rcb ) {

        if ( cssFilename.indexOf( '//' ) !== -1 ) {

          return rcb( null, compiled );

        }

        log( 'adding content of %s', path.join( __dirname, '..', cssFilename ) );

        fs.readFile( __dirname + '/../' + cssFilename, 'utf-8', function ( err, css ) {

          if ( err ) return rcb( err );

          rcb( null, compiled + css );

        } );

      }, function ( err, mainCss ) {

        if ( err ) return cb( err );

        // write it in dest css folder

        if ( !mainCss.length ) return cb();

        sass.render( { data: mainCss }, function ( err, result ) {

          if ( err ) return cb( err );

          fs.writeFile( destFile, result.css.toString(), cb );

        } );

      } );

    } );

  },


  /**
   * run through css files of templates and layouts found in map and build a complete css file list
   */

  listCss = function listCss( map, cssKey, cb ) {

    var cssIndex = {},

      parentsMap = [];

    if ( !cb ) {

      cb = cssKey;

      cssKey = 'css';

    }

    async.each( map, function ( mapItem, ecb ) {

      var templateName = typeof mapItem == 'string' ? mapItem : mapItem.uri;

      if ( !templateName ) {

        return ecb();

      }

      readTemplateConfig( templateName, function ( err, config ) {

        if ( err ) return cb( err );

        var offset = ( templateName.split( '/' ).length - 1 ) * 3,

          csses = {},

          templatePath = templateName.split( '/' );

        templatePath.pop();

        if ( config[ cssKey ] ) {

          for ( var c in config[ cssKey ] ) {

            if ( config[ cssKey ][ c ].indexOf( '../' ) !== -1 ) {

              // generic css

              csses[ c ] = config[ cssKey ][ c ].substr( offset );

            } else if ( config[ cssKey ][ c ].indexOf( '//' ) !== -1 ) {

              // web path, get as is

              csses[ c ] = config[ cssKey ][ c ];

            } else {

              // relative css. add path to folder

              csses[ c ] = templatePath + '/' + config[ cssKey ][ c ];

            }

          }

          cn.extend( cssIndex, csses );

        }

        if ( config.layout && ( parentsMap.indexOf( config.layout ) == -1 ) ) parentsMap.push( config.layout );

        ecb();

      } );

    }, function ( err ) {

      if ( err ) return cb( err );

      if ( parentsMap.length ) {

        listCss( parentsMap, cssKey, function ( err, parentsCssIndex ) {

          if ( err ) return cb( err );

          cb( null, cn.extend( parentsCssIndex, cssIndex ) );

        } );

      } else {

        cb( null, cssIndex );

      }

    } );


  },


  /**
   * read template config, get js file if any, browserify, minify, write to prod folder
   */

  prodifyTemplateJs = function ( map, cb ) {

    async.eachSeries( map, function ( mapItem, scb ) {

      var templateName = typeof mapItem == 'string' ? mapItem : mapItem.uri;

      if ( !templateName ) return scb();

      getTemplateFilesToBrowserify( templateName, function ( err, toBrowserify ) {

        if ( err ) return scb( err );

        async.eachSeries( toBrowserify, _browserify, scb );

      } );

    }, cb );

  },

  prodifyJs = function ( map, cb ) {

    async.eachSeries( map, function ( mapItem, scb ) {

      if ( !mapItem.js || !mapItem.prod ) {

        return scb();

      }

      var paths = { src: {}, dest: {} },

        path = mapItem.js.split( '/' );

      paths.dest.path = mapItem.prod.split( '/' );

      paths.src.name = path.pop();

      paths.src.path = '../' + path.join( '/' );

      paths.dest.name = paths.dest.path.pop();

      paths.dest.path = destPath + paths.dest.path.join( '/' );

      _browserify( paths, scb );

    }, cb );

  },

  getTemplateFilesToBrowserify = function ( templateName, cb ) {

    var toBrowserify = [];

    readTemplateConfig( templateName, function ( err, config ) {

      if ( config.js === true ) toBrowserify.push( _templateJsPath( templateName ) );

      if ( !config.layout ) return cb( null, toBrowserify );

      if ( config.layout ) readTemplateConfig( config.layout, function ( err, layoutConfig ) {

        if ( err ) return cb( err );

        if ( layoutConfig.js === true ) toBrowserify.push( _templateJsPath( config.layout ) );

        cb( null, toBrowserify );

      } );

    } );

  },

  _browserify = function ( paths, cb ) {

    if ( browserified.indexOf( paths.dest.path + paths.dest.name ) !== -1 ) {

      return cb();

    }


    browserified.push( paths.dest.path + paths.dest.name );

    log( 'browserificationization %s', path.join( paths.dest.path, paths.dest.name ) );


    // run webpack

    var compiler = webpack( production ? webpackConfigProd( paths ) : webpackConfigDev( paths ) );

    compiler.run( function ( err, stats ) {
      if ( err ) cb( err );

      var msg = stats.toString( {
          hash: false,
          chunks: false,
          colors: true
        } ),

        shownMsg = ~msg.indexOf( 'WARNING' ) ? msg.substring( 0, msg.indexOf( 'WARNING' ) - 11 ) : msg;

      console.log( shownMsg );

      cb();
    } );


    /*var b = browserify();

     b.transform(stringify(['.ejs', '.css', '.html', '.tblr' ]));

     b.transform( 'babelify' );

     b.add( __dirname + '/' + paths.src.path + '/' + paths.src.name );

     var bundle = b.bundle(),

     destFilePath = paths.dest.path + '/' + paths.dest.name,

     writeStream = fs.createWriteStream( destFilePath );

     bundle.pipe( writeStream );

     writeStream.on( 'close', function() {

     // minify here

     if ( !mangle ) return cb();

     fs.readFile( destFilePath, 'utf-8', function( err, content ){

     if ( err ) return cb( err );

     var uglified;

     try {

     uglified = ugly.minify(content, { mangle: true, fromString: true }).code;

     } catch( e ) {

     console.log( 'error', e );

     throw e;

     }


     // done!

     fs.writeFile( destFilePath, uglified, cb);

     });

     });*/


    // handle mangle

  },

  _templateJsPath = function ( name ) {

    var paths = {
      src: {},
      dest: { path: destPath }
    };

    // determine name of template js file

    var folder = name.split( '/' );

    paths.src.name = folder.pop() + '.js';

    paths.src.path = '../' + folder.join( '/' ) + '/js';

    paths.dest.name = cn.toCamelCase( name.replace( /\//g, '_' ) ) + '.js';

    return paths;

  },

  readTemplateConfig = function ( templateName, cb ) {

    fs.readFile( __dirname + '/../' + templateName + '.config.json', 'utf-8', function ( err, content ) {

      var config;

      if ( err ) return cb( err );

      try {

        config = JSON.parse( content );

      } catch ( e ) {

        return cb( e );

      }

      cb( null, config );

    } );

  };

for ( var i = 0; i < process.argv.length; i++ ) {
  if ( process.argv[ i ] == 'l' ) {
    labels = true;
    changeLine = true;
  } else if ( process.argv[ i ] == 'dev' ) {
    production = false;
  }
}

run();