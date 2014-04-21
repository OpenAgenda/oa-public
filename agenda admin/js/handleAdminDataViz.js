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

  _renderComboChart = function(title, label, data) {

    var div = document.createElement('div');

    el(params.canvas).appendChild(div);

    var cData = new google.visualization.DataTable();

    cData.addColumn('string', label);

    for (var first in data) break;

    for (var i in data[first]) cData.addColumn('number', i);

    for (i in data) {

      var newRow = [i];

      for (var j in data[i]) newRow.push(data[i][j].count);

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

  _renderChart = function(type, title, countName, itemName, data) {

    var div = document.createElement('div');

    el(params.canvas).appendChild(div);
    
    var cData = new google.visualization.DataTable();

    cData.addColumn('string', itemName);

    cData.addColumn('number', countName);

    for (var i in data) {
      cData.addRow([data[i].label, data[i].count]);
    }

    // Set chart options

    var chart = new google.visualization[type](div);
    
    chart.draw(cData, {title: title, width:'100%', height:300});

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

  _runByArticles = function(articles, extractFunc, filterEmpty) {

    var sortGroup = _sortGroup(extractFunc);

    for (var i in articles)
      _picker(articles[i], sortGroup, extractFunc);

    if (sortGroup[null] && !sortGroup[null].count) delete sortGroup[null];

    if (filterEmpty) for (i in sortGroup)
      if (!sortGroup[i].count) delete sortGroup[i];

    return sortGroup;

  },

  _runBySubset = function(articles, topExtractFunc, bottomExtractFunc, filterEmpty) {

    var parentGroup = {};

    var subsets = _subsets(articles, topExtractFunc);

    for (var key in subsets)
      parentGroup[key] = _runByArticles(subsets[key], bottomExtractFunc, filterEmpty);

    return parentGroup;

  },

  /**
   * category functins
   */
  
  _category = {

    labels: function() {

      if (!categoryLabels) {

        categoryLabels = {};

        for (var i = ctl.ct.length - 1; i >= 0; i--)
          categoryLabels[ctl.ct[i].s] = ctl.ct[i].c;

      }

      return categoryLabels;
    },

    extract: function(article) {

      if (typeof article.c == 'undefined') return [];

      var labels = _category.labels();

      return [labels[article.c]];
    },

  },

  _tag = {

    labels: function() {

      if (!tagLabels) {

        tagLabels = {};

        for (var i = ctl.t.length - 1; i >= 0; i--)
          tagLabels[ctl.t[i].s] = ctl.t[i].t;

      }

      return tagLabels;
    },

    extract: function(article) {

      if (typeof article.t == 'undefined') return [];

      var labels = _tag.labels(), tagLabels = [];

      for (var i = article.t.length - 1; i >= 0; i--)
        tagLabels.push(labels[article.t[i]]);

      return tagLabels;

    },
  },

  _date = {

    extractDays: function(article) {

      var days = [], pairList = [];

      _date.loopArticleDates(article, function(date) {

        var day = date.substr(8, 2) + ' ' + params.labels.shortMonths[parseInt(date.substr(5, 2), 10)-1] + ' ' + date.substr(0, 4);

        if (!contains(days, day)) {
          days.push(day);
          pairList.push({label: day, sortKey: date});
        }

      });

      return pairList;

    },

    extractMonths: function(article) {

      var months = [], pairList = [];

      _date.loopArticleDates(article, function(date) {

        var month = params.labels.shortMonths[parseInt(date.substr(5, 2), 10)-1] + ' ' + date.substr(0, 4);

        if (!contains(months, month)) {
          months.push(month);
          pairList.push({label: month, sortKey: date});
        }

      });

      return pairList;

    },

    extractYears: function(article) {

      var years = [], pairList = [];

      _date.loopArticleDates(article, function(date) {
        
        var year = date.substr(0, 4);

        if (!contains(years, year)) {
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

  _location = {
    extractPlace: function(article) {
      return _location.extract(article, 'p');
    },
    extractCity: function(article) {
      return _location.extract(article, 'ct');
    },
    extractDepartment: function(article) {
      return _location.extract(article, 'dp');
    },
    extractRegion: function(article) {
      return _location.extract(article, 'rg');
    },
    extract: function(article, key) {

      var values = [];

      _location.loopArticleLocations(article, function(location) {

        values.push(location[key]);

      });

      return values;

    },
    loopArticleLocations: function(article, callback) {
      for (var l in article.l)
        callback(article.l[l]);
    },
  },

  _compareSortKeys = function(a,b) {

    var aKey = (typeof a.sortKey == 'undefined')?a:a.sortKey,

    bKey = (typeof b.sortKey == 'undefined')?b:b.sortKey;

    if (aKey < bKey)
       return -1;
    if (aKey > bKey)
      return 1;

    return 0;
  },


  _picker = function(article, sortGroup, extractFunc) {

    var values = extractFunc(article);

    for (var i = 0; i < values.length; i++) {

      var label = (typeof values[i].label == 'undefined')?values[i]:values[i].label;

      sortGroup[label].count++;
    }

  },

  _subsets = function(articles, extractFunc) {

    var subsets = {};

    for (var a in articles) {

      var values = extractFunc(articles[a]);

      for (var i = values.length - 1; i >= 0; i--) {

        var label = (typeof values[i].label !== 'undefined')?values[i].label:values[i];

        if (typeof subsets[label] == 'undefined') subsets[label] = [];

        subsets[label].push(articles[a]);

      }

    }
      
    return subsets;

  },

  _sortGroup = function(extractFunc) {

    var group = {}, aggregated = [];

    for (var i in ctl.a) {

      var val = extractFunc(ctl.a[i]);

      if (val !== null) aggregated = aggregated.concat(val);

    }

    aggregated.sort(_compareSortKeys);

    for (i = 0; i < aggregated.length; i++) {

      var label = (typeof aggregated[i].label !== 'undefined')?aggregated[i].label:aggregated[i];

      group[label] = { label: label, count: 0 };

    }
      
    return group;

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