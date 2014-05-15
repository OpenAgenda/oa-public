var cn = require('../../js/lib/common/common.mod.js'),

remote = require('../../js/lib/remote/remote.mod.js'),

debug = false,

loadJs = require('../../js/lib/loadJs/loadJs.mod.js'),

dataWidgetMaker = require('./dataWidgetMaker.js'),

configMaker = require('./configMaker.js'),

widgetConfig,

params = {
  labels: {},
  canvas: false,
  ctl: false,
  config: false, // dataviz configuration
  update: false,
  templates: {
    totalPublished: '<span><%= data %></span>',
    totalDatesPublished: '<span><%= data %></span>'
  }
};

window.handleAdminDataViz = function(options) {

  var labels = cn.extend({}, params.labels, options.labels?options.labels:{});

  cn.extend(params, options, {labels:labels});

  loadResources(params, function(ctl, config) {

    widgetConfig = config;

    // here configuration is loaded

    dataWidgetMaker(ctl, {
      w: window, d: document,
      labels: params.labels,
      canvas: cn.el(params.canvas)
    }, function(generators) {


      // create totals widget
      generators.total();

      // create a widget for each stat
      for (var i = 0; i < config.length; i++)
        generators.widget(config[i], onWidgetRemove);
        
      var createButton = configMaker(ctl, {
        canvas: cn.el(params.canvas),
        labels: params.labels
      });

      createButton(function(section, subsection, filter) {

        var newConfig = {sections: []};

        newConfig.sections.push(section);

        if (subsection) newConfig.sections.push(subsection);

        if (filter=='upcoming') newConfig.filter = filter;

        widgetConfig.push(newConfig);

        update(widgetConfig);

        generators.widget(newConfig, onWidgetRemove);

      });

    });

  });

},


/**
 * things that happen when a widget is removed: widget config is removed, update is sent to server
 */

onWidgetRemove = function(wConfig) {

  var found = false;

  for (var i = widgetConfig.length - 1; i >= 0; i--)
    if (configMatch(widgetConfig[i], wConfig)) {
      found = true;
      break;
    }

  if (found) {

    widgetConfig = widgetConfig.splice(1,i);

    update(widgetConfig);

  }

},


/**
 * check if widget configurations match
 */

configMatch = function(config1, config2) {

  if (config1.sections.length !== config2.sections.length) return false;

  for (var i = config1.sections.length - 1; i >= 0; i--) {
    
    if (!cn.contains(config2.sections, config1.sections[i])) return false;

  }

  return true;

},


/**
 * load agenda control data and dataviz configuration
 */

loadResources = function(params, callback) {

  var loadCount = 1, ctl, datavizConfig,

  attempt = function() {

    loadCount--;

    if (loadCount===0) callback(ctl, datavizConfig);

  };

  if (typeof params.ctl == 'string') {

    // this is debug mode, update should be done with jsonp
    debug = true;

    loadCount ++;

    remote.getJsonp(params.ctl, {data: {format: 'jsonp', getcontroldata: ''} }, function(responseType, data){

      ctl = data;

      remote.getJsonp(params.ctl, {data: {format: 'jsonp', getdataviz: ''}}, function(responseType, data) {

        datavizConfig = JSON.parse(data);

      });

      attempt();

    });

  } else {

    callback(params.ctl, params.config);

  }

  cn.addEvent(window, 'load', function() {

    attempt();

  });

},


/**
 * update dataviz config in server
 */

update = function(newConfig, callback) {

  if (typeof callback == 'undefined') callback = function() {};

  var submitData = {dataviz: JSON.stringify(newConfig)};

  if (!debug) return remote.postXmlHttp(params.update, {data: submitData}, callback);

  submitData.format = 'jsonp';

  remote.getJsonp(params.update, {data: submitData}, callback);

};