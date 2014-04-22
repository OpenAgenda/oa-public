var cn = require('../../js/lib/common/common.mod.js'),

remote = require('../../js/lib/remote/remote.mod.js'),

loadJs = require('../../js/lib/loadJs/loadJs.mod.js'),

statsParser = require('./statsParser.js');

window.handleAdminDataViz = function(options) {

  var params = cn.extend({
    canvas: false,
    ctl: false,
    templates: {
      totalPublished: '<span><%= data %></span>',
      totalDatesPublished: '<span><%= data %></span>',
      totalPublishedBy: '<ul class="<%= classes.datavizList %>"><% for (var i in data) { %><li><label><%= data[i].label %></label><span><%= data[i].count %></span></li><% } %></ul>',
      totalPublishedByBy: '<ul class="<%= classes.datavizTopList %>"><% for (var i in data) { %><li><label><%= i %></label><ul class="<%= classes.datavizList %>"><% for (var j in data[i]) { %><li><label><%= data[i][j].label %></label><span><%= data[i][j].count %></span></li><% }%></ul></li><% } %>'
    },
    labels: {
      totalPublished: 'Total published events',
      totalDatesPublished: 'Total published dates',
      totalPublishedByCategories: 'Total published by categories',
      totalPublishedByTags: 'Total published by tag',
      totalPublishedByRegion: 'Total published by region',
      totalPublishedByDepartment: 'Total published by department',
      totalPublishedByCity: 'Total published by city',
      totalPublishedByCategoryAndRegion: 'Total published by category and region',
      totalPublishedByCategoriesAndTags: 'Total published by category and tags',
      categoryUnset: 'Events with no category',
      tagUnset: 'Events with no set tags',
      regionUnset: 'Undefined',
      departmentUnset: 'Undefined',
      cityUnset: 'Undefined',
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    classes: {
      section: 'dataviz-section',
      datavizList: 'dataviz-list',
      datavizTopList: 'dataviz-top-list',
    }
  }, options);

  loadResources(params, function(ctl) {

    /* var defaultConfig = [
      {label: 'Published events by Month', sections: ['month']},
      {label: 'Published events by Category', sections: ['category']},
      {label: 'Published events by Tag', sections: ['tag']},
      {label: 'Published events by City', sections: ['city']}
    ]; */

    var parser = statsParser(ctl, params);

    parser(['year', 'category']);

  });

},

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

  /*google.load('visualization', '1.0', {'packages':['corechart']});

  google.setOnLoadCallback(function() {

    attempt();

  });*/

  cn.addEvent(window, 'load', function() {

    attempt();

  });

};