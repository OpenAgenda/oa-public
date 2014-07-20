var useMockData = false, // use data in local json file

useMockGenUrl = false, // use basic url gen function

ejs = require('ejs'),

fs = require('fs'),

cn = require('../js/lib/common/common.mod.js'),

async = require('async'),

debug = require('debug'),

deepExtend = require('deep-extend'),

log = debug('templater');

module.exports = function(templateMode) {

  useMockData = !!templateMode;

  useMockGenUrl = !!templateMode;

  return loader;

};

var loader = function(templateName, data, cb) {

  if (typeof data == 'function') {

    cb = data;
    data = {};

  }

  log('loading template files for %s', templateName);

  var loaders = [
    loadTemplate(templateName),
    loadLabels
  ];

  if (useMockData) loaders.push(loadMockData(data));

  async.waterfall(loaders, function(err, results) {

    if (err) throw err; // because fuck it.

    var template = results.template, labels = results.labels;

    if (results.mock) cn.extend(data, results.mock);

    if (useMockGenUrl) data.genUrl = mockGenUrl;

    data.__ = loadTranslator(labels);

    var templateRender = renderTemplate(results.template, results.templateBody, data);

    if (results.layout) {

      templateRender = renderTemplate(results.layout, results.layoutBody, data).replace('<!-- content -->', templateRender);

    }

    cb(null, templateRender);

  });

},


renderTemplate = function(filename, templateBody, data) {

  data.filename = filename;

  return ejs.render(templateBody, data);

},


/**
 * prepare translator function used for template rendering
 */

loadTranslator = function( labels ) {

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

mockGenUrl = function ( name ) {

  var values = {};

  if (arguments.length > 1) {

    for (var i = 1; i < arguments.length; i++) {

      cn.extend(values, arguments[i]);

    }

  }

  return '#' + name + encodeURI(JSON.stringify(values));

},


loadTemplate = function( templateName ) {

  return function( cb ) {

    var baseTemplatePath = __dirname + '/../' + templateName,

    data = {name: templateName};

    fs.readFile(baseTemplatePath + '.config.json', 'utf-8', function (err, config) {

      if (err) return cb(err);

      data.config = JSON.parse(config);

      data.template = baseTemplatePath + '.ejs';

      var files = [async.apply(fs.readFile, data.template, 'utf-8')];

      if (data.config.layout) {

        data.layout = __dirname + '/../' + data.config.layout + '.ejs';

        files.push(async.apply(fs.readFile, data.layout, 'utf-8'));

      }

      async.parallel(files, function(err, results) {

        if (err) return cb(err);

        data.templateBody = results[0];

        if (data.config.layout) data.layoutBody = results[1];

        cb(null, data);

      });

    });

  };

},


loadLabels = function( data, cb ) {

  var files = [data.name];

  if (data.config.layout) files.push(data.config.layout);

  async.parallel(files.map(function ( name ) { 

    return async.apply(fs.readFile, __dirname + '/../' + name + '.fr.json', 'utf-8'); 

  }), function ( err, results ) {

    if (err) return cb(err);

    var labels = JSON.parse(results[0]);

    if (results.length > 1) cn.extend(labels, JSON.parse(results[1]));

    data.labels = labels;

    cb(null, data);

  });

},


loadMockData = function( request ) {

  return function ( data, cb ) {

    var files = [data.name];

    if (data.config.layout) files.push(data.config.layout);

    async.parallel(files.map(function(name) {

      return async.apply(fs.readFile, __dirname + '/../' + name + '.mock.json', 'utf-8');

    }), function (err, results) {

      if (err) return cb(err);

      var mockData = JSON.parse(results[0]);

      if (mockData.base) { // this template uses states

        // get requested state of data. else, get the first

        for (var state in mockData) {
          if (state !== 'base') break; // first is base, second is first state
        }

        if (request.state && mockData[request.state]) state = request.state;

        mockData = deepExtend(mockData.base, mockData[state]);

        if (data.config.layout) cn.extend(mockData, JSON.parse(results[1]));

      }

      data.mock = mockData;

      cb(null, data);

    });

  };

};