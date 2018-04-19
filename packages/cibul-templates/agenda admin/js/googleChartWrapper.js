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