(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"../../js/lib/common/common.mod.js":3,"../../js/lib/loadJs/loadJs.mod.js":4,"../../js/lib/remote/remote.mod.js":5,"./statsParser.js":2}],2:[function(require,module,exports){
var cn = require('../../js/lib/common/common.mod.js'),

ctl,

params,

init = function(ctlData) {

  // this creates the parser

  var map = {
    year: dateLib.extractYear,
    month: dateLib.extractMonth,
    day: dateLib.extractDay,
    place: locationLib.extractPlace,
    city: locationLib.extractCity,
    region: locationLib.extractRegion,
    department: locationLib.extractDepartment,
    category: categoryLib.extract,
    tag: tagLib.extract
  };

  module.exports = function(ctlData, options) {

    ctl = ctlData;

    params = cn.extend({}, options);

    return function(attributes) {

      if (typeof attributes == 'string') attributes = [attributes];

      if (attributes.length==1) {

        return processArticles(ctl.a, map[attributes[0]]);

      } else {

        console.log(map[attributes[0]]);
        console.log(map[attributes[1]]);

        return processSubsets(ctl.a, map[attributes[0]], map[attributes[1]]);

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

    if (typeof article.c == 'undefined') return [];

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

    if (typeof article.t == 'undefined') return [];

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
  extractRegion: function(article) {
    return locationLib.extract(article, 'rg');
  },
  extract: function(article, key) {

    var values = [];

    locationLib.loopArticleLocations(article, function(location) {

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

  // here extractFunc picks out the months 

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
},{"../../js/lib/common/common.mod.js":3}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
},{}]},{},[1])