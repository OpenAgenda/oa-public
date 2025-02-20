var fs = require( 'fs' ),

  path = require( 'path' ),

  { mkdirp } = require( 'mkdirp' ),

  debug = require( 'debug' ),

  webpack = require( 'webpack' ),

  sass = require( 'sass' ),

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
    debug.enable('prodify');
    log = debug('prodify');

    mkdirp.sync(path.join(__dirname, '../dist/css'));
    mkdirp.sync(path.join(__dirname, '../dist/js'));

    const tasks = [
      cb => prodifyCss(map, 'oaeCss', 'oae.css', cb),
      cb => prodifyCss(map, 'oaetCss', 'oaet.css', cb)
    ];

    if (onlyCss) {
      tasks.push(_copyMainCss, _copyAdminCss);
    } else {
      tasks.push(
        cb => prodifyJs(map, cb),
        _copyMainCss,
        _copyAdminCss
      );
    }

    // Exécute les tâches en série en utilisant des Promises
    tasks
      .reduce(
        (promiseChain, task) =>
          promiseChain.then(
            () =>
              new Promise((resolve, reject) => {
                task(err => (err ? reject(err) : resolve()));
              })
          ),
        Promise.resolve()
      )
      .then(() => {
        log('done.');
      })
      .catch(err => {
        throw err;
      });
  },


  _copyMainCss = function ( cb ) {

    const src = fs.createReadStream(require.resolve('@openagenda/bs-templates/compiled/main.css'));

    src.pipe(fs.createWriteStream(path.join(__dirname, '../dist/css/oa-main.css')));

    src.on('end', () => cb());

  },


  _copyAdminCss = function ( cb ) {

    const src = fs.createReadStream(require.resolve('@openagenda/bs-templates/compiled/admin.css'));

    src.pipe(fs.createWriteStream(path.join(__dirname, '../dist/css/oa-admin.css')));

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

      const mainCssPromise = csses.reduce((compiledPromise, cssFilename) => {
        return compiledPromise.then(compiled => {
          if (cssFilename.indexOf('//') !== -1) {
            return compiled;
          }

          const OAIndex = cssFilename.indexOf('@openagenda/');
          const fileToAdd = OAIndex !== -1
            ? require.resolve(cssFilename.slice(OAIndex))
            : path.join(__dirname, '..', cssFilename);

          log('adding content of %s', fileToAdd);

          return new Promise((resolve, reject) => {
            fs.readFile(fileToAdd, 'utf-8', (err, css) => {
              if (err) return reject(err);
              resolve(compiled + css);
            });
          });
        });
      }, Promise.resolve(''));

      mainCssPromise
        .then(mainCss => {
          if (!mainCss.length) return cb();

          sass.render({ data: mainCss }, (err, result) => {
            if (err) return cb(err);
            fs.writeFile(destPath, result.css.toString(), cb);
          });
        })
        .catch(cb);
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

    Promise.all(
      map.map(mapItem => {
        return new Promise((resolve, reject) => {
          const templateName = typeof mapItem === 'string' ? mapItem : mapItem.uri;
          if (!templateName) return resolve();

          readTemplateConfig(templateName, (err, config) => {
            if (err) return reject(err);

            const offset = (templateName.split('/').length - 1) * 3;
            const csses = {};
            const templatePath = templateName.split('/');
            templatePath.pop();

            if (config[cssKey]) {
              for (let c in config[cssKey]) {
                if (config[cssKey][c].indexOf('../') !== -1) {
                  // CSS générique
                  csses[c] = config[cssKey][c].substr(offset);
                } else if (config[cssKey][c].indexOf('//') !== -1) {
                  // Chemin web, on garde tel quel
                  csses[c] = config[cssKey][c];
                } else {
                  // Chemin relatif : on ajoute le chemin du dossier
                  csses[c] = templatePath.join('/') + '/' + config[cssKey][c];
                }
              }
              cn.extend(cssIndex, csses);
            }

            if (config.layout && (parentsMap.indexOf(config.layout) === -1)) {
              parentsMap.push(config.layout);
            }
            resolve();
          });
        });
      })
    )
      .then(() => {
        if (parentsMap.length) {
          listCss(parentsMap, cssKey, (err, parentsCssIndex) => {
            if (err) return cb(err);
            cb(null, cn.extend(parentsCssIndex, cssIndex));
          });
        } else {
          cb(null, cssIndex);
        }
      })
      .catch(cb);
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

    const jsEntriesPromise = map.reduce((promise, item) => {
      return promise.then(result => {
        const templateName = typeof item === 'string' ? item : item.uri;
        if (!templateName) {
          return result;
        }
        return new Promise((resolve, reject) => {
          getTemplateFilesToWebpackify(templateName, (err, toWebpackify) => {
            if (err) return reject(err);

            toWebpackify.forEach(template => {
              if (
                buildFilter.length &&
                !buildFilter.some(v => path.basename(template.dest.name, '.js').includes(v))
              ) {
                return;
              }
              // On retire les 3 derniers caractères (".js")
              result[template.dest.name.slice(0, -3)] = path.join(
                __dirname,
                template.src.path,
                template.src.name
              );
            });

            resolve(result);
          });
        });
      });
    }, Promise.resolve(jsEntries));

    jsEntriesPromise
      .then(entry => {
        log('browserificationization\n%O', entry);
        _build(
          {
            entry,
            output: {
              filename: '[name].js',
              path: jsDestPath,
            },
          },
          cb
        );
      })
      .catch(cb);
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

if ( !process.env.NODE_ENV || process.env.NODE_ENV === 'development' ) {
  production = false;
}

if ( buildFilter.length ) {
  process.env.DISABLE_WEBPACK_CACHE = 'true';
}

run();
