var http = require('http'),

url = require('url'),

st = require('st'),

templater = require('./server/templater.js'),

mountStatic = st({ path: __dirname , url: '/', cache: false }),

fs = require('fs'),

cn = require('./js/lib/common/common.mod.js'),

async = require('async'),

deepExtend = require('deep-extend'),

map;

http.createServer(function ( req, res ) {

  async.waterfall([

    loadMap,


    function( map, wcb ) { // load uri

      var parsed = url.parse(req.url, true);

      var uri = parsed.pathname.substr(1);

      if (!uri.length) return renderMap(map, req, res);

      if ( cn.contains( ['.css', '.jpg', '.png', '.ico', '.ttf', '.svg', '.eot', '.otf'], uri.substr(-4) )

      || cn.contains( ['.woff'], uri.substr(-5) ) ) return mountStatic( req, res );

      wcb( null, map, uri );

    },


    function( map, uri, wcb ) { // load template data

      loadData( uri, function( tConf ) { 

        // load css in mock data

        var css = tConf.config.css || {};

        if ( tConf.layoutConfig && tConf.layoutConfig.css ) css = cn.extend( tConf.layoutConfig.css, css );

        if ( !tConf.data.head ) tConf.data.head = {};

        tConf.data.head.css = css;


        // load state of data

        if ( tConf.data.base ) {

          // get requested state of data. else, get the first

          for (var state in mockData) {

            if (state !== 'base') break; // first is base, second is first state

          }

          if (req.query.state && tConf.data[req.query.state]) state = req.query.state;

          tConf.data = deepExtend( tConf.data.base, tConf.data[state] );

        }

        // fake url generator
        
        tConf.data.genUrl = genUrl( tConf.data );


        // static image path generator 
        
        tConf.data._i = imagePath;


        wcb( null, map, uri, tConf.data );

      });

    },

    function( map, uri, data, wcb ) {

      templater( uri, data, function( err, render ) {

        if ( err ) return wcb( err );

        respond( res, 200, render, data.responseType );

      });

    }

  ], function( err ) {

    if ( err ) return respond( res, 500, err );

  });  

}).listen(3000);


/**
 * render a template link map
 */

var renderMap = function( map, req, res ) {

  respond(res, 200, '<ul>' + map.map(function(uri) {
    return '<li><a href="/' + uri + '">' + uri + '</a></li>';
  }).join('') + '</ul>');

},


/**
 * respond with given body
 */

respond = function( res, code, body, responseType ) {

  if (responseType === undefined) responseType = "text/html; charset=utf-8";

  res.writeHead(code, {
    "Content-Type": responseType,
    'Cache-Control': 'no-cache'
  });

  res.write(body);
  res.end();

},

loadMap = function( wcb ) {

  readFile('map.json', function( map ) {

    wcb( null, map );

  });

},

loadData = function( templateName, cb ) {

  async.waterfall([

    function( wcb ) {

      readFile( templateName + '.config.json', function( content ) {

        wcb( null, { config: content });

      });

    },

    function( result, wcb ) {

      if ( !result.config.layout ) return wcb( null, result);

      fileExists(result.config.layout + '.config.json', function( exists ) {

        if ( !exists ) return wcb( null, result );

        readFile(result.config.layout + '.config.json', function( content ) {

          result.layoutConfig = content;

          wcb( null, result );

        });

      });

    },

    function( result, wcb ) { // load template mock data

      fileExists(templateName + '.mock.json', function( exists ) {

        result.data = {};

        if ( !exists ) return wcb( null, result);

        readFile(templateName + '.mock.json', function( content ) {

          result.data = content;

          wcb( null, result);

        });

      });

    },

    function( result, wcb ) { // load layout mock data

      if ( !result.config.layout ) return wcb( null, result );

      fileExists(result.config.layout + '.mock.json', function( exists ) {

        if ( !exists ) return wcb( null, result);

        readFile(result.config.layout + '.mock.json', function( content ) {

          result.data = deepExtend( content, result.data );

          wcb( null, result);

        });

      });

    },

    function( result, wcb ) { // config and mock data is loaded

      cb( result );

    }

  ], function( err ) {

    console.log(err);

    throw err;

  });

},

genUrl = function( data ) {

  return function ( name ) {

    var values = {};

    if (arguments.length > 1) {

      for (var i = 1; i < arguments.length; i++) {

        cn.extend(values, arguments[i]);

      }

    }

    if (data.devUrls) {

      return data.devUrls[name] + '#' + name + encodeURI(JSON.stringify(values));

    }

    return '#' + name + encodeURI(JSON.stringify(values));

  };

},

imagePath = function( image, static ) {

  if ( !static ) return '//cibulstatic.s3.amazonaws.com/' + image;

  return '/images/' + image;

},

fileExists = function( filename, cb ) {

  fs.exists( __dirname + '/' + filename, cb);  

},

readFile = function( filename, cb ) {

  fs.readFile(__dirname + '/' + filename, 'utf-8', function( err, content ) {

    if ( err ) throw err;

    if ( filename.indexOf('.json') !== -1 ) return cb( JSON.parse( content ) );

    cb( content );

  });

};