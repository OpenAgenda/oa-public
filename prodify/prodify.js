var ugly = require('uglify-js')
  , fs = require('fs')
  , files = require('./files.js').files
  , destPath = require('./files.js').destPath
  , labels = false
  , changeLine = false
  , mangle = true

  , run = function() {

    forEachDestinationFile(function(destFile, inputEntries) {

      var content = '';

      forEachInputFile(inputEntries, function(path, filename) {

        content += (labels?'/*' + filename + '*/':'') + (mangle?ugly.minify(path + filename, {mangle: true}).code:fs.readFileSync(path + filename)) + (changeLine?'\n':';');
        
      });

      fs.writeFile(destPath + destFile, content, function(err) {
        if (err) console.log(err);
      });

    });

  }
  , forEachDestinationFile = function(callback) {

    for (index in files) {
      callback(index, files[index]);
    }

  }
  , forEachInputFile = function(entries, callback) {

    for (var i=0; i<entries.length; i++) {

      var folderPath = entries[i][0];

      for (var j=1; j<entries[i].length; j++) {
        callback(folderPath, entries[i][j]);
      }

    }

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