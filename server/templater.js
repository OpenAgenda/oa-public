module.exports = function( templateName, data, cb ) {

  if ( typeof data == 'function' ) {

    cb = data;
    data = {};

  }

  log('loading template files for %s', templateName);

  var loaders = [
    loadTemplate(templateName),
    loadLabels,
    loadHelpers,
    loadScripts( templateName, data.scriptsBase ),
  ];

  async.waterfall(loaders, function( err, results ) {

    if (err) throw err; // because fuck it.

    var template = results.template, labels = results.labels;

    if ( results.config.base ) data = cn.extend(results.config.base, data);

    if ( results.layout && results.layoutConfig.base ) {

      data = cn.extend( results.layoutConfig.base, data );

    }

    if ( results.config.js ) data.js = results.config.js;

    if (results.helpers) cn.extend(data, results.helpers);

    data.__ = loadTranslator(labels);

    var templateRender = renderTemplate( results.template, results.templateBody, data );

    if ( results.layout ) {

      templateRender = renderTemplate(results.layout, results.layoutBody, data).replace( '<!-- content -->', templateRender );

    }

    cb( null, templateRender );

  });

};


var ejs = require('ejs'),

fs = require('fs'),

cn = require('../js/lib/common/common.mod.js'),

async = require('async'),

debug = require('debug'),

deepExtend = require('deep-extend'),

log = debug('templater'),

helpers = {},

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


loadTemplate = function( templateName ) {

  return function( cb ) {

    var baseTemplatePath = __dirname + '/../' + templateName,

    data = {name: templateName};

    fs.readFile(baseTemplatePath + '.config.json', 'utf-8', function (err, config) {

      if (err) return cb(err);

      data.config = JSON.parse(config);

      data.template = baseTemplatePath + '.ejs';

      var files = [async.apply(fs.readFile, data.template, 'utf-8')];

      if ( data.config.layout ) {

        data.layout = __dirname + '/../' + data.config.layout + '.ejs';

        files.push(async.apply(fs.readFile, data.layout, 'utf-8'));

        files.push(async.apply(fs.readFile, __dirname + '/../' + data.config.layout + '.config.json', 'utf-8'));

      }

      async.parallel(files, function(err, results) {

        if (err) return cb(err);

        data.templateBody = results[0];

        if ( data.config.layout ) {

          data.layoutBody = results[1];

          data.layoutConfig = JSON.parse( results[2] );

        }

        cb(null, data);

      });

    });

  };

},


loadLabels = function( data, cb ) {

  var files = [data.name];

  if (data.config.layout) files.push(data.config.layout);

  async.parallel(files.map(function ( name ) { 

    return async.apply( fs.readFile, __dirname + '/../' + name + '.fr.json', 'utf-8' ); 

  }), function ( err, results ) {

    if (err) return cb(err);

    var labels = JSON.parse(results[0]);

    if (results.length > 1) cn.extend(labels, JSON.parse(results[1]));

    data.labels = labels;

    cb( null, data );

  });

},

loadHelpers = function( data, cb ) {

  if ( !data.config.helpers ) return cb( null, data );

  data.helpers = {};

  for ( var name in data.config.helpers ) {

    if (!helpers[name]) {

      helpers[name] = require( __dirname + '/../helpers/' + data.config.helpers[name])({ lang: 'fr' } );

    }

    data.helpers[name] = helpers[name];

  }

  cb( null, data );

},


loadScripts = function( templateName, scriptsBase ) {

  var basePath = scriptsBase ? scriptsBase : '';

  return function( data, cb ) {

    if ( !data.config.js ) data.config.js = [];

    if ( data.config.templateJs ) {

      data.config.js.push( basePath + '/' + cn.toCamelCase( templateName.replace(/\//g, '_') ) + '.js' );

    }

    cb( null, data );

  };

};