(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * handles interaction with user to add a new graph configuration
 */
var cn = require('../../js/lib/common/common.mod.js'),

ejs = require('ejs'),

labels = {
  add: 'Add',
  cancel: 'cancel',
  create: 'create',
  sectionSelect: 'select a breakdown',
  subsectionSelect: 'add another breakdown',
  sections: { date: 'Date', month: 'Month', year: 'Year', tag: 'Tag', category: 'Category', country: 'Country', place: 'Place Name', city: 'City', region: 'Region', department: 'Department', postalCode: 'Postal Code'},
  includeAll: 'all events',
  includeUpcoming: 'upcoming events',
  count: 'select a count'
},

params = {
  canvas: false,  // required. canvas where to put config maker
  templates: {
    add: '<a class="button" href="#"><%= add %></a>',
    menu: '<div class="cform addMenu"><ul class="line"><li><select></select></li><li><select></select></li><li><a class="button" href="#"><%= create %></a></li></ul><ul><li><a class="url" href="#"><%= subsectionSelect %></a></li></ul></div>',
    subsectionMenu: '<div><select></select> <a href="#" class="url"><%= cancel %></a></div>'
  },
  sections: ['country', 'department', 'region', 'city', 'postalCode', 'place', 'year', 'month', 'day', 'category', 'tag'],
  mux: [
    ['country', 'department', 'region', 'city', 'postalCode', 'place'],
    ['year', 'month', 'day']
  ]
};

module.exports = function(ctl, options) {

  params = cn.extend(params, {
    hasCategories: ctl.ct.length,
    hasTags: ctl.t.length
  }, options);

  cn.extend(labels, typeof params.labels !== 'undefined'?params.labels:{});
  
  return create;

};

var create = function(callback) {

  var sandbox = document.createElement('div');

  sandbox.innerHTML = ejs.render(params.templates.add, labels);

  var addButton = cn.childObject(sandbox, 0);

  cn.addEvent(addButton, 'click', function(e) {
    cn.preventDefault(e);
    
    createMenu(addButton, callback);
    removeButton(addButton);

  });

  params.canvas.appendChild(addButton);

},

createMenu = function(button, callback) {

  // initialize dom object
  
  var sandbox = document.createElement('div');

  sandbox.innerHTML = ejs.render(params.templates.menu, labels);

  var menu = cn.childObject(sandbox, 0),

  section = false, subsection = false, filter = false,

  filterSelect = cn.el(menu, 'select'),

  sectionSelect = cn.els(menu, 'select')[1],

  subsectionLink = cn.els(menu, 'a')[1];

  createLink = cn.els(menu, 'a')[0];

  subsectionMenu = false; // subsection menu does not exist

  
  // add behavior and content to section selectbox

  addSectionOptions(sectionSelect, labels.sectionSelect);

  cn.addEvent(sectionSelect, 'change', function() {

    section = sectionSelect.value;

    if (subsectionMenu) {

      removeSubsection(subsectionMenu);

      subsection = subsectionMenu = false;

      subsectionLink.removeAttribute('style');

    }
      
  });


  // add behavior and content to filter select box
  
  createFilterSelect(filterSelect, function(value) {

    filter = value;

  });


  // add behavior to subsection link
  
  cn.addEvent(subsectionLink, 'click', function(e) {

    cn.preventDefault(e);

    subsectionLink.style.display = 'none';

    subsectionMenu = createSubsection(section, function() { // subsection select callback

      subsection = cn.el(subsectionMenu, 'select').value;

    }, function() { // cancel callback
      
      subsection = subsectionMenu = false;

      subsectionLink.removeAttribute('style');

    });

    subsectionLink.insertAdjacentElement('afterend', subsectionMenu);

  });

  // add behavior to create link
  
  cn.addEvent(createLink, 'click', function(e) {

    cn.preventDefault(e);

    if (!section && !subsection) return;

    if (!section) section = subsection;

    callback(section, subsection, filter);

    menu.parentNode.removeChild(menu);

    create(callback);

  });

  button.insertAdjacentElement('afterend', menu);

  return menu;

},

createSubsection = function(currentSection, selectCallback, cancelCallback) {

  var sandbox = document.createElement('div');

  sandbox.innerHTML = ejs.render(params.templates.subsectionMenu, labels);

  var subsection = cn.childObject(sandbox, 0);

  resetSubsection(subsection, currentSection);

  cn.addEvent(subsection, 'change', selectCallback);
  
  // the first a of the subsection is the cancel link
  cn.addEvent(cn.el(subsection, 'a'), 'click', function(e) {

    cn.preventDefault(e);

    removeSubsection(subsection);
    cancelCallback();

  });

  return subsection;

},

createFilterSelect = function(elem, callback) {

  addOption(elem, '', labels.countSelect);
  addOption(elem, '', labels.includeAll);
  addOption(elem, 'upcoming', labels.includeUpcoming);

  cn.addEvent(elem, 'change', function() {
    callback(elem.value);
  });

},

removeSubsection = function(subsection) {

  subsection.parentNode.removeChild(subsection);

},

resetSubsection = function(subsection, currentSection) {

  while (cn.el(subsection, 'select').options.length > 0)
    cn.el(subsection, 'select').remove(0);

  // look at mutually exclusive sections to establish exception lists
  var exclusions = [];

  for (var i = 0; i < params.mux.length; i++)
    if (cn.contains(params.mux[i], currentSection)) exclusions = exclusions.concat(params.mux[i]);

  // add all except the one already used
  addSectionOptions(cn.el(subsection, 'select'), labels.subsectionSelect, exclusions);

},

removeButton = function(button) {

  button.parentNode.removeChild(button);

},

addSectionOptions = function(select, defaultLabel, exclusions) {

  addOption(select, '', defaultLabel);

  cn.forEach(params.sections, function(section) {

    if ((typeof exclusions !== 'undefined') && cn.contains(exclusions, section)) return;

    addOption(select, section, labels.sections[section]);
    
  });

},

addOption = function(select, value, label) {

  if (typeof label == 'undefined') label = value;

  var option = document.createElement('option');
    
  option.value = value;
  option.innerHTML = label;
  select.appendChild(option);

};
},{"../../js/lib/common/common.mod.js":9,"ejs":5}],2:[function(require,module,exports){
var cn = require('../../js/lib/common/common.mod.js'),

remote = require('../../js/lib/remote/remote.mod.js'),

debug = false,

loadJs = require('../../js/lib/loadJs/loadJs.mod.js'),

dataWidgetMaker = require('./dataWidgetMaker.js'),

configMaker = require('./configMaker.js'),

widgetConfig,

ejs = require('ejs'),

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

processStat = function(cfg) {

  var data = parser(cfg.sections);

  // make widget

  //var statElem = render(cfg.label, data, cfg.sections.length);

  //cn.el(params.canvas).appendChild(statElem);

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
},{"../../js/lib/common/common.mod.js":9,"../../js/lib/loadJs/loadJs.mod.js":10,"../../js/lib/remote/remote.mod.js":11,"./configMaker.js":1,"./dataWidgetMaker.js":3,"ejs":5}],3:[function(require,module,exports){
var cn = require('../../js/lib/common/common.mod.js'),

statsParser = require('./statsParser.js'),

parser,

totals,

gChartWrapper = require('./googleChartWrapper.js'),

ejs = require('ejs'),

labels = {
  unset: 'Unset',
  events: 'Events',
  upcoming: 'Upcoming Events',
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  linkContent: {
    list: 'see chart',
    chart: 'see list'
  },
  sections: {
    day: 'Day',
    date: 'Date',
    month: 'Month',
    year: 'Year',
    tag: 'Tag',
    category: 'Category',
    country: 'Country',
    place: 'Place Name',
    city: 'City',
    region: 'Region',
    department: 'Department',
    postalCode: 'Postal Code'
  },
  total: 'Total events',
  dates: 'dates',
  totalUpcoming: 'Total upcoming events',
  upcomingDates: 'dates'
},

sortedSections = ['tag', 'category', 'country', 'place', 'region', 'department', 'postalCode', 'city'], // sections that should be sorted by count

canvas = false, // where the widgets are stacked

params = {
  w: false, d: false,
  canvas: false,
  classes: {
    section: 'dataviz-section',
    datavizList: 'dataviz-list',
    datavizTopList: 'dataviz-top-list',
  },
  selectors: {
    statTargetElem: '.js_graph'
  },
  templates: {
    total: '<ul class="totals"><li><label><%= labels.total %>:</label><span><%= total %></span><label><%= labels.dates %>:</label><span><%= dates %></span></li><li><label><%= labels.totalUpcoming %>:</label><span><%= upcoming %></span><label><%= labels.upcomingDates %>: </label><span><%= upcomingDates %></span></li></ul>',
    main: '<a class="url"><%= linkContent %></a><a class="url">csv</a><div class="dataviz-head"><h2><%= label %></h2><a class="url"><%= labels.remove %></a></div><div class="js_graph"></div>',
    simple: '<ul class="<%= classes.datavizList %>"><% for (var i in data) { %><li <% if (odd) { %>class="odd"<% } %><% odd=!odd; %>><label><%= data[i].label %></label><span><%= data[i].count %></span></li><% } %></ul>',
    combo: '<ul class="<%= classes.datavizTopList %>"><% for (var i in data) { %><li><label><%= i %></label><ul class="<%= classes.datavizList %>"><% var odd = true; %><% for (var j in data[i]) { %><li <% if (odd) { %>class="odd"<% } %><% odd=!odd; %>><label><%= data[i][j].label %></label><span><%= data[i][j].count %></span></li><% }%></ul></li><% } %>',
    csv: '<% for (var r=0; r<rows.length; r++) { %><% for (var c=0; c<rows[0].length; c++) { %>"<%= rows[r][c]!==0?rows[r][c]:\'\' %>",<% } %>\n<% } %>'
  }
};

module.exports = function(ctl, options, callback) {

  cn.extend(labels, options.labels?options.labels:{});

  cn.extend(params, options);

  canvas = params.canvas;
  
  parser = statsParser(ctl, {
    labels: labels
  });

  totals = countTotals(ctl);

  gChartMake = gChartWrapper({w: params.w, d: params.d}, function() {

    // chart lib is ready

    callback({
      widget: createWidget,
      total: createTotals
    });

  });

};

/**
 * create a stats widget
 */

var createWidget = function(config, removeCallback) {

  var wConfig = cn.extend({
    display: 'list', // other being chart
    label: '',
    sections: false, // mandatory
    filter: false // optional.
  }, config),

  display = wConfig.display;

  var wDiv = params.d.createElement('div');

  var wData = parser(config.sections, wConfig.filter?filters[wConfig.filter]:false, true);

  canvas.appendChild(wDiv);

  wDiv.className = params.classes.section;

  setContent(wDiv, wData, display, wConfig, removeCallback);
},


/**
 * create a totals widget
 */

createTotals = function() {

  var sandbox = params.d.createElement('div');

  sandbox.innerHTML = ejs.render(params.templates.total, cn.extend({labels: labels}, totals));

  canvas.appendChild(cn.childObject(sandbox, 0));

},

setContent = function(wCanvas, wData, currentMode, wConfig, removeCallback) {

  clearWidget(wCanvas);

  var label = setTitleLabel(wConfig.sections, wConfig.filter);

  wCanvas.innerHTML = ejs.render(params.templates.main, { labels: labels, linkContent: labels.linkContent[currentMode], classes: params.classes, label: label });

  cn.addEvent(cn.els(wCanvas, 'a')[2], 'click', function(e) {

    cn.preventDefault(e);

    clearWidget(wCanvas);

    wCanvas.parentNode.removeChild(wCanvas);

    removeCallback(wConfig);

  });

  var aData = sortByCount(wData, wConfig.sections);

  if (currentMode=='list') {

    renderList(cn.el(wCanvas, params.selectors.statTargetElem), wConfig.label, aData, wConfig.sections);

  } else {

    gChartMake(aData, {
      canvas: cn.el(wCanvas, params.selectors.statTargetElem),
      depth: wConfig.sections.length,
      countName: labels.count
    });

  }

  cn.addEvent(cn.el(wCanvas, 'a'), 'click', function(e) {

    cn.preventDefault(e);

    setContent(wCanvas, wData, currentMode=='list'?'chart':'list', wConfig);

  });

  cn.addEvent(cn.els(wCanvas, 'a')[1], 'click', function(e) {

    cn.preventDefault(e);

    var encodedUri = encodeURI(renderCsv(wData, wConfig.sections, wConfig.filter));
    var link = document.createElement("a");
    link.setAttribute("href", "data:text/csv;charset=utf-8,\uFEFF" + encodedUri);
    link.setAttribute("download","report.csv");
    link.click();

  });


},

renderList = function(canvas, label, data, sections) {

  var depth = sections.length;

  var template = params.templates.simple;

  if (depth==2) template = params.templates.combo;

  var child;

  canvas.innerHTML = ejs.render(template, cn.extend({labels: params.labels, classes: params.classes, odd: true}, {data: data}));

},

renderCsv = function(data, sections, filter) {

  var rows = [], i;

  if (sections.length==2) {

    var cols = [labels.sections[sections[0]]];

    // define columns 
    for (var topSection in data)
      for (i in data[topSection])
        if (!cn.contains(cols, data[topSection][i].label)) cols.push(data[topSection][i].label);

    rows.push(cols);

    for (topSection in data) {

      var newRow = [topSection];

      for (var c=1; c<cols.length; c++) {

        var found = false;

        for (i in data[topSection]) {

          if (cols[c]==data[topSection][i].label) {
            found = true;
            newRow.push(data[topSection][i].count);
            break;
          }

        }

        if (!found) newRow.push(0);

      }

      rows.push(newRow);
    }

  } else {

    rows.push([labels.sections[sections[0]], filter?labels[filter]:labels.events]);

    for (i in data)
      rows.push([i, data[i].count]);

  }

  return ejs.render(params.templates.csv, {rows: rows});

},

sortByCount = function(data, sections) {

  if (sections.length==1)
    return toArray(data, sortRequired(sections));

  for (var key in data)
    data[key] = toArray(data[key], sortRequired(sections));

  return data;

},

sortRequired = function(sections) {

  return cn.contains(sortedSections, sections[sections.length-1]);

},

toArray = function(data, sort) {
  
  if (typeof sort == 'undefined') sort = false;

  var aData = [];

  for (var key in data)
    aData.push(data[key]);

  if (!sort) return aData;

  return aData.sort(function(a, b) {

    if (a.count > b.count) return -1;

    if (a.count < b.count) return 1;

    return 0;

  });

},

clearWidget = function(elem) {

  var child;

  while (child = cn.childObject(elem, 0))
    elem.removeChild(child);

},

countTotals = function(ctl) {

  var upcoming = filters.upcoming(ctl.a), dates = 0, upcomingDates = 0;

  for (var i in ctl.a)
    for (var l in ctl.a[i].l)
      dates += ctl.a[i].l[l].d.length;
      

  for (i in upcoming)
    for (l in upcoming[i].l)
      upcomingDates += upcoming[i].l[l].d.length;

  return {
    total: cn.size(ctl.a),
    upcoming: cn.size(upcoming),
    dates: dates,
    upcomingDates: upcomingDates
  };

},

setTitleLabel = function(sections, filter) {

  var label = [];

  if (!filter)
    label.push(labels.events);
  else
    label.push(labels[filter]);

  for (var i = 0; i < sections.length; i++)
    label.push(labels.sections[sections[i]]);

  return label.join(' / ');

},

filters = {
  upcoming: function(articles) {

    var today = new Date();

    today = today.getFullYear() + '-' + cn.addZero(today.getMonth()+1) + '-' + cn.addZero(today.getDate());
    
    var a = JSON.parse(JSON.stringify(articles));

    for (var aId in a) {
      for (var l in a[aId].l) {

        var dates = [];

        for (var i = a[aId].l[l].d.length - 1; i >= 0; i--)
          if (a[aId].l[l].d[i]>=today)
            dates.push(a[aId].l[l].d[i]);

        a[aId].l[l].d = dates;

        if (!dates.length) delete a[aId].l[l];
      }

      if (!cn.size(a[aId].l)) delete a[aId];
    }

    return a;

  }
};
},{"../../js/lib/common/common.mod.js":9,"./googleChartWrapper.js":4,"./statsParser.js":8,"ejs":5}],4:[function(require,module,exports){
var cn = require('../../js/lib/common/common.mod.js'),

loadJs = require('../../js/lib/loadJs/loadJs.mod.js'),

params = {
  w: false,
  d: false,
  classes: {
    canvas: 'graphbox'
  }
},

chartsReady;

module.exports = function(options, callback) {

  cn.extend(params, options);

  chartsReady = callback;

  params.w.googleChartsLoaded = onGoogleChartsLoaded;
  
  loadJs('//www.google.com/jsapi?callback=googleChartsLoaded');

  return render;

};

var render = function(data, renderOptions) {

  var rParams = cn.extend({
    canvas: false,
    depth: 1,
    type: 'BarChart',
    countName: 'total',
    title: '',
    label: 'Label'
  }, renderOptions);

  if (!rParams.canvas) throw new Exception('chart canvas is missing');

  if (rParams.depth == 1) {
    renderSimple(rParams.canvas, rParams.type, rParams.title, rParams.label, rParams.countName, data);
  } else {
    renderCombo(rParams.canvas, 'whatever', rParams.title, rParams.label, data);
  }

},

onGoogleChartsLoaded = function() {

  google.load('visualization', '1.0', {packages:['corechart'], callback: chartsReady});

},


renderCombo = function(canvas, type, title, label, data) {

  // make the canvas
  var div = params.d.createElement('div');

  canvas.appendChild(div);

  // get col values by fetching all sublevel keys
  var cols = [], colLabels = {};

  for (var i in data)
    for (var j in data[i]) {
      if (!cn.contains(cols, j)) {

        cols.push(j);
        colLabels[j] = data[i][j].label;

      }
    }
      

  cols = cols.sort();


  var cData = new google.visualization.DataTable();

  cData.addColumn('string', label);

  for (i = 0; i < cols.length; i++)
    cData.addColumn('number', colLabels[cols[i]]);

  for (var r in data) {

    var newRow = [r];

    // loop through columns and add counts where values exist
    for (i = 0; i < cols.length; i++) {

      var count = 0;

      if (typeof data[r][cols[i]] !== 'undefined') {
        count = data[r][cols[i]].count;
      }

      newRow.push(count);

    }

    cData.addRow(newRow);

  }

  var chart = new google.visualization.ComboChart(div);

  chart.draw(cData, {
    title: title,
    width:'100%',
    height:300,
    seriesType: "bars"
  });
},

renderSimple = function(canvas, type, title, label, countName, data) {

  var div = document.createElement('div'),

  unitHeight = 25, offsetHeight = 40;

  canvas.appendChild(div);

  div.className = params.classes.canvas;

  div.style.height = cn.size(data)*unitHeight + offsetHeight + 'px';
  
  var cData = new google.visualization.DataTable();

  cData.addColumn('string', label);

  cData.addColumn('number', countName);

  for (var i in data) {
    cData.addRow([data[i].label, data[i].count]);
  }

  // Set chart options

  var chart = new google.visualization[type](div);
  
  chart.draw(cData, {
    title: title,
    width:'100%',
    chartArea: {left:150,top: 0, width:"100%", height: "100%"},
    backgroundColor: 'transparent',
    colors: ['#31def4']
  });

};
},{"../../js/lib/common/common.mod.js":9,"../../js/lib/loadJs/loadJs.mod.js":10}],5:[function(require,module,exports){

/*!
 * EJS
 * Copyright(c) 2012 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('./utils')
  , path = require('path')
  , dirname = path.dirname
  , extname = path.extname
  , join = path.join
  , fs = require('fs')
  , read = fs.readFileSync;

/**
 * Filters.
 *
 * @type Object
 */

var filters = exports.filters = require('./filters');

/**
 * Intermediate js cache.
 *
 * @type Object
 */

var cache = {};

/**
 * Clear intermediate js cache.
 *
 * @api public
 */

exports.clearCache = function(){
  cache = {};
};

/**
 * Translate filtered code into function calls.
 *
 * @param {String} js
 * @return {String}
 * @api private
 */

function filtered(js) {
  return js.substr(1).split('|').reduce(function(js, filter){
    var parts = filter.split(':')
      , name = parts.shift()
      , args = parts.join(':') || '';
    if (args) args = ', ' + args;
    return 'filters.' + name + '(' + js + args + ')';
  });
};

/**
 * Re-throw the given `err` in context to the
 * `str` of ejs, `filename`, and `lineno`.
 *
 * @param {Error} err
 * @param {String} str
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

function rethrow(err, str, filename, lineno){
  var lines = str.split('\n')
    , start = Math.max(lineno - 3, 0)
    , end = Math.min(lines.length, lineno + 3);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? ' >> ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'ejs') + ':'
    + lineno + '\n'
    + context + '\n\n'
    + err.message;

  throw err;
}

/**
 * Parse the given `str` of ejs, returning the function body.
 *
 * @param {String} str
 * @return {String}
 * @api public
 */

var parse = exports.parse = function(str, options){
  var options = options || {}
    , open = options.open || exports.open || '<%'
    , close = options.close || exports.close || '%>'
    , filename = options.filename
    , compileDebug = options.compileDebug !== false
    , buf = "";

  buf += 'var buf = [];';
  if (false !== options._with) buf += '\nwith (locals || {}) { (function(){ ';
  buf += '\n buf.push(\'';

  var lineno = 1;

  var consumeEOL = false;
  for (var i = 0, len = str.length; i < len; ++i) {
    var stri = str[i];
    if (str.slice(i, open.length + i) == open) {
      i += open.length

      var prefix, postfix, line = (compileDebug ? '__stack.lineno=' : '') + lineno;
      switch (str[i]) {
        case '=':
          prefix = "', escape((" + line + ', ';
          postfix = ")), '";
          ++i;
          break;
        case '-':
          prefix = "', (" + line + ', ';
          postfix = "), '";
          ++i;
          break;
        default:
          prefix = "');" + line + ';';
          postfix = "; buf.push('";
      }

      var end = str.indexOf(close, i);

      if (end < 0){
        throw new Error('Could not find matching close tag "' + close + '".');
      }

      var js = str.substring(i, end)
        , start = i
        , include = null
        , n = 0;

      if ('-' == js[js.length-1]){
        js = js.substring(0, js.length - 2);
        consumeEOL = true;
      }

      if (0 == js.trim().indexOf('include')) {
        var name = js.trim().slice(7).trim();
        if (!filename) throw new Error('filename option is required for includes');
        var path = resolveInclude(name, filename);
        include = read(path, 'utf8');
        include = exports.parse(include, { filename: path, _with: false, open: open, close: close, compileDebug: compileDebug });
        buf += "' + (function(){" + include + "})() + '";
        js = '';
      }

      while (~(n = js.indexOf("\n", n))) n++, lineno++;
      if (js.substr(0, 1) == ':') js = filtered(js);
      if (js) {
        if (js.lastIndexOf('//') > js.lastIndexOf('\n')) js += '\n';
        buf += prefix;
        buf += js;
        buf += postfix;
      }
      i += end - start + close.length - 1;

    } else if (stri == "\\") {
      buf += "\\\\";
    } else if (stri == "'") {
      buf += "\\'";
    } else if (stri == "\r") {
      // ignore
    } else if (stri == "\n") {
      if (consumeEOL) {
        consumeEOL = false;
      } else {
        buf += "\\n";
        lineno++;
      }
    } else {
      buf += stri;
    }
  }

  if (false !== options._with) buf += "'); })();\n} \nreturn buf.join('');";
  else buf += "');\nreturn buf.join('');";
  return buf;
};

/**
 * Compile the given `str` of ejs into a `Function`.
 *
 * @param {String} str
 * @param {Object} options
 * @return {Function}
 * @api public
 */

var compile = exports.compile = function(str, options){
  options = options || {};
  var escape = options.escape || utils.escape;

  var input = JSON.stringify(str)
    , compileDebug = options.compileDebug !== false
    , client = options.client
    , filename = options.filename
        ? JSON.stringify(options.filename)
        : 'undefined';

  if (compileDebug) {
    // Adds the fancy stack trace meta info
    str = [
      'var __stack = { lineno: 1, input: ' + input + ', filename: ' + filename + ' };',
      rethrow.toString(),
      'try {',
      exports.parse(str, options),
      '} catch (err) {',
      '  rethrow(err, __stack.input, __stack.filename, __stack.lineno);',
      '}'
    ].join("\n");
  } else {
    str = exports.parse(str, options);
  }

  if (options.debug) console.log(str);
  if (client) str = 'escape = escape || ' + escape.toString() + ';\n' + str;

  try {
    var fn = new Function('locals, filters, escape, rethrow', str);
  } catch (err) {
    if ('SyntaxError' == err.name) {
      err.message += options.filename
        ? ' in ' + filename
        : ' while compiling ejs';
    }
    throw err;
  }

  if (client) return fn;

  return function(locals){
    return fn.call(this, locals, filters, escape, rethrow);
  }
};

/**
 * Render the given `str` of ejs.
 *
 * Options:
 *
 *   - `locals`          Local variables object
 *   - `cache`           Compiled functions are cached, requires `filename`
 *   - `filename`        Used by `cache` to key caches
 *   - `scope`           Function execution context
 *   - `debug`           Output generated function body
 *   - `open`            Open tag, defaulting to "<%"
 *   - `close`           Closing tag, defaulting to "%>"
 *
 * @param {String} str
 * @param {Object} options
 * @return {String}
 * @api public
 */

exports.render = function(str, options){
  var fn
    , options = options || {};

  if (options.cache) {
    if (options.filename) {
      fn = cache[options.filename] || (cache[options.filename] = compile(str, options));
    } else {
      throw new Error('"cache" option requires "filename".');
    }
  } else {
    fn = compile(str, options);
  }

  options.__proto__ = options.locals;
  return fn.call(options.scope, options);
};

/**
 * Render an EJS file at the given `path` and callback `fn(err, str)`.
 *
 * @param {String} path
 * @param {Object|Function} options or callback
 * @param {Function} fn
 * @api public
 */

exports.renderFile = function(path, options, fn){
  var key = path + ':string';

  if ('function' == typeof options) {
    fn = options, options = {};
  }

  options.filename = path;

  var str;
  try {
    str = options.cache
      ? cache[key] || (cache[key] = read(path, 'utf8'))
      : read(path, 'utf8');
  } catch (err) {
    fn(err);
    return;
  }
  fn(null, exports.render(str, options));
};

/**
 * Resolve include `name` relative to `filename`.
 *
 * @param {String} name
 * @param {String} filename
 * @return {String}
 * @api private
 */

function resolveInclude(name, filename) {
  var path = join(dirname(filename), name);
  var ext = extname(name);
  if (!ext) path += '.ejs';
  return path;
}

// express support

exports.__express = exports.renderFile;

/**
 * Expose to require().
 */

if (require.extensions) {
  require.extensions['.ejs'] = function (module, filename) {
    filename = filename || module.filename;
    var options = { filename: filename, client: true }
      , template = fs.readFileSync(filename).toString()
      , fn = compile(template, options);
    module._compile('module.exports = ' + fn.toString() + ';', filename);
  };
} else if (require.registerExtension) {
  require.registerExtension('.ejs', function(src) {
    return compile(src, {});
  });
}

},{"./filters":6,"./utils":7,"fs":12,"path":14}],6:[function(require,module,exports){
/*!
 * EJS - Filters
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * First element of the target `obj`.
 */

exports.first = function(obj) {
  return obj[0];
};

/**
 * Last element of the target `obj`.
 */

exports.last = function(obj) {
  return obj[obj.length - 1];
};

/**
 * Capitalize the first letter of the target `str`.
 */

exports.capitalize = function(str){
  str = String(str);
  return str[0].toUpperCase() + str.substr(1, str.length);
};

/**
 * Downcase the target `str`.
 */

exports.downcase = function(str){
  return String(str).toLowerCase();
};

/**
 * Uppercase the target `str`.
 */

exports.upcase = function(str){
  return String(str).toUpperCase();
};

/**
 * Sort the target `obj`.
 */

exports.sort = function(obj){
  return Object.create(obj).sort();
};

/**
 * Sort the target `obj` by the given `prop` ascending.
 */

exports.sort_by = function(obj, prop){
  return Object.create(obj).sort(function(a, b){
    a = a[prop], b = b[prop];
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });
};

/**
 * Size or length of the target `obj`.
 */

exports.size = exports.length = function(obj) {
  return obj.length;
};

/**
 * Add `a` and `b`.
 */

exports.plus = function(a, b){
  return Number(a) + Number(b);
};

/**
 * Subtract `b` from `a`.
 */

exports.minus = function(a, b){
  return Number(a) - Number(b);
};

/**
 * Multiply `a` by `b`.
 */

exports.times = function(a, b){
  return Number(a) * Number(b);
};

/**
 * Divide `a` by `b`.
 */

exports.divided_by = function(a, b){
  return Number(a) / Number(b);
};

/**
 * Join `obj` with the given `str`.
 */

exports.join = function(obj, str){
  return obj.join(str || ', ');
};

/**
 * Truncate `str` to `len`.
 */

exports.truncate = function(str, len, append){
  str = String(str);
  if (str.length > len) {
    str = str.slice(0, len);
    if (append) str += append;
  }
  return str;
};

/**
 * Truncate `str` to `n` words.
 */

exports.truncate_words = function(str, n){
  var str = String(str)
    , words = str.split(/ +/);
  return words.slice(0, n).join(' ');
};

/**
 * Replace `pattern` with `substitution` in `str`.
 */

exports.replace = function(str, pattern, substitution){
  return String(str).replace(pattern, substitution || '');
};

/**
 * Prepend `val` to `obj`.
 */

exports.prepend = function(obj, val){
  return Array.isArray(obj)
    ? [val].concat(obj)
    : val + obj;
};

/**
 * Append `val` to `obj`.
 */

exports.append = function(obj, val){
  return Array.isArray(obj)
    ? obj.concat(val)
    : obj + val;
};

/**
 * Map the given `prop`.
 */

exports.map = function(arr, prop){
  return arr.map(function(obj){
    return obj[prop];
  });
};

/**
 * Reverse the given `obj`.
 */

exports.reverse = function(obj){
  return Array.isArray(obj)
    ? obj.reverse()
    : String(obj).split('').reverse().join('');
};

/**
 * Get `prop` of the given `obj`.
 */

exports.get = function(obj, prop){
  return obj[prop];
};

/**
 * Packs the given `obj` into json string
 */
exports.json = function(obj){
  return JSON.stringify(obj);
};

},{}],7:[function(require,module,exports){

/*!
 * EJS
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function(html){
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};
 

},{}],8:[function(require,module,exports){
var cn = require('../../js/lib/common/common.mod.js'),

ctl,

params,

init = function() {

  // this creates the parser

  var map = {
    year: dateLib.extractYear,
    month: dateLib.extractMonth,
    day: dateLib.extractDay,
    place: locationLib.extractPlace,
    city: locationLib.extractCity,
    region: locationLib.extractRegion,
    department: locationLib.extractDepartment,
    country: locationLib.extractCountry,
    postalCode: locationLib.extractPostalCode,
    category: categoryLib.extract,
    tag: tagLib.extract
  };

  module.exports = function(ctlData, options) {

    ctl = ctlData;

    params = cn.extend({}, options);

    return function(attributes, filter, countSort) {

      var articles = ctl.a;

      if (typeof countSort == 'undefined') countSort = false;

      if (filter) articles = filter(articles);

      if (typeof attributes == 'string') attributes = [attributes];

      if (attributes.length==1) {

        return processArticles(articles, map[attributes[0]]);

      } else {

        return processSubsets(articles, map[attributes[0]], map[attributes[1]]);

      }

    };

  };

},

categoryLabels, // store category labels by id (slug)

tagLabels, // store tag labels by id (slug)

categoryLib = {

  labels: function() {

    if (!categoryLabels) {

      categoryLabels = {};

      for (var i = ctl.ct.length - 1; i >= 0; i--)
        categoryLabels[ctl.ct[i].s] = ctl.ct[i].c;

    }

    return categoryLabels;
  },

  extract: function(article) {

    if (typeof article.c == 'undefined') return [params.labels.unset];

    var labels = categoryLib.labels();

    return [labels[article.c]];
  },

},

tagLib = {

  labels: function() {

    if (!tagLabels) {

      tagLabels = {};

      for (var i = ctl.t.length - 1; i >= 0; i--)
        tagLabels[ctl.t[i].s] = ctl.t[i].t;

    }

    return tagLabels;
  },

  extract: function(article) {

    if (typeof article.t == 'undefined') return [params.labels.unset];

    var labels = tagLib.labels(), tagLabels = [];

    for (var i = article.t.length - 1; i >= 0; i--)
      tagLabels.push(labels[article.t[i]]);

    return tagLabels;

  },
},

dateLib = {

  extractDay: function(article) {

    var days = [], pairList = [];

    dateLib.loopArticleDates(article, function(date) {

      var day = date.substr(8, 2) + ' ' + params.labels.shortMonths[parseInt(date.substr(5, 2), 10)-1] + ' ' + date.substr(0, 4);

      if (!cn.contains(days, day)) {
        days.push(day);
        pairList.push({label: day, sortKey: date});
      }

    });

    return pairList;

  },

  extractMonth: function(article) {

    var months = [], pairList = [];

    dateLib.loopArticleDates(article, function(date) {

      var month = params.labels.shortMonths[parseInt(date.substr(5, 2), 10)-1] + ' ' + date.substr(0, 4);

      if (!cn.contains(months, month)) {
        months.push(month);
        pairList.push({label: month, sortKey: date});
      }

    });

    return pairList;

  },

  extractYear: function(article) {

    var years = [], pairList = [];

    dateLib.loopArticleDates(article, function(date) {
      
      var year = date.substr(0, 4);

      if (!cn.contains(years, year)) {
        years.push(year);
        pairList.push({label: year, sortKey: date});
      }

    });

    return pairList;

  },

  loopArticleDates: function(article, callback) {

    for (var l in article.l)
      for (var i = article.l[l].d.length - 1; i >= 0; i--)
        callback(article.l[l].d[i]);

  }
},

locationLib = {
  extractPlace: function(article) {
    return locationLib.extract(article, 'p');
  },
  extractCity: function(article) {
    return locationLib.extract(article, 'ct');
  },
  extractDepartment: function(article) {
    return locationLib.extract(article, 'dp');
  },
  extractCountry: function(article) {
    return locationLib.extract(article, 'cn');
  },
  extractRegion: function(article) {
    return locationLib.extract(article, 'rg');
  },
  extractPostalCode: function(article) {
    return locationLib.extract(article, 'pc');
  },
  extract: function(article, key) {

    var values = [];

    locationLib.loopArticleLocations(article, function(location) {

      if (typeof location[key]=='undefined') {

        values.push(params.labels.unset);

        return;

      }

      values.push(location[key]);

    });

    return values;

  },
  loopArticleLocations: function(article, callback) {
    for (var l in article.l)
      callback(article.l[l]);
  },
},

processArticles = function(articles, extractFunc, filterEmpty) {

  var sortGroup = createSortGroup(articles, extractFunc);

  for (var i in articles)
    picker(articles[i], sortGroup, extractFunc);

  if (sortGroup[null] && !sortGroup[null].count) delete sortGroup[null];

  if (filterEmpty) for (i in sortGroup)
    if (!sortGroup[i].count) delete sortGroup[i];

  return sortGroup;

},

processSubsets = function(articles, topExtractFunc, bottomExtractFunc, filterEmpty) {

  var parentGroup = {};

  var subsets = createSubsets(articles, topExtractFunc);

  for (var key in subsets) {

    var result = processArticles(subsets[key], bottomExtractFunc, filterEmpty, topExtractFunc, key);

    parentGroup[key] = result;
  }

  return parentGroup;

},

compareCounts = function(a, b) {

  if (a.count < b.count)
    return -1;
  if (a.count > b.count)
    return 1;

  return 0;

},

compareSortKeys = function(a,b) {

  var aKey = (typeof a.sortKey == 'undefined')?a:a.sortKey,

  bKey = (typeof b.sortKey == 'undefined')?b:b.sortKey;

  if (aKey < bKey)
     return -1;
  if (aKey > bKey)
    return 1;

  return 0;
},

picker = function(article, sortGroup, extractFunc) {

  var values = extractFunc(article);

  for (var i = 0; i < values.length; i++) {

    var label = (typeof values[i].label == 'undefined')?values[i]:values[i].label;

    sortGroup[label].count++;
  }

},

createSubsets = function(articles, extractFunc) {

  var subsets = {};

  for (var a in articles) {

    var values = extractFunc(articles[a]);

    for (var i = values.length - 1; i >= 0; i--) {

      var label = (typeof values[i].label !== 'undefined')?values[i].label:values[i];

      if (typeof subsets[label] == 'undefined') subsets[label] = [];

      subsets[label].push(values[i].article?values[i].article:articles[a]);

    }

  }
    
  return subsets;

},

createSortGroup = function(articles, extractFunc) {

  var group = {}, aggregated = [];

  for (var i in articles) {

    var val = extractFunc(articles[i]);

    if (val !== null) aggregated = aggregated.concat(val);

  }

  aggregated.sort(compareSortKeys);

  for (i = 0; i < aggregated.length; i++) {

    var label = (typeof aggregated[i].label !== 'undefined')?aggregated[i].label:aggregated[i];

    group[label] = { label: label, count: 0 };

  }
    
  return group;

};

init();
},{"../../js/lib/common/common.mod.js":9}],9:[function(require,module,exports){
exports.addZero = function(number) {
  return (parseInt(number, 10)<10?'0':'') + number;
};

/* Object.size */
exports.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

/* extend */
exports.extend = function(){
  for(var i=1; i<arguments.length; i++)
      for(var key in arguments[i])
          if(arguments[i].hasOwnProperty(key))
              arguments[0][key] = arguments[i][key];
  return arguments[0];
};

/*contains*/
exports.contains = function(a, obj) {
  var i = a.length;
  while (i--) {
     if (a[i] === obj) {
         return true;
     }
  }
  return false;
};

exports.isArray = function(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

exports.removeValueFromArray = function(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
};

exports.unpack = function(encoded) {
  return JSON.parse(encoded);
};

var hasClass = function(element, cls) { return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1; };
var addClass = function(element, className) { if (!hasClass(element, className)) element.className = element.className + ' ' + className; };
var removeClass = function(element, cls) { if (hasClass(element, cls)) { var regex = new RegExp(cls, 'g'); element.className = element.className.replace(regex,''); } };

exports.hasClass = hasClass;
exports.addClass = addClass;
exports.removeClass = removeClass;



exports.removeEvent = function(elem,types,eventHandle) {
  if (elem === null || elem === undefined) return;
  if (typeof types == 'string') types = [types];
  forEach(types, function(type) {
    if (elem.removeEventListener) {
      elem.removeEventListener(type, eventHandle,false);
    } else if (elem.detachEvent) {
      elem.detachEvent('on'+type, eventHandle);
    } else {
      elem["on"+type]=null;
    }
  });
};

exports.addEvent = function(elem, types, eventHandle) {
  if (elem == null || elem == undefined) return;
  if (typeof types == 'string') types = [types];
  forEach(types, function(type){
    if ( elem.addEventListener ) {
      elem.addEventListener( type, eventHandle, false);
    } else if ( elem.attachEvent ) {
        elem.attachEvent( "on" + type, eventHandle );
    } else {
        elem["on"+type]=eventHandle;
    }  
  });
};

exports.preventDefault = function(event) {
  event.preventDefault ? event.preventDefault() : event.returnValue = false;
};

var getElementsByClassName = function(node, classname) {
  if (typeof node == 'string') {
    classname = node;
    node = document;
  }
  var a = [];
  var re = new RegExp('(^| )'+classname+'( |$)');
  var els = node.getElementsByTagName("*");
  for(var i=0,j=els.length; i<j; i++)
      if(re.test(els[i].className))a.push(els[i]);
  return a;
};

exports.getElementsByClassName = getElementsByClassName;


var els = function(node, selector) {

  if (typeof node == 'string') {
    selector = node;
    node = document;
  }

  var prefix = selector.substr(0,1);

  if ('.#,'.indexOf(prefix) !== -1) selector = selector.substr(1);

  if (prefix == '.')
    return getElementsByClassName(node, selector);
  else if (prefix == '#') {
    var result = node.getElementById(selector);
    if (result)
      return [result];
    else
      return [];
  }
  else
    return node.getElementsByTagName(selector);

};

exports.els = els;


exports.el = function(node, selector) {

  var results = els(node, selector);

  return results.length?results[0]:null;

};


/* previousObject, nextObject, childObject, getChildIndex v0.1 */
var previousObject = function(elem) {
  
  elem = elem.previousSibling;

  while (elem && elem.nodeType != 1)
    elem = elem.previousSibling;

  return elem;

};

exports.previousObject = previousObject;

exports.nextObject = function(elem) {

  elem = elem.nextSibling;

  while (elem && elem.nodeType != 1)
    elem = elem.nextSibling;

  return elem;
};

exports.childObject = function(elem, index) {

  var i = 0, realI = 0;

  while (elem.childNodes[i]) {

    if (elem.childNodes[i].nodeType == 1) {

      if (realI==index) return elem.childNodes[i];

      realI++;
    }

    i++;

  }

  return false;

};

exports.getChildIndex = function(child) {

  var i = 0;

  while ( (child = previousObject(child)) !== null ) i++;

  return i;

};

var forEach = function(array, action) {
  for (var i = 0; i < array.length; i++)
    action(array[i]);
};

exports.forEach = forEach;


exports.asymDiff = function(a, b) {

  if (typeof dSuffix != 'string') dSuffix = '';
  var diff = {};
  
  for (var pName in a) {
      if (typeof b[pName] != 'undefined') {
          if (b[pName] !== a[pName]) diff[pName] = a[pName];
      } else {
          diff[pName] = a[pName];
      }
  }
  
  return diff;
};


/* HTMLElement.prototype.insertAdjacentElement (for FF) */
if (typeof HTMLElement != "undefined" && !HTMLElement.prototype.insertAdjacentElement) {

  HTMLElement.prototype.insertAdjacentElement = function (where, parsedNode) {
    switch (where.toLowerCase()) {
      case 'beforebegin':
        this.parentNode.insertBefore(parsedNode, this);
        break;
      case 'afterbegin':
        this.insertBefore(parsedNode, this.firstChild);
        break;
      case 'beforeend':
        this.appendChild(parsedNode);
        break;
      case 'afterend':
        if (this.nextSibling) this.parentNode.insertBefore(parsedNode, this.nextSibling);
        else this.parentNode.appendChild(parsedNode);
        break;
    }
  };

  HTMLElement.prototype.insertAdjacentHTML = function (where, htmlStr) {
    var r = this.ownerDocument.createRange();
    r.setStartBefore(this);
    var parsedHTML = r.createContextualFragment(htmlStr);
    this.insertAdjacentElement(where, parsedHTML);
  };

  HTMLElement.prototype.insertAdjacentText = function (where, txtStr) {
    var parsedText = document.createTextNode(txtStr);
    this.insertAdjacentElement(where, parsedText);
  };
}


exports.getScrollOffsets = function(w){

  // Use the specified window or the current window if no argument 
  w = w || window;

  // This works for all browsers except IE versions 8 and before
  if (typeof w.pageXOffset !== 'undefined') return {
    x: w.pageXOffset,
    y:w.pageYOffset
  };

  // For IE (or any browser) in Standards mode
  var d = w.document;
  if (document.compatMode == "CSS1Compat") {
    return {
      x:d.documentElement.scrollLeft,
      y:d.documentElement.scrollTop
    };
  }

  // For browsers in Quirks mode
  return {
    x: d.body.scrollLeft,
    y: d.body.scrollTop
  };
};

exports.windowInnerHeight = function() {

  return window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;

};

exports.triggerEvent = function(elem, name) {

  var e;

  if (document.createEvent) {
    e = document.createEvent("HTMLEvents");
    e.initEvent(name, true, true);
  } else {
    e = document.createEventObject();
    e.eventType = name;
  }

  e.eventName = name;

  if (document.createEvent) {
    elem.dispatchEvent(e);
  } else {
    elem.fireEvent("on" + e.eventType, e);
  }

};

exports.isElement = function(o){
  return (
    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
  );
};

// add trim function to IE8
if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
  };
}

exports.removeProperty = function(obj, name) {

  if (typeof obj.removeProperty !== 'undefined') return obj.removeProperty(name);

  return obj.removeAttribute(name);

};
},{}],10:[function(require,module,exports){
module.exports = function(src, callback){

  if (typeof src == 'string') {

    var script = document.createElement('script');

    if (script.readyState) { // IE

      script.onreadystatechange=function(){

        if (script.readyState=="loaded" || script.readyState=="complete") {

          script.onreadystatechange = null;

          if (typeof callback == "function") callback();
          
          callback=null;

        }
      };
    }
    else {

      script.onload=function(){

        if(typeof callback=="function") callback(); callback=null;

      };

    }

    script.charset = "utf-8";

    script.src = src;

    script.type = 'text/javascript';

    document.getElementsByTagName('head')[0].appendChild(script);

  } else {

    var loadedScriptCount=0;

    for (var i=0; i<src.length; i++) {

      loadJs(src[i], function(){

        loadedScriptCount++;

        if(loadedScriptCount==src.length) {

          callback();
          callback = null;

        }
      });

    }

  }

};
},{}],11:[function(require,module,exports){
// this guy does not include the getStack method
module.exports = {
  get: function(url, settings, callback, ajax) {
    if (ajax === undefined) ajax = false;

    if (ajax) {
      this.getXmlHttp(url, settings, callback);
    } else {
      this.getJsonp(url, settings, callback);
    }
  },
  postXmlHttp: function(url, settings, callback) {

    this.xmlHttp(url, settings, callback, "POST");

  },
  getXmlHttp: function(url, settings, callback) {

    this.xmlHttp(url, settings, callback, "GET");

  },

  xmlHttp: function(url, settings, callback, type) {

    var self = this;

    if (typeof settings == 'function') {
      callback = settings;
      settings = {};
    }

    var retries = 0;
    if (settings.retries) retries = settings.retries;
    if (!settings.timeout) settings.timeout = 2000;
    if (!settings.name) settings.name = url;

    var finished = false;

    if (settings.logger) settings.logger.log('remote.getXmlHttp - preparing get for item ' + settings.name);

    var sentUrl = type=="GET"?this.appendToUrl(url, settings.data):url;

    var onSuccess = function(data){

      if (finished) return;

      finished = true;

      if (settings.logger) settings.logger.log('remote.getXmlHttp - response received for item ' + settings.name);

      callback('success', data);

    };

    var onTimeout = function() {

      if (finished) return;

      if (retries) {

        if (settings.logger) settings.logger.log('remote.getXmlHttp - timeout hit, retrying for item ' + settings.name);
        
        sendRequest();

        retries--;

      } else {

        finished = true;

        if (settings.logger) settings.logger.log('remote.getXmlHttp - timeout hit, no retry for item ' + settings.name);

        callback('timeout');

      }

    };

    // this will call the timeout if is hit, but will call callback even if it comes after
    var sendRequest = function(){

      var timer = setTimeout(function(){

        onTimeout();

      }, settings.timeout);

      var xhr = new XMLHttpRequest(),

      response;

      xhr.onreadystatechange = function(){

        if (xhr.readyState==4) if (xhr.status==200) {

          clearTimeout(timer);

          if (xhr.responseText.substring(0,1)=='(') {
            response = xhr.responseText.substring(1).substring(0,xhr.responseText.length-2);
          } else {
            response = xhr.responseText;
          }
            
          onSuccess(JSON.parse(response));

        }

      };

      xhr.open(type, sentUrl, true);
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      xhr.setRequestHeader("Content-Type", type=="POST"?"application/x-www-form-urlencoded":"text/plain;charset=UTF-8");
      
      if (type=="GET") {

        xhr.send();

      } else {

        xhr.send(self.appendToUrl('', settings.data).substr(1));

      }

    };

    sendRequest(onSuccess, onTimeout);

  },

  getJsonp: function(url, settings, callback){

    var timer,
      timeout = settings.timeout?settings.timeout:2000,
      retries = settings.retries?settings.retries:0,
      sentUrl = this.appendToUrl(url, settings.data),
      callbackParam = {},
      self = this,
      callbackParamName = settings.callbackParamName?settings.callbackParamName:'callback';

    var handleResponse = function(data){
      clearTimeout(timer);
      callback('success', data);
    };

    var handleTimeout = function() {
      if ((!window[settings.data.callback]) || !retries) return callback('timeout');
      sendQuery();
      retries--;
    };

    var sendQuery = function() {
      var callbackName = 'jsonpCb' + Math.ceil(Math.random()*100000);

      window[callbackName] = handleResponse;
      var script = document.createElement('script');
      if (sentUrl.indexOf(callbackParamName + '=') != -1) { // callback param is already in string
        script.src = sentUrl.substring(0, sentUrl.indexOf(callbackParamName + '=') + 9) + callbackName + sentUrl.substring(sentUrl.indexOf(callbackParamName + '=') + 9);
      } else {
        callbackParam[callbackParamName] = callbackName;
        script.src = self.appendToUrl(sentUrl, callbackParam);
      }
        
      document.getElementsByTagName('head')[0].appendChild(script);
    };

    sendQuery();
    
  },
  appendToUrl: function(url, data) {

    if (typeof data != 'undefined') {

      if (url.indexOf('?') == -1) {
        url = url + '?';
      } else {
        url = url + '&';
      }

      for (var name in data) {

        if (typeof data[name] == 'object') {
          for (var index in data[name]) {
            url = url + name + '[]=' + encodeURIComponent(data[name][index]) + '&';
          }
        } else {

          url = url + name + '=' + encodeURIComponent(data[name]) + '&';

        }

      }

      if (url.substr(url.length-1, 1) == '&') url = url.substr(0, url.length-1);

    }

    return url;
  }
};
},{}],12:[function(require,module,exports){

},{}],13:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.once = noop;
process.off = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],14:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require("/usr/local/lib/node_modules/watchify/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/usr/local/lib/node_modules/watchify/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":13}]},{},[2])