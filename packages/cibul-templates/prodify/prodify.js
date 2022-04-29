var fs = require( 'fs' ),

  path = require( 'path' ),

  mkdirp = require( 'mkdirp' ),

  async = require( 'async' ),

  debug = require( 'debug' ),

  webpack = require( 'webpack' ),

  sass = require( 'node-sass' ),

  map = require( '../map' ),

  cn = require( '../js/lib/common' ),

  webpackConfigProd = require( './config.prod.js' ),

  webpackConfigDev = require( './config.dev.js' ),

  jsDestPath = path.join(__dirname, '../dist/js'),

  onlyCss = false,

  production = true,

  watch = false,

  log,

  buildFilter = [],

  run = function () {

    debug.enable( 'prodify' );

    log = debug( 'prodify' );

    mkdirp.sync(path.join(__dirname, '../dist/css'));
    mkdirp.sync(path.join(__dirname, '../dist/js'));

    async.series( [
      async.apply( prodifyCss, map, 'css', 'compiled.css' ),
      async.apply( prodifyCss, map, 'embedCss', 'embedDefault.css' ),
      async.apply( prodifyCss, map, 'adminCss', 'compiledAdmin.css' ),
      async.apply( prodifyCss, map, 'oaCss', 'oa.css' ),
      async.apply( prodifyCss, map, 'oaeCss', 'oae.css' ),
      async.apply( prodifyCss, map, 'oaetCss', 'oaet.css' )
    ].concat( onlyCss ? _copyBsCss : [
      async.apply( prodifyJs, map ),
      _copyBsCss
    ] ), function ( err ) {

      if ( err ) throw err;

      log( 'done.' );

    } );

  },


  _copyBsCss = function ( cb ) {

    const src = fs.createReadStream(require.resolve('@openagenda/bs-templates/compiled/main.css'));

    src.pipe(fs.createWriteStream(path.join(__dirname, '../dist/css/oasfmain.css')));

    src.on('end', () => cb());

  },


  /**
   * compile css files
   */

  prodifyCss = function ( map, cssKey, destFile, cb ) {

    if ( buildFilter.length && !buildFilter.some( v => cssKey.indexOf( v ) !== -1 ) ) {

      return cb();

    }

    const destPath = path.join(__dirname, '../dist/css', destFile);

    log( 'compiling css %s to %s', cssKey, destPath );

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

        const OAIndex = cssFilename.indexOf( '@openagenda/' )
        const fileToAdd = OAIndex !== -1
          ? require.resolve( cssFilename.slice( OAIndex ) )
          : path.join( __dirname, '..', cssFilename );

        log( 'adding content of %s', fileToAdd );

        fs.readFile( fileToAdd, 'utf-8', function ( err, css ) {

          if ( err ) return rcb( err );

          rcb( null, compiled + css );

        } );

      }, function ( err, mainCss ) {

        if ( err ) return cb( err );

        // write it in dest css folder

        if ( !mainCss.length ) return cb();

        sass.render( { data: mainCss }, function ( err, result ) {

          if ( err ) return cb( err );

          fs.writeFile( destPath, result.css.toString(), cb );

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

        var offset = (templateName.split( '/' ).length - 1) * 3,

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

        if ( config.layout && (parentsMap.indexOf( config.layout ) == -1) ) parentsMap.push( config.layout );

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
   * read template config, get js file if any, webpackify, minify, write to prod folder
   */

  prodifyJs = function ( map, cb ) {

    if ( onlyCss ) return cb();

    const jsEntries = map.reduce( ( result, item ) => {

      if ( !item.js || !item.prod ) {
        return result;
      }

      if ( buildFilter.length && !buildFilter.some( v => path.basename( item.prod, '.js' ).includes( v ) ) ) {
        return result;
      }

      result[ item.prod.slice( 0, -3 ) ] = path.join( __dirname, '..', item.js );

      return result;

    }, {} );

    async.reduce( map, jsEntries, ( result, item, rcb ) => {

      const templateName = typeof item == 'string' ? item : item.uri;

      if ( !templateName ) {
        return rcb( null, result );
      }

      getTemplateFilesToWebpackify( templateName, function ( err, toWebpackify ) {

        if ( err ) return rcb( err );

        toWebpackify.forEach( template => {

          if (
            buildFilter.length
            && !buildFilter.some( v => path.basename( template.dest.name, '.js' ).includes( v ) )
          ) {
            return;
          }

          result[ template.dest.name.slice( 0, -3 ) ] = path.join(
            __dirname,
            template.src.path,
            template.src.name
          );

        } );

        rcb( null, result );

      } );

    }, ( err, entry ) => {

      if ( err ) {

        return cb( err );

      }

      log( 'browserificationization\n%O', entry );

      _build( {
        entry,
        output: {
          filename: '[name].js',
          path: jsDestPath
        }
      }, cb );

    } );

  },

  getTemplateFilesToWebpackify = function ( templateName, cb ) {

    var toWebpackify = [];

    readTemplateConfig( templateName, function ( err, config ) {

      if ( config.js === true ) toWebpackify.push( _templateJsPath( templateName ) );

      if ( !config.layout ) return cb( null, toWebpackify );

      if ( config.layout ) readTemplateConfig( config.layout, function ( err, layoutConfig ) {

        if ( err ) return cb( err );

        if ( layoutConfig.js === true ) toWebpackify.push( _templateJsPath( config.layout ) );

        cb( null, toWebpackify );

      } );

    } );

  },

  _build = function ( options, cb ) {

    var compiler = webpack( production ? webpackConfigProd( options ) : webpackConfigDev( options ) );

    const compileFn = watch ? compiler.watch.bind( compiler, {} ) : compiler.run.bind( compiler );

    // compiler.watch( {}, function ( err, stats ) {
    // compiler.run( function ( err, stats ) {
    compileFn( function ( err, stats ) {

      if ( err ) cb( err );

      log( stats.toString( {
        hash: false,
        chunks: false,
        colors: true,
        reasons: true,
        modules: false,
        moduleTrace: true,
        errorDetails: true,
        warnings: true,
        ignoreWarnings: [
          warning => {
            console.log(warning);
            return true;
          }
        ]
      } ) );

      if ( !watch ) {
        cb();
      }

    } );

  },

  _templateJsPath = function ( name ) {

    var paths = {
      src: {},
      dest: {}
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

for (let i = 2; i < process.argv.length; i++) {
  switch (process.argv[i]) {
    case 'css':
      onlyCss = true;
      break;
    case '-w':
    case '--watch':
      watch = true;
      break;
    default:
      buildFilter.push(process.argv[i]);
  }
}

if ( process.env.NODE_ENV === 'development' ) {
  production = false;
}

if ( buildFilter.length ) {
  process.env.DISABLE_WEBPACK_CACHE = 'true';
}

run();
