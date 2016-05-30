/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var parser = __webpack_require__(1),
	    cn = __webpack_require__(2),
	    config = __webpack_require__(4),
	    UID = 0,
	    env = window.env ? window.env : 'prod',
	    tpl = __webpack_require__(5),
	    tplMap = __webpack_require__(6),
	    remote = __webpack_require__(7),
	    debug = __webpack_require__(8),
	    style = __webpack_require__(9),
	    styler = __webpack_require__(10),
	    defaults = {
	  uid: false, // required
	  link: false, // optional. link to agenda page
	  eventPart: false, // required. bit to add to link to open event
	  lang: 'fr',
	  useStyle: true,
	  count: config.count
	};

	if (cn.contains(['dev', 'tpl'], env)) debug.enable('*');

	cn.addEvent(window, 'load', _init);

	function widget(elem, options) {

	  var params = cn.extend({}, defaults, options),
	      log = debug('preview ' + params.uid);

	  if (!params.uid) return log('preview widget uid not found');

	  log('fetching agenda data');

	  _fetch(params.uid, function (err, data) {

	    if (err) return log('could not retrieve agenda data %s', err);

	    var wTpl = _extractTemplate(tpl, elem),
	        events = _clean(data.events, {
	      lang: params.lang,
	      link: params.link,
	      eventPart: params.eventPart,
	      count: params.count
	    });

	    if (!events.length) return log('there are no upcoming events');

	    styler(style);

	    elem.innerHTML = '';

	    elem.insertAdjacentElement('afterbegin', _render(wTpl, { events: events, total: data.total }));
	  });
	}

	function _render(template, data) {

	  var div = document.createElement('div'),
	      p = parser(tplMap);

	  p.load(template);

	  div.innerHTML = p.render(data);

	  return div;
	}

	function _clean(events, options) {

	  var lang = options.lang;

	  return events.slice(0, options.count).map(function (event) {

	    var e = cn.extend({}, event);

	    _flattenMultilinguals(event, e, lang);

	    _defineEventLink(event, e, options);

	    if (e.thumbnail) e.thumbnail = e.thumbnail.replace('cibuldev', 'cibul');
	    if (e.image) e.image = e.image.replace('cibuldev', 'cibul');

	    return e;
	  });
	}

	function _extractTemplate(defaultTemplate, elem) {

	  // pick out commented section
	  var startIndex = elem.innerHTML.indexOf('<!--'),
	      endIndex = elem.innerHTML.indexOf('-->');

	  if (startIndex == -1 || endIndex == -1) {

	    return defaultTemplate;
	  }

	  return elem.innerHTML.substr(startIndex + '<!--'.length, endIndex - startIndex - '<!--'.length);
	}

	function _defineEventLink(event, e, options) {

	  var link = options.link,
	      eventPart = options.eventPart;

	  e.link = link + eventPart.replace('{uid}', event.uid);
	}

	function _flattenMultilinguals(event, e, lang) {

	  cn.forEach(['title', 'description', 'longDescription', 'range'], function (field) {

	    var l = false;

	    for (l in event[field]) {
	      break;
	    }if (event[field] && typeof event[field][lang] !== 'undefined') {

	      l = lang;
	    }

	    if (l) e[field] = event[field][l];
	  });
	}

	function _fetch(uid, cb) {

	  remote.get((config.res[env] ? config.res[env].json : config.res.all.json).replace('{uid}', uid), { timeout: config.timeout }, function (responseType, data) {

	    cb(responseType === 'success' ? null : responseType, data);
	  }, env === 'tpl');
	}

	function _filterByAttr(obj, arr) {

	  var newObj = {};

	  cn.forEach(arr, function (name) {

	    if (obj[name] !== undefined) newObj[name] = obj[name];
	  });

	  return newObj;
	}

	function _init() {

	  var res = config.res[env] ? config.res[env] : config.res.all,
	      found = false,
	      _process = function _process(elem) {

	    found = true;

	    var arr = elem.getAttribute(config.attributes.config).split('|'),
	        lang = elem.hasAttribute(config.attributes.lang) ? elem.getAttribute(config.attributes.lang) : config.defaultLang,
	        count = elem.hasAttribute(config.attributes.count) ? parseInt(elem.getAttribute(config.attributes.count), 10) : 3,
	        link = cn.el(elem, 'a').getAttribute('href');

	    widget(elem, {
	      uid: arr[UID],
	      link: link,
	      eventPart: link.indexOf('openagenda.com') !== -1 ? res.eventPart : res.embedEventPart,
	      useStyle: !elem.hasAttribute(config.attributes.noDefaultStyle),
	      count: count
	    });
	  };

	  cn.forEach(cn.els(config.selector), _process);

	  if (found) return;

	  cn.forEach(document.querySelectorAll(config.backupSelector), function (elem) {

	    cn.addClass(elem, config.backupClasses);

	    _process(elem);
	  });
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var debug = __webpack_require__( !(function webpackMissingModule() { var e = new Error("Cannot find module \"debug\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()) ),

	log = debug( 'parser' );

	module.exports = parser;

	function parser( struct ) {

	  var log = debug( 'parser ' + struct.name );

	  if ( !struct ) throw 'parser structure missing';

	  var attributes = _validateAttributes( struct.attributes ),

	  template,

	  templateAttributes, // attributes which are in template

	  templateAttributeBlocks; // attributes which are in template

	  if ( struct.children ) {

	    log( 'children' );

	    struct.children = _createChildrenParsers( struct.children );

	  }

	  return {
	    load: load,
	    render: render
	  };

	  /**
	   * load template (validate, while you are at it)
	   */

	  function load( tpl ) {

	    // cut bits down to hand over to children
	    if ( struct.children ) {

	      struct.children.forEach( function( child ) {

	        tpl = _childLoadAndSlice( child, tpl );

	      });

	    } 

	    // spot blocks and variables. any unknown throws errors

	    templateAttributes = _extractTemplateAttributes( attributes, tpl );

	    templateAttributeBlocks = _extractTemplateAttributeBlocks( attributes, tpl );

	    template = tpl;

	  }


	  function render( data ) {

	    var clean = _mergeExpected( data, templateAttributes, struct.children );

	    if ( !template ) throw 'template is undefined';

	    var rendered = template;

	    for( var i in clean ) {

	      // process the children blocks
	      
	      if ( _isArray( clean[ i ] ) ) {

	        // find child and process
	        rendered = _renderChild( i, clean[ i ], struct.children, rendered );

	      }
	      
	      // process the attribute blocks

	      if ( templateAttributeBlocks[ i ] !== undefined ) {
	      
	        if ( !data[ i ] ) {

	          rendered = _removeBlock( rendered, templateAttributeBlocks[ i ] );

	        } 

	      }

	      // process the attributes
	      
	      if ( templateAttributes[ i ] !== undefined ) {

	        rendered = rendered.replace( new RegExp( '{' + templateAttributes[ i ] + '}', 'g'), data[ i ] );

	      }

	    }

	    rendered = _removeRemainingStatements( rendered );

	    return rendered;

	  }

	}



	function _validateAttributes( attributes ) {

	  if ( !attributes ) attributes = [];

	  attributes.forEach( function( attr ) {

	    if ( attr.mapTo === undefined || attr.name === undefined ) {

	      throw new Error( 'both mapTo and name must be defined in attribute' );

	    }

	  });

	  return attributes;

	}


	/**
	 * creates a parser for each
	 * child of current parser
	 */

	function _createChildrenParsers( children ) {

	  children.forEach( function( child ) {

	    _defineDepth( child );

	    child.parser = parser( child );

	  });

	  // deeper children must be processed first
	  return children.sort( function( a, b ) {

	    return a.depth < b.depth;

	  } );

	}

	function _defineDepth( node ) {

	  var maxDepth = 0;

	  if ( node.depth !== undefined ) return node.depth;

	  node.depth = 0;

	  if ( node.children !== undefined ) {

	    node.children.forEach( function( child ) {

	      var childDepth = _defineDepth( child );

	      if ( childDepth > maxDepth ) maxDepth = childDepth;

	    });

	    node.depth = maxDepth + 1;

	  }

	  return node.depth;

	}

	/**
	 * from given template, extract bit relevent to
	 * given child and return stripped template
	 */

	function _childLoadAndSlice( child, tpl ) {

	  var indexes, childTemplate;

	  try {

	    indexes = _findBlockIndexes( tpl, child.name );

	  } catch( e ) {

	    log( 'child %s is undefined in template', child.name );

	    return tpl;

	  }

	  childTemplate = tpl.substr( indexes[ 2 ], indexes[ 1 ] - indexes[ 2 ] );

	  child.parser.load( childTemplate );

	  return tpl.replace( childTemplate, '' );

	}


	function _renderChild( key, arr, children, rendered ) {

	  var child = children.filter( function( child ) {

	    return child.mapTo == key;
	  
	  } )[ 0 ],

	  indexes, childRender = '';

	  try {

	     indexes = _findBlockIndexes( rendered, child.name );

	  } catch( e ) {

	    log( 'child %s is not used in template', child.name );

	    return rendered;

	  }

	  arr.forEach( function( childData ) {

	    childRender += child.parser.render( childData );

	  } );

	  return rendered.substr( 0, indexes[ 0 ] )

	  + childRender

	  + rendered.substr( indexes[ 3 ] );

	}


	/**
	 * extract blocks corresponding to attributes
	 */

	function _extractTemplateAttributeBlocks( attributes, template ) {

	  var filteredTpl = _removeBlocks( attributes, template ),

	  attributeBlocks = {};

	  attributes.forEach( function( attr ) {

	    try {

	      _findBlockIndexes( filteredTpl, attr.name );
	          
	      attributeBlocks[ attr.mapTo ] = attr.name;

	    } catch( e ) {};

	  });

	  return attributeBlocks;

	}


	function _findBlockIndexes( tpl, blockName ) {

	  var openingStatement = '{block:' + blockName + '}',

	  closingStatement = '{/block:' + blockName + '}',

	  opening, closing;

	  opening = tpl.indexOf( openingStatement );

	  if ( opening == -1 ) throw 'opening block statement not found';

	  closing = tpl.indexOf( closingStatement );

	  if ( closing == -1 ) throw 'closing block statement not found: ' + '{/block:' + blockName + '}';

	  if ( closing < opening ) throw 'closing block statement should come after opening block statement: ' + '{block:' + attr.name + '}';

	  return [ opening, closing, opening + openingStatement.length, closing + closingStatement.length ];

	}



	/**
	 * extract attributes which are effectively present in template
	 */

	function _extractTemplateAttributes( attributes, template ) {

	  // strip template of blocks which are not attribute blocks

	  var filteredTpl = _removeBlocks( attributes, template ),

	  templateAttributes = {};

	  attributes.forEach( function( attr ) {

	    var matches = filteredTpl.match( new RegExp( '{' + attr.name + '}', 'g' ) );

	    templateAttributes[ attr.mapTo ] = attr.name;

	  });

	  return templateAttributes;

	}


	function _removeBlocks( attributes, template ) {

	  var stripped = template,

	  attributeNames = attributes.map( function( a ) {
	    return a.name;
	  }),

	  opening = template.match(/{block:[a-z|A-Z]+}/g);

	  if ( !opening ) return template;

	  opening.forEach( function( o ) {

	    var name = o.replace( /{block:|}/g, '' );

	    if ( attributeNames.indexOf( name ) == -1 ) {

	      // it is not an attribute block;
	      // kill it with the edge of the sword.
	      
	      stripped = _removeBlock( stripped, name );

	    }

	  });

	  return stripped;

	}


	/**
	 * remove block from template
	 */

	function _removeBlock( tpl, name ) {

	  var stripped = tpl, sub;

	  while( sub = _extractBlock( stripped, name ) ) {

	    stripped = stripped.replace( sub, '' );

	  }

	  return stripped;

	}


	/**
	 * return first occurrence
	 * of block content in given template
	 */

	function _extractBlock( tpl, name ) {

	  var o = '{block:' + name + '}', 

	  cl = o.replace(/^{/, '{/'), clIndex,

	  sub, oIndex = tpl.indexOf( o );

	  if ( oIndex == -1 ) {

	    return false;

	  }

	  // start from where the opening block is
	  sub = tpl.substr( oIndex );

	  // find closing index
	  clIndex = sub.indexOf( cl );

	  if ( clIndex == -1 ) {

	    throw 'closing statement of block not found: ' + cl;

	  }

	  // remove the bit after the closing index
	  sub = sub.substr( 0, clIndex + cl.length );

	  return sub;

	}


	function _removeBlockStatement( tpl, name ) {

	  return tpl.replace( new RegExp( '{(|/)block:' + name + '}', 'g' ), '' );

	}

	function _mergeExpected( data, tplAttributes, children ) {

	  var clean = {};

	  for( var i in tplAttributes ) {

	    clean[ i ] = null;

	    if ( typeof data[ i ] !== 'undefined' ) {

	      clean[ i ] = data[ i ];

	    }

	  }

	  if ( children ) children.forEach( function( child ) {

	    clean[ child.mapTo ] = [];

	    if ( typeof data[ child.mapTo ] !== 'undefined' ) {

	      clean[ child.mapTo ] = data[ child.mapTo ];

	    }

	  });


	  return clean;

	}

	function _removeRemainingStatements( tpl ) {

	  return tpl.replace( /{(|\/)(block:|)([a-z]|[A-Z])+}/g , '');

	}

	function _isArray( obj ) {

	  return Object.prototype.toString.call(obj) === '[object Array]';

	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof2 = __webpack_require__(3);

	var _typeof3 = _interopRequireDefault(_typeof2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.addZero = function (number) {
	  return (parseInt(number, 10) < 10 ? '0' : '') + number;
	};

	/* Object.size */
	exports.size = function (obj) {
	  var size = 0,
	      key;
	  for (key in obj) {
	    if (obj.hasOwnProperty(key)) size++;
	  }
	  return size;
	};

	/* extend */
	exports.extend = function () {
	  for (var i = 1; i < arguments.length; i++) {
	    for (var key in arguments[i]) {
	      if (arguments[i].hasOwnProperty(key)) arguments[0][key] = arguments[i][key];
	    }
	  }return arguments[0];
	};

	/*contains*/
	exports.contains = function (a, obj) {
	  var i = a.length;
	  while (i--) {
	    if (a[i] === obj) {
	      return true;
	    }
	  }
	  return false;
	};

	exports.toCamelCase = function toCamelCase(input) {

	  if ((typeof input === 'undefined' ? 'undefined' : (0, _typeof3.default)(input)) == 'object') {

	    var camelCased = {};

	    for (var key in input) {

	      if (!contains(['parse', '_typeCast'], key)) {

	        camelCased[toCamelCase(key)] = input[key];
	      }
	    }

	    return camelCased;
	  }

	  return input.replace(/[-_](.)/g, function (match, group1) {

	    return group1.toUpperCase();
	  });
	};

	exports.isArray = function (obj) {
	  return Object.prototype.toString.call(obj) === '[object Array]';
	};

	exports.removeValueFromArray = function (arr) {
	  var what,
	      a = arguments,
	      L = a.length,
	      ax;
	  while (L > 1 && arr.length) {
	    what = a[--L];
	    while ((ax = arr.indexOf(what)) !== -1) {
	      arr.splice(ax, 1);
	    }
	  }
	  return arr;
	};

	exports.unpack = function (encoded) {
	  return JSON.parse(encoded);
	};

	var hasClass = function hasClass(element, cls) {
	  return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
	};
	var addClass = function addClass(element, className) {
	  if (!hasClass(element, className)) element.className = element.className + ' ' + className;
	};
	var removeClass = function removeClass(element, cls) {
	  if (hasClass(element, cls)) {
	    var regex = new RegExp(cls, 'g');element.className = element.className.replace(regex, '');
	  }
	};

	exports.hasClass = hasClass;
	exports.addClass = addClass;
	exports.removeClass = removeClass;

	exports.removeEvent = function (elem, types, eventHandle) {
	  if (elem === null || elem === undefined) return;
	  if (typeof types == 'string') types = [types];
	  forEach(types, function (type) {
	    if (elem.removeEventListener) {
	      elem.removeEventListener(type, eventHandle, false);
	    } else if (elem.detachEvent) {
	      elem.detachEvent('on' + type, eventHandle);
	    } else {
	      elem["on" + type] = null;
	    }
	  });
	};

	exports.addEvent = function (elem, types, eventHandle) {
	  if (elem == null || elem == undefined) return;
	  if (typeof types == 'string') types = [types];
	  forEach(types, function (type) {
	    if (elem.addEventListener) {
	      elem.addEventListener(type, eventHandle, false);
	    } else if (elem.attachEvent) {
	      elem.attachEvent("on" + type, eventHandle);
	    } else {
	      elem["on" + type] = eventHandle;
	    }
	  });
	};

	exports.preventDefault = function (event) {
	  event.preventDefault ? event.preventDefault() : event.returnValue = false;
	};

	var getElementsByClassName = exports.getElementsByClassName = function (node, classname) {
	  if (typeof node == 'string') {
	    classname = node;
	    node = document;
	  }
	  var a = [];
	  var re = new RegExp('(^| )' + classname + '( |$)');
	  var els = node.getElementsByTagName("*");
	  for (var i = 0, j = els.length; i < j; i++) {
	    if (re.test(els[i].className)) a.push(els[i]);
	  }return a;
	};

	var els = exports.els = function (node, selector) {

	  if (typeof node == 'string') {
	    selector = node;
	    node = document;
	  }

	  var prefix = selector.substr(0, 1);

	  if ('.#,'.indexOf(prefix) !== -1) selector = selector.substr(1);

	  if (prefix == '.') return getElementsByClassName(node, selector);else if (prefix == '#') {
	    var result = node.getElementById(selector);
	    if (result) return [result];else return [];
	  } else return node.getElementsByTagName(selector);
	};

	exports.el = function (node, selector) {

	  var results = els(node, selector);

	  return results.length ? results[0] : null;
	};

	/* previousObject, nextObject, childObject, getChildIndex v0.1 */
	var previousObject = function previousObject(elem) {

	  elem = elem.previousSibling;

	  while (elem && elem.nodeType != 1) {
	    elem = elem.previousSibling;
	  }return elem;
	};

	exports.previousObject = previousObject;

	exports.nextObject = function (elem) {

	  elem = elem.nextSibling;

	  while (elem && elem.nodeType != 1) {
	    elem = elem.nextSibling;
	  }return elem;
	};

	exports.childObject = function (elem, index) {

	  var i = 0,
	      realI = 0;

	  while (elem.childNodes[i]) {

	    if (elem.childNodes[i].nodeType == 1) {

	      if (realI == index) return elem.childNodes[i];

	      realI++;
	    }

	    i++;
	  }

	  return false;
	};

	exports.getChildIndex = function (child) {

	  var i = 0;

	  while ((child = previousObject(child)) !== null) {
	    i++;
	  }return i;
	};

	var forEach = function forEach(array, action) {
	  for (var i = 0; i < array.length; i++) {
	    action(array[i]);
	  }
	};

	exports.forEach = forEach;

	exports.asymDiff = function (a, b) {

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

	exports.arrDiff = function (a, b) {

	  var diff = [];

	  for (var i = 0; i < a.length; i++) {

	    if (b.indexOf(a[i]) == -1) {

	      diff.push(a[i]);
	    }
	  }

	  for (i = 0; i < b.length; i++) {

	    if (a.indexOf(b[i]) == -1) {

	      diff.push(b[i]);
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
	        if (this.nextSibling) this.parentNode.insertBefore(parsedNode, this.nextSibling);else this.parentNode.appendChild(parsedNode);
	        break;
	    }
	  };

	  if (!HTMLElement.prototype.insertAdjacentHTML) HTMLElement.prototype.insertAdjacentHTML = function (where, htmlStr) {
	    var r = this.ownerDocument.createRange();
	    r.setStartBefore(this);
	    var parsedHTML = r.createContextualFragment(htmlStr);
	    this.insertAdjacentElement(where, parsedHTML);
	  };

	  if (!HTMLElement.prototype.insertAdjacentText) HTMLElement.prototype.insertAdjacentText = function (where, txtStr) {
	    var parsedText = document.createTextNode(txtStr);
	    this.insertAdjacentElement(where, parsedText);
	  };
	}

	exports.getScrollOffsets = function (w) {

	  // Use the specified window or the current window if no argument
	  w = w || window;

	  // This works for all browsers except IE versions 8 and before
	  if (typeof w.pageXOffset !== 'undefined') return {
	    x: w.pageXOffset,
	    y: w.pageYOffset
	  };

	  // For IE (or any browser) in Standards mode
	  var d = w.document;
	  if (document.compatMode == "CSS1Compat") {
	    return {
	      x: d.documentElement.scrollLeft,
	      y: d.documentElement.scrollTop
	    };
	  }

	  // For browsers in Quirks mode
	  return {
	    x: d.body.scrollLeft,
	    y: d.body.scrollTop
	  };
	};

	exports.windowInnerHeight = function (w, d) {

	  if (!w) {
	    w = window;
	    d = document;
	  }

	  return w.innerHeight || d.documentElement.clientHeight || d.getElementsByTagName('body')[0].clientHeight;
	};

	exports.triggerEvent = function (elem, name) {

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

	exports.isElement = function (o) {
	  return (typeof HTMLElement === 'undefined' ? 'undefined' : (0, _typeof3.default)(HTMLElement)) === "object" ? o instanceof HTMLElement : //DOM2
	  o && (typeof o === 'undefined' ? 'undefined' : (0, _typeof3.default)(o)) === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string";
	};

	// add trim function to IE8
	if (typeof String.prototype.trim !== 'function') {
	  String.prototype.trim = function () {
	    return this.replace(/^\s+|\s+$/g, '');
	  };
	}

	exports.removeProperty = function (obj, name) {

	  if (typeof obj.removeProperty !== 'undefined') return obj.removeProperty(name);

	  return obj.removeAttribute(name);
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _iterator = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../core-js/symbol/iterator\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _iterator2 = _interopRequireDefault(_iterator);

	var _symbol = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../core-js/symbol\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _symbol2 = _interopRequireDefault(_symbol);

	var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default ? "symbol" : typeof obj; };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
	  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
	} : function (obj) {
	  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	module.exports = {
	  attributes: {
	    lang: 'data-lang',
	    config: 'data-cbctl',
	    count: 'data-count'
	  },
	  selector: '.cbpgpr',
	  backupSelector: '[data-oapr]',
	  backupClasses: 'oa-preview',
	  timeout: 5000,
	  defaultLang: 'fr',
	  count: 3,
	  res: {
	    all: {
	      json: '//openagenda.com/agendas/{uid}/events.json',
	      eventPart: '/events/{uid}',
	      embedEventPart: '?search[uid]={uid}'
	    },
	    dev: {
	      json: '//d.openagenda.com/agendas/{uid}/events.json',
	      eventPart: '/events/{uid}',
	      embedEventPart: '?search[uid]={uid}'
	    },
	    tpl: {
	      json: '/server/testdata/previewwidgetres.json',
	      page: '#page',
	      eventPart: '#/events/{uid}',
	      embedEventPart: '#?search[uid]={uid}'
	    }
	  }
	};

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = "<ul>\n  {block:Events}\n  <li>\n    <a href=\"{Link}\">\n      <span class=\"oa-title\">{Title}</span>\n      <span class=\"oa-desc\">{Description}</span>\n      <span class=\"oa-range\">{DateRange} - {LocationName}</span>\n    </a>\n  </li>\n  {/block:Events}\n</ul>"

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = {
		"attributes": [
			{
				"name": "TotalEvents",
				"mapTo": "total"
			}
		],
		"children": [
			{
				"name": "Events",
				"mapTo": "events",
				"attributes": [
					{
						"name": "Title",
						"mapTo": "title"
					},
					{
						"name": "Description",
						"mapTo": "description"
					},
					{
						"name": "Link",
						"mapTo": "link"
					},
					{
						"name": "ImageUrl",
						"mapTo": "image"
					},
					{
						"name": "ThumbnailUrl",
						"mapTo": "thumbnail"
					},
					{
						"name": "LocationName",
						"mapTo": "locationName"
					},
					{
						"name": "City",
						"mapTo": "city"
					},
					{
						"name": "DateRange",
						"mapTo": "range"
					},
					{
						"name": "PricingInfo",
						"mapTo": "pricingInfo"
					},
					{
						"name": "TicketUrl",
						"mapTo": "ticketLink"
					}
				]
			}
		]
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _typeof2 = __webpack_require__(3);

	var _typeof3 = _interopRequireDefault(_typeof2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// this guy does not include the getStack method
	module.exports = {
	  get: function get(url, settings, callback, ajax) {
	    if (ajax === undefined) ajax = false;

	    if (ajax) {
	      this.getXmlHttp(url, settings, callback);
	    } else {
	      this.getJsonp(url, settings, callback);
	    }
	  },
	  postXmlHttp: function postXmlHttp(url, settings, callback) {

	    if (settings.form) settings.data = this.serialize(settings.form);

	    this.xmlHttp(url, settings, callback, "POST");
	  },
	  getXmlHttp: function getXmlHttp(url, settings, callback) {

	    this.xmlHttp(url, settings, callback, "GET");
	  },

	  xmlHttp: function xmlHttp(url, settings, callback, type) {

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

	    var sentUrl = type == "GET" ? this.appendToUrl(url, settings.data) : url;

	    var onSuccess = function onSuccess(data) {

	      if (finished) return;

	      finished = true;

	      if (settings.logger) settings.logger.log('remote.getXmlHttp - response received for item ' + settings.name);

	      callback('success', data);
	    };

	    var onTimeout = function onTimeout() {

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
	    var sendRequest = function sendRequest() {

	      var timer = setTimeout(function () {

	        onTimeout();
	      }, settings.timeout);

	      var xhr = new XMLHttpRequest(),
	          response;

	      xhr.onreadystatechange = function () {

	        if (xhr.readyState == 4) if (xhr.status == 200) {

	          clearTimeout(timer);

	          if (xhr.responseText.substring(0, 1) == '(') {
	            response = xhr.responseText.substring(1).substring(0, xhr.responseText.length - 2);
	          } else {
	            response = xhr.responseText;
	          }

	          if (settings.raw) return onSuccess(response);

	          onSuccess(JSON.parse(response));
	        }
	      };

	      xhr.open(type, sentUrl, true);
	      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	      xhr.setRequestHeader("Content-Type", type == "POST" ? "application/x-www-form-urlencoded" : "text/plain;charset=UTF-8");

	      if (type == "GET") {

	        xhr.send();
	      } else {

	        var body = settings.data;

	        if (typeof body !== 'string') body = self.appendToUrl('', settings.data).substr(1);

	        xhr.send(body);
	      }
	    };

	    sendRequest(onSuccess, onTimeout);
	  },

	  getJsonp: function getJsonp(url, settings, callback) {

	    var timer,
	        timeout = settings.timeout ? settings.timeout : 2000,
	        retries = settings.retries ? settings.retries : 0,
	        sentUrl = this.appendToUrl(url, settings.data),
	        self = this,
	        callbackParamName = settings.callbackParamName ? settings.callbackParamName : 'callback';

	    var handleResponse = function handleResponse(data) {
	      clearTimeout(timer);
	      callback('success', data);
	    };

	    var handleTimeout = function handleTimeout() {
	      if (!window[settings.data.callback] || !retries) return callback('timeout');
	      sendQuery();
	      retries--;
	    };

	    var sendQuery = function sendQuery() {

	      var callbackName,
	          callbackParam = {},
	          script = document.createElement('script'),
	          urlCbNameIndex = sentUrl.indexOf(callbackParamName + '=');

	      script.setAttribute('type', 'text/javascript');

	      if (urlCbNameIndex !== -1) {

	        callbackName = sentUrl.substr(urlCbNameIndex + callbackParamName.length + 1);

	        script.src = sentUrl;
	      } else {

	        callbackName = 'jsonpCb' + Math.ceil(Math.random() * 100000);

	        callbackParam[callbackParamName] = callbackName;

	        script.src = self.appendToUrl(sentUrl, callbackParam);
	      }

	      window[callbackName] = handleResponse;

	      document.getElementsByTagName('head')[0].appendChild(script);
	    };

	    sendQuery();
	  },

	  appendToUrl: function appendToUrl(url, data) {

	    var isArray;

	    if (typeof data != 'undefined') {

	      if (url.indexOf('?') == -1) {
	        url = url + '?';
	      } else {
	        url = url + '&';
	      }

	      for (var name in data) {

	        if ((0, _typeof3.default)(data[name]) == 'object') {

	          isArray = Object.prototype.toString.call(data[name]) === '[object Array]';

	          for (var index in data[name]) {
	            url = url + name + '[' + (isArray ? '' : index) + ']=' + encodeURIComponent(data[name][index]) + '&';
	          }
	        } else {

	          url = url + name + '=' + encodeURIComponent(data[name]) + '&';
	        }
	      }

	      if (url.substr(url.length - 1, 1) == '&') url = url.substr(0, url.length - 1);
	    }

	    return url;
	  },

	  collect: function collect(a, f) {
	    var n = [];
	    for (var i = 0; i < a.length; i++) {
	      var v = f(a[i]);
	      if (v != null) n.push(v);
	    }
	    return n;
	  },

	  serialize: function serialize(f) {
	    function g(n) {
	      return f.getElementsByTagName(n);
	    };
	    var nv = function nv(e) {
	      if (e.name) return encodeURIComponent(e.name) + '=' + encodeURIComponent(e.value);
	    };
	    var i = this.collect(g('input'), function (i) {
	      if (i.type != 'radio' && i.type != 'checkbox' || i.checked) return nv(i);
	    });
	    var s = this.collect(g('select'), nv);
	    var t = this.collect(g('textarea'), nv);
	    return i.concat(s).concat(t).join('&');
	  }
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the web browser implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */

	exports = module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./debug\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;

	/**
	 * Colors.
	 */

	exports.colors = [
	  'lightseagreen',
	  'forestgreen',
	  'goldenrod',
	  'dodgerblue',
	  'darkorchid',
	  'crimson'
	];

	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */

	function useColors() {
	  // is webkit? http://stackoverflow.com/a/16459606/376773
	  return ('WebkitAppearance' in document.documentElement.style) ||
	    // is firebug? http://stackoverflow.com/a/398120/376773
	    (window.console && (console.firebug || (console.exception && console.table))) ||
	    // is firefox >= v31?
	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
	    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
	}

	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */

	exports.formatters.j = function(v) {
	  return JSON.stringify(v);
	};


	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */

	function formatArgs() {
	  var args = arguments;
	  var useColors = this.useColors;

	  args[0] = (useColors ? '%c' : '')
	    + this.namespace
	    + (useColors ? ' %c' : ' ')
	    + args[0]
	    + (useColors ? '%c ' : ' ')
	    + '+' + exports.humanize(this.diff);

	  if (!useColors) return args;

	  var c = 'color: ' + this.color;
	  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

	  // the final "%c" is somewhat tricky, because there could be other
	  // arguments passed either before or after the %c, so we need to
	  // figure out the correct index to insert the CSS into
	  var index = 0;
	  var lastC = 0;
	  args[0].replace(/%[a-z%]/g, function(match) {
	    if ('%%' === match) return;
	    index++;
	    if ('%c' === match) {
	      // we only are interested in the *last* %c
	      // (the user may have provided their own)
	      lastC = index;
	    }
	  });

	  args.splice(lastC, 0, c);
	  return args;
	}

	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */

	function log() {
	  // This hackery is required for IE8,
	  // where the `console.log` function doesn't have 'apply'
	  return 'object' == typeof console
	    && 'function' == typeof console.log
	    && Function.prototype.apply.call(console.log, console, arguments);
	}

	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */

	function save(namespaces) {
	  try {
	    if (null == namespaces) {
	      localStorage.removeItem('debug');
	    } else {
	      localStorage.debug = namespaces;
	    }
	  } catch(e) {}
	}

	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */

	function load() {
	  var r;
	  try {
	    r = localStorage.debug;
	  } catch(e) {}
	  return r;
	}

	/**
	 * Enable namespaces listed in `localStorage.debug` initially.
	 */

	exports.enable(load());


/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = ".oa-preview ul {\n\n  list-style-type: none;\n  padding: 0;\n\n}\n\n.oa-preview li {\n\n  padding: 0 0 1em;\n\n}\n\n.oa-preview a {\n\n  text-decoration: inherit;\n\n}\n\n.oa-preview span {\n\n  display: block;\n\n}\n\n.oa-preview .oa-title {\n\n  font-weight: bold;\n\n}"

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var du = __webpack_require__(11),
	    utils = __webpack_require__(13),
	    defaults = {
	  styles: {
	    disabledColor: '#ccc',
	    defaultColor: '#333',
	    activeColor: '#333',
	    selectedColor: 'blue',
	    preselectedColor: '#f0f0f0'
	  }
	},
	    sheet,
	    style = '',
	    styler = function styler(styleToAppend, styleVars, w, d) {

	  if (!w) w = window;

	  if (!d) d = document;

	  if (!sheet) _createSheet(w, d);

	  styles = utils.extend({}, defaults.styles, styleVars ? styleVars : {});

	  style += _format(styleToAppend, styles);

	  if (sheet.styleSheet) {

	    sheet.styleSheet.cssText = style;
	  } else {

	    sheet.innerHTML += style;
	  }
	},
	    _createSheet = function _createSheet(w, d) {

	  sheet = d.createElement('style');

	  sheet.type = 'text/css';

	  sheet.media = 'all';

	  du.asapReady(function () {

	    _stickSheet(d);
	  });
	},
	    _stickSheet = function _stickSheet(d) {

	  d.body.appendChild(sheet);
	},
	    _format = function _format(tpl, ctx) {

	  return tpl.replace(/\{\{([a-zA-Z ]*)\}\}/g, function (m, g) {

	    return ctx[g.replace(/^\s+|\s+$/g, '')] || '';
	  });
	};

	module.exports = styler;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _typeof2 = __webpack_require__(3);

	var _typeof3 = _interopRequireDefault(_typeof2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var qs = __webpack_require__(12),
	    utils = __webpack_require__(13);

	module.exports = {
	  el: el,
	  els: els,
	  addEvent: addEvent, // add an event to an element
	  removeEvent: removeEvent,
	  whenReady: whenReady, // executes callback when dom is ready or if dom is ready
	  asapReady: asapReady, // executes cb as soon as elem targetted by elem ( or body by default ) exists.
	  loadInLocation: loadInLocation,
	  hasClass: hasClass,
	  addClass: addClass,
	  removeClass: removeClass,
	  forEach: forEach,
	  childObject: childObject,
	  preventDefault: preventDefault,
	  isElement: isElement,
	  nl2br: nl2br
	};

	function isElement(o) {

	  return (typeof HTMLElement === 'undefined' ? 'undefined' : (0, _typeof3.default)(HTMLElement)) === "object" ? o instanceof HTMLElement : //DOM2
	  o && (typeof o === 'undefined' ? 'undefined' : (0, _typeof3.default)(o)) === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string";
	}

	function preventDefault(event) {

	  event.preventDefault ? event.preventDefault() : event.returnValue = false;
	};

	function childObject(elem, index) {

	  var i = 0,
	      realI = 0;

	  while (elem.childNodes[i]) {

	    if (elem.childNodes[i].nodeType == 1) {

	      if (realI == index) return elem.childNodes[i];

	      realI++;
	    }

	    i++;
	  }

	  return false;
	}

	function hasClass(element, cls) {

	  return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
	}

	function addClass(element, className) {

	  if (!hasClass(element, className)) element.className = element.className + ' ' + className;
	}

	function removeClass(element, cls) {

	  if (hasClass(element, cls)) {

	    var regex = new RegExp(cls, 'g');

	    element.className = element.className.replace(regex, '');
	  }
	}

	function els(node, selector) {

	  if (typeof node == 'string') {

	    selector = node;
	    node = document;
	  }

	  var prefix = selector.substr(0, 1);

	  if ('.#,'.indexOf(prefix) !== -1) {

	    selector = selector.substr(1);
	  }

	  if (prefix == '.') {

	    return getElementsByClassName(node, selector);
	  } else if (prefix == '#') {

	    var result = node.getElementById(selector);

	    if (result) {

	      return [result];
	    } else {

	      return [];
	    }
	  } else {

	    return node.getElementsByTagName(selector);
	  }
	};

	function el(node, selector) {

	  var results = els(node, selector);

	  return results.length ? results[0] : null;
	}

	function whenReady(cb) {

	  if (document.readyState === 'complete') {

	    cb();
	  } else {

	    addEvent(window, 'load', cb);
	  }
	}

	function asapReady(selector, timeout, cb) {

	  if (arguments.length == 1) {

	    cb = selector;

	    timeout = 0;

	    selector = 'body';
	  } else if (arguments.length == 2) {

	    cb = timeout;

	    timeout = 0;
	  }

	  if (el(selector)) return cb();

	  setTimeout(function () {

	    asapReady(selector, Math.min((timeout + 10) * 2, 10000), cb);
	  }, timeout);
	}

	function loadInLocation(values) {

	  var href = window.location.href.split('?')[0];

	  if (utils.size(values)) {

	    href += '?' + qs.stringify(values);
	  }

	  return href;
	}

	/**
	 * cross browser add event
	 */

	function addEvent(elem, types, eventHandle) {

	  if (elem == null || elem == undefined) return;

	  if (typeof types == 'string') types = [types];

	  forEach(types, function (type) {

	    if (elem.addEventListener) {

	      elem.addEventListener(type, eventHandle, false);
	    } else if (elem.attachEvent) {

	      elem.attachEvent('on' + type, eventHandle);
	    } else {

	      elem['on' + type] = eventHandle;
	    }
	  });
	}

	function removeEvent(elem, types, eventHandle) {

	  if (elem === null || elem === undefined) return;

	  if (typeof types == 'string') types = [types];

	  forEach(types, function (type) {

	    if (elem.removeEventListener) {

	      elem.removeEventListener(type, eventHandle, false);
	    } else if (elem.detachEvent) {

	      elem.detachEvent('on' + type, eventHandle);
	    } else {

	      elem["on" + type] = null;
	    }
	  });
	};

	function forEach(array, action) {

	  for (var i = 0; i < array.length; i++) {

	    action(array[i]);
	  }
	}

	function getElementsByClassName(node, className) {

	  if (typeof node == 'string') {

	    className = node;
	    node = document;
	  }

	  var a = [],
	      re = new RegExp('(^| )' + className + '( |$)'),
	      els = node.getElementsByTagName('*');

	  for (var i = 0, j = els.length; i < j; i++) {

	    if (re.test(els[i].className)) {

	      a.push(els[i]);
	    }
	  }

	  return a;
	}

	function nl2br(str, is_xhtml) {

	  var breakTag = is_xhtml || typeof is_xhtml === 'undefined' ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display

	  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
	}

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./lib/\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


/***/ },
/* 13 */
/***/ function(module, exports) {

	"use strict";

	module.exports = {
	  extend: extend,
	  filterByAttr: filterByAttr,
	  isArray: isArray,
	  size: size,
	  fZ: fZ,
	  unique: unique,
	  forEach: forEach, // for some older browsers
	  toCamelCase: toCamelCase,
	  toUnderscore: toUnderscore,
	  escape: escape,
	  truncate: truncate,
	  capitalize: capitalize,
	  uncapitalize: uncapitalize
	};


	function uncapitalize( str ) {

	  str = String(str);

	  if ( !str.length ) return '';

	  return str[ 0 ].toLowerCase() + str.substr( 1, str.length );

	}

	function capitalize( str ) {

	  str = String(str);

	  if ( !str.length ) return '';

	  return str[ 0 ].toUpperCase() + str.substr( 1, str.length );

	};


	function truncate( str, len, append ) {

	  str = String( str );

	  if ( str.length > len ) {

	    str = str.slice( 0, len );

	    if ( append ) str += append;

	  }

	  return str;
	  
	}

	function escape( str, escapeApostrophe ) {

	  if ( !str ) return str;

	  if ( escapeApostrophe === undefined ) {

	    escapeApostrophe = true;

	  }

	  var escaped = String( str )
	  
	  .replace( /&/g, '&amp;' )
	  
	  .replace( /</g, '&lt;' )
	  
	  .replace( />/g, '&gt;' )
	  
	  .replace( /"/g, '&quot;' );

	  if ( escapeApostrophe ) {

	    escaped = escaped.replace( /'/g, '&#39;' );

	  }

	  return escaped;

	}

	function toCamelCase( input ) {

	  if ( typeof input == 'object' ) {

	    var camelCased = {};

	    for ( var key in input ) {

	      camelCased[ toCamelCase(key) ] = input[ key ];

	    }

	    return camelCased;

	  }

	  return input.replace( /[-_](.)/g, function( match, group1 ) {

	    return group1.toUpperCase();

	  });

	}

	function toUnderscore( input ) {

	  if (typeof input == 'object') {

	    var underscored = {};

	    for (var key in input) {

	      underscored[toUnderscore(key)] = input[key];

	    }

	    return underscored;

	  }

	  return input.replace(/([A-Z])/g, function($1){return "_"+$1.toLowerCase();});

	}

	function unique( arr ) {

	  var u = [];

	  arr.forEach( function( a ) {

	    if ( u.indexOf( a ) === -1 ) u.push( a );

	  });

	  return u;

	}


	function isArray( obj ) {

	  return Object.prototype.toString.call( obj ) === '[object Array]';

	}

	function size( obj ) {

	  var size = 0, key;

	  for ( key in obj ) {

	    if ( obj.hasOwnProperty( key ) ) size++;

	  }

	  return size;

	}


	function filterByAttr( obj, arr ) {

	  var newObj = {};

	  forEach( arr, function( name ) {

	    if ( obj[name] !== undefined ) newObj[name] = obj[name];

	  });

	  return newObj;

	};

	function forEach( array, action ) {

	  for ( var i = 0; i < array.length; i++ ) {

	    action( array[i] );

	  }

	};

	function extend() {

	  for ( var i=1; i<arguments.length; i++ ) {

	    for ( var key in arguments[i] ) {

	      if ( arguments[i].hasOwnProperty( key ) ) {

	        arguments[ 0 ][ key ] = arguments[ i ][ key ];

	      }

	    }

	  }
	        
	  return arguments[ 0 ];

	}

	function fZ( n, size ) {

	  if ( !size ) size = 2;

	  var s = n + '',

	  sign = s.substr( 0, 1 ) == '-' ? '-' : '';

	  if ( sign.length ) {

	    s = s.substr( 1 );

	  }

	  while ( s.length < size ) s = '0' + s;

	  return sign + s; 
	}


/***/ }
/******/ ]);