var ugly = require('uglify-js'),

fs = require('fs'),

files = require('./files.js').files, // ye olde prodify reference

destPath = require('./files.js').destPath,

destCssPath = require('./files.js').destCssPath,

map =  JSON.parse( fs.readFileSync('../map.json', "utf8") ),

cn = require('../js/lib/common/common.mod.js'),

async = require('async'),

debug = require('debug'),

labels = false,

changeLine = false,

mangle = true,

log,

browserify = require('browserify'),

run = function() {

  debug.enable('*');

  log = debug('prodify');

  prodifyCss( map, function( err, cssFiles ) {

    if ( err ) throw err;

    async.each( map, prodifyTemplateJs, function( err ) {

      if ( err ) throw err;

      log('done with template based scripts');

      //legacyProdify();

    });

  });

},


/**
 * prodify scripts for legacy site scripts
 */

legacyProdify = function() {

  forEachDestinationFile(function( destFile, inputEntries ) {

    var content = '';

    forEachInputFile(inputEntries, function( path, filename ) {

      content += (labels?'/*' + filename + '*/':'') + (mangle?ugly.minify(path + filename, {mangle: true}).code:fs.readFileSync(path + filename)) + (changeLine?'\n':';');
      
    });

    fs.writeFile(destPath + destFile, content, function( err ) {

      if ( err ) console.log( err );

    });

  });

},

forEachDestinationFile = function( callback ) {

  for (var index in files) {
    callback(index, files[index]);
  }

},

forEachInputFile = function( entries, callback ) {

  for (var i=0; i<entries.length; i++) {

    var folderPath = entries[i][0];

    for (var j=1; j<entries[i].length; j++) {
      callback(folderPath, entries[i][j]);
    }

  }

},


/**
 * compile css files
 */

prodifyCss = function( map, cb ) {

  listCss( map, function( err, cssFiles ) {

    // make array

    var csses = [];

    for ( var c in cssFiles ) {

      csses.push( cssFiles[c] );

    }

    // concatenate

    async.reduce(csses, '', function( compiled, cssFilename, rcb ) {

      if ( cssFilename.indexOf('//') !== -1 ) {

        return rcb( null, compiled );

      }

      fs.readFile( __dirname + '/../' + cssFilename, 'utf-8', function( err, css ) {

        if ( err ) return rcb( err );

        rcb( null, compiled + css );

      });

    }, function( err, mainCss ) {

      if ( err ) return cb( err );

      // write it in dest css folder

      fs.writeFile( destCssPath, mainCss, cb);

    });

  });

},


/**
 * run through css files of templates and layouts found in map and build a complete css file list
 */

listCss = function listCss( map, cb ) {

  var cssIndex = {},

  parentsMap = [];

  async.each( map, function( templateName, ecb ) {

    readTemplateConfig( templateName, function( err, config ) {

      if ( err ) return cb( err );

      var offset = ( templateName.split('/').length - 1 ) * 3, 

      csses = {},

      templatePath = templateName.split('/');

      templatePath.pop();

      if ( config.css ) {

        for (var c in config.css ) {

          if ( config.css[c].indexOf('../') !== -1 ) {

            // generic css

            csses[c] = config.css[c].substr( offset );
            
          } else if ( config.css[c].indexOf('//') !== -1 ) {

            // web path, get as is

            csses[c] = config.css[c];

          } else {

            // relative css. add path to folder

            csses[c] = templatePath + '/' + config.css[c];

          }

          

        }

        cn.extend( cssIndex, csses );

      }

      if ( config.layout && ( parentsMap.indexOf( config.layout ) == -1 ) ) parentsMap. push( config.layout );

      ecb();

    });

  }, function( err ) {

    if ( err ) return cb( err );

    if ( parentsMap.length ) {

      listCss( parentsMap, function( err, parentsCssIndex ) {

        if ( err ) return cb( err );

        cb( null, cn.extend( parentsCssIndex, cssIndex ) );

      });

    } else {

      cb( null, cssIndex );

    }

  });

  

},




/**
 * read template config, get js file if any, browserify, minify, write to prod folder
 */

prodifyTemplateJs = function( templateName, cb ) {

  readTemplateConfig( templateName, function( err, config ) {

    if ( err ) throw err;

    if ( !config.templateJs ) return cb();

    browserifyTemplateScript( templateName, function( err ) {

      if ( err ) throw err;

      if ( !config.layout ) return cb();

      readTemplateConfig( config.layout, function( err, config ) {

        if ( err ) throw err;

        if ( !config.templateJs ) return cb();

        browserifyTemplateScript( config.layout, cb );

      });

    } );

  });


},

browserifyTemplateScript = function( name, cb ) {

  // determine js file name from template name and process

  var b = browserify(),

  folder = name.split('/');

  folder[ folder.length - 1 ] = 'js/' + folder[ folder.length - 1 ] + '.js';

  var jsFile = __dirname + '/../' + folder.join('/'),

  destName = cn.toCamelCase( name.replace(/\//g, '_') ),

  destFilePath = destPath + destName + '.js',

  writeStream = fs.createWriteStream( destFilePath );

  b.add( jsFile );

  b.bundle().pipe( writeStream );

  writeStream.on( 'close', function() {

    // minify here

    if ( !mangle ) return cb();

    fs.readFile( destFilePath, 'utf-8', function( err, content ){

      if ( err ) return cb( err );

      var uglified = ugly.minify(content, { mangle: true, fromString: true }).code;

      // done!

      fs.writeFile( destFilePath, uglified, cb);

    });

  });

},

readTemplateConfig = function( templateName, cb ) {

  fs.readFile(__dirname + '/../' + templateName + '.config.json', 'utf-8', function( err, content ) {

    var config;

    if ( err ) return cb( err );

    try {

      config = JSON.parse( content );

    } catch ( e ) {

      return cb( e );

    }

    cb( null, config );

  });

};

for (var i=0; i<process.argv.length; i++) {
  if (process.argv[i] == 'l') {
    labels = true;
    changeLine = true;
  } else if (process.argv[i] == 'nc') {
    mangle = false;
  }
}

run();