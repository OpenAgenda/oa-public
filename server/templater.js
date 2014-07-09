var useMockData = false, // use data in local json file

ejs = require('ejs'),

fs = require('fs'),

cn = require('../js/lib/common/common.mod.js'),

async = require('async'),

debug = require('debug'),

log = debug('templater');

module.exports = function(templateMode) {

  useMockData = !!templateMode;

  return loader;

};

var loader = function(templateName, data, cb) {

  if (typeof data == 'function') {

    cb = data;
    data = {};

  }

  log('loading template files for %s', templateName);

  loadFiles(templateName, function(err, template, labels, mockData) {

    log('template files loaded for %s', templateName);

    var translator = loadTranslator(labels);

    cn.extend(data, {
      '__' : translator,
      filename : '../' + templateName + '.ejs'
    }, useMockData?mockData:{});

    var rendered = ejs.render(template, data, cb);

    cb(null, rendered);

  });

},


/**
 * prepare translator function used for template rendering
 */

loadTranslator = function(labels) {

  return function(label, values) {

    if (!values) values = {};

    var translation = labels[label];

    if (translation === undefined) translation = label;

    for (var key in values) {

      translation = translation.replace(key, values[key]);

    }

    return translation;

  };

},


/**
 * load layout, template and int labels
 */

loadFiles = function(templateName, cb) {

  var baseTemplatePath = '../' + templateName;

  async.waterfall([


    // read template config

    function(wcb) {

      fs.readFile(baseTemplatePath + '.config.json', function(err, data) {

        if (err) return wcb(err);

        wcb(null, JSON.parse(data));

      });

    },


    // define files to load

    function(tConfig, wcb) {

      var filesToLoad = [
        '../' + templateName + '.fr.json',
        '../' + templateName + '.ejs'
      ];

      if (tConfig.layout) filesToLoad.push('../' + tConfig.layout + '.ejs');

      if (useMockData) filesToLoad.push('../' + templateName + '.mock.json');

      wcb(null, tConfig, filesToLoad);

    },


    // load files
    
    function(tConfig, filesToLoad, wcb) {

      async.parallel(filesToLoad.map(function(path) {

        return async.apply(fs.readFile, path, 'utf8');

      }), function (err, results) {

        if (err) return cb(err);

        wcb(null, tConfig, results);

      });

    },


    // prepare template and give result callback
    
    function(tConfig, results, wcb) {

      var template = results[1],

      mockData = false,

      langLabels = JSON.parse(results[0]);

      if (tConfig.layout) {

        template = results[2].replace('<!-- content -->', template);

      }

      if (useMockData) mockData = JSON.parse(results[tConfig.layout?3:2]);

      cb(null, template, langLabels, mockData);

    }


  ]);

};