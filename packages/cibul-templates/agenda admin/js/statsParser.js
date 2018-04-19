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