var cn = require('../../js/lib/common/common.mod.js'),

statsParser = require('./statsParser.js'),

parser,

gChartWrapper = require('./googleChartWrapper.js'),

ejs = require('ejs'),

labels = {
  unset: 'Unset',
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  linkContent: {
    list: 'see chart',
    chart: 'see list'
  }
},

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
    statTargetElem: 'div'
  },
  templates: {
    main: '<a class="url"><%= linkContent %></a><h2><%= label %></h2><div></div>',
    simple: '<ul class="<%= classes.datavizList %>"><% for (var i in data) { %><li><label><%= data[i].label %></label><span><%= data[i].count %></span></li><% } %></ul>',
    combo: '<ul class="<%= classes.datavizTopList %>"><% for (var i in data) { %><li><label><%= i %></label><ul class="<%= classes.datavizList %>"><% for (var j in data[i]) { %><li><label><%= data[i][j].label %></label><span><%= data[i][j].count %></span></li><% }%></ul></li><% } %>',
  }
};

module.exports = function(ctl, options, callback) {

  cn.extend(labels, options.labels?options.labels:{});

  cn.extend(params, options);

  canvas = params.canvas;
  
  parser = statsParser(ctl, {
    labels: labels
  });

  gChartMake = gChartWrapper({w: params.w, d: params.d}, callback);

  return createWidget;

};

var createWidget = function(config) {

  var wConfig = cn.extend({
    display: 'list', // other being chart
    label: '',
    sections: false // mandatory
  }, config),

  display = wConfig.display;

  var wDiv = params.d.createElement('div');

  var wData = parser(config.sections);

  canvas.appendChild(wDiv);

  wDiv.className = params.classes.section;

  setContent(wDiv, wData, display, wConfig);
},

setContent = function(wCanvas, wData, currentMode, wConfig) {

  clearWidget(wCanvas);

  wCanvas.innerHTML = ejs.render(params.templates.main, {linkContent: labels.linkContent[currentMode], classes: params.classes, label: wConfig.label});

  if (currentMode=='list') {

    renderList(cn.el(wCanvas, params.selectors.statTargetElem), wConfig.label, wData, wConfig.sections.length);

  } else {

    gChartMake(wData, {
      canvas: cn.el(wCanvas, params.selectors.statTargetElem),
      depth: wConfig.sections.length,
      countName: labels.count
    });

  }

  cn.addEvent(cn.el(wCanvas, 'a'), 'click', function(e) {

    cn.preventDefault(e);

    setContent(wCanvas, wData, currentMode=='list'?'chart':'list', wConfig);

  });


},

renderList = function(canvas, label, data, depth) {

  if (typeof depth == 'undefined') depth = 1;

  var template = params.templates.simple;

  if (depth==2) template = params.templates.combo;

  var child;

  canvas.innerHTML = ejs.render(template, cn.extend({labels: params.labels, classes: params.classes}, {data: data}));

},

clearWidget = function(elem) {

  var child;

  while (child = cn.childObject(elem, 0))
    elem.removeChild(child);

};