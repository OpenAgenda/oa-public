var http = require('http'),

url = require('url'),

st = require('st'),

templater = require('./server/templater.js')(true),

mountCss = st({ path: __dirname + '/css', url: '/css' }),

mountImage = st({ path: __dirname + '/images', url: '/images'});

http.createServer(function ( req, res ) {

  var parsed = url.parse(req.url, true);

  var uri = parsed.pathname.substr(1);

  if (!uri.length) return renderMap(req, res);

  if (mountCss(req, res) || mountImage(req, res) || uri=='favicon.ico') return; // here be static file.

  var data = {};

  if (parsed.query.state) data.state = parsed.query.state;

  templater(uri, data, function(err, render) { // vow to make mockdata disappear from templater

    if (err) throw err;

    respond(res, 200, render, data.responseType);

  });

}).listen(3000);


/**
 * render a template link map
 */

var renderMap = function( req, res ) {

  var m = [
    'presentation/index',
    'mock/presentation',
    'newsletter/event/full',
    'newsletter/agenda/full',
    'newsletter/show',
    'newsletter/admin/index',
    'newsletter/admin/campaignForm',
    'newsletter/admin/campaignLayoutForm',
    'newsletter/admin/campaignFeaturedForm',
    'newsletter/admin/contactListForm',
    'newsletter/admin/contactListShow'
  ];

  respond(res, 200, '<ul>' + m.map(function(uri) {
    return '<li><a href="/' + uri + '">' + uri + '</a></li>';
  }).join('') + '</ul>');

},


/**
 * respond with given body
 */

respond = function( res, code, body, responseType ) {

  if (responseType==undefined) responseType = "text/html; charset=utf-8";

  res.writeHead(code, {
    "Content-Type": responseType,
    'Cache-Control': 'no-cache'
  });

  res.write(body);
  res.end();

};