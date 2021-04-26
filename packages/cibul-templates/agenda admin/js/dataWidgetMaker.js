var cn = require('../../js/lib/common/common.mod.js'),

statsParser = require('./statsParser.js'),

parser,

totals,

gChartWrapper = require('./googleChartWrapper.js'),

_ = require('lodash'),

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

  sandbox.innerHTML = _.template(params.templates.total)(cn.extend({labels: labels}, totals));

  canvas.appendChild(cn.childObject(sandbox, 0));

},

setContent = function(wCanvas, wData, currentMode, wConfig, removeCallback) {

  clearWidget(wCanvas);

  var label = setTitleLabel(wConfig.sections, wConfig.filter);

  wCanvas.innerHTML = _.template(params.templates.main)({ labels: labels, linkContent: labels.linkContent[currentMode], classes: params.classes, label: label });

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

  canvas.innerHTML = _.template(template)(cn.extend({labels: params.labels, classes: params.classes, odd: true}, {data: data}));

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

  return _.template(params.templates.csv)({rows: rows});

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
