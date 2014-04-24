var handleAdminDataViz = function(options) {

  var params = extend({
    canvas: false,      // required. canvas element
    ctl: false,          // required. control data
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
  }, options),

  ctl, categoryLabels, tagLabels,

  run = function() {

    // here everything is stacked up
    // an element could be calculated, then graphed,
    // following a config store
    

    // a module for handling the agenda data like this and that
    // a module for rendering the data on a page following a configuration
    // a module for reading agenda config and handling the menus
    // 
    // browserify can compile that shit and get it ready
    // 
    // everytime it is saved.
    

    /*_writeTotalPublished();

    _writeTotalPublishedDates();*/

    /*_renderAndAppend(
      params.labels.totalPublishedByCity,
      params.templates.totalPublishedBy,
      _runByArticles(ctl.a,_location.extractCity)
    );*/

    /*_renderAndAppend(
      'yalla',
      params.templates.totalPublishedByBy,
      _runBySubset(ctl.a, _date.extractYears, _tag.extract)
    );*/

    /*_renderChart('BarChart', 'Events by city', 'Events', 'Cities', _runByArticles(ctl.a,_location.extractCity));

    _renderChart('ColumnChart', 'Events by category', 'Events', 'Categories', _runByArticles(ctl.a, _category.extract));

    _renderChart('ColumnChart', 'Events by month', 'Events', 'Months', _runByArticles(ctl.a, _date.extractMonths));

    _renderComboChart('Events by year by category', 'year', _runBySubset(ctl.a, _date.extractYears, _category.extract));

    _renderChart('ColumnChart', 'Events by month', 'Events', 'Months', _runByArticles(ctl.a, _date.extractMonths));*/

    _renderChart('ColumnChart', 'Events by tag', 'Events', 'Tags', _runByArticles(ctl.a,_category.extract));

    _renderAndAppend(
      params.labels.totalPublishedByTags,
      params.templates.totalPublishedBy,
      _runByArticles(ctl.a,_tag.extract)
    );

  },

  

  _writeTotalPublished = function() {

    _renderAndAppend(params.labels.totalPublished, params.templates.totalPublished, Object.size(ctl.a));

  },

  _writeTotalPublishedDates = function() {

    var dateCount = 0;

    for (var i in ctl.a)
      for (var j in ctl.a[i].l)
        dateCount += ctl.a[i].l[j].d.length;

    _renderAndAppend(params.labels.totalDatesPublished, params.templates.totalDatesPublished, dateCount);

  },

  

  _renderAndAppend = function(head, template, templateData) {

    var div = document.createElement('div'), child;

    div.innerHTML = new EJS({text: template}).render(extend({labels: params.labels, classes: params.classes}, {data: templateData}));

    div.className = params.classes.section;

    var headElem = document.createElement('h2');

    headElem.innerHTML = head;

    div.insertAdjacentElement('afterbegin', headElem);

    el(params.canvas).appendChild(div);

  },

  loadRes = function(callback) {

    var loadCount = 2,

    attempt = function() {

      loadCount--;

      if (loadCount===0) callback();

    };

    if (typeof params.ctl == 'string') {

      loadCount ++;

      remote.getJsonp(params.ctl, {data: {format: 'jsonp', getcontroldata: ''} }, function(responseType, data){

        ctl = data;

        attempt();

      });

    } else {

      ctl = params.ctl;

    }

    google.load('visualization', '1.0', {'packages':['corechart']});

    google.setOnLoadCallback(function() {

      attempt();

    });

    addEvent(window, 'load', function() {
  
      attempt();

    });

  };

  loadRes(run);

};