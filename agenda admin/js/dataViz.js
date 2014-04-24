var cn = require('../../js/lib/common/common.mod.js'),

remote = require('../../js/lib/remote/remote.mod.js'),

loadJs = require('../../js/lib/loadJs/loadJs.mod.js'),

dataWidgetMaker = require('./dataWidgetMaker.js');

ejs = require('ejs'),

params = {
  labels: {
    totalPublished: 'Total published events',
    totalDatesPublished: 'Total published dates',
    totalPublishedByCategories: 'Total published by categories',
    totalPublishedByTags: 'Total published by tag',
    totalPublishedByRegion: 'Total published by region',
    totalPublishedByDepartment: 'Total published by department',
    totalPublishedByCity: 'Total published by city',
    totalPublishedByDay: 'Total published by day',
    totalPublishedByCategoryAndRegion: 'Total published by category and region',
    totalPublishedByCategoriesAndTags: 'Total published by category and tags',
  },
  canvas: false,
  ctl: false,
  templates: {
    totalPublished: '<span><%= data %></span>',
    totalDatesPublished: '<span><%= data %></span>'
  }
};

window.handleAdminDataViz = function(options) {

  var labels = cn.extend({}, params.labels, options.labels?options.labels:{});

  cn.extend(params, options, {labels:labels});

  loadResources(params, function(ctl) {

    var config = [
      {label: params.labels.totalPublishedByCity, sections: ['city']},
      {label: params.labels.totalPublishedByRegion, sections: ['region']},
      {label: params.labels.totalPublishedByCategories, sections: ['category']},
      {label: params.labels.totalPublishedByTags, sections: ['tag']},
      {label: params.labels.totalPublishedByCategoriesAndTags, sections: ['category', 'tag']},
      {label: params.labels.totalPublishedByDay, sections: ['day']}
    ];

    var widget = dataWidgetMaker(ctl, {
      w: window, d: document,
      labels: params.labels,
      canvas: cn.el(params.canvas)
    }, function() {

      // create a widget for each stat
      for (var i = 0; i < config.length; i++)
        widget(config[i]);

    });

  });

},

processStat = function(cfg) {

  var data = parser(cfg.sections);

  // make widget

  //var statElem = render(cfg.label, data, cfg.sections.length);

  

  //cn.el(params.canvas).appendChild(statElem);

},

/*
render = function(head, data, depth) {

  if (typeof depth == 'undefined') depth = 1;

  var template = params.templates.totalPublishedBy;

  if (depth==2) template = params.templates.totalPublishedByBy;

  var div = document.createElement('div'), child;

  div.innerHTML = ejs.render(template, cn.extend({labels: params.labels, classes: params.classes}, {data: data}));

  div.className = params.classes.section;

  var headElem = document.createElement('h2');

  headElem.innerHTML = head;

  div.insertAdjacentElement('afterbegin', headElem);

  return div;

}, */

loadResources = function(params, callback) {

  var loadCount = 1, ctl,

  attempt = function() {

    loadCount--;

    if (loadCount===0) callback(ctl);

  };

  if (typeof params.ctl == 'string') {

    loadCount ++;

    remote.getJsonp(params.ctl, {data: {format: 'jsonp', getcontroldata: ''} }, function(responseType, data){

      ctl = data;

      attempt();

    });

  } else {

    callback(params.ctl);

  }

  cn.addEvent(window, 'load', function() {

    attempt();

  });

};