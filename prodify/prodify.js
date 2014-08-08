var ugly = require('uglify-js'),

fs = require('fs'),

files = require('./files.js').files, // ye olde prodify reference

destPath = require('./files.js').destPath,

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

  async.each(map, prodifyTemplateJs, function( err ) {

    if ( err ) throw err;

    log('done with template based scripts');

    //legacyProdify();

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
 * read template config, get js file if any, browserify, minify, write to prod folder
 */

prodifyTemplateJs = function( templateName, cb ) {

  fs.readFile(__dirname + '/../' + templateName + '.config.json', 'utf-8', function( err, content ) {

    if ( err ) return cb( err );

    var config = JSON.parse( content );

    if ( !config.templateJs ) return cb();


    // determine js file name from template name and process

    var b = browserify(),

    templateFolder = templateName.split('/');

    templateFolder[ templateFolder.length - 1 ] = 'js/' + templateFolder[ templateFolder.length - 1 ] + '.js';

    var jsFile = __dirname + '/../' + templateFolder.join('/'),

    destName = cn.toCamelCase( templateName.replace(/\//g, '_') ),

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