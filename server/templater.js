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

    cn.extend(data, {'__' : translator}, useMockData?mockData:{});

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

  var files = [
    '../layout/footer.layout.ejs',
    '../layout/header.layout.ejs',
    '../' + templateName + '.fr.json',
    '../' + templateName + '.ejs'
  ];

  if (useMockData) files.push('../' + templateName + '.mock.json');

  async.parallel(files.map(function(path) {

    return async.apply(fs.readFile, path, 'utf8');

  }),

  function (err, results) {

    if (err) return cb(err);

    cb(null, 
      results[1] + results[3] + results[0], 
      JSON.parse(results[2]), 
      useMockData?JSON.parse(results[4]):false
    );

  });

};