(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var deepExtend = require( 'deep-extend' ),

config = {
  all: {
    partialOptions: {}
  },
  tpl : {
    partialOptions: {
      raw: true,
      decorate: {
        page: 1,
        count: 20, 
        total: 65
      }
    }
  }
},

currentConfig = ( typeof config[ window.env ] == 'undefined' ) ? {} : config[ window.env ];

module.exports = deepExtend( config.all, currentConfig );

},{"deep-extend":20}],2:[function(require,module,exports){
"use strict";

var controllers = require( '../../widgets/controller/main' ),

embedded = require( '../../widgets/lib/embeddedPage' ),

domUtils = require( '../../js/lib/domUtils' ),

facebookEmbedded = require( '../../widgets/lib/facebookPage' ),

debug = require( 'debug' ), log,

activeFilters = require( '../../widgets/activeFilters/activeFilters' ),

list = require( './list' ),

cn = require( '../../js/lib/common/common.mod' ),

handler,

Masonry = require( 'masonry-layout' ), 

msnry = false,

defaults = {
  selectors: {
    listContent: '.js_list_content',
    loadNext: '.js_load_next'
  },
  cascading: false
};

window.asap( function( options ) {

  var params = cn.extend( {}, defaults, options );

  log = debug( 'embedded agenda show' );

  log( 'initing with options %s', JSON.stringify( params ) );

  if ( params.facebook ) {

    handler = _initFacebook( params, list );

  } else {

    handler = _initEmbedded( params );

  }

  if ( params.cascading ) {

    log( 'cascading mode on' );

    domUtils.whenReady( function() {

      msnry = _masonry( params.selectors.listContent );

    } );

  }

  list.init( {
    total: params.total,
    perPage: params.perPage,
    autoLoadNext: false,
    onLastPage: _hideTrigger( params.selectors.loadNext )
  } );

  _handleLoadNextElements( params.selectors.loadNext );

});

function _initFacebook( params, list ) {

  var handler = facebookEmbedded( params );

  // reset list with controller values when there is a change
  window.cibul.getController( params.uid ).setProxy( {
    update: function( newValues ) {

      log( 'change in iframe %s', JSON.stringify( newValues ) );

      for( var i in newValues ) {

        if ( newValues[ i ] === null ) delete newValues[ i ];

      }

      window.location.href = domUtils.loadInLocation( { 
        search: newValues,
        fb: 1
      } );

    }
  } );

  return handler;
}

function _initEmbedded( params ) {

  var handler = embedded( {
    onReceive: function( message ) {

      if ( message.bottom ) {

        _loadNext();

      }

    }
  }, params );

  // pass on frame search/query changes to parent window
  window.cibul.getController( params.uid ).setProxy( {
    update: function( newValues ) {

      log( 'change in iframe %s', JSON.stringify( newValues ) );

      handler.send( { update: newValues } );

    }
  } );

  //do not manipulate href from inside frame
  window.cibul.getController( params.uid ).disableSyncHref();

  window.cibul.getController( params.uid ).disablePassedAutoLoad();

  return handler;

}


function _handleLoadNextElements( selector ) {

  cn.forEach( cn.els( selector ), function( elem ) {

    cn.addEvent( elem, 'click', function( e ) {

      cn.preventDefault( e );

      _loadNext();

    });

  } );

}

function _loadNext() {

  if ( !handler ) return;

  list.loadNext( function( err ) {

    handler.contentChange();

    if ( msnry ) msnry.reset();
    
  });

}

function _hideTrigger( selector ) {

  return function() {

    cn.forEach( cn.els( selector ), function( elem ) {

      elem.style.display = 'none';

    } );

  }

}


function _masonry( listSelector ) {

  var m = _start();

  return {
    reset: function() {

      m.destroy();

      _start();

    },
    start: _start
  }

  function _start() {

    return new Masonry( listSelector );

  }

}

},{"../../js/lib/common/common.mod":8,"../../js/lib/domUtils":10,"../../widgets/activeFilters/activeFilters":41,"../../widgets/controller/main":53,"../../widgets/lib/embeddedPage":55,"../../widgets/lib/facebookPage":56,"./list":3,"debug":17,"masonry-layout":24}],3:[function(require,module,exports){
"use strict";

var debug = require( 'debug' ), log,

pagination = require( './pagination' ),

partialLoader = require( './partialLoader' ),

cn = require( '../../js/lib/common/common.mod' ),

config = require( './config' ),

params = {
  empty: false,                 // true if agenda is empty
  total: false,                 // total items
  perPager: false,              // items per page
  onLoad: false,
  selectors: {
    list: '.js_list_content'
  },
  autoLoadNext: true,
  onLastPage: false
},

loader, pagination;

module.exports = {
  init: init,
  reset: reset,
  loadNext: loadNext
}


function init( options ) {

  log = debug( 'agenda list' );

  log( 'initing' );
  
  cn.extend( params, options );

  if ( options.empty ) return;

  loader = partialLoader( cn.extend( config.partialOptions, {
    canvas: cn.el( params.selectors.list ),
    onLoad: params.onLoad
  }));

  pagination.init( {
    href: window.location.href,
    total: params.total,
    perPage: params.perPage,
    loadNext: loader.after,
    loadPrev: loader.before,
    auto: params.autoLoadNext,
    onLastPage: params.onLastPage 
  } );

}

function loadNext( cb ) {

  log( 'load next' );

  pagination.loadNext( cb );

}

function reset( newHref ) {

  loader.replace( newHref, function( err, data ) {

    if ( err ) {

      console.log( err );

      return;

    }

    pagination.reset( newHref, data.total );

  });

}

},{"../../js/lib/common/common.mod":8,"./config":1,"./pagination":4,"./partialLoader":5,"debug":17}],4:[function(require,module,exports){
"use strict";

var cn = require( '../../js/lib/common/common.mod' ),

remote = require( '../../js/lib/remote/remote.mod' ),

debug = require( 'debug' ), log,

qs = require( 'qs' ),

params = {
  loadNext: false, // cb to get next page content
  loadPrev: false, // cb to get previous page content
  auto: true,      // loads next page on bottom hit
  selectors: {
    pager: '.js_pages',
    list: '.js_list_content',
    previous: '.js_previous_page'
  },
  classes: {
    displayNone: 'display-none'
  },
  onLastPage: false
},

page = 1,

loading = false,

prevPageExists = true;

module.exports = {
  init: init,
  reset: reset,
  loadNext: loadNext
}

function init( options ) {

  log = debug( 'pagination' );

  cn.extend( params, options );

  log( 'initing with params %s', JSON.stringify( options ) );

  _readPage( params.href );

  _hidePager();

  _initPrevPage( params.href );

  if ( params.auto ) {

    _onHitBottom( loadNext );

  }

  if ( !_hasNext() && params.onLastPage ) params.onLastPage();

}

function reset( newHref, total ) {

  params.total = total;

  params.href = newHref;

  _removePrevPage();

  page = 1;

  loading = false;

  if ( !_hasNext() && params.onLastPage ) params.onLastPage();

}

function loadNext( cb ) {

  log( 'loading next' );

  var newHref;

  if ( loading ) {

    log( 'already loading' );

    return cb ? cb( 'already loading' ) : null;

  }

  loading = true;

  if ( !_hasNext() ) {

    log( 'last page already reached: %s', page );

    if ( params.onLastPage ) params.onLastPage();

    return cb ? cb( 'last page already reached' ) : null;

  }


  newHref = _setHrefPage( params.href, page + 1 );
  

  params.loadNext( newHref, function( err, data ) {

    loading = false;

    page += 1;

    if ( !_hasNext() && params.onLastPage ) params.onLastPage();

    if ( cb ) cb( err );

  } );

}



function _onHitBottom( cb ) {

  var offset,

  body = cn.el( 'body' );

  cn.addEvent( document, 'scroll', function() {

    var scrollPos = cn.getScrollOffsets().y,

    pageBottom = body.offsetHeight,

    windowHeight = cn.windowInnerHeight();

    if ( pageBottom - windowHeight <= scrollPos ) {

      cb();

    }

  });

}


function _hidePager() {

  cn.forEach( cn.els( params.selectors.pager ), function( pagerElem ) {

    cn.addClass( pagerElem, params.classes.displayNone );

  } );

}


function _setHrefPage( href, newPage ) {

  var parts = href.split( '?' ),

  queryString = ( parts.length == 1 ) ? '' : parts[1].split( '#' )[0],

  query = qs.parse( queryString );

  query.page = newPage;

  return parts[0] + '?' + qs.stringify( query );

}


function _initPrevPage( href ) {

  var firstPage = page;

  if ( firstPage > 1 ) {

    cn.addEvent( cn.el( params.selectors.previous ), 'click', function( ) {

      params.loadPrev( _setHrefPage( href, firstPage - 1 ), function( err, data ) {

        loading = false;

        firstPage -= 1;

        if ( firstPage == 1 ) {

          _removePrevPage();

        }

      } );

    } );

    cn.removeClass( cn.el( params.selectors.previous ), params.classes.displayNone );    

  } else {

    _removePrevPage();

  }


}


function _removePrevPage() {

  if ( prevPageExists && cn.el( params.selectors.previous ) ) {

    cn.el( params.selectors.previous ).parentNode.removeChild( cn.el( params.selectors.previous ) );

    prevPageExists = false;

  }

}


function _readPage( href ) {

  var parts = href.split( '?' ),

  query = {};

  if ( parts.length == 1 ) {

    page = 1;

    return;

  }

  query = qs.parse( parts[1].split( '#' )[0] );

  if ( query.page ) {

    page = parseInt( query.page, 10 );

  } else {

    page = 1;

  }

}

function _hasNext() {

  return page * params.perPage < params.total;

}

},{"../../js/lib/common/common.mod":8,"../../js/lib/remote/remote.mod":12,"debug":17,"qs":36}],5:[function(require,module,exports){
var remote = require( '../../js/lib/remote/remote.mod' ),

cn = require( '../../js/lib/common/common.mod' ),

log = require( 'debug' )( 'partialLoader' ),

qs = require( 'qs' ),

defaults = {
  canvas: false, // canvas elem where content is loaded
  href: false, // this is the href loaded
  raw: false,   // response should be considered as raw data
  decorate: {},  // response should be decorated with this
  preventBrowserCache: true,
  onLoad: false
};


module.exports = function( options ) {

  var params = cn.extend( {}, defaults, options ),

  init = function() {

    log( 'initing' );

    return {
      replace: _action( 'replace' ),
      after: _action( 'after' ),
      before: _action( 'before' )
    }

  },

  _action = function( name ) {

    return function( href, cb ) {

      _get( href, function( err, data ) {

        if ( err ) {

          return cb( err );

        }

        _dom[ name ]( data );

        if ( cb ) cb( null, data );

        if ( params.onLoad ) params.onLoad( null, data );

      });

    }

  },

  _dom = {

    replace: function( data ) {

      _clear( params.canvas );

      params.canvas.innerHTML = data.partial;

    },

    after: function( data ) {

      params.canvas.insertAdjacentHTML( 'beforeend', data.partial );

    },

    before: function( data ) {

      params.canvas.insertAdjacentHTML( 'afterbegin', data.partial );

    }

  },

  _get = function( href, cb ) {

    var settings = {};

    if ( params.raw ) {

      settings.raw = true;

    }

    if ( params.preventBrowserCache ) {

      settings.data = { preventCache: Math.random() };

    }

    if ( window.env == 'tpl' ) href = _templateHref( href ); 

    remote.getXmlHttp( href, settings, function( responseType, data ) {

      var response = {};

      if ( responseType !== 'success' ) {

        cb( responseType );

        return;

      }

      if ( params.raw ) {

        response.partial = data;

      } else {

        response = data;

      }

      if ( params.decorate ) {

        cn.extend( response, options.decorate );

      }

      cb( null, response );

    });

  };

  return init();

};




function _clear( elem ) {

  var child;
  
  while ( child = cn.childObject( elem, 0 ) ) {

    elem.removeChild( child );

  }

}


/**
 * fetch partial directly in template mode
 */

function _templateHref( href ) {

  var parts = href.split( '?' );

  return parts[0].replace('embedS', 's' ) + '.part' + ( parts.length == 2 ? '?' + parts[1] : '' );

}

},{"../../js/lib/common/common.mod":8,"../../js/lib/remote/remote.mod":12,"debug":17,"qs":36}],6:[function(require,module,exports){
var rsplit = function(string, regex) {
  var result = regex.exec(string),retArr = new Array(), first_idx, last_idx, first_bit;
  while (result != null)
  {
    first_idx = result.index; last_idx = regex.lastIndex;
    if ((first_idx) != 0)
    {
      first_bit = string.substring(0,first_idx);
      retArr.push(string.substring(0,first_idx));
      string = string.slice(first_idx);
    }   
    retArr.push(result[0]);
    string = string.slice(result[0].length);
    result = regex.exec(string);  
  }
  if (! string == '')
  {
    retArr.push(string);
  }
  return retArr;
},
chop =  function(string){
    return string.substr(0, string.length - 1);
},
extend = function(d, s){
    for(var n in s){
        if(s.hasOwnProperty(n))  d[n] = s[n]
    }
},


EJS = function( options ){
  options = typeof options == "string" ? {view: options} : options
    this.set_options(options);
  if(options.precompiled){
    this.template = {};
    this.template.process = options.precompiled;
    EJS.update(this.name, this);
    return;
  }
    if(options.element)
  {
    if(typeof options.element == 'string'){
      var name = options.element
      options.element = document.getElementById(  options.element )
      if(options.element == null) throw name+'does not exist!'
    }
    if(options.element.value){
      this.text = options.element.value
    }else{
      this.text = options.element.innerHTML
    }
    this.name = options.element.id
    this.type = '['
  }else if(options.url){
        options.url = EJS.endExt(options.url, this.extMatch);
    this.name = this.name ? this.name : options.url;
        var url = options.url
        //options.view = options.absolute_url || options.view || options.;
    var template = EJS.get(this.name /*url*/, this.cache);
    if (template) return template;
      if (template == EJS.INVALID_PATH) return null;
        try{
            this.text = EJS.request( url+(this.cache ? '' : '?'+Math.random() ));
        }catch(e){}

    if(this.text == null){
            throw( {type: 'EJS', message: 'There is no template at '+url}  );
    }
    //this.name = url;
  }
  var template = new EJS.Compiler(this.text, this.type);

  template.compile(options, this.name);

  
  EJS.update(this.name, this);
  this.template = template;
};
/* @Prototype*/
EJS.prototype = {
  /**
   * Renders an object with extra view helpers attached to the view.
   * @param {Object} object data to be rendered
   * @param {Object} extra_helpers an object with additonal view helpers
   * @return {String} returns the result of the string
   */
    render : function(object, extra_helpers){
        object = object || {};
        this._extra_helpers = extra_helpers;
    var v = new EJS.Helpers(object, extra_helpers || {});
    return this.template.process.call(object, object,v);
  },
    update : function(element, options){
        if(typeof element == 'string'){
      element = document.getElementById(element)
    }
    if(options == null){
      _template = this;
      return function(object){
        EJS.prototype.update.call(_template, element, object)
      }
    }
    if(typeof options == 'string'){
      params = {}
      params.url = options
      _template = this;
      params.onComplete = function(request){
        var object = eval( request.responseText )
        EJS.prototype.update.call(_template, element, object)
      }
      EJS.ajax_request(params)
    }else
    {
      element.innerHTML = this.render(options)
    }
    },
  out : function(){
    return this.template.out;
  },
    /**
     * Sets options on this view to be rendered with.
     * @param {Object} options
     */
  set_options : function(options){
        this.type = options.type || EJS.type;
    this.cache = options.cache != null ? options.cache : EJS.cache;
    this.text = options.text || null;
    this.name =  options.name || null;
    this.ext = options.ext || EJS.ext;
    this.extMatch = new RegExp(this.ext.replace(/\./, '\.'));
  }
};
EJS.endExt = function(path, match){
  if(!path) return null;
  match.lastIndex = 0
  return path+ (match.test(path) ? '' : this.ext )
}




/* @Static*/
EJS.Scanner = function(source, left, right) {
  
    extend(this,
        {left_delimiter:  left +'%',
         right_delimiter:   '%'+right,
         double_left:     left+'%%',
         double_right:    '%%'+right,
         left_equal:    left+'%=',
         left_comment:  left+'%#'})

  this.SplitRegexp = left=='[' ? /(\[%%)|(%%\])|(\[%=)|(\[%#)|(\[%)|(%\]\n)|(%\])|(\n)/ : new RegExp('('+this.double_left+')|(%%'+this.double_right+')|('+this.left_equal+')|('+this.left_comment+')|('+this.left_delimiter+')|('+this.right_delimiter+'\n)|('+this.right_delimiter+')|(\n)') ;
  
  this.source = source;
  this.stag = null;
  this.lines = 0;
};

EJS.Scanner.to_text = function(input){
  if(input == null || input === undefined)
        return '';
    if(input instanceof Date)
    return input.toDateString();
  if(input.toString) 
        return input.toString();
  return '';
};

EJS.Scanner.prototype = {
  scan: function(block) {
     scanline = this.scanline;
   regex = this.SplitRegexp;
   if (! this.source == '')
   {
     var source_split = rsplit(this.source, /\n/);
     for(var i=0; i<source_split.length; i++) {
       var item = source_split[i];
       this.scanline(item, regex, block);
     }
   }
  },
  scanline: function(line, regex, block) {
   this.lines++;
   var line_split = rsplit(line, regex);
   for(var i=0; i<line_split.length; i++) {
     var token = line_split[i];
       if (token != null) {
        try{
            block(token, this);
      }catch(e){
        throw {type: 'EJS.Scanner', line: this.lines};
      }
       }
   }
  }
};


EJS.Buffer = function(pre_cmd, post_cmd) {
  this.line = new Array();
  this.script = "";
  this.pre_cmd = pre_cmd;
  this.post_cmd = post_cmd;
  for (var i=0; i<this.pre_cmd.length; i++)
  {
    this.push(pre_cmd[i]);
  }
};
EJS.Buffer.prototype = {
  
  push: function(cmd) {
  this.line.push(cmd);
  },

  cr: function() {
  this.script = this.script + this.line.join('; ');
  this.line = new Array();
  this.script = this.script + "\n";
  },

  close: function() {
  if (this.line.length > 0)
  {
    for (var i=0; i<this.post_cmd.length; i++){
      this.push(pre_cmd[i]);
    }
    this.script = this.script + this.line.join('; ');
    line = null;
  }
  }
  
};


EJS.Compiler = function(source, left) {
    this.pre_cmd = ['var ___ViewO = [];'];
  this.post_cmd = new Array();
  this.source = ' ';  
  if (source != null)
  {
    if (typeof source == 'string')
    {
        source = source.replace(/\r\n/g, "\n");
            source = source.replace(/\r/g,   "\n");
      this.source = source;
    }else if (source.innerHTML){
      this.source = source.innerHTML;
    } 
    if (typeof this.source != 'string'){
      this.source = "";
    }
  }
  left = left || '<';
  var right = '>';
  switch(left) {
    case '[':
      right = ']';
      break;
    case '<':
      break;
    default:
      throw left+' is not a supported deliminator';
      break;
  }
  this.scanner = new EJS.Scanner(this.source, left, right);
  this.out = '';
};
EJS.Compiler.prototype = {
  compile: function(options, name) {
    options = options || {};
  this.out = '';
  var put_cmd = "___ViewO.push(";
  var insert_cmd = put_cmd;
  var buff = new EJS.Buffer(this.pre_cmd, this.post_cmd);   
  var content = '';
  var clean = function(content)
  {
      content = content.replace(/\\/g, '\\\\');
        content = content.replace(/\n/g, '\\n');
        content = content.replace(/"/g,  '\\"');
        return content;
  };
  this.scanner.scan(function(token, scanner) {
    if (scanner.stag == null)
    {
      switch(token) {
        case '\n':
          content = content + "\n";
          buff.push(put_cmd + '"' + clean(content) + '");');
          buff.cr();
          content = '';
          break;
        case scanner.left_delimiter:
        case scanner.left_equal:
        case scanner.left_comment:
          scanner.stag = token;
          if (content.length > 0)
          {
            buff.push(put_cmd + '"' + clean(content) + '")');
          }
          content = '';
          break;
        case scanner.double_left:
          content = content + scanner.left_delimiter;
          break;
        default:
          content = content + token;
          break;
      }
    }
    else {
      switch(token) {
        case scanner.right_delimiter:
          switch(scanner.stag) {
            case scanner.left_delimiter:
              if (content[content.length - 1] == '\n')
              {
                content = chop(content);
                buff.push(content);
                buff.cr();
              }
              else {
                buff.push(content);
              }
              break;
            case scanner.left_equal:
              buff.push(insert_cmd + "(EJS.Scanner.to_text(" + content + ")))");
              break;
          }
          scanner.stag = null;
          content = '';
          break;
        case scanner.double_right:
          content = content + scanner.right_delimiter;
          break;
        default:
          content = content + token;
          break;
      }
    }
  });
  if (content.length > 0)
  {
    // Chould be content.dump in Ruby
    buff.push(put_cmd + '"' + clean(content) + '")');
  }
  buff.close();
  this.out = buff.script + ";";
  var to_be_evaled = '/*'+name+'*/this.process = function(_CONTEXT,_VIEW) { try { with(_VIEW) { with (_CONTEXT) {'+this.out+" return ___ViewO.join('');}}}catch(e){e.lineNumber=null;throw e;}};";
  
  try{
    eval(to_be_evaled);
  }catch(e){
    if(typeof JSLINT != 'undefined'){
      JSLINT(this.out);
      for(var i = 0; i < JSLINT.errors.length; i++){
        var error = JSLINT.errors[i];
        if(error.reason != "Unnecessary semicolon."){
          error.line++;
          var e = new Error();
          e.lineNumber = error.line;
          e.message = error.reason;
          if(options.view)
            e.fileName = options.view;
          throw e;
        }
      }
    }else{
      throw e;
    }
  }
  }
};


//type, cache, folder
/**
 * Sets default options for all views
 * @param {Object} options Set view with the following options
 * <table class="options">
        <tbody><tr><th>Option</th><th>Default</th><th>Description</th></tr>
        <tr>
          <td>type</td>
          <td>'<'</td>
          <td>type of magic tags.  Options are '&lt;' or '['
          </td>
        </tr>
        <tr>
          <td>cache</td>
          <td>true in production mode, false in other modes</td>
          <td>true to cache template.
          </td>
        </tr>
  </tbody></table>
 * 
 */
EJS.config = function(options){
  EJS.cache = options.cache != null ? options.cache : EJS.cache;
  EJS.type = options.type != null ? options.type : EJS.type;
  EJS.ext = options.ext != null ? options.ext : EJS.ext;
  
  var templates_directory = EJS.templates_directory || {}; //nice and private container
  EJS.templates_directory = templates_directory;
  EJS.get = function(path, cache){
    if(cache == false) return null;
    if(templates_directory[path]) return templates_directory[path];
      return null;
  };
  
  EJS.update = function(path, template) { 
    if(path == null) return;
    templates_directory[path] = template ;
  };
  
  EJS.INVALID_PATH =  -1;
};
EJS.config( {cache: true, type: '<', ext: '.ejs' } );



/**
 * @constructor
 * By adding functions to EJS.Helpers.prototype, those functions will be available in the 
 * views.
 * @init Creates a view helper.  This function is called internally.  You should never call it.
 * @param {Object} data The data passed to the view.  Helpers have access to it through this._data
 */
EJS.Helpers = function(data, extras){
  this._data = data;
    this._extras = extras;
    extend(this, extras );
};
/* @prototype*/
EJS.Helpers.prototype = {
    /**
     * Renders a new view.  If data is passed in, uses that to render the view.
     * @param {Object} options standard options passed to a new view.
     * @param {optional:Object} data
     * @return {String}
     */
  view: function(options, data, helpers){
        if(!helpers) helpers = this._extras
    if(!data) data = this._data;
    return new EJS(options).render(data, helpers);
  },
    /**
     * For a given value, tries to create a human representation.
     * @param {Object} input the value being converted.
     * @param {Object} null_text what text should be present if input == null or undefined, defaults to ''
     * @return {String} 
     */
  to_text: function(input, null_text) {
      if(input == null || input === undefined) return null_text || '';
      if(input instanceof Date) return input.toDateString();
    if(input.toString) return input.toString().replace(/\n/g, '<br />').replace(/''/g, "'");
    return '';
  }
};
EJS.newRequest = function(){
 var factories = [function() { return new ActiveXObject("Msxml2.XMLHTTP"); },function() { return new XMLHttpRequest(); },function() { return new ActiveXObject("Microsoft.XMLHTTP"); }];
 for(var i = 0; i < factories.length; i++) {
      try {
          var request = factories[i]();
          if (request != null)  return request;
      }
      catch(e) { continue;}
 }
}

EJS.request = function(path){
 var request = new EJS.newRequest()
 request.open("GET", path, false);
 
 try{request.send(null);}
 catch(e){return null;}
 
 if ( request.status == 404 || request.status == 2 ||(request.status == 0 && request.responseText == '') ) return null;
 
 return request.responseText
}
EJS.ajax_request = function(params){
params.method = ( params.method ? params.method : 'GET')

var request = new EJS.newRequest();
request.onreadystatechange = function(){
  if(request.readyState == 4){
    if(request.status == 200){
      params.onComplete(request)
    }else
    {
      params.onComplete(request)
    }
  }
}
request.open(params.method, params.url)
request.send(null)
}

module.exports = EJS;

},{}],7:[function(require,module,exports){
var EJS = require( './ejs' );

module.exports = {
  render: render
}

function render( template, data ) {

  var escaped = _removeOnload( data );

  return new EJS( { text: template } ).render( escaped );

}

function _removeOnload( data ) {

  var escaped = {};

  for ( var i in data ) {

    if ( typeof data[ i ] == 'string' ) {

      escaped[ i ] = data[ i ].replace( /onload=/g, '' );

    } else {

      escaped[ i ] = data[ i ];

    }

  }

  return escaped;

}

},{"./ejs":6}],8:[function(require,module,exports){
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


exports.toCamelCase = function toCamelCase( input ) {

  if ( typeof input == 'object' ) {

    var camelCased = {};

    for (var key in input) {

      if ( !contains(['parse', '_typeCast'], key)) {

        camelCased[toCamelCase(key)] = input[key];
        
      }

    }

    return camelCased;

  }

  return input.replace(/[-_](.)/g, function(match, group1) {

    return group1.toUpperCase();

  });

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

var getElementsByClassName = exports.getElementsByClassName = function( node, classname ) {
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



var els = exports.els = function( node, selector ) {

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

exports.el = function( node, selector ) {

  var results = els(node, selector);

  return results.length?results[0]:null;

};


/* previousObject, nextObject, childObject, getChildIndex v0.1 */
var previousObject = function( elem ) {
  
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

exports.arrDiff = function( a, b ) {

  var diff = [];

  for( var i = 0; i < a.length; i++ ) {

    if ( b.indexOf( a[ i ] ) == -1 ) {

      diff.push( a[ i ] );

    }

  }

  for( i = 0; i < b.length; i++ ) {

    if ( a.indexOf( b[ i ] ) == -1 ) {

      diff.push( b[ i ] );

    }

  }

  return diff;

}


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

exports.windowInnerHeight = function( w, d ) {

  if ( !w ) {
    w = window;
    d = document;
  }

  return w.innerHeight || d.documentElement.clientHeight || d.getElementsByTagName('body')[0].clientHeight;

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

},{}],9:[function(require,module,exports){
"use strict";

var cn = require( '../common/common.mod.js' ),

remote = require( '../remote/remote.mod.js' ),

res = {
  prod: {
    agenda : '//openagenda.com/agendas/{uid}/controldata',
    embed : '//openagenda.com/agendas/{uid}/embeds/{embedUid}/controldata'
  },
  dev: {
    agenda : '//d.openagenda.com/agendas/{uid}/controldata',
    embed : '//d.openagenda.com/agendas/{uid}/embeds/{embedUid}/controldata'
  },
  test: {
    agenda : '//d.openagenda.com/agendas/{uid}/controldata',
    embed : '//d.openagenda.com/agendas/{uid}/embeds/{embedUid}/controldata'
  },
  tpl: {
    agenda : '/server/testdata/controldata-pepite.json',
    embed : '/server/testdata/' + ( window.testControlData ? window.testControlData : 'embedcontroldata-pepite.json' )
  }
},

defaults = {
  uid: false, // required. the uid of the agenda
  embedUid: false, // optional. the uid of the embed
  jsonp: false,
}

module.exports = fetch;

function fetch( options, cb ) {

  var params = cn.extend( {}, defaults, options ),

  fetchRes = res[ window.env || 'prod' ][ params.embedUid ? 'embed' : 'agenda' ]

  .replace( '{uid}', params.uid );

  if ( params.embedUid ) {

    fetchRes = fetchRes.replace( '{embedUid}', params.embedUid );

  }

  if ( params.jsonp ) {

    fetchRes += '?callback=cb' + params.uid + ( params.embedUid || '' );

  }

  remote.get( fetchRes, { timeout: 20000 }, function( responseType, data ) {

    if ( responseType !== 'success' ) {

      return cb( responseType );

    }

    cb( null, data.data );

  }, !params.jsonp );

}

},{"../common/common.mod.js":8,"../remote/remote.mod.js":12}],10:[function(require,module,exports){
"use strict";

var qs = require( 'qs' );

module.exports = {
  el: el,
  els: els,
  addEvent: addEvent,     // add an event to an element 
  whenReady: whenReady, // executes callback when dom is ready or if dom is ready
  loadInLocation: loadInLocation
}


function els( node, selector ) {

  if ( typeof node == 'string' ) {

    selector = node;
    node = document;

  }

  var prefix = selector.substr( 0, 1 );

  if ( '.#,'.indexOf( prefix ) !== -1 ) {

    selector = selector.substr( 1 );

  }

  if ( prefix == '.' ) {

    return getElementsByClassName( node, selector );

  } else if ( prefix == '#') {

    var result = node.getElementById( selector );
    
    if ( result ) {

      return [ result ];

    } else {

      return [];

    }

  } else {

    return node.getElementsByTagName( selector );

  }

};

function el( node, selector ) {

  var results = els( node, selector );

  return results.length ? results[ 0 ] : null;

}


function whenReady( cb ) {

  if ( document.readyState === 'complete' ) {

    cb();

  } else {

    addEvent( window, 'load', cb );

  }

}


function loadInLocation( values ) {

  var href = window.location.href.split( '?' )[0];

  if ( cn.size( values ) ) {

    href += '?' + qs.stringify( values );

  }

  return href;

}


/**
 * cross browser add event
 */

function addEvent( elem, types, eventHandle ) {

  if ( elem == null || elem == undefined ) return;
  
  if ( typeof types == 'string' ) types = [ types ];
  
  forEach( types, function( type ) {

    if ( elem.addEventListener ) {

      elem.addEventListener( type, eventHandle, false );

    } else if ( elem.attachEvent ) {

        elem.attachEvent( 'on' + type, eventHandle );

    } else {

        elem[ 'on' + type ]=eventHandle;

    }

  } );

}

function forEach( array, action ) {

  for ( var i = 0; i < array.length; i++ ) {

    action( array[ i ] );

  }

}

},{"qs":36}],11:[function(require,module,exports){
module.exports = function( src, callback ){

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

},{}],12:[function(require,module,exports){
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

    if (settings.form) 
      settings.data = this.serialize(settings.form);    

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

    if ( settings.retries ) retries = settings.retries;
    if ( !settings.timeout ) settings.timeout = 2000;
    if ( !settings.name ) settings.name = url;

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

          if ( settings.raw ) return onSuccess( response );
            
          onSuccess(JSON.parse(response));

        }

      };

      xhr.open(type, sentUrl, true);
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      xhr.setRequestHeader("Content-Type", type=="POST"?"application/x-www-form-urlencoded":"text/plain;charset=UTF-8");
      
      if (type=="GET") {

        xhr.send();

      } else {

        var body = settings.data;

        if (typeof body !== 'string')
          body = self.appendToUrl('', settings.data).substr(1);

        xhr.send(body);

      }

    };

    sendRequest(onSuccess, onTimeout);

  },

  getJsonp: function(url, settings, callback){

    var timer,
      timeout = settings.timeout?settings.timeout:2000,
      retries = settings.retries?settings.retries:0,
      sentUrl = this.appendToUrl(url, settings.data),
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

      var callbackName,

      callbackParam = {},

      script = document.createElement('script'),

      urlCbNameIndex = sentUrl.indexOf( callbackParamName + '=' );

      script.setAttribute( 'type','text/javascript' );

      if ( urlCbNameIndex !== -1 ) {

        callbackName = sentUrl.substr( urlCbNameIndex + callbackParamName.length + 1 );

        script.src = sentUrl;

      } else {

        callbackName = 'jsonpCb' + Math.ceil( Math.random()*100000 );

        callbackParam[ callbackParamName ] = callbackName;

        script.src = self.appendToUrl( sentUrl, callbackParam );

      }

      window[ callbackName ] = handleResponse;
        
      document.getElementsByTagName('head')[0].appendChild(script);

    };

    sendQuery();
    
  },

  appendToUrl: function(url, data) {

    var isArray;

    if (typeof data != 'undefined') {

      if (url.indexOf('?') == -1) {
        url = url + '?';
      } else {
        url = url + '&';
      }

      for (var name in data) {

        if (typeof data[name] == 'object') {

          isArray = Object.prototype.toString.call( data[name] ) === '[object Array]';

          for (var index in data[name]) {
            url = url + name + '[' + ( isArray ? '' : index ) + ']=' + encodeURIComponent(data[name][index]) + '&';
          }

        } else {

          url = url + name + '=' + encodeURIComponent(data[name]) + '&';

        }

      }

      if (url.substr(url.length-1, 1) == '&') url = url.substr(0, url.length-1);

    }

    return url;
  },

  collect: function(a, f) {
    var n = [];
    for (var i = 0; i < a.length; i++) {
        var v = f(a[i]);
        if (v != null) n.push(v);
    }
    return n;
  },

  serialize: function (f) {
    function g(n) {
        return f.getElementsByTagName(n);
    };
    var nv = function (e) {
        if (e.name) return encodeURIComponent(e.name) + '=' + encodeURIComponent(e.value);
    };
    var i = this.collect(g('input'), function (i) {
        if ((i.type != 'radio' && i.type != 'checkbox') || i.checked) return nv(i);
    });
    var s = this.collect(g('select'), nv);
    var t = this.collect(g('textarea'), nv);
    return i.concat(s).concat(t).join('&');
  }
};

},{}],13:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    if (encoding === 'base64')
      subject = base64clean(subject)
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new TypeError('must start with number, buffer, array or string')

  if (this.length > kMaxLength)
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
      'size: 0x' + kMaxLength.toString(16) + ' bytes')

  var buf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
    throw new TypeError('Arguments must be Buffers')

  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) throw new TypeError('Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    case 'hex':
      ret = str.length >>> 1
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    default:
      ret = str.length
  }
  return ret
}

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function (encoding, start, end) {
  var loweredCase = false

  start = start >>> 0
  end = end === undefined || end === Infinity ? this.length : end >>> 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase)
          throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function (b) {
  if(!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max)
      str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(byte)) throw new Error('Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new TypeError('Unknown encoding: ' + encoding)
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function binarySlice (buf, start, end) {
  return asciiSlice(buf, start, end)
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0)
    throw new RangeError('offset is not uint')
  if (offset + ext > length)
    throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80))
    return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  if (end < start) throw new TypeError('sourceEnd < sourceStart')
  if (target_start < 0 || target_start >= target.length)
    throw new TypeError('targetStart out of bounds')
  if (start < 0 || start >= source.length) throw new TypeError('sourceStart out of bounds')
  if (end < 0 || end > source.length) throw new TypeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new TypeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new TypeError('start out of bounds')
  if (end < 0 || end > this.length) throw new TypeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":14,"ieee754":15,"is-array":16}],14:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],15:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],16:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],17:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
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

},{"./debug":18}],18:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":19}],19:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  var match = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 's':
      return n * s;
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],20:[function(require,module,exports){
(function (Buffer){
/*!
 * Node.JS module "Deep Extend"
 * @description Recursive object extending.
 * @author Viacheslav Lotsmanov (unclechu) <lotsmanov89@gmail.com>
 * @license MIT
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2013 Viacheslav Lotsmanov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Extening object that entered in first argument.
 * Returns extended object or false if have no target object or incorrect type.
 * If you wish to clone object, simply use that:
 *  deepExtend({}, yourObj_1, [yourObj_N]) - first arg is new empty object
 */
var deepExtend = module.exports = function (/*obj_1, [obj_2], [obj_N]*/) {
	if (arguments.length < 1 || typeof arguments[0] !== 'object') {
		return false;
	}

	if (arguments.length < 2) return arguments[0];

	var target = arguments[0];

	// convert arguments to array and cut off target object
	var args = Array.prototype.slice.call(arguments, 1);

	var key, val, src, clone, tmpBuf;

	args.forEach(function (obj) {
		if (typeof obj !== 'object') return;

		for (key in obj) {
			if ( ! (key in obj)) continue;

			src = target[key];
			val = obj[key];

			if (val === target) continue;

			if (typeof val !== 'object' || val === null) {
				target[key] = val;
				continue;
			} else if (val instanceof Buffer) {
				tmpBuf = new Buffer(val.length);
				val.copy(tmpBuf);
				target[key] = tmpBuf;
				continue;
			} else if (val instanceof Date) {
				target[key] = new Date(val.getTime());
				continue;
			}

			if (typeof src !== 'object' || src === null) {
				clone = (Array.isArray(val)) ? [] : {};
				target[key] = deepExtend(clone, val);
				continue;
			}

			if (Array.isArray(val)) {
				clone = (Array.isArray(src)) ? src : [];
			} else {
				clone = (!Array.isArray(src)) ? src : {};
			}

			target[key] = deepExtend(clone, val);
		}
	});

	return target;
}

}).call(this,require("buffer").Buffer)
},{"buffer":13}],21:[function(require,module,exports){
/*!
 * imagesLoaded v3.1.8
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

( function( window, factory ) { 'use strict';
  // universal module definition

  /*global define: false, module: false, require: false */

  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( [
      'eventEmitter/EventEmitter',
      'eventie/eventie'
    ], function( EventEmitter, eventie ) {
      return factory( window, EventEmitter, eventie );
    });
  } else if ( typeof exports === 'object' ) {
    // CommonJS
    module.exports = factory(
      window,
      require('wolfy87-eventemitter'),
      require('eventie')
    );
  } else {
    // browser global
    window.imagesLoaded = factory(
      window,
      window.EventEmitter,
      window.eventie
    );
  }

})( window,

// --------------------------  factory -------------------------- //

function factory( window, EventEmitter, eventie ) {

'use strict';

var $ = window.jQuery;
var console = window.console;
var hasConsole = typeof console !== 'undefined';

// -------------------------- helpers -------------------------- //

// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

var objToString = Object.prototype.toString;
function isArray( obj ) {
  return objToString.call( obj ) === '[object Array]';
}

// turn element or nodeList into an array
function makeArray( obj ) {
  var ary = [];
  if ( isArray( obj ) ) {
    // use object if already an array
    ary = obj;
  } else if ( typeof obj.length === 'number' ) {
    // convert nodeList to array
    for ( var i=0, len = obj.length; i < len; i++ ) {
      ary.push( obj[i] );
    }
  } else {
    // array of single index
    ary.push( obj );
  }
  return ary;
}

  // -------------------------- imagesLoaded -------------------------- //

  /**
   * @param {Array, Element, NodeList, String} elem
   * @param {Object or Function} options - if function, use as callback
   * @param {Function} onAlways - callback function
   */
  function ImagesLoaded( elem, options, onAlways ) {
    // coerce ImagesLoaded() without new, to be new ImagesLoaded()
    if ( !( this instanceof ImagesLoaded ) ) {
      return new ImagesLoaded( elem, options );
    }
    // use elem as selector string
    if ( typeof elem === 'string' ) {
      elem = document.querySelectorAll( elem );
    }

    this.elements = makeArray( elem );
    this.options = extend( {}, this.options );

    if ( typeof options === 'function' ) {
      onAlways = options;
    } else {
      extend( this.options, options );
    }

    if ( onAlways ) {
      this.on( 'always', onAlways );
    }

    this.getImages();

    if ( $ ) {
      // add jQuery Deferred object
      this.jqDeferred = new $.Deferred();
    }

    // HACK check async to allow time to bind listeners
    var _this = this;
    setTimeout( function() {
      _this.check();
    });
  }

  ImagesLoaded.prototype = new EventEmitter();

  ImagesLoaded.prototype.options = {};

  ImagesLoaded.prototype.getImages = function() {
    this.images = [];

    // filter & find items if we have an item selector
    for ( var i=0, len = this.elements.length; i < len; i++ ) {
      var elem = this.elements[i];
      // filter siblings
      if ( elem.nodeName === 'IMG' ) {
        this.addImage( elem );
      }
      // find children
      // no non-element nodes, #143
      var nodeType = elem.nodeType;
      if ( !nodeType || !( nodeType === 1 || nodeType === 9 || nodeType === 11 ) ) {
        continue;
      }
      var childElems = elem.querySelectorAll('img');
      // concat childElems to filterFound array
      for ( var j=0, jLen = childElems.length; j < jLen; j++ ) {
        var img = childElems[j];
        this.addImage( img );
      }
    }
  };

  /**
   * @param {Image} img
   */
  ImagesLoaded.prototype.addImage = function( img ) {
    var loadingImage = new LoadingImage( img );
    this.images.push( loadingImage );
  };

  ImagesLoaded.prototype.check = function() {
    var _this = this;
    var checkedCount = 0;
    var length = this.images.length;
    this.hasAnyBroken = false;
    // complete if no images
    if ( !length ) {
      this.complete();
      return;
    }

    function onConfirm( image, message ) {
      if ( _this.options.debug && hasConsole ) {
        console.log( 'confirm', image, message );
      }

      _this.progress( image );
      checkedCount++;
      if ( checkedCount === length ) {
        _this.complete();
      }
      return true; // bind once
    }

    for ( var i=0; i < length; i++ ) {
      var loadingImage = this.images[i];
      loadingImage.on( 'confirm', onConfirm );
      loadingImage.check();
    }
  };

  ImagesLoaded.prototype.progress = function( image ) {
    this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
    // HACK - Chrome triggers event before object properties have changed. #83
    var _this = this;
    setTimeout( function() {
      _this.emit( 'progress', _this, image );
      if ( _this.jqDeferred && _this.jqDeferred.notify ) {
        _this.jqDeferred.notify( _this, image );
      }
    });
  };

  ImagesLoaded.prototype.complete = function() {
    var eventName = this.hasAnyBroken ? 'fail' : 'done';
    this.isComplete = true;
    var _this = this;
    // HACK - another setTimeout so that confirm happens after progress
    setTimeout( function() {
      _this.emit( eventName, _this );
      _this.emit( 'always', _this );
      if ( _this.jqDeferred ) {
        var jqMethod = _this.hasAnyBroken ? 'reject' : 'resolve';
        _this.jqDeferred[ jqMethod ]( _this );
      }
    });
  };

  // -------------------------- jquery -------------------------- //

  if ( $ ) {
    $.fn.imagesLoaded = function( options, callback ) {
      var instance = new ImagesLoaded( this, options, callback );
      return instance.jqDeferred.promise( $(this) );
    };
  }


  // --------------------------  -------------------------- //

  function LoadingImage( img ) {
    this.img = img;
  }

  LoadingImage.prototype = new EventEmitter();

  LoadingImage.prototype.check = function() {
    // first check cached any previous images that have same src
    var resource = cache[ this.img.src ] || new Resource( this.img.src );
    if ( resource.isConfirmed ) {
      this.confirm( resource.isLoaded, 'cached was confirmed' );
      return;
    }

    // If complete is true and browser supports natural sizes,
    // try to check for image status manually.
    if ( this.img.complete && this.img.naturalWidth !== undefined ) {
      // report based on naturalWidth
      this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
      return;
    }

    // If none of the checks above matched, simulate loading on detached element.
    var _this = this;
    resource.on( 'confirm', function( resrc, message ) {
      _this.confirm( resrc.isLoaded, message );
      return true;
    });

    resource.check();
  };

  LoadingImage.prototype.confirm = function( isLoaded, message ) {
    this.isLoaded = isLoaded;
    this.emit( 'confirm', this, message );
  };

  // -------------------------- Resource -------------------------- //

  // Resource checks each src, only once
  // separate class from LoadingImage to prevent memory leaks. See #115

  var cache = {};

  function Resource( src ) {
    this.src = src;
    // add to cache
    cache[ src ] = this;
  }

  Resource.prototype = new EventEmitter();

  Resource.prototype.check = function() {
    // only trigger checking once
    if ( this.isChecked ) {
      return;
    }
    // simulate loading on detached element
    var proxyImage = new Image();
    eventie.bind( proxyImage, 'load', this );
    eventie.bind( proxyImage, 'error', this );
    proxyImage.src = this.src;
    // set flag
    this.isChecked = true;
  };

  // ----- events ----- //

  // trigger specified handler for event type
  Resource.prototype.handleEvent = function( event ) {
    var method = 'on' + event.type;
    if ( this[ method ] ) {
      this[ method ]( event );
    }
  };

  Resource.prototype.onload = function( event ) {
    this.confirm( true, 'onload' );
    this.unbindProxyEvents( event );
  };

  Resource.prototype.onerror = function( event ) {
    this.confirm( false, 'onerror' );
    this.unbindProxyEvents( event );
  };

  // ----- confirm ----- //

  Resource.prototype.confirm = function( isLoaded, message ) {
    this.isConfirmed = true;
    this.isLoaded = isLoaded;
    this.emit( 'confirm', this, message );
  };

  Resource.prototype.unbindProxyEvents = function( event ) {
    eventie.unbind( event.target, 'load', this );
    eventie.unbind( event.target, 'error', this );
  };

  // -----  ----- //

  return ImagesLoaded;

});

},{"eventie":22,"wolfy87-eventemitter":23}],22:[function(require,module,exports){
/*!
 * eventie v1.0.6
 * event binding helper
 *   eventie.bind( elem, 'click', myFn )
 *   eventie.unbind( elem, 'click', myFn )
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true */
/*global define: false, module: false */

( function( window ) {

'use strict';

var docElem = document.documentElement;

var bind = function() {};

function getIEEvent( obj ) {
  var event = window.event;
  // add event.target
  event.target = event.target || event.srcElement || obj;
  return event;
}

if ( docElem.addEventListener ) {
  bind = function( obj, type, fn ) {
    obj.addEventListener( type, fn, false );
  };
} else if ( docElem.attachEvent ) {
  bind = function( obj, type, fn ) {
    obj[ type + fn ] = fn.handleEvent ?
      function() {
        var event = getIEEvent( obj );
        fn.handleEvent.call( fn, event );
      } :
      function() {
        var event = getIEEvent( obj );
        fn.call( obj, event );
      };
    obj.attachEvent( "on" + type, obj[ type + fn ] );
  };
}

var unbind = function() {};

if ( docElem.removeEventListener ) {
  unbind = function( obj, type, fn ) {
    obj.removeEventListener( type, fn, false );
  };
} else if ( docElem.detachEvent ) {
  unbind = function( obj, type, fn ) {
    obj.detachEvent( "on" + type, obj[ type + fn ] );
    try {
      delete obj[ type + fn ];
    } catch ( err ) {
      // can't delete window object properties
      obj[ type + fn ] = undefined;
    }
  };
}

var eventie = {
  bind: bind,
  unbind: unbind
};

// ----- module definition ----- //

if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( eventie );
} else if ( typeof exports === 'object' ) {
  // CommonJS
  module.exports = eventie;
} else {
  // browser global
  window.eventie = eventie;
}

})( window );

},{}],23:[function(require,module,exports){
/*!
 * EventEmitter v4.2.11 - git.io/ee
 * Unlicense - http://unlicense.org/
 * Oliver Caldwell - http://oli.me.uk/
 * @preserve
 */

;(function () {
    'use strict';

    /**
     * Class for managing events.
     * Can be extended to provide event functionality in other classes.
     *
     * @class EventEmitter Manages event registering and emitting.
     */
    function EventEmitter() {}

    // Shortcuts to improve speed and size
    var proto = EventEmitter.prototype;
    var exports = this;
    var originalGlobalValue = exports.EventEmitter;

    /**
     * Finds the index of the listener for the event in its storage array.
     *
     * @param {Function[]} listeners Array of listeners to search through.
     * @param {Function} listener Method to look for.
     * @return {Number} Index of the specified listener, -1 if not found
     * @api private
     */
    function indexOfListener(listeners, listener) {
        var i = listeners.length;
        while (i--) {
            if (listeners[i].listener === listener) {
                return i;
            }
        }

        return -1;
    }

    /**
     * Alias a method while keeping the context correct, to allow for overwriting of target method.
     *
     * @param {String} name The name of the target method.
     * @return {Function} The aliased method
     * @api private
     */
    function alias(name) {
        return function aliasClosure() {
            return this[name].apply(this, arguments);
        };
    }

    /**
     * Returns the listener array for the specified event.
     * Will initialise the event object and listener arrays if required.
     * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
     * Each property in the object response is an array of listener functions.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Function[]|Object} All listener functions for the event.
     */
    proto.getListeners = function getListeners(evt) {
        var events = this._getEvents();
        var response;
        var key;

        // Return a concatenated array of all matching events if
        // the selector is a regular expression.
        if (evt instanceof RegExp) {
            response = {};
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    response[key] = events[key];
                }
            }
        }
        else {
            response = events[evt] || (events[evt] = []);
        }

        return response;
    };

    /**
     * Takes a list of listener objects and flattens it into a list of listener functions.
     *
     * @param {Object[]} listeners Raw listener objects.
     * @return {Function[]} Just the listener functions.
     */
    proto.flattenListeners = function flattenListeners(listeners) {
        var flatListeners = [];
        var i;

        for (i = 0; i < listeners.length; i += 1) {
            flatListeners.push(listeners[i].listener);
        }

        return flatListeners;
    };

    /**
     * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Object} All listener functions for an event in an object.
     */
    proto.getListenersAsObject = function getListenersAsObject(evt) {
        var listeners = this.getListeners(evt);
        var response;

        if (listeners instanceof Array) {
            response = {};
            response[evt] = listeners;
        }

        return response || listeners;
    };

    /**
     * Adds a listener function to the specified event.
     * The listener will not be added if it is a duplicate.
     * If the listener returns true then it will be removed after it is called.
     * If you pass a regular expression as the event name then the listener will be added to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListener = function addListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var listenerIsWrapped = typeof listener === 'object';
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
                listeners[key].push(listenerIsWrapped ? listener : {
                    listener: listener,
                    once: false
                });
            }
        }

        return this;
    };

    /**
     * Alias of addListener
     */
    proto.on = alias('addListener');

    /**
     * Semi-alias of addListener. It will add a listener that will be
     * automatically removed after its first execution.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addOnceListener = function addOnceListener(evt, listener) {
        return this.addListener(evt, {
            listener: listener,
            once: true
        });
    };

    /**
     * Alias of addOnceListener.
     */
    proto.once = alias('addOnceListener');

    /**
     * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
     * You need to tell it what event names should be matched by a regex.
     *
     * @param {String} evt Name of the event to create.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvent = function defineEvent(evt) {
        this.getListeners(evt);
        return this;
    };

    /**
     * Uses defineEvent to define multiple events.
     *
     * @param {String[]} evts An array of event names to define.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvents = function defineEvents(evts) {
        for (var i = 0; i < evts.length; i += 1) {
            this.defineEvent(evts[i]);
        }
        return this;
    };

    /**
     * Removes a listener function from the specified event.
     * When passed a regular expression as the event name, it will remove the listener from all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to remove the listener from.
     * @param {Function} listener Method to remove from the event.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListener = function removeListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var index;
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                index = indexOfListener(listeners[key], listener);

                if (index !== -1) {
                    listeners[key].splice(index, 1);
                }
            }
        }

        return this;
    };

    /**
     * Alias of removeListener
     */
    proto.off = alias('removeListener');

    /**
     * Adds listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
     * You can also pass it a regular expression to add the array of listeners to all events that match it.
     * Yeah, this function does quite a bit. That's probably a bad thing.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListeners = function addListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(false, evt, listeners);
    };

    /**
     * Removes listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be removed.
     * You can also pass it a regular expression to remove the listeners from all events that match it.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListeners = function removeListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(true, evt, listeners);
    };

    /**
     * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
     * The first argument will determine if the listeners are removed (true) or added (false).
     * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be added/removed.
     * You can also pass it a regular expression to manipulate the listeners of all events that match it.
     *
     * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
        var i;
        var value;
        var single = remove ? this.removeListener : this.addListener;
        var multiple = remove ? this.removeListeners : this.addListeners;

        // If evt is an object then pass each of its properties to this method
        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
            for (i in evt) {
                if (evt.hasOwnProperty(i) && (value = evt[i])) {
                    // Pass the single listener straight through to the singular method
                    if (typeof value === 'function') {
                        single.call(this, i, value);
                    }
                    else {
                        // Otherwise pass back to the multiple function
                        multiple.call(this, i, value);
                    }
                }
            }
        }
        else {
            // So evt must be a string
            // And listeners must be an array of listeners
            // Loop over it and pass each one to the multiple method
            i = listeners.length;
            while (i--) {
                single.call(this, evt, listeners[i]);
            }
        }

        return this;
    };

    /**
     * Removes all listeners from a specified event.
     * If you do not specify an event then all listeners will be removed.
     * That means every event will be emptied.
     * You can also pass a regex to remove all events that match it.
     *
     * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeEvent = function removeEvent(evt) {
        var type = typeof evt;
        var events = this._getEvents();
        var key;

        // Remove different things depending on the state of evt
        if (type === 'string') {
            // Remove all listeners for the specified event
            delete events[evt];
        }
        else if (evt instanceof RegExp) {
            // Remove all events matching the regex.
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    delete events[key];
                }
            }
        }
        else {
            // Remove all listeners in all events
            delete this._events;
        }

        return this;
    };

    /**
     * Alias of removeEvent.
     *
     * Added to mirror the node API.
     */
    proto.removeAllListeners = alias('removeEvent');

    /**
     * Emits an event of your choice.
     * When emitted, every listener attached to that event will be executed.
     * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
     * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
     * So they will not arrive within the array on the other side, they will be separate.
     * You can also pass a regular expression to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {Array} [args] Optional array of arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emitEvent = function emitEvent(evt, args) {
        var listeners = this.getListenersAsObject(evt);
        var listener;
        var i;
        var key;
        var response;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                i = listeners[key].length;

                while (i--) {
                    // If the listener returns true then it shall be removed from the event
                    // The function is executed either with a basic call or an apply if there is an args array
                    listener = listeners[key][i];

                    if (listener.once === true) {
                        this.removeListener(evt, listener.listener);
                    }

                    response = listener.listener.apply(this, args || []);

                    if (response === this._getOnceReturnValue()) {
                        this.removeListener(evt, listener.listener);
                    }
                }
            }
        }

        return this;
    };

    /**
     * Alias of emitEvent
     */
    proto.trigger = alias('emitEvent');

    /**
     * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
     * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {...*} Optional additional arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emit = function emit(evt) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(evt, args);
    };

    /**
     * Sets the current value to check against when executing listeners. If a
     * listeners return value matches the one set here then it will be removed
     * after execution. This value defaults to true.
     *
     * @param {*} value The new value to check for when executing listeners.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.setOnceReturnValue = function setOnceReturnValue(value) {
        this._onceReturnValue = value;
        return this;
    };

    /**
     * Fetches the current value to check against when executing listeners. If
     * the listeners return value matches this one then it should be removed
     * automatically. It will return true by default.
     *
     * @return {*|Boolean} The current value to check for or the default, true.
     * @api private
     */
    proto._getOnceReturnValue = function _getOnceReturnValue() {
        if (this.hasOwnProperty('_onceReturnValue')) {
            return this._onceReturnValue;
        }
        else {
            return true;
        }
    };

    /**
     * Fetches the events object and creates one if required.
     *
     * @return {Object} The events storage object.
     * @api private
     */
    proto._getEvents = function _getEvents() {
        return this._events || (this._events = {});
    };

    /**
     * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
     *
     * @return {Function} Non conflicting EventEmitter class.
     */
    EventEmitter.noConflict = function noConflict() {
        exports.EventEmitter = originalGlobalValue;
        return EventEmitter;
    };

    // Expose the class either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return EventEmitter;
        });
    }
    else if (typeof module === 'object' && module.exports){
        module.exports = EventEmitter;
    }
    else {
        exports.EventEmitter = EventEmitter;
    }
}.call(this));

},{}],24:[function(require,module,exports){
/*!
 * Masonry v3.3.0
 * Cascading grid layout library
 * http://masonry.desandro.com
 * MIT License
 * by David DeSandro
 */

( function( window, factory ) {
  'use strict';
  // universal module definition
  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( [
        'outlayer/outlayer',
        'get-size/get-size',
        'fizzy-ui-utils/utils'
      ],
      factory );
  } else if ( typeof exports === 'object' ) {
    // CommonJS
    module.exports = factory(
      require('outlayer'),
      require('get-size'),
      require('fizzy-ui-utils')
    );
  } else {
    // browser global
    window.Masonry = factory(
      window.Outlayer,
      window.getSize,
      window.fizzyUIUtils
    );
  }

}( window, function factory( Outlayer, getSize, utils ) {

'use strict';

// -------------------------- masonryDefinition -------------------------- //

  // create an Outlayer layout class
  var Masonry = Outlayer.create('masonry');

  Masonry.prototype._resetLayout = function() {
    this.getSize();
    this._getMeasurement( 'columnWidth', 'outerWidth' );
    this._getMeasurement( 'gutter', 'outerWidth' );
    this.measureColumns();

    // reset column Y
    var i = this.cols;
    this.colYs = [];
    while (i--) {
      this.colYs.push( 0 );
    }

    this.maxY = 0;
  };

  Masonry.prototype.measureColumns = function() {
    this.getContainerWidth();
    // if columnWidth is 0, default to outerWidth of first item
    if ( !this.columnWidth ) {
      var firstItem = this.items[0];
      var firstItemElem = firstItem && firstItem.element;
      // columnWidth fall back to item of first element
      this.columnWidth = firstItemElem && getSize( firstItemElem ).outerWidth ||
        // if first elem has no width, default to size of container
        this.containerWidth;
    }

    var columnWidth = this.columnWidth += this.gutter;

    // calculate columns
    var containerWidth = this.containerWidth + this.gutter;
    var cols = containerWidth / columnWidth;
    // fix rounding errors, typically with gutters
    var excess = columnWidth - containerWidth % columnWidth;
    // if overshoot is less than a pixel, round up, otherwise floor it
    var mathMethod = excess && excess < 1 ? 'round' : 'floor';
    cols = Math[ mathMethod ]( cols );
    this.cols = Math.max( cols, 1 );
  };

  Masonry.prototype.getContainerWidth = function() {
    // container is parent if fit width
    var container = this.options.isFitWidth ? this.element.parentNode : this.element;
    // check that this.size and size are there
    // IE8 triggers resize on body size change, so they might not be
    var size = getSize( container );
    this.containerWidth = size && size.innerWidth;
  };

  Masonry.prototype._getItemLayoutPosition = function( item ) {
    item.getSize();
    // how many columns does this brick span
    var remainder = item.size.outerWidth % this.columnWidth;
    var mathMethod = remainder && remainder < 1 ? 'round' : 'ceil';
    // round if off by 1 pixel, otherwise use ceil
    var colSpan = Math[ mathMethod ]( item.size.outerWidth / this.columnWidth );
    colSpan = Math.min( colSpan, this.cols );

    var colGroup = this._getColGroup( colSpan );
    // get the minimum Y value from the columns
    var minimumY = Math.min.apply( Math, colGroup );
    var shortColIndex = utils.indexOf( colGroup, minimumY );

    // position the brick
    var position = {
      x: this.columnWidth * shortColIndex,
      y: minimumY
    };

    // apply setHeight to necessary columns
    var setHeight = minimumY + item.size.outerHeight;
    var setSpan = this.cols + 1 - colGroup.length;
    for ( var i = 0; i < setSpan; i++ ) {
      this.colYs[ shortColIndex + i ] = setHeight;
    }

    return position;
  };

  /**
   * @param {Number} colSpan - number of columns the element spans
   * @returns {Array} colGroup
   */
  Masonry.prototype._getColGroup = function( colSpan ) {
    if ( colSpan < 2 ) {
      // if brick spans only one column, use all the column Ys
      return this.colYs;
    }

    var colGroup = [];
    // how many different places could this brick fit horizontally
    var groupCount = this.cols + 1 - colSpan;
    // for each group potential horizontal position
    for ( var i = 0; i < groupCount; i++ ) {
      // make an array of colY values for that one group
      var groupColYs = this.colYs.slice( i, i + colSpan );
      // and get the max value of the array
      colGroup[i] = Math.max.apply( Math, groupColYs );
    }
    return colGroup;
  };

  Masonry.prototype._manageStamp = function( stamp ) {
    var stampSize = getSize( stamp );
    var offset = this._getElementOffset( stamp );
    // get the columns that this stamp affects
    var firstX = this.options.isOriginLeft ? offset.left : offset.right;
    var lastX = firstX + stampSize.outerWidth;
    var firstCol = Math.floor( firstX / this.columnWidth );
    firstCol = Math.max( 0, firstCol );
    var lastCol = Math.floor( lastX / this.columnWidth );
    // lastCol should not go over if multiple of columnWidth #425
    lastCol -= lastX % this.columnWidth ? 0 : 1;
    lastCol = Math.min( this.cols - 1, lastCol );
    // set colYs to bottom of the stamp
    var stampMaxY = ( this.options.isOriginTop ? offset.top : offset.bottom ) +
      stampSize.outerHeight;
    for ( var i = firstCol; i <= lastCol; i++ ) {
      this.colYs[i] = Math.max( stampMaxY, this.colYs[i] );
    }
  };

  Masonry.prototype._getContainerSize = function() {
    this.maxY = Math.max.apply( Math, this.colYs );
    var size = {
      height: this.maxY
    };

    if ( this.options.isFitWidth ) {
      size.width = this._getContainerFitWidth();
    }

    return size;
  };

  Masonry.prototype._getContainerFitWidth = function() {
    var unusedCols = 0;
    // count unused columns
    var i = this.cols;
    while ( --i ) {
      if ( this.colYs[i] !== 0 ) {
        break;
      }
      unusedCols++;
    }
    // fit container to columns that have been used
    return ( this.cols - unusedCols ) * this.columnWidth - this.gutter;
  };

  Masonry.prototype.needsResizeLayout = function() {
    var previousWidth = this.containerWidth;
    this.getContainerWidth();
    return previousWidth !== this.containerWidth;
  };

  return Masonry;

}));

},{"fizzy-ui-utils":28,"get-size":29,"outlayer":35}],25:[function(require,module,exports){
/**
 * matchesSelector v1.0.3
 * matchesSelector( element, '.selector' )
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false, module: false */

( function( ElemProto ) {

  'use strict';

  var matchesMethod = ( function() {
    // check for the standard method name first
    if ( ElemProto.matches ) {
      return 'matches';
    }
    // check un-prefixed
    if ( ElemProto.matchesSelector ) {
      return 'matchesSelector';
    }
    // check vendor prefixes
    var prefixes = [ 'webkit', 'moz', 'ms', 'o' ];

    for ( var i=0, len = prefixes.length; i < len; i++ ) {
      var prefix = prefixes[i];
      var method = prefix + 'MatchesSelector';
      if ( ElemProto[ method ] ) {
        return method;
      }
    }
  })();

  // ----- match ----- //

  function match( elem, selector ) {
    return elem[ matchesMethod ]( selector );
  }

  // ----- appendToFragment ----- //

  function checkParent( elem ) {
    // not needed if already has parent
    if ( elem.parentNode ) {
      return;
    }
    var fragment = document.createDocumentFragment();
    fragment.appendChild( elem );
  }

  // ----- query ----- //

  // fall back to using QSA
  // thx @jonathantneal https://gist.github.com/3062955
  function query( elem, selector ) {
    // append to fragment if no parent
    checkParent( elem );

    // match elem with all selected elems of parent
    var elems = elem.parentNode.querySelectorAll( selector );
    for ( var i=0, len = elems.length; i < len; i++ ) {
      // return true if match
      if ( elems[i] === elem ) {
        return true;
      }
    }
    // otherwise return false
    return false;
  }

  // ----- matchChild ----- //

  function matchChild( elem, selector ) {
    checkParent( elem );
    return match( elem, selector );
  }

  // ----- matchesSelector ----- //

  var matchesSelector;

  if ( matchesMethod ) {
    // IE9 supports matchesSelector, but doesn't work on orphaned elems
    // check for that
    var div = document.createElement('div');
    var supportsOrphans = match( div, 'div' );
    matchesSelector = supportsOrphans ? match : matchChild;
  } else {
    matchesSelector = query;
  }

  // transport
  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( function() {
      return matchesSelector;
    });
  } else if ( typeof exports === 'object' ) {
    module.exports = matchesSelector;
  }
  else {
    // browser global
    window.matchesSelector = matchesSelector;
  }

})( Element.prototype );

},{}],26:[function(require,module,exports){
/*!
 * docReady v1.0.3
 * Cross browser DOMContentLoaded event emitter
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true, unused: true*/
/*global define: false, require: false, module: false */

( function( window ) {

'use strict';

var document = window.document;
// collection of functions to be triggered on ready
var queue = [];

function docReady( fn ) {
  // throw out non-functions
  if ( typeof fn !== 'function' ) {
    return;
  }

  if ( docReady.isReady ) {
    // ready now, hit it
    fn();
  } else {
    // queue function when ready
    queue.push( fn );
  }
}

docReady.isReady = false;

// triggered on various doc ready events
function init( event ) {
  // bail if IE8 document is not ready just yet
  var isIE8NotReady = event.type === 'readystatechange' && document.readyState !== 'complete';
  if ( docReady.isReady || isIE8NotReady ) {
    return;
  }
  docReady.isReady = true;

  // process queue
  for ( var i=0, len = queue.length; i < len; i++ ) {
    var fn = queue[i];
    fn();
  }
}

function defineDocReady( eventie ) {
  eventie.bind( document, 'DOMContentLoaded', init );
  eventie.bind( document, 'readystatechange', init );
  eventie.bind( window, 'load', init );

  return docReady;
}

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  // if RequireJS, then doc is already ready
  docReady.isReady = typeof requirejs === 'function';
  define( [ 'eventie/eventie' ], defineDocReady );
} else if ( typeof exports === 'object' ) {
  module.exports = defineDocReady( require('eventie') );
} else {
  // browser global
  window.docReady = defineDocReady( window.eventie );
}

})( window );

},{"eventie":27}],27:[function(require,module,exports){
module.exports=require(22)
},{"/home/kaore/Dev/www/cibul-templates/node_modules/imagesloaded/node_modules/eventie/eventie.js":22}],28:[function(require,module,exports){
/**
 * Fizzy UI utils v1.0.1
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true, strict: true */

( function( window, factory ) {
  /*global define: false, module: false, require: false */
  'use strict';
  // universal module definition

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
      'doc-ready/doc-ready',
      'matches-selector/matches-selector'
    ], function( docReady, matchesSelector ) {
      return factory( window, docReady, matchesSelector );
    });
  } else if ( typeof exports == 'object' ) {
    // CommonJS
    module.exports = factory(
      window,
      require('doc-ready'),
      require('desandro-matches-selector')
    );
  } else {
    // browser global
    window.fizzyUIUtils = factory(
      window,
      window.docReady,
      window.matchesSelector
    );
  }

}( window, function factory( window, docReady, matchesSelector ) {

'use strict';

var utils = {};

// ----- extend ----- //

// extends objects
utils.extend = function( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
};

// ----- modulo ----- //

utils.modulo = function( num, div ) {
  return ( ( num % div ) + div ) % div;
};

// ----- isArray ----- //
  
var objToString = Object.prototype.toString;
utils.isArray = function( obj ) {
  return objToString.call( obj ) == '[object Array]';
};

// ----- makeArray ----- //

// turn element or nodeList into an array
utils.makeArray = function( obj ) {
  var ary = [];
  if ( utils.isArray( obj ) ) {
    // use object if already an array
    ary = obj;
  } else if ( obj && typeof obj.length == 'number' ) {
    // convert nodeList to array
    for ( var i=0, len = obj.length; i < len; i++ ) {
      ary.push( obj[i] );
    }
  } else {
    // array of single index
    ary.push( obj );
  }
  return ary;
};

// ----- indexOf ----- //

// index of helper cause IE8
utils.indexOf = Array.prototype.indexOf ? function( ary, obj ) {
    return ary.indexOf( obj );
  } : function( ary, obj ) {
    for ( var i=0, len = ary.length; i < len; i++ ) {
      if ( ary[i] === obj ) {
        return i;
      }
    }
    return -1;
  };

// ----- removeFrom ----- //

utils.removeFrom = function( ary, obj ) {
  var index = utils.indexOf( ary, obj );
  if ( index != -1 ) {
    ary.splice( index, 1 );
  }
};

// ----- isElement ----- //

// http://stackoverflow.com/a/384380/182183
utils.isElement = ( typeof HTMLElement == 'function' || typeof HTMLElement == 'object' ) ?
  function isElementDOM2( obj ) {
    return obj instanceof HTMLElement;
  } :
  function isElementQuirky( obj ) {
    return obj && typeof obj == 'object' &&
      obj.nodeType == 1 && typeof obj.nodeName == 'string';
  };

// ----- setText ----- //

utils.setText = ( function() {
  var setTextProperty;
  function setText( elem, text ) {
    // only check setTextProperty once
    setTextProperty = setTextProperty || ( document.documentElement.textContent !== undefined ? 'textContent' : 'innerText' );
    elem[ setTextProperty ] = text;
  }
  return setText;
})();

// ----- getParent ----- //

utils.getParent = function( elem, selector ) {
  while ( elem != document.body ) {
    elem = elem.parentNode;
    if ( matchesSelector( elem, selector ) ) {
      return elem;
    }
  }
};

// ----- getQueryElement ----- //

// use element as selector string
utils.getQueryElement = function( elem ) {
  if ( typeof elem == 'string' ) {
    return document.querySelector( elem );
  }
  return elem;
};

// ----- handleEvent ----- //

// enable .ontype to trigger from .addEventListener( elem, 'type' )
utils.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

// ----- filterFindElements ----- //

utils.filterFindElements = function( elems, selector ) {
  // make array of elems
  elems = utils.makeArray( elems );
  var ffElems = [];

  for ( var i=0, len = elems.length; i < len; i++ ) {
    var elem = elems[i];
    // check that elem is an actual element
    if ( !utils.isElement( elem ) ) {
      continue;
    }
    // filter & find items if we have a selector
    if ( selector ) {
      // filter siblings
      if ( matchesSelector( elem, selector ) ) {
        ffElems.push( elem );
      }
      // find children
      var childElems = elem.querySelectorAll( selector );
      // concat childElems to filterFound array
      for ( var j=0, jLen = childElems.length; j < jLen; j++ ) {
        ffElems.push( childElems[j] );
      }
    } else {
      ffElems.push( elem );
    }
  }

  return ffElems;
};

// ----- debounceMethod ----- //

utils.debounceMethod = function( _class, methodName, threshold ) {
  // original method
  var method = _class.prototype[ methodName ];
  var timeoutName = methodName + 'Timeout';

  _class.prototype[ methodName ] = function() {
    var timeout = this[ timeoutName ];
    if ( timeout ) {
      clearTimeout( timeout );
    }
    var args = arguments;

    var _this = this;
    this[ timeoutName ] = setTimeout( function() {
      method.apply( _this, args );
      delete _this[ timeoutName ];
    }, threshold || 100 );
  };
};

// ----- htmlInit ----- //

// http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
utils.toDashed = function( str ) {
  return str.replace( /(.)([A-Z])/g, function( match, $1, $2 ) {
    return $1 + '-' + $2;
  }).toLowerCase();
};

var console = window.console;
/**
 * allow user to initialize classes via .js-namespace class
 * htmlInit( Widget, 'widgetName' )
 * options are parsed from data-namespace-option attribute
 */
utils.htmlInit = function( WidgetClass, namespace ) {
  docReady( function() {
    var dashedNamespace = utils.toDashed( namespace );
    var elems = document.querySelectorAll( '.js-' + dashedNamespace );
    var dataAttr = 'data-' + dashedNamespace + '-options';

    for ( var i=0, len = elems.length; i < len; i++ ) {
      var elem = elems[i];
      var attr = elem.getAttribute( dataAttr );
      var options;
      try {
        options = attr && JSON.parse( attr );
      } catch ( error ) {
        // log error, do not initialize
        if ( console ) {
          console.error( 'Error parsing ' + dataAttr + ' on ' +
            elem.nodeName.toLowerCase() + ( elem.id ? '#' + elem.id : '' ) + ': ' +
            error );
        }
        continue;
      }
      // initialize
      var instance = new WidgetClass( elem, options );
      // make available via $().data('layoutname')
      var jQuery = window.jQuery;
      if ( jQuery ) {
        jQuery.data( elem, namespace, instance );
      }
    }
  });
};

// -----  ----- //

return utils;

}));

},{"desandro-matches-selector":25,"doc-ready":26}],29:[function(require,module,exports){
/*!
 * getSize v1.2.2
 * measure size of elements
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false, exports: false, require: false, module: false, console: false */

( function( window, undefined ) {

'use strict';

// -------------------------- helpers -------------------------- //

// get a number from a string, not a percentage
function getStyleSize( value ) {
  var num = parseFloat( value );
  // not a percent like '100%', and a number
  var isValid = value.indexOf('%') === -1 && !isNaN( num );
  return isValid && num;
}

function noop() {}

var logError = typeof console === 'undefined' ? noop :
  function( message ) {
    console.error( message );
  };

// -------------------------- measurements -------------------------- //

var measurements = [
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingBottom',
  'marginLeft',
  'marginRight',
  'marginTop',
  'marginBottom',
  'borderLeftWidth',
  'borderRightWidth',
  'borderTopWidth',
  'borderBottomWidth'
];

function getZeroSize() {
  var size = {
    width: 0,
    height: 0,
    innerWidth: 0,
    innerHeight: 0,
    outerWidth: 0,
    outerHeight: 0
  };
  for ( var i=0, len = measurements.length; i < len; i++ ) {
    var measurement = measurements[i];
    size[ measurement ] = 0;
  }
  return size;
}



function defineGetSize( getStyleProperty ) {

// -------------------------- setup -------------------------- //

var isSetup = false;

var getStyle, boxSizingProp, isBoxSizeOuter;

/**
 * setup vars and functions
 * do it on initial getSize(), rather than on script load
 * For Firefox bug https://bugzilla.mozilla.org/show_bug.cgi?id=548397
 */
function setup() {
  // setup once
  if ( isSetup ) {
    return;
  }
  isSetup = true;

  var getComputedStyle = window.getComputedStyle;
  getStyle = ( function() {
    var getStyleFn = getComputedStyle ?
      function( elem ) {
        return getComputedStyle( elem, null );
      } :
      function( elem ) {
        return elem.currentStyle;
      };

      return function getStyle( elem ) {
        var style = getStyleFn( elem );
        if ( !style ) {
          logError( 'Style returned ' + style +
            '. Are you running this code in a hidden iframe on Firefox? ' +
            'See http://bit.ly/getsizebug1' );
        }
        return style;
      };
  })();

  // -------------------------- box sizing -------------------------- //

  boxSizingProp = getStyleProperty('boxSizing');

  /**
   * WebKit measures the outer-width on style.width on border-box elems
   * IE & Firefox measures the inner-width
   */
  if ( boxSizingProp ) {
    var div = document.createElement('div');
    div.style.width = '200px';
    div.style.padding = '1px 2px 3px 4px';
    div.style.borderStyle = 'solid';
    div.style.borderWidth = '1px 2px 3px 4px';
    div.style[ boxSizingProp ] = 'border-box';

    var body = document.body || document.documentElement;
    body.appendChild( div );
    var style = getStyle( div );

    isBoxSizeOuter = getStyleSize( style.width ) === 200;
    body.removeChild( div );
  }

}

// -------------------------- getSize -------------------------- //

function getSize( elem ) {
  setup();

  // use querySeletor if elem is string
  if ( typeof elem === 'string' ) {
    elem = document.querySelector( elem );
  }

  // do not proceed on non-objects
  if ( !elem || typeof elem !== 'object' || !elem.nodeType ) {
    return;
  }

  var style = getStyle( elem );

  // if hidden, everything is 0
  if ( style.display === 'none' ) {
    return getZeroSize();
  }

  var size = {};
  size.width = elem.offsetWidth;
  size.height = elem.offsetHeight;

  var isBorderBox = size.isBorderBox = !!( boxSizingProp &&
    style[ boxSizingProp ] && style[ boxSizingProp ] === 'border-box' );

  // get all measurements
  for ( var i=0, len = measurements.length; i < len; i++ ) {
    var measurement = measurements[i];
    var value = style[ measurement ];
    value = mungeNonPixel( elem, value );
    var num = parseFloat( value );
    // any 'auto', 'medium' value will be 0
    size[ measurement ] = !isNaN( num ) ? num : 0;
  }

  var paddingWidth = size.paddingLeft + size.paddingRight;
  var paddingHeight = size.paddingTop + size.paddingBottom;
  var marginWidth = size.marginLeft + size.marginRight;
  var marginHeight = size.marginTop + size.marginBottom;
  var borderWidth = size.borderLeftWidth + size.borderRightWidth;
  var borderHeight = size.borderTopWidth + size.borderBottomWidth;

  var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;

  // overwrite width and height if we can get it from style
  var styleWidth = getStyleSize( style.width );
  if ( styleWidth !== false ) {
    size.width = styleWidth +
      // add padding and border unless it's already including it
      ( isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth );
  }

  var styleHeight = getStyleSize( style.height );
  if ( styleHeight !== false ) {
    size.height = styleHeight +
      // add padding and border unless it's already including it
      ( isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight );
  }

  size.innerWidth = size.width - ( paddingWidth + borderWidth );
  size.innerHeight = size.height - ( paddingHeight + borderHeight );

  size.outerWidth = size.width + marginWidth;
  size.outerHeight = size.height + marginHeight;

  return size;
}

// IE8 returns percent values, not pixels
// taken from jQuery's curCSS
function mungeNonPixel( elem, value ) {
  // IE8 and has percent value
  if ( window.getComputedStyle || value.indexOf('%') === -1 ) {
    return value;
  }
  var style = elem.style;
  // Remember the original values
  var left = style.left;
  var rs = elem.runtimeStyle;
  var rsLeft = rs && rs.left;

  // Put in the new values to get a computed value out
  if ( rsLeft ) {
    rs.left = elem.currentStyle.left;
  }
  style.left = value;
  value = style.pixelLeft;

  // Revert the changed values
  style.left = left;
  if ( rsLeft ) {
    rs.left = rsLeft;
  }

  return value;
}

return getSize;

}

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD for RequireJS
  define( [ 'get-style-property/get-style-property' ], defineGetSize );
} else if ( typeof exports === 'object' ) {
  // CommonJS for Component
  module.exports = defineGetSize( require('desandro-get-style-property') );
} else {
  // browser global
  window.getSize = defineGetSize( window.getStyleProperty );
}

})( window );

},{"desandro-get-style-property":30}],30:[function(require,module,exports){
/*!
 * getStyleProperty v1.0.4
 * original by kangax
 * http://perfectionkills.com/feature-testing-css-properties/
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false, exports: false, module: false */

( function( window ) {

'use strict';

var prefixes = 'Webkit Moz ms Ms O'.split(' ');
var docElemStyle = document.documentElement.style;

function getStyleProperty( propName ) {
  if ( !propName ) {
    return;
  }

  // test standard property first
  if ( typeof docElemStyle[ propName ] === 'string' ) {
    return propName;
  }

  // capitalize
  propName = propName.charAt(0).toUpperCase() + propName.slice(1);

  // test vendor specific properties
  var prefixed;
  for ( var i=0, len = prefixes.length; i < len; i++ ) {
    prefixed = prefixes[i] + propName;
    if ( typeof docElemStyle[ prefixed ] === 'string' ) {
      return prefixed;
    }
  }
}

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( function() {
    return getStyleProperty;
  });
} else if ( typeof exports === 'object' ) {
  // CommonJS for Component
  module.exports = getStyleProperty;
} else {
  // browser global
  window.getStyleProperty = getStyleProperty;
}

})( window );

},{}],31:[function(require,module,exports){
/**
 * Outlayer Item
 */

( function( window, factory ) {
  'use strict';
  // universal module definition
  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( [
        'eventEmitter/EventEmitter',
        'get-size/get-size',
        'get-style-property/get-style-property',
        'fizzy-ui-utils/utils'
      ],
      function( EventEmitter, getSize, getStyleProperty, utils ) {
        return factory( window, EventEmitter, getSize, getStyleProperty, utils );
      }
    );
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = factory(
      window,
      require('wolfy87-eventemitter'),
      require('get-size'),
      require('desandro-get-style-property'),
      require('fizzy-ui-utils')
    );
  } else {
    // browser global
    window.Outlayer = {};
    window.Outlayer.Item = factory(
      window,
      window.EventEmitter,
      window.getSize,
      window.getStyleProperty,
      window.fizzyUIUtils
    );
  }

}( window, function factory( window, EventEmitter, getSize, getStyleProperty, utils ) {
'use strict';

// ----- helpers ----- //

var getComputedStyle = window.getComputedStyle;
var getStyle = getComputedStyle ?
  function( elem ) {
    return getComputedStyle( elem, null );
  } :
  function( elem ) {
    return elem.currentStyle;
  };


function isEmptyObj( obj ) {
  for ( var prop in obj ) {
    return false;
  }
  prop = null;
  return true;
}

// -------------------------- CSS3 support -------------------------- //

var transitionProperty = getStyleProperty('transition');
var transformProperty = getStyleProperty('transform');
var supportsCSS3 = transitionProperty && transformProperty;
var is3d = !!getStyleProperty('perspective');

var transitionEndEvent = {
  WebkitTransition: 'webkitTransitionEnd',
  MozTransition: 'transitionend',
  OTransition: 'otransitionend',
  transition: 'transitionend'
}[ transitionProperty ];

// properties that could have vendor prefix
var prefixableProperties = [
  'transform',
  'transition',
  'transitionDuration',
  'transitionProperty'
];

// cache all vendor properties
var vendorProperties = ( function() {
  var cache = {};
  for ( var i=0, len = prefixableProperties.length; i < len; i++ ) {
    var prop = prefixableProperties[i];
    var supportedProp = getStyleProperty( prop );
    if ( supportedProp && supportedProp !== prop ) {
      cache[ prop ] = supportedProp;
    }
  }
  return cache;
})();

// -------------------------- Item -------------------------- //

function Item( element, layout ) {
  if ( !element ) {
    return;
  }

  this.element = element;
  // parent layout class, i.e. Masonry, Isotope, or Packery
  this.layout = layout;
  this.position = {
    x: 0,
    y: 0
  };

  this._create();
}

// inherit EventEmitter
utils.extend( Item.prototype, EventEmitter.prototype );

Item.prototype._create = function() {
  // transition objects
  this._transn = {
    ingProperties: {},
    clean: {},
    onEnd: {}
  };

  this.css({
    position: 'absolute'
  });
};

// trigger specified handler for event type
Item.prototype.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

Item.prototype.getSize = function() {
  this.size = getSize( this.element );
};

/**
 * apply CSS styles to element
 * @param {Object} style
 */
Item.prototype.css = function( style ) {
  var elemStyle = this.element.style;

  for ( var prop in style ) {
    // use vendor property if available
    var supportedProp = vendorProperties[ prop ] || prop;
    elemStyle[ supportedProp ] = style[ prop ];
  }
};

 // measure position, and sets it
Item.prototype.getPosition = function() {
  var style = getStyle( this.element );
  var layoutOptions = this.layout.options;
  var isOriginLeft = layoutOptions.isOriginLeft;
  var isOriginTop = layoutOptions.isOriginTop;
  var x = parseInt( style[ isOriginLeft ? 'left' : 'right' ], 10 );
  var y = parseInt( style[ isOriginTop ? 'top' : 'bottom' ], 10 );

  // clean up 'auto' or other non-integer values
  x = isNaN( x ) ? 0 : x;
  y = isNaN( y ) ? 0 : y;
  // remove padding from measurement
  var layoutSize = this.layout.size;
  x -= isOriginLeft ? layoutSize.paddingLeft : layoutSize.paddingRight;
  y -= isOriginTop ? layoutSize.paddingTop : layoutSize.paddingBottom;

  this.position.x = x;
  this.position.y = y;
};

// set settled position, apply padding
Item.prototype.layoutPosition = function() {
  var layoutSize = this.layout.size;
  var layoutOptions = this.layout.options;
  var style = {};

  // x
  var xPadding = layoutOptions.isOriginLeft ? 'paddingLeft' : 'paddingRight';
  var xProperty = layoutOptions.isOriginLeft ? 'left' : 'right';
  var xResetProperty = layoutOptions.isOriginLeft ? 'right' : 'left';

  var x = this.position.x + layoutSize[ xPadding ];
  // set in percentage
  x = layoutOptions.percentPosition && !layoutOptions.isHorizontal ?
    ( ( x / layoutSize.width ) * 100 ) + '%' : x + 'px';
  style[ xProperty ] = x;
  // reset other property
  style[ xResetProperty ] = '';

  // y
  var yPadding = layoutOptions.isOriginTop ? 'paddingTop' : 'paddingBottom';
  var yProperty = layoutOptions.isOriginTop ? 'top' : 'bottom';
  var yResetProperty = layoutOptions.isOriginTop ? 'bottom' : 'top';

  var y = this.position.y + layoutSize[ yPadding ];
  // set in percentage
  y = layoutOptions.percentPosition && layoutOptions.isHorizontal ?
    ( ( y / layoutSize.height ) * 100 ) + '%' : y + 'px';
  style[ yProperty ] = y;
  // reset other property
  style[ yResetProperty ] = '';

  this.css( style );
  this.emitEvent( 'layout', [ this ] );
};


// transform translate function
var translate = is3d ?
  function( x, y ) {
    return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
  } :
  function( x, y ) {
    return 'translate(' + x + 'px, ' + y + 'px)';
  };


Item.prototype._transitionTo = function( x, y ) {
  this.getPosition();
  // get current x & y from top/left
  var curX = this.position.x;
  var curY = this.position.y;

  var compareX = parseInt( x, 10 );
  var compareY = parseInt( y, 10 );
  var didNotMove = compareX === this.position.x && compareY === this.position.y;

  // save end position
  this.setPosition( x, y );

  // if did not move and not transitioning, just go to layout
  if ( didNotMove && !this.isTransitioning ) {
    this.layoutPosition();
    return;
  }

  var transX = x - curX;
  var transY = y - curY;
  var transitionStyle = {};
  // flip cooridinates if origin on right or bottom
  var layoutOptions = this.layout.options;
  transX = layoutOptions.isOriginLeft ? transX : -transX;
  transY = layoutOptions.isOriginTop ? transY : -transY;
  transitionStyle.transform = translate( transX, transY );

  this.transition({
    to: transitionStyle,
    onTransitionEnd: {
      transform: this.layoutPosition
    },
    isCleaning: true
  });
};

// non transition + transform support
Item.prototype.goTo = function( x, y ) {
  this.setPosition( x, y );
  this.layoutPosition();
};

// use transition and transforms if supported
Item.prototype.moveTo = supportsCSS3 ?
  Item.prototype._transitionTo : Item.prototype.goTo;

Item.prototype.setPosition = function( x, y ) {
  this.position.x = parseInt( x, 10 );
  this.position.y = parseInt( y, 10 );
};

// ----- transition ----- //

/**
 * @param {Object} style - CSS
 * @param {Function} onTransitionEnd
 */

// non transition, just trigger callback
Item.prototype._nonTransition = function( args ) {
  this.css( args.to );
  if ( args.isCleaning ) {
    this._removeStyles( args.to );
  }
  for ( var prop in args.onTransitionEnd ) {
    args.onTransitionEnd[ prop ].call( this );
  }
};

/**
 * proper transition
 * @param {Object} args - arguments
 *   @param {Object} to - style to transition to
 *   @param {Object} from - style to start transition from
 *   @param {Boolean} isCleaning - removes transition styles after transition
 *   @param {Function} onTransitionEnd - callback
 */
Item.prototype._transition = function( args ) {
  // redirect to nonTransition if no transition duration
  if ( !parseFloat( this.layout.options.transitionDuration ) ) {
    this._nonTransition( args );
    return;
  }

  var _transition = this._transn;
  // keep track of onTransitionEnd callback by css property
  for ( var prop in args.onTransitionEnd ) {
    _transition.onEnd[ prop ] = args.onTransitionEnd[ prop ];
  }
  // keep track of properties that are transitioning
  for ( prop in args.to ) {
    _transition.ingProperties[ prop ] = true;
    // keep track of properties to clean up when transition is done
    if ( args.isCleaning ) {
      _transition.clean[ prop ] = true;
    }
  }

  // set from styles
  if ( args.from ) {
    this.css( args.from );
    // force redraw. http://blog.alexmaccaw.com/css-transitions
    var h = this.element.offsetHeight;
    // hack for JSHint to hush about unused var
    h = null;
  }
  // enable transition
  this.enableTransition( args.to );
  // set styles that are transitioning
  this.css( args.to );

  this.isTransitioning = true;

};

var itemTransitionProperties = transformProperty && ( utils.toDashed( transformProperty ) +
  ',opacity' );

Item.prototype.enableTransition = function(/* style */) {
  // only enable if not already transitioning
  // bug in IE10 were re-setting transition style will prevent
  // transitionend event from triggering
  if ( this.isTransitioning ) {
    return;
  }

  // make transition: foo, bar, baz from style object
  // TODO uncomment this bit when IE10 bug is resolved
  // var transitionValue = [];
  // for ( var prop in style ) {
  //   // dash-ify camelCased properties like WebkitTransition
  //   transitionValue.push( toDash( prop ) );
  // }
  // enable transition styles
  // HACK always enable transform,opacity for IE10
  this.css({
    transitionProperty: itemTransitionProperties,
    transitionDuration: this.layout.options.transitionDuration
  });
  // listen for transition end event
  this.element.addEventListener( transitionEndEvent, this, false );
};

Item.prototype.transition = Item.prototype[ transitionProperty ? '_transition' : '_nonTransition' ];

// ----- events ----- //

Item.prototype.onwebkitTransitionEnd = function( event ) {
  this.ontransitionend( event );
};

Item.prototype.onotransitionend = function( event ) {
  this.ontransitionend( event );
};

// properties that I munge to make my life easier
var dashedVendorProperties = {
  '-webkit-transform': 'transform',
  '-moz-transform': 'transform',
  '-o-transform': 'transform'
};

Item.prototype.ontransitionend = function( event ) {
  // disregard bubbled events from children
  if ( event.target !== this.element ) {
    return;
  }
  var _transition = this._transn;
  // get property name of transitioned property, convert to prefix-free
  var propertyName = dashedVendorProperties[ event.propertyName ] || event.propertyName;

  // remove property that has completed transitioning
  delete _transition.ingProperties[ propertyName ];
  // check if any properties are still transitioning
  if ( isEmptyObj( _transition.ingProperties ) ) {
    // all properties have completed transitioning
    this.disableTransition();
  }
  // clean style
  if ( propertyName in _transition.clean ) {
    // clean up style
    this.element.style[ event.propertyName ] = '';
    delete _transition.clean[ propertyName ];
  }
  // trigger onTransitionEnd callback
  if ( propertyName in _transition.onEnd ) {
    var onTransitionEnd = _transition.onEnd[ propertyName ];
    onTransitionEnd.call( this );
    delete _transition.onEnd[ propertyName ];
  }

  this.emitEvent( 'transitionEnd', [ this ] );
};

Item.prototype.disableTransition = function() {
  this.removeTransitionStyles();
  this.element.removeEventListener( transitionEndEvent, this, false );
  this.isTransitioning = false;
};

/**
 * removes style property from element
 * @param {Object} style
**/
Item.prototype._removeStyles = function( style ) {
  // clean up transition styles
  var cleanStyle = {};
  for ( var prop in style ) {
    cleanStyle[ prop ] = '';
  }
  this.css( cleanStyle );
};

var cleanTransitionStyle = {
  transitionProperty: '',
  transitionDuration: ''
};

Item.prototype.removeTransitionStyles = function() {
  // remove transition
  this.css( cleanTransitionStyle );
};

// ----- show/hide/remove ----- //

// remove element from DOM
Item.prototype.removeElem = function() {
  this.element.parentNode.removeChild( this.element );
  // remove display: none
  this.css({ display: '' });
  this.emitEvent( 'remove', [ this ] );
};

Item.prototype.remove = function() {
  // just remove element if no transition support or no transition
  if ( !transitionProperty || !parseFloat( this.layout.options.transitionDuration ) ) {
    this.removeElem();
    return;
  }

  // start transition
  var _this = this;
  this.once( 'transitionEnd', function() {
    _this.removeElem();
  });
  this.hide();
};

Item.prototype.reveal = function() {
  delete this.isHidden;
  // remove display: none
  this.css({ display: '' });

  var options = this.layout.options;

  var onTransitionEnd = {};
  var transitionEndProperty = this.getHideRevealTransitionEndProperty('visibleStyle');
  onTransitionEnd[ transitionEndProperty ] = this.onRevealTransitionEnd;

  this.transition({
    from: options.hiddenStyle,
    to: options.visibleStyle,
    isCleaning: true,
    onTransitionEnd: onTransitionEnd
  });
};

Item.prototype.onRevealTransitionEnd = function() {
  // check if still visible
  // during transition, item may have been hidden
  if ( !this.isHidden ) {
    this.emitEvent('reveal');
  }
};

/**
 * get style property use for hide/reveal transition end
 * @param {String} styleProperty - hiddenStyle/visibleStyle
 * @returns {String}
 */
Item.prototype.getHideRevealTransitionEndProperty = function( styleProperty ) {
  var optionStyle = this.layout.options[ styleProperty ];
  // use opacity
  if ( optionStyle.opacity ) {
    return 'opacity';
  }
  // get first property
  for ( var prop in optionStyle ) {
    return prop;
  }
};

Item.prototype.hide = function() {
  // set flag
  this.isHidden = true;
  // remove display: none
  this.css({ display: '' });

  var options = this.layout.options;

  var onTransitionEnd = {};
  var transitionEndProperty = this.getHideRevealTransitionEndProperty('hiddenStyle');
  onTransitionEnd[ transitionEndProperty ] = this.onHideTransitionEnd;

  this.transition({
    from: options.visibleStyle,
    to: options.hiddenStyle,
    // keep hidden stuff hidden
    isCleaning: true,
    onTransitionEnd: onTransitionEnd
  });
};

Item.prototype.onHideTransitionEnd = function() {
  // check if still hidden
  // during transition, item may have been un-hidden
  if ( this.isHidden ) {
    this.css({ display: 'none' });
    this.emitEvent('hide');
  }
};

Item.prototype.destroy = function() {
  this.css({
    position: '',
    left: '',
    right: '',
    top: '',
    bottom: '',
    transition: '',
    transform: ''
  });
};

return Item;

}));

},{"desandro-get-style-property":32,"fizzy-ui-utils":28,"get-size":29,"wolfy87-eventemitter":34}],32:[function(require,module,exports){
module.exports=require(30)
},{"/home/kaore/Dev/www/cibul-templates/node_modules/masonry-layout/node_modules/get-size/node_modules/desandro-get-style-property/get-style-property.js":30}],33:[function(require,module,exports){
module.exports=require(22)
},{"/home/kaore/Dev/www/cibul-templates/node_modules/imagesloaded/node_modules/eventie/eventie.js":22}],34:[function(require,module,exports){
module.exports=require(23)
},{"/home/kaore/Dev/www/cibul-templates/node_modules/imagesloaded/node_modules/wolfy87-eventemitter/EventEmitter.js":23}],35:[function(require,module,exports){
/*!
 * Outlayer v1.4.0
 * the brains and guts of a layout library
 * MIT license
 */

( function( window, factory ) {
  'use strict';
  // universal module definition

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
        'eventie/eventie',
        'eventEmitter/EventEmitter',
        'get-size/get-size',
        'fizzy-ui-utils/utils',
        './item'
      ],
      function( eventie, EventEmitter, getSize, utils, Item ) {
        return factory( window, eventie, EventEmitter, getSize, utils, Item);
      }
    );
  } else if ( typeof exports == 'object' ) {
    // CommonJS
    module.exports = factory(
      window,
      require('eventie'),
      require('wolfy87-eventemitter'),
      require('get-size'),
      require('fizzy-ui-utils'),
      require('./item')
    );
  } else {
    // browser global
    window.Outlayer = factory(
      window,
      window.eventie,
      window.EventEmitter,
      window.getSize,
      window.fizzyUIUtils,
      window.Outlayer.Item
    );
  }

}( window, function factory( window, eventie, EventEmitter, getSize, utils, Item ) {
'use strict';

// ----- vars ----- //

var console = window.console;
var jQuery = window.jQuery;
var noop = function() {};

// -------------------------- Outlayer -------------------------- //

// globally unique identifiers
var GUID = 0;
// internal store of all Outlayer intances
var instances = {};


/**
 * @param {Element, String} element
 * @param {Object} options
 * @constructor
 */
function Outlayer( element, options ) {
  var queryElement = utils.getQueryElement( element );
  if ( !queryElement ) {
    if ( console ) {
      console.error( 'Bad element for ' + this.constructor.namespace +
        ': ' + ( queryElement || element ) );
    }
    return;
  }
  this.element = queryElement;
  // add jQuery
  if ( jQuery ) {
    this.$element = jQuery( this.element );
  }

  // options
  this.options = utils.extend( {}, this.constructor.defaults );
  this.option( options );

  // add id for Outlayer.getFromElement
  var id = ++GUID;
  this.element.outlayerGUID = id; // expando
  instances[ id ] = this; // associate via id

  // kick it off
  this._create();

  if ( this.options.isInitLayout ) {
    this.layout();
  }
}

// settings are for internal use only
Outlayer.namespace = 'outlayer';
Outlayer.Item = Item;

// default options
Outlayer.defaults = {
  containerStyle: {
    position: 'relative'
  },
  isInitLayout: true,
  isOriginLeft: true,
  isOriginTop: true,
  isResizeBound: true,
  isResizingContainer: true,
  // item options
  transitionDuration: '0.4s',
  hiddenStyle: {
    opacity: 0,
    transform: 'scale(0.001)'
  },
  visibleStyle: {
    opacity: 1,
    transform: 'scale(1)'
  }
};

// inherit EventEmitter
utils.extend( Outlayer.prototype, EventEmitter.prototype );

/**
 * set options
 * @param {Object} opts
 */
Outlayer.prototype.option = function( opts ) {
  utils.extend( this.options, opts );
};

Outlayer.prototype._create = function() {
  // get items from children
  this.reloadItems();
  // elements that affect layout, but are not laid out
  this.stamps = [];
  this.stamp( this.options.stamp );
  // set container style
  utils.extend( this.element.style, this.options.containerStyle );

  // bind resize method
  if ( this.options.isResizeBound ) {
    this.bindResize();
  }
};

// goes through all children again and gets bricks in proper order
Outlayer.prototype.reloadItems = function() {
  // collection of item elements
  this.items = this._itemize( this.element.children );
};


/**
 * turn elements into Outlayer.Items to be used in layout
 * @param {Array or NodeList or HTMLElement} elems
 * @returns {Array} items - collection of new Outlayer Items
 */
Outlayer.prototype._itemize = function( elems ) {

  var itemElems = this._filterFindItemElements( elems );
  var Item = this.constructor.Item;

  // create new Outlayer Items for collection
  var items = [];
  for ( var i=0, len = itemElems.length; i < len; i++ ) {
    var elem = itemElems[i];
    var item = new Item( elem, this );
    items.push( item );
  }

  return items;
};

/**
 * get item elements to be used in layout
 * @param {Array or NodeList or HTMLElement} elems
 * @returns {Array} items - item elements
 */
Outlayer.prototype._filterFindItemElements = function( elems ) {
  return utils.filterFindElements( elems, this.options.itemSelector );
};

/**
 * getter method for getting item elements
 * @returns {Array} elems - collection of item elements
 */
Outlayer.prototype.getItemElements = function() {
  var elems = [];
  for ( var i=0, len = this.items.length; i < len; i++ ) {
    elems.push( this.items[i].element );
  }
  return elems;
};

// ----- init & layout ----- //

/**
 * lays out all items
 */
Outlayer.prototype.layout = function() {
  this._resetLayout();
  this._manageStamps();

  // don't animate first layout
  var isInstant = this.options.isLayoutInstant !== undefined ?
    this.options.isLayoutInstant : !this._isLayoutInited;
  this.layoutItems( this.items, isInstant );

  // flag for initalized
  this._isLayoutInited = true;
};

// _init is alias for layout
Outlayer.prototype._init = Outlayer.prototype.layout;

/**
 * logic before any new layout
 */
Outlayer.prototype._resetLayout = function() {
  this.getSize();
};


Outlayer.prototype.getSize = function() {
  this.size = getSize( this.element );
};

/**
 * get measurement from option, for columnWidth, rowHeight, gutter
 * if option is String -> get element from selector string, & get size of element
 * if option is Element -> get size of element
 * else use option as a number
 *
 * @param {String} measurement
 * @param {String} size - width or height
 * @private
 */
Outlayer.prototype._getMeasurement = function( measurement, size ) {
  var option = this.options[ measurement ];
  var elem;
  if ( !option ) {
    // default to 0
    this[ measurement ] = 0;
  } else {
    // use option as an element
    if ( typeof option === 'string' ) {
      elem = this.element.querySelector( option );
    } else if ( utils.isElement( option ) ) {
      elem = option;
    }
    // use size of element, if element
    this[ measurement ] = elem ? getSize( elem )[ size ] : option;
  }
};

/**
 * layout a collection of item elements
 * @api public
 */
Outlayer.prototype.layoutItems = function( items, isInstant ) {
  items = this._getItemsForLayout( items );

  this._layoutItems( items, isInstant );

  this._postLayout();
};

/**
 * get the items to be laid out
 * you may want to skip over some items
 * @param {Array} items
 * @returns {Array} items
 */
Outlayer.prototype._getItemsForLayout = function( items ) {
  var layoutItems = [];
  for ( var i=0, len = items.length; i < len; i++ ) {
    var item = items[i];
    if ( !item.isIgnored ) {
      layoutItems.push( item );
    }
  }
  return layoutItems;
};

/**
 * layout items
 * @param {Array} items
 * @param {Boolean} isInstant
 */
Outlayer.prototype._layoutItems = function( items, isInstant ) {
  this._emitCompleteOnItems( 'layout', items );

  if ( !items || !items.length ) {
    // no items, emit event with empty array
    return;
  }

  var queue = [];

  for ( var i=0, len = items.length; i < len; i++ ) {
    var item = items[i];
    // get x/y object from method
    var position = this._getItemLayoutPosition( item );
    // enqueue
    position.item = item;
    position.isInstant = isInstant || item.isLayoutInstant;
    queue.push( position );
  }

  this._processLayoutQueue( queue );
};

/**
 * get item layout position
 * @param {Outlayer.Item} item
 * @returns {Object} x and y position
 */
Outlayer.prototype._getItemLayoutPosition = function( /* item */ ) {
  return {
    x: 0,
    y: 0
  };
};

/**
 * iterate over array and position each item
 * Reason being - separating this logic prevents 'layout invalidation'
 * thx @paul_irish
 * @param {Array} queue
 */
Outlayer.prototype._processLayoutQueue = function( queue ) {
  for ( var i=0, len = queue.length; i < len; i++ ) {
    var obj = queue[i];
    this._positionItem( obj.item, obj.x, obj.y, obj.isInstant );
  }
};

/**
 * Sets position of item in DOM
 * @param {Outlayer.Item} item
 * @param {Number} x - horizontal position
 * @param {Number} y - vertical position
 * @param {Boolean} isInstant - disables transitions
 */
Outlayer.prototype._positionItem = function( item, x, y, isInstant ) {
  if ( isInstant ) {
    // if not transition, just set CSS
    item.goTo( x, y );
  } else {
    item.moveTo( x, y );
  }
};

/**
 * Any logic you want to do after each layout,
 * i.e. size the container
 */
Outlayer.prototype._postLayout = function() {
  this.resizeContainer();
};

Outlayer.prototype.resizeContainer = function() {
  if ( !this.options.isResizingContainer ) {
    return;
  }
  var size = this._getContainerSize();
  if ( size ) {
    this._setContainerMeasure( size.width, true );
    this._setContainerMeasure( size.height, false );
  }
};

/**
 * Sets width or height of container if returned
 * @returns {Object} size
 *   @param {Number} width
 *   @param {Number} height
 */
Outlayer.prototype._getContainerSize = noop;

/**
 * @param {Number} measure - size of width or height
 * @param {Boolean} isWidth
 */
Outlayer.prototype._setContainerMeasure = function( measure, isWidth ) {
  if ( measure === undefined ) {
    return;
  }

  var elemSize = this.size;
  // add padding and border width if border box
  if ( elemSize.isBorderBox ) {
    measure += isWidth ? elemSize.paddingLeft + elemSize.paddingRight +
      elemSize.borderLeftWidth + elemSize.borderRightWidth :
      elemSize.paddingBottom + elemSize.paddingTop +
      elemSize.borderTopWidth + elemSize.borderBottomWidth;
  }

  measure = Math.max( measure, 0 );
  this.element.style[ isWidth ? 'width' : 'height' ] = measure + 'px';
};

/**
 * emit eventComplete on a collection of items events
 * @param {String} eventName
 * @param {Array} items - Outlayer.Items
 */
Outlayer.prototype._emitCompleteOnItems = function( eventName, items ) {
  var _this = this;
  function onComplete() {
    _this.emitEvent( eventName + 'Complete', [ items ] );
  }

  var count = items.length;
  if ( !items || !count ) {
    onComplete();
    return;
  }

  var doneCount = 0;
  function tick() {
    doneCount++;
    if ( doneCount === count ) {
      onComplete();
    }
  }

  // bind callback
  for ( var i=0, len = items.length; i < len; i++ ) {
    var item = items[i];
    item.once( eventName, tick );
  }
};

// -------------------------- ignore & stamps -------------------------- //


/**
 * keep item in collection, but do not lay it out
 * ignored items do not get skipped in layout
 * @param {Element} elem
 */
Outlayer.prototype.ignore = function( elem ) {
  var item = this.getItem( elem );
  if ( item ) {
    item.isIgnored = true;
  }
};

/**
 * return item to layout collection
 * @param {Element} elem
 */
Outlayer.prototype.unignore = function( elem ) {
  var item = this.getItem( elem );
  if ( item ) {
    delete item.isIgnored;
  }
};

/**
 * adds elements to stamps
 * @param {NodeList, Array, Element, or String} elems
 */
Outlayer.prototype.stamp = function( elems ) {
  elems = this._find( elems );
  if ( !elems ) {
    return;
  }

  this.stamps = this.stamps.concat( elems );
  // ignore
  for ( var i=0, len = elems.length; i < len; i++ ) {
    var elem = elems[i];
    this.ignore( elem );
  }
};

/**
 * removes elements to stamps
 * @param {NodeList, Array, or Element} elems
 */
Outlayer.prototype.unstamp = function( elems ) {
  elems = this._find( elems );
  if ( !elems ){
    return;
  }

  for ( var i=0, len = elems.length; i < len; i++ ) {
    var elem = elems[i];
    // filter out removed stamp elements
    utils.removeFrom( this.stamps, elem );
    this.unignore( elem );
  }

};

/**
 * finds child elements
 * @param {NodeList, Array, Element, or String} elems
 * @returns {Array} elems
 */
Outlayer.prototype._find = function( elems ) {
  if ( !elems ) {
    return;
  }
  // if string, use argument as selector string
  if ( typeof elems === 'string' ) {
    elems = this.element.querySelectorAll( elems );
  }
  elems = utils.makeArray( elems );
  return elems;
};

Outlayer.prototype._manageStamps = function() {
  if ( !this.stamps || !this.stamps.length ) {
    return;
  }

  this._getBoundingRect();

  for ( var i=0, len = this.stamps.length; i < len; i++ ) {
    var stamp = this.stamps[i];
    this._manageStamp( stamp );
  }
};

// update boundingLeft / Top
Outlayer.prototype._getBoundingRect = function() {
  // get bounding rect for container element
  var boundingRect = this.element.getBoundingClientRect();
  var size = this.size;
  this._boundingRect = {
    left: boundingRect.left + size.paddingLeft + size.borderLeftWidth,
    top: boundingRect.top + size.paddingTop + size.borderTopWidth,
    right: boundingRect.right - ( size.paddingRight + size.borderRightWidth ),
    bottom: boundingRect.bottom - ( size.paddingBottom + size.borderBottomWidth )
  };
};

/**
 * @param {Element} stamp
**/
Outlayer.prototype._manageStamp = noop;

/**
 * get x/y position of element relative to container element
 * @param {Element} elem
 * @returns {Object} offset - has left, top, right, bottom
 */
Outlayer.prototype._getElementOffset = function( elem ) {
  var boundingRect = elem.getBoundingClientRect();
  var thisRect = this._boundingRect;
  var size = getSize( elem );
  var offset = {
    left: boundingRect.left - thisRect.left - size.marginLeft,
    top: boundingRect.top - thisRect.top - size.marginTop,
    right: thisRect.right - boundingRect.right - size.marginRight,
    bottom: thisRect.bottom - boundingRect.bottom - size.marginBottom
  };
  return offset;
};

// -------------------------- resize -------------------------- //

// enable event handlers for listeners
// i.e. resize -> onresize
Outlayer.prototype.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

/**
 * Bind layout to window resizing
 */
Outlayer.prototype.bindResize = function() {
  // bind just one listener
  if ( this.isResizeBound ) {
    return;
  }
  eventie.bind( window, 'resize', this );
  this.isResizeBound = true;
};

/**
 * Unbind layout to window resizing
 */
Outlayer.prototype.unbindResize = function() {
  if ( this.isResizeBound ) {
    eventie.unbind( window, 'resize', this );
  }
  this.isResizeBound = false;
};

// original debounce by John Hann
// http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/

// this fires every resize
Outlayer.prototype.onresize = function() {
  if ( this.resizeTimeout ) {
    clearTimeout( this.resizeTimeout );
  }

  var _this = this;
  function delayed() {
    _this.resize();
    delete _this.resizeTimeout;
  }

  this.resizeTimeout = setTimeout( delayed, 100 );
};

// debounced, layout on resize
Outlayer.prototype.resize = function() {
  // don't trigger if size did not change
  // or if resize was unbound. See #9
  if ( !this.isResizeBound || !this.needsResizeLayout() ) {
    return;
  }

  this.layout();
};

/**
 * check if layout is needed post layout
 * @returns Boolean
 */
Outlayer.prototype.needsResizeLayout = function() {
  var size = getSize( this.element );
  // check that this.size and size are there
  // IE8 triggers resize on body size change, so they might not be
  var hasSizes = this.size && size;
  return hasSizes && size.innerWidth !== this.size.innerWidth;
};

// -------------------------- methods -------------------------- //

/**
 * add items to Outlayer instance
 * @param {Array or NodeList or Element} elems
 * @returns {Array} items - Outlayer.Items
**/
Outlayer.prototype.addItems = function( elems ) {
  var items = this._itemize( elems );
  // add items to collection
  if ( items.length ) {
    this.items = this.items.concat( items );
  }
  return items;
};

/**
 * Layout newly-appended item elements
 * @param {Array or NodeList or Element} elems
 */
Outlayer.prototype.appended = function( elems ) {
  var items = this.addItems( elems );
  if ( !items.length ) {
    return;
  }
  // layout and reveal just the new items
  this.layoutItems( items, true );
  this.reveal( items );
};

/**
 * Layout prepended elements
 * @param {Array or NodeList or Element} elems
 */
Outlayer.prototype.prepended = function( elems ) {
  var items = this._itemize( elems );
  if ( !items.length ) {
    return;
  }
  // add items to beginning of collection
  var previousItems = this.items.slice(0);
  this.items = items.concat( previousItems );
  // start new layout
  this._resetLayout();
  this._manageStamps();
  // layout new stuff without transition
  this.layoutItems( items, true );
  this.reveal( items );
  // layout previous items
  this.layoutItems( previousItems );
};

/**
 * reveal a collection of items
 * @param {Array of Outlayer.Items} items
 */
Outlayer.prototype.reveal = function( items ) {
  this._emitCompleteOnItems( 'reveal', items );

  var len = items && items.length;
  for ( var i=0; len && i < len; i++ ) {
    var item = items[i];
    item.reveal();
  }
};

/**
 * hide a collection of items
 * @param {Array of Outlayer.Items} items
 */
Outlayer.prototype.hide = function( items ) {
  this._emitCompleteOnItems( 'hide', items );

  var len = items && items.length;
  for ( var i=0; len && i < len; i++ ) {
    var item = items[i];
    item.hide();
  }
};

/**
 * reveal item elements
 * @param {Array}, {Element}, {NodeList} items
 */
Outlayer.prototype.revealItemElements = function( elems ) {
  var items = this.getItems( elems );
  this.reveal( items );
};

/**
 * hide item elements
 * @param {Array}, {Element}, {NodeList} items
 */
Outlayer.prototype.hideItemElements = function( elems ) {
  var items = this.getItems( elems );
  this.hide( items );
};

/**
 * get Outlayer.Item, given an Element
 * @param {Element} elem
 * @param {Function} callback
 * @returns {Outlayer.Item} item
 */
Outlayer.prototype.getItem = function( elem ) {
  // loop through items to get the one that matches
  for ( var i=0, len = this.items.length; i < len; i++ ) {
    var item = this.items[i];
    if ( item.element === elem ) {
      // return item
      return item;
    }
  }
};

/**
 * get collection of Outlayer.Items, given Elements
 * @param {Array} elems
 * @returns {Array} items - Outlayer.Items
 */
Outlayer.prototype.getItems = function( elems ) {
  elems = utils.makeArray( elems );
  var items = [];
  for ( var i=0, len = elems.length; i < len; i++ ) {
    var elem = elems[i];
    var item = this.getItem( elem );
    if ( item ) {
      items.push( item );
    }
  }

  return items;
};

/**
 * remove element(s) from instance and DOM
 * @param {Array or NodeList or Element} elems
 */
Outlayer.prototype.remove = function( elems ) {
  var removeItems = this.getItems( elems );

  this._emitCompleteOnItems( 'remove', removeItems );

  // bail if no items to remove
  if ( !removeItems || !removeItems.length ) {
    return;
  }

  for ( var i=0, len = removeItems.length; i < len; i++ ) {
    var item = removeItems[i];
    item.remove();
    // remove item from collection
    utils.removeFrom( this.items, item );
  }
};

// ----- destroy ----- //

// remove and disable Outlayer instance
Outlayer.prototype.destroy = function() {
  // clean up dynamic styles
  var style = this.element.style;
  style.height = '';
  style.position = '';
  style.width = '';
  // destroy items
  for ( var i=0, len = this.items.length; i < len; i++ ) {
    var item = this.items[i];
    item.destroy();
  }

  this.unbindResize();

  var id = this.element.outlayerGUID;
  delete instances[ id ]; // remove reference to instance by id
  delete this.element.outlayerGUID;
  // remove data for jQuery
  if ( jQuery ) {
    jQuery.removeData( this.element, this.constructor.namespace );
  }

};

// -------------------------- data -------------------------- //

/**
 * get Outlayer instance from element
 * @param {Element} elem
 * @returns {Outlayer}
 */
Outlayer.data = function( elem ) {
  elem = utils.getQueryElement( elem );
  var id = elem && elem.outlayerGUID;
  return id && instances[ id ];
};


// -------------------------- create Outlayer class -------------------------- //

/**
 * create a layout class
 * @param {String} namespace
 */
Outlayer.create = function( namespace, options ) {
  // sub-class Outlayer
  function Layout() {
    Outlayer.apply( this, arguments );
  }
  // inherit Outlayer prototype, use Object.create if there
  if ( Object.create ) {
    Layout.prototype = Object.create( Outlayer.prototype );
  } else {
    utils.extend( Layout.prototype, Outlayer.prototype );
  }
  // set contructor, used for namespace and Item
  Layout.prototype.constructor = Layout;

  Layout.defaults = utils.extend( {}, Outlayer.defaults );
  // apply new options
  utils.extend( Layout.defaults, options );
  // keep prototype.settings for backwards compatibility (Packery v1.2.0)
  Layout.prototype.settings = {};

  Layout.namespace = namespace;

  Layout.data = Outlayer.data;

  // sub-class Item
  Layout.Item = function LayoutItem() {
    Item.apply( this, arguments );
  };

  Layout.Item.prototype = new Item();

  // -------------------------- declarative -------------------------- //

  utils.htmlInit( Layout, namespace );

  // -------------------------- jQuery bridge -------------------------- //

  // make into jQuery plugin
  if ( jQuery && jQuery.bridget ) {
    jQuery.bridget( namespace, Layout );
  }

  return Layout;
};

// ----- fin ----- //

// back in global
Outlayer.Item = Item;

return Outlayer;

}));


},{"./item":31,"eventie":33,"fizzy-ui-utils":28,"get-size":29,"wolfy87-eventemitter":34}],36:[function(require,module,exports){
module.exports = require('./lib/');

},{"./lib/":37}],37:[function(require,module,exports){
// Load modules

var Stringify = require('./stringify');
var Parse = require('./parse');


// Declare internals

var internals = {};


module.exports = {
    stringify: Stringify,
    parse: Parse
};

},{"./parse":38,"./stringify":39}],38:[function(require,module,exports){
// Load modules

var Utils = require('./utils');


// Declare internals

var internals = {
    delimiter: '&',
    depth: 5,
    arrayLimit: 20,
    parameterLimit: 1000
};


internals.parseValues = function (str, options) {

    var obj = {};
    var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);

    for (var i = 0, il = parts.length; i < il; ++i) {
        var part = parts[i];
        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;

        if (pos === -1) {
            obj[Utils.decode(part)] = '';
        }
        else {
            var key = Utils.decode(part.slice(0, pos));
            var val = Utils.decode(part.slice(pos + 1));

            if (!obj.hasOwnProperty(key)) {
                obj[key] = val;
            }
            else {
                obj[key] = [].concat(obj[key]).concat(val);
            }
        }
    }

    return obj;
};


internals.parseObject = function (chain, val, options) {

    if (!chain.length) {
        return val;
    }

    var root = chain.shift();

    var obj = {};
    if (root === '[]') {
        obj = [];
        obj = obj.concat(internals.parseObject(chain, val, options));
    }
    else {
        var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;
        var index = parseInt(cleanRoot, 10);
        var indexString = '' + index;
        if (!isNaN(index) &&
            root !== cleanRoot &&
            indexString === cleanRoot &&
            index >= 0 &&
            index <= options.arrayLimit) {

            obj = [];
            obj[index] = internals.parseObject(chain, val, options);
        }
        else {
            obj[cleanRoot] = internals.parseObject(chain, val, options);
        }
    }

    return obj;
};


internals.parseKeys = function (key, val, options) {

    if (!key) {
        return;
    }

    // The regex chunks

    var parent = /^([^\[\]]*)/;
    var child = /(\[[^\[\]]*\])/g;

    // Get the parent

    var segment = parent.exec(key);

    // Don't allow them to overwrite object prototype properties

    if (Object.prototype.hasOwnProperty(segment[1])) {
        return;
    }

    // Stash the parent if it exists

    var keys = [];
    if (segment[1]) {
        keys.push(segment[1]);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while ((segment = child.exec(key)) !== null && i < options.depth) {

        ++i;
        if (!Object.prototype.hasOwnProperty(segment[1].replace(/\[|\]/g, ''))) {
            keys.push(segment[1]);
        }
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return internals.parseObject(keys, val, options);
};


module.exports = function (str, options) {

    if (str === '' ||
        str === null ||
        typeof str === 'undefined') {

        return {};
    }

    options = options || {};
    options.delimiter = typeof options.delimiter === 'string' || Utils.isRegExp(options.delimiter) ? options.delimiter : internals.delimiter;
    options.depth = typeof options.depth === 'number' ? options.depth : internals.depth;
    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : internals.arrayLimit;
    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : internals.parameterLimit;

    var tempObj = typeof str === 'string' ? internals.parseValues(str, options) : str;
    var obj = {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0, il = keys.length; i < il; ++i) {
        var key = keys[i];
        var newObj = internals.parseKeys(key, tempObj[key], options);
        obj = Utils.merge(obj, newObj);
    }

    return Utils.compact(obj);
};

},{"./utils":40}],39:[function(require,module,exports){
// Load modules

var Utils = require('./utils');


// Declare internals

var internals = {
    delimiter: '&',
    indices: true
};


internals.stringify = function (obj, prefix, options) {

    if (Utils.isBuffer(obj)) {
        obj = obj.toString();
    }
    else if (obj instanceof Date) {
        obj = obj.toISOString();
    }
    else if (obj === null) {
        obj = '';
    }

    if (typeof obj === 'string' ||
        typeof obj === 'number' ||
        typeof obj === 'boolean') {

        return [encodeURIComponent(prefix) + '=' + encodeURIComponent(obj)];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys = Object.keys(obj);
    for (var i = 0, il = objKeys.length; i < il; ++i) {
        var key = objKeys[i];
        if (!options.indices &&
            Array.isArray(obj)) {

            values = values.concat(internals.stringify(obj[key], prefix, options));
        }
        else {
            values = values.concat(internals.stringify(obj[key], prefix + '[' + key + ']', options));
        }
    }

    return values;
};


module.exports = function (obj, options) {

    options = options || {};
    var delimiter = typeof options.delimiter === 'undefined' ? internals.delimiter : options.delimiter;
    options.indices = typeof options.indices === 'boolean' ? options.indices : internals.indices;

    var keys = [];

    if (typeof obj !== 'object' ||
        obj === null) {

        return '';
    }

    var objKeys = Object.keys(obj);
    for (var i = 0, il = objKeys.length; i < il; ++i) {
        var key = objKeys[i];
        keys = keys.concat(internals.stringify(obj[key], key, options));
    }

    return keys.join(delimiter);
};

},{"./utils":40}],40:[function(require,module,exports){
// Load modules


// Declare internals

var internals = {};


exports.arrayToObject = function (source) {

    var obj = {};
    for (var i = 0, il = source.length; i < il; ++i) {
        if (typeof source[i] !== 'undefined') {

            obj[i] = source[i];
        }
    }

    return obj;
};


exports.merge = function (target, source) {

    if (!source) {
        return target;
    }

    if (typeof source !== 'object') {
        if (Array.isArray(target)) {
            target.push(source);
        }
        else {
            target[source] = true;
        }

        return target;
    }

    if (typeof target !== 'object') {
        target = [target].concat(source);
        return target;
    }

    if (Array.isArray(target) &&
        !Array.isArray(source)) {

        target = exports.arrayToObject(target);
    }

    var keys = Object.keys(source);
    for (var k = 0, kl = keys.length; k < kl; ++k) {
        var key = keys[k];
        var value = source[key];

        if (!target[key]) {
            target[key] = value;
        }
        else {
            target[key] = exports.merge(target[key], value);
        }
    }

    return target;
};


exports.decode = function (str) {

    try {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    } catch (e) {
        return str;
    }
};


exports.compact = function (obj, refs) {

    if (typeof obj !== 'object' ||
        obj === null) {

        return obj;
    }

    refs = refs || [];
    var lookup = refs.indexOf(obj);
    if (lookup !== -1) {
        return refs[lookup];
    }

    refs.push(obj);

    if (Array.isArray(obj)) {
        var compacted = [];

        for (var i = 0, il = obj.length; i < il; ++i) {
            if (typeof obj[i] !== 'undefined') {
                compacted.push(obj[i]);
            }
        }

        return compacted;
    }

    var keys = Object.keys(obj);
    for (i = 0, il = keys.length; i < il; ++i) {
        var key = keys[i];
        obj[key] = exports.compact(obj[key], refs);
    }

    return obj;
};


exports.isRegExp = function (obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};


exports.isBuffer = function (obj) {

    if (obj === null ||
        typeof obj === 'undefined') {

        return false;
    }

    return !!(obj.constructor &&
        obj.constructor.isBuffer &&
        obj.constructor.isBuffer(obj));
};

},{}],41:[function(require,module,exports){
exports.setOnReady = setOnReady;

var UID = 0, LANG = 1, MODE = 2,

cn = require(  '../../js/lib/common/common.mod.js' ),

wLib = require(  '../lib/widgetLib' ),

debug = require( 'debug' ),

domLib = require( './dom' ),

config = require( './config' ),

dateLabels = require( './dateLabels' ),

onReady;

if ( ['tpl', 'dev'].indexOf( window.env ) !== -1 ) {

  debug.enable( '*' );

}

var widget = function( elem, options ) {

  var log,

  enabled = false,

  activeFilters = {},

  dom = domLib( elem ),

  lang = 'fr',

  categories = {},

  tags = {},

  organizations = {},

  controller;

  return ( function() {

    var uid = options.anchorConfig[ UID ],

    lang = options.anchorConfig[ LANG ],

    log = debug( 'activeFilters widget ' + uid );

    dateLabels.setLang( lang );

    if ( options.anchorConfig[ MODE ] ) {

      dom.setMode( options.anchorConfig[ MODE ] );

    }

    dom.setOnRemove( _onFilterRemove );

    log( 'initing' );

    controller = options.register( wLib.interface( 'activeFilters', uid, {
      enable : enable,
      disable : disable
    } ));

    controller.getControlData( function( data ) {

      _indexLabels( data );

      log( 'init complete, enable to render' );

      if ( onReady ) onReady();

    });

  } )();

  function disable() {

    enabled = false;

    _render();

  }

  function enable( reqParams ) {

    var newFilters = [], reqTags, tagLabels;

    enabled = true;

    if ( reqParams.neLat ) {

      newFilters.push({
        label: _label( 'map' ),
        keys: [ 'neLat', 'neLng', 'swLat', 'swLng' ]
      });

    }

    if ( reqParams.from ) {

      if ( reqParams.to && ( reqParams.to !== reqParams.from )) {

        newFilters.push({
          label: dateLabels( reqParams.from, reqParams.to ),
          keys: [ 'from', 'to' ]
        });

      } else {

        newFilters.push({
          label: dateLabels( reqParams.from ),
          keys: [ 'from', 'to' ]
        });

      }

    }

    if ( reqParams.what ) {

      newFilters.push({
        label: reqParams.what,
        keys: [ 'what' ]
      });

    }

    if ( reqParams.category ) {

      newFilters.push({
        label: categories[ reqParams.category ],
        keys: [ 'category' ]
      });

    }

    if ( reqParams.tags ) {

      reqTags = ( typeof reqParams.tags == 'string' ) ? [ reqParams.tags ] : reqParams.tags;

      tagLabels = [];

      cn.forEach( reqTags, function( tag ) {

        tagLabels.push( tags[ tag ] );

      });

      newFilters.push({
        label: tagLabels.join( ', ' ),
        keys: [ 'tags' ]
      });

    }

    if ( reqParams.location ) {

      newFilters.push({
        label: config.labels[ lang ].location,
        keys: [ 'location' ]
      });

    }

    if ( reqParams.org ) {

      newFilters.push({
        label: organizations[ reqParams.org ],
        keys: [ 'org' ]
      });

    }

    if ( reqParams.passed ) {

      newFilters.push({
        label: config.labels[ lang ].passed,
        keys: [ 'passed' ]
      });

    }

    activeFilters = newFilters;

    _render();

  }

  function _render() {

    dom.render({ filters: activeFilters, enabled: enabled });

  }

  function _label( type, values ) {

    if ( typeof values == 'undefined' ) values = {};

    return _format( config.labels[ lang ][ type ], values );

  }

  function _format(tpl, ctx) {

    return tpl.replace(/\{\{([a-zA-Z ]*)\}\}/g, function(m, g) {
        return ctx[g.trim()] || '';
    });

  }

  function _indexLabels( data ) {

    cn.forEach( data.ct, function( c ) {

      categories[ c.s ] = c.c;

    } );

    cn.forEach( data.t, function( t ) {

      tags[ t.s ] = t.t;

    } );

    if ( data.org ) {

      cn.forEach( data.org, function( o ) {

        organizations[ o.s ] = o.l;

      } );

    }

  }

  function _onFilterRemove( filter ) {

    var keysToRemove = {};

    if ( !enabled ) {

      log( 'remove filter ignored, widget not enabled' );

      return;

    }

    cn.forEach( filter.keys, function( key ) {

      keysToRemove[ key ] = null;

    } );

    controller.update( 'activeFilters', keysToRemove );

  }

}

function setOnReady( cb ) {

  onReady = cb;

}

require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgft', { register: register }, widget );

} );

},{"../../js/lib/common/common.mod.js":8,"../lib/controllerLoader":54,"../lib/widgetLib":59,"./config":44,"./dateLabels":46,"./dom":47,"debug":17}],42:[function(require,module,exports){
module.exports = "<li class=\"active\"><a href=\"#\"><%= label %></a></li>";

},{}],43:[function(require,module,exports){
module.exports = "<ul class=\"nav nav-pills\"></ul>";

},{}],44:[function(require,module,exports){
module.exports = {
  labels: {
    fr: {
      dateRange: 'du {{from}} au {{to}}',
      map: 'carte',
      passed: 'événements passés',
      location: 'lieu'
    },
    en: {
      dateRange: 'from {{from}} to {{to}}',
      map: 'map',
      passed: 'past events',
      location: 'place'
    },
    es: {
      dateRange: 'desde {{from}} hasta {{to}}',
      map: 'mapa',
      passed: 'pasado',
      location: 'lugar'
    },
    it: {
      dateRange: 'dal {{from}} al {{to}}',
      map: 'carta',
      passed: 'passato',
      location: 'luogo'
    },
    de: {
      dateRange: 'von {{from}} bis {{to}}',
      map: 'karte',
      passed: 'vergangenheit',
      location: 'platz'
    }
  }
}

},{}],45:[function(require,module,exports){
module.exports={
  "from %start% to %end%" : "du %start% au %end%",
  "january" : "janvier",
  "february" : "février",
  "march" : "mars",
  "april" : "avril",
  "may" : "mai",
  "june" : "juin",
  "july" : "juillet",
  "august" : "août",
  "september" : "septembre",
  "october" : "octobre",
  "november" : "novembre",
  "december" : "décembre",
  "monday" : "lundi",
  "tuesday" : "mardi",
  "wednesday" : "mercredi",
  "thursday" : "jeudi",
  "friday" : "vendredi",
  "saturday" : "samedi",
  "sunday" : "dimanche"
}
},{}],46:[function(require,module,exports){
"use strict";

var labels = {
  fr: require( './dateLabels.fr.json' ),
},

lang = 'en',

months = [ 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december' ];

module.exports = renderLabel;

module.exports.setLang = setLang;

function renderLabel() {

  if ( arguments.length == 2 ) {

    return renderRange( arguments[ 0 ], arguments[ 1 ] );

  } else {

    return renderDate( arguments[ 0 ] );

  }

}

function renderRange( s, e ) {

  var label = 'from %start% to %end%';

  if ( lang !== 'en' ) label = labels[ lang ][ label ];

  return label.replace( '%start%', renderDate( s ) ).replace( '%end%', renderDate( e ) ); 

}

function renderDate( d ) {

  var date = new Date( d ),

  now = new Date(),

  displayYear = date.getFullYear() !== now.getFullYear(),

  month = months[ date.getMonth() ];

  if ( lang !== 'en' ) month = labels[ lang ][ month ];

  return date.getDate() + ' ' + month + ( displayYear ? ' ' + date.getFullYear() : '' );

}


function setLang( l ) {

  lang = l;

}

},{"./dateLabels.fr.json":45}],47:[function(require,module,exports){
var ejs = require( '../../js/lib/clientEjs/ejs.secured' ),

cn = require( '../../js/lib/common/common.mod.js' ),

log = require( 'debug' )( 'activeFilter dom' ),

params = {
  selectors: {
    itemsCanvas: 'ul'
  }
},

templates = {
  main : require( './main.ejs' ),
  bsMain : require( './bsMain.ejs' ),
  item : require( './item.ejs' ),
  bsItem: require( './bsItem.ejs' )
},

mainTemplate = templates.main,

itemTemplate = templates.item;

module.exports = function( anchorElem ) {

  var onRemove; // callback

  return {
    render: render,
    setOnRemove: setOnRemove, // set callback to call when remove request is set
    setMode: setMode
  };

  function render( data ) {

    var wrapper = document.createElement( 'div' ), 

    itemsCanvas;

    _clear();

    if ( !data.filters || !data.filters.length ) {

      return;

    }

    wrapper.innerHTML = ejs.render( mainTemplate, data );

    itemsCanvas = cn.el( wrapper, params.selectors.itemsCanvas );

    cn.forEach( data.filters, function( filter ) {

      itemsCanvas.appendChild( _createFilterItem( filter ) );

    } );

    anchorElem.appendChild( cn.childObject( wrapper, 0 ) );

  }

  
  function setOnRemove( cb ) {

    onRemove = cb;

  }


  function setMode( mode ) {

    if ( mode == 'bs' ) {

      mainTemplate = templates.bsMain;

      itemTemplate = templates.bsItem;

    }

  }


  function _createFilterItem( filter ) {

    var itemWrapper = document.createElement( 'ul' ),

    filterElem;

    itemWrapper.innerHTML = ejs.render( itemTemplate, filter );

    filterElem = cn.el( itemWrapper, 'li' );

    cn.addEvent( cn.el( filterElem, 'a' ), 'click', function( e ) {

      log( 'click' );

      cn.preventDefault( e );

      onRemove( filter ); // handle this in widget

    });

    return filterElem;

  }


  function _clear() {

    var child;

    while( child = cn.childObject( anchorElem, 0) ) {

      anchorElem.removeChild( child );

    }

  }

}

},{"../../js/lib/clientEjs/ejs.secured":7,"../../js/lib/common/common.mod.js":8,"./bsItem.ejs":42,"./bsMain.ejs":43,"./item.ejs":48,"./main.ejs":49,"debug":17}],48:[function(require,module,exports){
module.exports = "<li><span><%= label %></span><a>&#10005</a></li>";

},{}],49:[function(require,module,exports){
module.exports = "<% if ( filters.length ) { %>\n<ul class=\"active-filters\" <% if ( !enabled ) { %>class=\"disabled\"<% } %>></ul>\n<% } %>";

},{}],50:[function(require,module,exports){
"use strict";

var debug = require( 'debug' ),

cn = require( '../../js/lib/common/common.mod.js' ),

remote = require( '../../js/lib/remote/remote.mod.js' ),

filters = require( './filters' ),

geoLib = require( './geolocate' ),

controlDataFetch = require( '../../js/lib/controlDataFetch/controlDataFetch' ),

qs = require( 'qs' ),

env = window.env ? window.env : 'prod',

defaults = {
  all: {
    search : '//openagenda.com/widgets/{uid}/search'
  },
  dev: {
    search : '//d.openagenda.com/widgets/{uid}/search'
  },
  test: {
    search : '//d.openagenda.com/widgets/{uid}/search'
  },
  tpl: {
    search : '//d.openagenda.com/widgets/{uid}/search'
  }
},

params = cn.extend( defaults.all, defaults[ env ] ? defaults[ env ] : {} );

module.exports = function( uid ) {

  var log = debug( 'controller ' + uid ),

  ctl = false,   // full agenda data in js form

  ready = false, // is server connection established

  widgets = [], // collection of interfaces to widgets handled by controller

  sendRequest = false,  // callback given by link widget to notify of request params updates

  ctlRequests = [], // stack of callbacks to call when control data is available

  currentRequestParams = {}, // current agenda request parameters

  whatUids = false, what, scope,

  enabled = false,

  embedMode = ( ( uid + '' ).indexOf('/') !== -1 ), // embedMode is true if widget is for agenda embed

  proxy = false,

  syncHref = false,

  passedAutoLoad = true;

  return (function() {

    log( 'controller loaded in %s environment', env );

    log( 'controller is configured in %s mode', embedMode ? 'embed' : 'agenda' );

    controlDataFetch( {
      jsonp: !_isAjax(),
      uid: uid.split( '/' )[ 0 ],
      embedUid: embedMode ? uid.split( '/' )[ 1 ] : false
    }, function( err, data ) {

      if ( err || !data ) {

        log( 'problem while fetching data %s', err );

        if ( !data ) {

          log( 'not data could be retrieved' );

        }

        return;

      }

      log( 'successfully fetched control data' );

      ctl = _initControlData( data );

      syncHref = !!ctl.sh;

      if ( typeof _readHrefQuery().geolocate !== 'undefined' ) {

        geoLib( ctl, _readHrefQuery( 'geolocate' ), function( err, cornerParams ) {

          if ( err ) {

            _init();

          } else {

            _init( cornerParams );

          }

        } );

      } else {

        _init();

      }
      
    });

    return {
      register: register,
      getWidget: getWidget,
      requestModal: requestModal,
      releaseModal: releaseModal,
      update : update,
      sweep : sweep,
      getControlData: getControlData,
      getCurrentQuery: getCurrentQuery,
      isDifferent: isDifferent,
      setProxy: setProxy,
      disableSyncHref: disableSyncHref,
      disablePassedAutoLoad: disablePassedAutoLoad
    }

  })();


  function _init( initParams ) {

    _initCurrentRequestParams( initParams );

    _processWidgetCtlRequests( false );

    ready = true;

    // hack to allow some widgets to run getControlData callback once all
    // is declared ready, 
    _processWidgetCtlRequests( true );

    log( 'controller will sync with href ? %s', syncHref ? 'yes' : 'no' );

    if ( syncHref ) {

      _forEachWidget( 'change', currentRequestParams );

      cn.addEvent( window, 'popstate', _handlePop );

    }

    _fetchWhatUids( function() {

      sweep();

    });

  }

  function _handlePop() {

    if ( !syncHref ) return;

    update( _readHrefQuery( 'search' ) );

  }


  /**
   * register a widget - run by widget to establish link with controller
   */

  function register( options ) {

    var widgetParams = cn.extend( {
      name : false  // required. name of the widget
    }, options );

    log( 'registering widget %s', widgetParams.name );

    widgets.push( widgetParams );

    return {
      update: update,
      getControlData: getControlData,
      requestModal: requestModal,
      releaseModal: releaseModal,
      getCurrentQuery: getCurrentQuery,
      isDifferent: isDifferent
    };

  }


  function getWidget( name ) {

    var widgetParams = false;

    cn.forEach( widgets, function( widget ) {

      if ( widget.name == name ) {

        widgetParams = widget;

      }

    });

    return widgetParams;

  }


  /**
   * hand over control data when ready.
   */
  
  function getControlData( postReady, cb ) {

    if ( !cb ) {

      cb = postReady;

      postReady = false;

    }

    if ( ctl ) {

      log( 'control data available, handing over' );

      cb( ctl );

    } else {

      log( 'control data not yet available, stacking request' );

      ctlRequests.push( [ postReady, cb ] );

    }

  }


  function getCurrentQuery() {

    return cn.extend( {}, currentRequestParams );

  }


  function setProxy( p ) {

    proxy = p;

  }

  function disableSyncHref() {

    syncHref = false;

  }

  function disablePassedAutoLoad() {

    passedAutoLoad = false;

  }


  /**
   * controller
   * 
   * called by widget when some agenda request parameters were updated
   */
  
  function update( originWidget, updatedParams ) {

    if ( arguments.length == 1 ) {

      updatedParams = originWidget;

      originWidget = {};

    }

    log( 'updating with %s', JSON.stringify( updatedParams ) );

    var newParams = cn.extend( {}, currentRequestParams, { 
      uid: null
    }, updatedParams );

    if ( !isDifferent( newParams ) ) return;

    currentRequestParams = _clean( newParams );

    if ( !ready ) {

      log( 'control data not yet received' );

      return;

    }

    if ( proxy && proxy.update ) proxy.update( updatedParams );

    if ( syncHref ) {

      _updateHrefQuery( currentRequestParams );

    }

    _forEachWidget( 'change', currentRequestParams, originWidget );

    _forEachWidget( 'disable', originWidget );

    _fetchWhatUids( function() {

      sweep();

    });

  }


  function _fetchWhatUids( cb ) {

    if ( what === currentRequestParams.what 

    && scope === currentRequestParams.scope ) return cb();

    whatUids = false;

    what = currentRequestParams.what;

    scope = currentRequestParams.scope;

    if ( !what ) return cb();

    remote.getJsonp( params.search.replace( '{uid}', uid ), { 
      data: { search: { what: what, scope: scope } }, 
      timeout: 10000 
    }, function( responseType, data ) {

      if ( responseType == 'success' ) {

        whatUids = data;

      }

      cb();

    } );

  }


  /**
   * disable all widgets except caller
   */
  
  function requestModal( name, cb ) {

    _forEachWidget( 'disable', name );

    enabled = false;

    if ( cb ) cb();

  }


  /**
   * re-enables all widgets
   */
  
  function releaseModal() {

    _forEachWidget( 'enable' );

    enabled = true;

  }


  function _initCurrentRequestParams( overridingParams ) {

    var today = new Date();

    if ( typeof overridingParams !== 'undefined' ) {

      currentRequestParams = overridingParams;

      if ( syncHref ) _updateHrefQuery( currentRequestParams );

      return;

    }


    if ( syncHref ) {

      currentRequestParams = _cleanSearch( _readHrefQuery( 'search' ) );

    }

    if ( ctl.lo ) {

      // bit of a transitional hack (2015-03-06) - remove ctl.p in other widgets before anything here
      ctl.p = today > new Date( ctl.lo.end );

    }

    if ( ctl.p && passedAutoLoad && typeof currentRequestParams.passed == 'undefined' ) {

      currentRequestParams.passed = 1;

      if ( syncHref ) _updateHrefQuery( currentRequestParams );

    }

  }



  function _hasControlData() {

    return !!ctl;

  }


  /**
   * run method of each widget at the optional exception of...
   */
  
  function _forEachWidget( methodName, methodParams, except ) {

    if ( ( arguments.length == 2 ) && ( typeof methodParams == 'string' ) ) {

      except = methodParams;

      methodParams = {}

    } else if ( arguments.length == 2 ) {

      except = false;

    } else if ( arguments.length == 1 ) {

      methodParams = {};

      except = false;

    }

    log( 'running %s for all widgets with %s except for %s', methodName, JSON.stringify( methodParams ), except ? except : 'no one' );

    for ( var i = widgets.length - 1; i >= 0; i-- ) {

      if ( widgets[i].name !== except ) {

        if ( widgets[i][ methodName ] ) {

          widgets[i][ methodName ]( methodParams );

        } else {

          log( '%s not set for widget "%s"', methodName, widgets[i].name );

        }

      }
    
    }

  }


  function _processWidgetCtlRequests( postReady ) {

    var toProcess = ctlRequests.length;

    var stackedCallback, restacked = [];

    // send control data to whoever requested it during registration process
    while ( stackedCallback = ctlRequests.pop() ) {

      if ( stackedCallback[ 0 ] === postReady ) {

        stackedCallback[ 1 ]( ctl );

      } else {

        restacked.push( stackedCallback );

      }

    }

    ctlRequests = restacked;

  }


  function _initControlData( data ) {

    // distribute location data throughout events

    var locations = {},

    today = _stringifyDate();

    cn.forEach( data.l, function( l ) {

      locations[ l.u ] = { lt: l.lt, lg: l.lg };

    });

    data.geolocate = typeof _readHrefQuery().geolocate !== 'undefined';

    cn.forEach( data.ev, function( e ) {

      if ( e.l ) {

        if ( typeof locations[ e.l ] !== 'undefined' ) {

          e.lt = locations[ e.l ].lt;

          e.lg = locations[ e.l ].lg;

        } else {

          console.log( 'invalid location for event' );
          console.log( e );

        }

      }


      // append is passed info

      e.p = true;
      
      for (var i = e.d.length - 1; i >= 0; i--) {

        if ( e.d[ i ] >= today ) {

          e.p = false;

          break;

        }

      };

    });

    locations = undefined;

    return data;

  }


  function _isAjax() {

    if ( embedMode && ( window.env !== 'tpl' ) ) {

      return false;

    }

    return true;

  }


  /**
   * uses the control data ( agenda js data ) to determine which
   * events are included and which are not
   */
  
  function sweep() {

    var includedCount = 0;

    if ( typeof currentRequestParams == 'undefined' ) currentRequestParams = {};

    if ( !ready ) {

      log( 'controller not ready, sweep aborted' );

      return;

    }

    log( 'doing sweep with params %s', JSON.stringify( currentRequestParams ) );

    // clear all the widgets!
    _forEachWidget( 'clear' );

    // go through each event, determine if should be included
    // .. in which case include in widgets
    for ( var i in ctl.ev ) {

      if ( _applyFilters( ctl.ev[i], currentRequestParams ) ) {

        includedCount++;

        ctl.ev[i].passed = _isPassed( ctl.ev[i] );

        _include( ctl.ev[i], currentRequestParams );

      }
    
    }

    log( 'sweep result %d out of %d', includedCount, cn.size( ctl.a ) );

    // enable all the widgets!
    _forEachWidget( 'enable', currentRequestParams );

  }


  /**
   * have there been any changes in parameters?
   */
  
  function isDifferent( data ) {

    for ( var i in currentRequestParams ) {

      if ( typeof data[i] == 'undefined' || data[i] !== currentRequestParams[i] ) return true;

    }

    for ( i in data ) {

      if ( typeof currentRequestParams[i] == 'undefined' ) return true;

      if ( data[i] !== currentRequestParams[i] ) return true;

    }

    return false;

  }


  /**
   * as part of sweep, tell widgets event item passed through filters
   */
  
  function _include( item, p ) {

    for ( var i = widgets.length - 1; i >= 0; i-- ) {

      if ( widgets[ i ].include ) {

        widgets[i].include( item, p );  

      }

    }

  }

  
  function _applyFilters( item, reqParams ) {

    for ( var i in filters ) {

      if ( !filters[i]( item, reqParams, whatUids ) ) return false;

    }

    return true;

  }


  function _clean( data ) {

    var cleanData = {};

    for ( var k in data ) {

      if ( data[ k ] !== null ) {

        cleanData[ k ] = data[ k ];

      }

    }

    return cleanData;

  }


  function _isPassed( eItem ) {

    var today = _stringifyDate( new Date() );

    for ( var i = eItem.d.length - 1; i >= 0; i-- ) {
      
      if ( eItem.d[ i ] >= today ) return false;

    };

    return true;

  }

  function _updateHrefQuery( updatedQuery ) {

    log( 'attempting to update href query' );

    var href = window.location.href, dashPart = false, query = false, queryPart;

    if ( href.split( '#' ).length > 1 ) {

      dashPart = href.split( '#' )[ 0 ];

    }

    href = href.split( '?' )[ 0 ];

    if ( ( typeof window.history == 'undefined' ) || ( typeof window.history.pushState == 'undefined' ) ) {

      log( 'window.history is not available' );

    } else {

      query = _readHrefQuery();
      
      if ( cn.size( updatedQuery ) ) {

        query.search = updatedQuery;

      } else {

        delete query.search;

      }

      if ( cn.size( query ) ) {

        href = href + '?' + qs.stringify( query );

      }

      if ( dashPart ) {

        href = href + '#' + dashPart;

      }

      if ( ( typeof window.history !== 'undefined' ) && ( typeof window.history.pushState !== 'undefined' ) ) {

        window.history.pushState( updatedQuery, null, href );
        
      }

      
    }

  }

  function _readHrefQuery( key ) {

    var query = {}, queryParts;

    try {

      queryParts = window.location.href.split('#')[0].split( '?' ).slice( 1 );

      if ( queryParts.length ) {

        query = qs.parse( queryParts[ 0 ] );

      }

      return key ? ( query[ key ] ? query[ key ] : {} ) : query;

    } catch( e ) {

      log( 'had some trouble reading href query: %s', e );

    }

    return {};

  }

  function _cleanSearch( search ) {

    var cleanTags = [];

    if ( !search ) return;

    cn.forEach( [ 'neLat', 'neLng', 'swLat', 'swLng' ], function( f ) {

      if ( search[ f ] ) search[ f ] = parseFloat( search[ f ] );

    });


    if ( ( typeof search.tags !== 'undefined' ) && cn.isArray( search.tags ) ) {

      cn.forEach( search.tags, function( tag ) {

        if ( tag.length ) cleanTags.push( tag );

      });

      if ( !cleanTags.length ) {

        delete search.tags;

      } else {

        search.tags = cleanTags;

      }

    }

    return search;

  }

  function _stringifyDate( d ) {

    if ( !d ) d = new Date();

    return [ d.getFullYear(), _fZ( d.getMonth() + 1 ), _fZ( d.getDate() ) ].join( '-' );

  }

  function _fZ( str ) {

    if ( ( str + '' ).length == 1 ) {

      return '0' + str;

    }

    return str;

  }

}

},{"../../js/lib/common/common.mod.js":8,"../../js/lib/controlDataFetch/controlDataFetch":9,"../../js/lib/remote/remote.mod.js":12,"./filters":51,"./geolocate":52,"debug":17,"qs":36}],51:[function(require,module,exports){
"use strict";

var cn = require( '../../js/lib/common/common.mod' );


module.exports = {
  what: what,
  //passed: passed,
  event: event,
  categories: categories,
  tags: tags,
  organizations: organizations,
  locations: locations,
  dates: dates
}


function what( item, reqParams, whatUids ) {

  if ( reqParams.what ) {

    if ( !whatUids || whatUids.indexOf( parseInt( item.u, 10 ) ) == -1 ) {

      return false;

    }

  }

  return true;

}


function passed( item, reqParams ) {

  var today = new Date();

  today = today.getFullYear() + '-' + _fZ( today.getMonth() + 1 ) + '-' + _fZ( today.getDate() );

  if ( !reqParams.passed && !reqParams.from ) {

    for ( var i in item.d ) {

      if ( item.d[ i ] >= today ) {

        return true;

      }

    }

    return false;

  }

  return true;

}


function event( item, reqParams ) {
  
  if ( reqParams.uid ) {

    return (item.u + '') == (reqParams.uid + '');

  };

  return true;

}


function categories( item, reqParams ) {

  if ( reqParams.category && ( item.c !== reqParams.category ) ) return false;

  return true;

}


function tags( item, reqParams ) {

  var reqTags;

  if ( !reqParams.tags ) return true;

  reqTags = typeof reqParams.tags == 'string' ? [ reqParams.tags ] : reqParams.tags;

  if ( !reqTags.length ) return true;

  if ( !item.t ) return false;

  for ( var i = reqTags.length - 1; i >= 0; i-- ) {

    if ( !cn.contains( item.t, reqTags[ i ] ) ) return false;

  }

  return true;

}


function organizations( item, reqParams ) {

  if ( reqParams.org && ( ( !item.org ) || ( item.org.s !== reqParams.org ) ) ) return false;

  return true;

}


function dates( item, reqParams ) {

  if ( !reqParams.from ) {

    return true;

  }

  var period = [ reqParams.from, reqParams.to ? reqParams.to : reqParams.from ];

  for ( var i in item.d ) {

    if ( ( item.d[ i ] >= period[ 0 ] ) && ( item.d[ i ] <= period[ 1 ] ) ) {

      return true;

    }

  }

  return false;

}


function locations( item, reqParams ) {

  if ( reqParams.location ) {

    return parseInt( reqParams.location, 10 ) == item.l;

  }

  // is one of the locations within square... works most places
  
  if ( reqParams.neLat && reqParams.neLng && reqParams.swLat && reqParams.swLng ) {

    var ne = [ parseFloat(reqParams.neLat), parseFloat(reqParams.neLng) ], 

    sw = [parseFloat(reqParams.swLat), parseFloat(reqParams.swLng)];

    if ( (item.lt <= ne[0] ) &&

    ( item.lg <= ne[1] ) &&

    ( item.lt >= sw[0] ) &&

    ( item.lg >= sw[1]) ) return true;

    return false;

  }

  return true;

}

function _fZ( n ) {
  return (n>9?'':'0') + n;
};

},{"../../js/lib/common/common.mod":8}],52:[function(require,module,exports){
"use strict";

module.exports = function( ctlData, initValues, cb ) {

  var requestTimeout;

  if ( initValues.lat && initValues.lng ) return cb( null, [ initValues.lat, initValues.lng ] );

  if ( !_hasFeature() ) return cb( 'navigator cannot geolocate' );

  if ( !initValues.count ) initValues.count = 10;

  initValues.count = Math.min( initValues.count, 50 );

  requestTimeout = setTimeout( function() {
    cb( 'user did not respond to geolocate' );
  }, 5000 );

  _requestGeolocation( function( err, coords ) {

    clearTimeout( requestTimeout );

    if ( err ) return cb( err );

    // find distance from point encompassing the count locations
    
    var closest = _extractClosest( ctlData.l, coords, initValues.count ),

    boundParams = _determineBounds( closest );

    cb( null, boundParams );

  } );

}


function _determineBounds( locations ) {

  var neLat = false, neLng = false,

  swLat = false, swLng = false,

  lat, lng;

  for ( var l in locations ) {

    var lat = locations[ l ].lt,

    lng = locations[ l ].lg;

    if ( !neLat ) {
      
      neLat = swLat = lat;

      neLng = swLng = lng;

    } else {

      if ( lat > neLat ) neLat = lat;

      if ( lat < swLat ) swLat = lat;

      if ( lng > neLng ) neLng = lng;

      if ( lng < swLng ) swLng = lng;

    }

  }

  return {
    neLat: neLat,
    neLng: neLng,
    swLat: swLat,
    swLng: swLng
  }

}


/**
 * given a lat/lng pair and a list of locations, find the 'count' first locations
 */

function _extractClosest( locations, coords, count, cb ) {

  var currentLocation, currentDistance,

  furthestDistance = false, closestDistances = [], newFurthest = false,

  closestLocations = {},

  processed = {};

  for (var i = locations.length - 1; i >= 0; i--) {

    currentLocation = locations[ i ];

    if ( typeof processed[ currentLocation.u ] == 'undefined' ) {

      currentDistance = parseInt( _distance( currentLocation.lt, currentLocation.lg, coords[ 0 ], coords[ 1 ] ), 10 );

      if ( ( closestDistances.length >= count ) && ( currentDistance < furthestDistance ) ) {

        // one needs to go and be replaced

        newFurthest = currentDistance; // furthest is once again unknown


        for( var c in closestDistances ) {

          if ( closestDistances[ c ] == furthestDistance ) {

            // the furthest is out and replaced
            closestDistances[ c ] = currentDistance;
            closestLocations[ c ] = currentLocation;

          } else {

            if ( closestDistances[ c ] > newFurthest ) {

              // new furthest is found
              newFurthest = closestDistances[ c ];

            }

          }

        }

        furthestDistance = newFurthest;

      } else if ( closestDistances.length < count ) {
          
        closestDistances.push( currentDistance );

        closestLocations[ closestDistances.length - 1 ] = currentLocation;

        if ( !furthestDistance || ( currentDistance > furthestDistance ) ) {

          furthestDistance = currentDistance;

        }

      }

      processed[ currentLocation.u ] = true;

    }

  };

  return closestLocations;
  
}

function _distance( lat1, lon1, lat2, lon2 ) {
  
  var radlat1 = Math.PI * lat1 / 180,
  
  radlat2 = Math.PI * lat2 / 180,
  
  radlon1 = Math.PI * lon1 / 180,
  
  radlon2 = Math.PI * lon2 / 80,
  
  radtheta = Math.PI * (lon1-lon2)/180;
  
  return 60 * 1.1515 * 1609.344 * 180/Math.PI * Math.acos(Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta));

}


function _requestGeolocation( cb ) {

  navigator.geolocation.getCurrentPosition( function ( pos ) {

    cb( null, [ pos.coords.latitude, pos.coords.longitude ] );

  }, function( err ) {

    cb( err.message );

  } );

}


function _hasFeature() {

  return 'geolocation' in navigator;

}

},{}],53:[function(require,module,exports){
"user strict";

/**
 * handle widget registration to page controllers
 */

if ( !window.cibul ) {

  var debug = require( 'debug' ),

  cn = require( '../../js/lib/common/common.mod.js' ),

  controller = require( './controller' );

  if ( window.env == 'tpl' ) debug.enable( '*' );

  var log = debug( 'controllers' ),

  controllers = {},

  getCallbacks = {};

  window.cibul = {};

  /**
   * called by a widget to register itself to the right controller
   */

  window.cibul.registerWidget = function( options, cb ) {

    var widgetParams = cn.extend( {
      name: false,      // required. name of the widget
      uid: false        // required. the uid of the agenda/embed
    }, options );

    log( 'widget register request received from %s', widgetParams.name );

   // create controller if not existing

    if ( typeof controllers[ widgetParams.uid ] == 'undefined' ) {

      controllers[ widgetParams.uid ] = controller( widgetParams.uid );

    }

    if ( typeof getCallbacks[ widgetParams.name ] !== 'undefined' ) {

      log( 'calling getWidget callback' );

      getCallbacks[ widgetParams.name ]( widgetParams );

    }

    // register widget with right controller

    return controllers[ widgetParams.uid ].register( widgetParams );

  };


  /**
   * called for getting a handle on controller
   */

  window.cibul.getController = function( uid ) {

    if ( !uid ) {

      throw 'agenda uid is missing';

    }

    if ( !controllers[ uid ] ) {

      log( 'getController: controller not existing > creating: %s', uid );

      controllers[ uid ] = controller( uid );

    }

    return controllers[ uid ];

  }



  /**
   * for admin only. get widget to fetch config data
   */

  exports.getWidget = function( name, cb ) {

    log( 'attempting to get widget %s', name );

    if ( !cn.size( controllers ) ) {

      getCallbacks[ name ] = cb;

      return;

    }

    for( var c in controllers ) break;

    return controllers[c].getWidget( name );

  };

}

},{"../../js/lib/common/common.mod.js":8,"./controller":50,"debug":17}],54:[function(require,module,exports){
var loadJs = require( '../../js/lib/loadJs/loadJs.mod.js' ),

cn = require( '../../js/lib/common/common.mod.js' ),

defaults = {
  all : {
    controllersPath : '//openagenda.com/js/embed/cibulControllers.js'
  },
  dev : {
    controllersPath : '//d.openagenda.com/js/embed/cibulControllers.js'
  },
  tpl : {
    controllersPath : '/js/browserified/widgetsControllerMain.js'
  }
},

env = window.env ? window.env : 'prod',

params = cn.extend( defaults.all, defaults[ env ] ? defaults[ env ] : {} );


module.exports = function( cb ) {

  getRegister( cb );

}


var getRegister = function( cb ) {

  if ( window.cibul ) {

    cb( window.cibul.registerWidget );

  } else {

    loadJs( params.controllersPath, function() {

      cb( window.cibul.registerWidget );

    } );

  }

}

},{"../../js/lib/common/common.mod.js":8,"../../js/lib/loadJs/loadJs.mod.js":11}],55:[function(require,module,exports){
"use strict";

var frameLink = require( './frameLink' ).frame,

debug = require( 'debug' ), log,

cn = require( '../../js/lib/common/common.mod.js' ),

pageHeight = require( './pageHeight' ),

linkClickController = false;

module.exports = function( pageOptions ) {

  var sendFunc;

  log = debug( 'embedded' );

  log( 'initing' );

  _catchLinkEvents();

  frameLink( function( s ) {

    sendFunc = s;

    log( 'linked with parent' );

    pageHeight.setOnChange( function( height ) {

      sendFunc( {
        height: height
      } );
        
    });

    pageHeight.force();

    linkClickController = function( href, target ) {

      sendFunc( {
        load: href,
        target: target
      } );

    };


  }, function( parentMessage ) {

    if ( pageOptions.onReceive ) pageOptions.onReceive( parentMessage );

  });

  return {
    send: function( data ) {

      if ( sendFunc ) {

        sendFunc( data );

      } else {

        log( 'send is not ready' );

      }

    },
    contentChange: function() {

      pageHeight.check();

      _catchLinkEvents();

    }
  }

}


function _catchLinkEvents() {

  var flaggedAttr = 'data-frame-link';

  cn.forEach( cn.els( 'a' ), function( linkElem ) {

    if ( linkElem.hasAttribute( 'data-frame-link' ) ) return;

    linkElem.setAttribute( 'data-frame-link', 'checked' );

    cn.addEvent( linkElem, 'click', function( e ) {

      cn.preventDefault( e );

      if ( !linkClickController ) return;

      linkClickController( linkElem.href, linkElem.hasAttribute( 'target' ) ? linkElem.getAttribute( 'target' ) : false );

    });

  });

}

},{"../../js/lib/common/common.mod.js":8,"./frameLink":57,"./pageHeight":58,"debug":17}],56:[function(require,module,exports){
"use strict";

var debug = require( 'debug' ), log,

cn = require( '../../js/lib/common/common.mod.js' ),

pageHeight = require( './pageHeight' ),

params = {
  fbAppId: false
};

module.exports = function( pageOptions ) {

  cn.extend( params, pageOptions );

  _fbAsyncInit( params.fbAppId, function( err, FB ) {

    FB.Canvas.setAutoGrow();

    FB.Canvas.scrollTo( 0, 400 );

  } );

}

function _fbAsyncInit( fbAppId, cb ) {

  window.fbAsyncInit = function() {
    
    FB.init({
      appId      : fbAppId,
      xfbml      : true,
      version    : 'v2.4'
    });

    cb( null, FB );

  };


  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));

}

},{"../../js/lib/common/common.mod.js":8,"./pageHeight":58,"debug":17}],57:[function(require,module,exports){
"use strict";

var debug = require( 'debug' ),

cn = require( '../../js/lib/common/common.mod.js' );

module.exports = {
  frame: parentLink, // link with parent window
  parent: frameLink  // link with frame window
}

function parentLink( onLinkEstablished, onParentMessage ) {

  var log = debug( 'parentLink ( frame script )' ),

  handShakeComplete = false;

  window.addEventListener( 'message', function _onParentMessageReceived( e ) {

    if ( !handShakeComplete ) {

      log( 'received hanshake request from parent' );

      window.parent.postMessage( { href: window.location.href }, e.origin );

      handShakeComplete = true;

      onLinkEstablished( function( message ) {

        log( 'sending message to parent: ', JSON.stringify( message ) );

        window.parent.postMessage( JSON.stringify( message ), e.origin );

      });

    } else {

      log( 'received message from parent' );

      onParentMessage( JSON.parse( e.data ) );

    }

  }, false );

}


function frameLink( elem, onLinkEstablished, onReceive ) {

  var log = debug( 'frameLink ( parent script )' ),

  frameSrc, handShakeComplete = false;

  cn.addEvent( elem, 'load', function() {
    
    _stop();

    _start();

  });

  _start();

  return;
  

  function _start() {

    frameSrc = _appendProtocol( elem.getAttribute( 'src' ) );

    log( 'establishing link on frame with %s', frameSrc );

    handShakeComplete = false;

    window.addEventListener( 'message', _onFrameMessageReceived, frameSrc );

    elem.contentWindow.postMessage( true, frameSrc );

  }


  function _stop() {

    window.removeEventListener( 'message', _onFrameMessageReceived );

  }


  function _onFrameMessageReceived( e ) {

    if ( !handShakeComplete ) {

      log( 'link with frame established' );
      
      onLinkEstablished( e.data.href, function( message ) {

        elem.contentWindow.postMessage( JSON.stringify( message ), frameSrc );

      } );

      handShakeComplete = true;

    } else {

      log( 'receiving message from frame: %s', e.data );

      onReceive( typeof e.data == 'string' ? JSON.parse( e.data ) : e.data );

    }

  }

  function _appendProtocol( href ) {

    if ( href.substr( 0, 2 ) == '//' ) {

      return window.location.href.split('//')[0] + href;

    }

    return href;

  }

}

},{"../../js/lib/common/common.mod.js":8,"debug":17}],58:[function(require,module,exports){
"use strict";

var imagesLoaded = require( 'imagesloaded' );

module.exports = {
  check: check,
  force: force,
  setOnChange: setOnChange
}

var height,

cn = require( '../../js/lib/common/common.mod' ),



onChangeCb = false,

firstChildPaddings = false,

enabled = true, enableTimeout;

cn.addEvent( window, 'resize', check );

cn.addEvent( window, 'load', function() {

  imagesLoaded( cn.el( 'body' ), check );

});

function check( force ) {

  var current = _getHeight();

  if ( _isDisabled() ) return;

  if ( typeof force !== 'boolean' ) force = false;

  if ( !force && ( height == current ) ) return;

  height = current;

  if ( onChangeCb ) onChangeCb( height );

  _disable();

  _enable( 100 );

}

function force() {

  check( true );

}

function setOnChange( cb ) {

  onChangeCb = cb;

}

function _isDisabled() { 

  return !enabled;

}

function _disable() { 

  enabled = false;

}

function _enable( delay ) { 

  if ( enableTimeout ) clearTimeout( enableTimeout );

  enableTimeout = setTimeout( function() {

    enabled = true;

  }, typeof delay !== 'undefined' ? delay : 0 );

}

function _getHeight() {
  
  // for IE8, html tag returns wrong height. Taking body height is needed for a cross browser solution.
  return document.getElementsByTagName('body')[0].offsetHeight - _getFirstChildPaddingSum();

}

function _getFirstChildPaddingSum() {

  var firstElemIndex = 0, firstChild;

  if ( firstChildPaddings ) return firstChildPaddings[ 0 ] + firstChildPaddings[ 1 ]; // they screw up height estimation

  firstChild = cn.childObject( cn.el( 'body' ), 0 );

  if ( firstChild && ( firstChild.tagName == 'STYLE' ) ) {

    firstChild = cn.childObject( cn.el( 'body' ), 1 );

  }

  if ( !firstChild ) {

    firstChildPaddings = [ 0, 0 ];

  } else {

    firstChildPaddings = [
      _getStyleValue( firstChild, 'paddingTop' ),
      _getStyleValue( firstChild, 'paddingBottom' )
    ];

  }

  return firstChildPaddings[ 0 ] + firstChildPaddings[ 1 ];

}

function _getStyleValue( elem, name ) {

  return parseInt( ( window.getComputedStyle ? window.getComputedStyle( elem ) : elem.currentStyle )[ name ], 10 );

}

},{"../../js/lib/common/common.mod":8,"imagesloaded":21}],59:[function(require,module,exports){
var cn = require( '../../js/lib/common/common.mod.js' ),

log = require( 'debug' )( 'widgetLib' );


/**
 * for each element corresponding to selector, load config in attribute
 * and handover the element and the config to the callback
 * callback should be the widget
 */

exports.forEachAnchor = function( selector, options, cb ) {

  _onAsapReady( function() {

    cn.forEach( cn.els( selector ), function( elem ) {
      
      cb( elem, cn.extend( {
        anchorConfig: readAnchorConfig( elem )
      }, options ) );

    } );

  });

};

/**
 * bootstrap widget with default controller interface functions
 */

exports.interface = function( name, uid, cbs ) {

  return cn.extend({
    name: name,
    uid: uid,
    clear: isNotDefined( 'clear', name ),
    include: isNotDefined( 'include', name ),
    enable: isNotDefined( 'enable', name ),
    disable: isNotDefined( 'disable', name ),
    change: isNotDefined( 'change', name )
  }, cbs );

}

exports.flagged = function( elem ) {

  if ( elem.hasAttribute( 'data-flag' ) ) {

    return true;

  }

  elem.setAttribute( 'data-flag', '1' );

  return false;

}

function isNotDefined( type, name ) {

  return function() {}

}

function readAnchorConfig( elem ) {

  if ( elem.hasAttribute( 'data-cbctl' ) ) {

    return elem.getAttribute('data-cbctl').split('|');

  } else if ( elem.hasAttribute( 'src') ) {

    return elem.getAttribute( 'src' );

  }

}

function _domReady( cb ) {

  if (document.readyState === "complete") {

    cb();

  } else {

    cn.addEvent( window, 'load', cb );

  }

}

function _onAsapReady( timeout, cb ) {

  if ( arguments.length == 1 ) {

    cb = timeout;

    timeout = 0;

  }

  if ( cn.el( 'body' ) ) return cb();

  setTimeout( function() {

    _onAsapReady( Math.max( ( timeout + 10 ) * 2, 10000 ), cb );

  }, timeout );

}

},{"../../js/lib/common/common.mod.js":8,"debug":17}]},{},[2]);
