var http = require('http'),

url = require('url'),

st = require('st'),

templater = require('./server/templater.js'),

mountStatic = st( { path: __dirname , url: '/', cache: false } ),

fs = require('fs'),

cn = require('./js/lib/common/common.mod.js'),

async = require('async'),

deepExtend = require('deep-extend'),

url = require('url'),

browserify = require('browserify'),

debug = require('debug'),

map;

debug.enable('*');

var log = debug('httpServer');

log('IMPORTANT: if nodemon is to be used, use it with proper exclusions');

http.createServer(function ( req, res ) {

  log('processing request');

  async.waterfall([

    _loadMap,

    function( map, wcb ) { // load uri

      var parsed = url.parse(req.url, true);

      var uri = parsed.pathname.substr(1);

      if (!uri.length) return _renderMap(map, req, res);

      if ( cn.contains( ['.js'], uri.substr(-3) ) ||

      cn.contains( ['.css', '.jpg', '.png', '.ico', '.ttf', '.svg', '.eot', '.otf'], uri.substr(-4) ) ||

      cn.contains( ['.woff'], uri.substr(-5) ) ) return mountStatic( req, res );

      wcb( null, map, uri );

    },


    function( map, uri, wcb ) { // load template data

      var reqQuery = url.parse(req.url, true).query;

      _loadData( uri, reqQuery.br !== undefined ? true : false, function( tConf ) { 

        // load state of data

        if ( tConf.data.base ) {

          // get requested state of data. else, get the first

          for ( var state in tConf.data ) {

            if ( state !== 'base' ) break; // first is base, second is first state

          }

          if ( reqQuery.state && tConf.data[reqQuery.state]) state = reqQuery.state;

          tConf.data = deepExtend( tConf.data.base, tConf.data[state] );

        }

        // append layout data
        
        if ( tConf.layoutData ) tConf.data = deepExtend( tConf.layoutData, tConf.data );


        // load css in mock data

        if ( !tConf.data.head ) tConf.data.head = {};

        var css = tConf.config.css || {};


        if ( tConf.layoutConfig && tConf.layoutConfig.css ) css = cn.extend( _absolutePath(tConf.config.layout, tConf.layoutConfig.css), _absolutePath(uri, css));

        tConf.data.head.css = css;

        
        tConf.data.scriptsBase = '/js/browserified';


        // fake url generator
        
        tConf.data.genUrl = _genUrl( tConf.data );


        // static image path generator 

        wcb( null, map, uri, tConf.data );

      });

    },

    function( map, uri, data, wcb ) {

      templater( uri, data, function( err, render ) {

        render = _insertEnvironment( render );

        if ( err ) return wcb( err );

        _respond( res, 200, render, data.responseType );

      });

    }

  ], function( err ) {

    if ( err ) return _respond( res, 500, err );

  });  

}).listen(3000);


/**
 * render a template link map
 */

var _renderMap = function( map, req, res ) {

  _respond(res, 200, '<ul>' + map.map(function(uri) {
    return '<li><a href="/' + uri + '">' + uri + '</a></li>';
  }).join('') + '</ul>');

},


/**
 * respond with given body
 */

_respond = function( res, code, body, responseType ) {

  if (responseType === undefined) responseType = "text/html; charset=utf-8";

  res.writeHead(code, {
    "Content-Type": responseType,
    'Cache-Control': 'no-cache'
  });

  res.write(body);
  res.end();

},

_loadMap = function( wcb ) {

  _readFile('map.json', function( err, map ) {

    wcb( null, map );

  });

},

_loadData = function( templateName, doBrowserify, cb ) {

  async.waterfall([

    function( wcb ) {

      log('loading template config');

      _readFile( templateName + '.config.json', function( err, content ) {

        wcb( null, { config: content });

      });

    },

    function( result, wcb ) { // browserify script if exists & setting set?

      if ( !result.config.templateJs || !doBrowserify ) return wcb( null, result );

      log('template js exists');

      _processTemplateJs( templateName, function( err ) {

        return wcb( err, result );

      } );

    },

    function( result, wcb ) { // load layout config if exists

      if ( !result.config.layout ) return wcb( null, result);

      _readFile( result.config.layout + '.config.json', function( err, content ) {

        if ( err ) return wcb( null, result );

        result.layoutConfig = content;

        wcb( null, result );

      });

    },

    function( result, wcb ) { // browserify layout script if exists

      if ( !result.layoutConfig || !result.layoutConfig.templateJs || !doBrowserify ) return wcb( null, result );

      log('layout js exists');

      _processTemplateJs( result.config.layout, function( err ) {

        return wcb( err, result );

      } );

    },

    function( result, wcb ) { // load template mock data

      result.data = {};

      _readFile(templateName + '.mock.json', function( err, content ) {

        if ( err ) return wcb( null, result );

        result.data = content;

        wcb( null, result);

      });

    },

    function( result, wcb ) { // load layout mock data

      if ( !result.config.layout ) return wcb( null, result );

      _readFile( result.config.layout + '.mock.json', function( err, content ) {

        if ( err ) return wcb( null, result );

        result.layoutData = content;

        wcb( null, result);

      });

    },

    function( result, wcb ) { // config and mock data is loaded

      cb( result );

    }

  ], function( err ) {

    console.log( err );

    throw err;

  });

},

_processTemplateJs = function( name, cb ) {

  log('browserificationization');

  // determine name of template js file
      
  var folder = name.split('/');

  folder[ folder.length - 1 ] = 'js/' + folder[ folder.length - 1 ] + '.js';


  // browserify the thing

  var jsFile = folder.join('/'),

  destName = cn.toCamelCase( name.replace(/\//g, '_') ),

  destFilePath = '/js/browserified/' + destName + '.js';


  // run browserify

  var b = browserify();

  b.add( __dirname + '/' + jsFile );

  var bundle = b.bundle();

  bundle.pipe( fs.createWriteStream( __dirname + destFilePath ) );

  bundle.on('end', cb);

},

_genUrl = function( data ) {

  return function ( name ) {

    var values = {};

    if (arguments.length > 1) {

      for (var i = 1; i < arguments.length; i++) {

        cn.extend(values, arguments[i]);

      }

    }

    if ( data.devUrls && data.devUrls[name] ) {

      return data.devUrls[name] + '#' + name + encodeURI(JSON.stringify(values));

    }

    return '#' + name + encodeURI(JSON.stringify(values));

  };

},

_readFile = function( filename, cb ) {

  fs.readFile(__dirname + '/' + filename, 'utf-8', function( err, content ) {

    if ( err ) return cb( err );

    if ( filename.indexOf('.json') !== -1 ) return cb( null, JSON.parse( content ) );

    cb( null, content );

  });

},

_absolutePath = function( uri, css ) {

  var templatePath = uri.split('/');

  templatePath.pop();

  var absCss = {};

  for( var c in css ) {

    var path = css[c].split('/'),

    isSub = true;

    while ( path[0] == '..' ) {
      path.splice(0, 1);
      isSub = false;
    }

    absCss[c] = ( isSub ? '' : '/' ) + path.join('/');

  }

  return absCss;

},

_insertEnvironment = function( render ) {

  return render.replace( '</body>', '<script type="text/javascript">window.env="dev";</script>' );

};