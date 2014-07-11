var http = require('http'),

url = require('url'),

st = require('st'),

templater = require('./templater.js')(true),

mountCss = st({ path: __dirname + '/../css', url: '/css' }),

mountImage = st({ path: __dirname + '/../images', url: '/images'});

http.createServer(function(req, res) {

  var uri = url.parse(req.url).pathname.substr(1);

  if (!uri.length) return renderMap(req, res);

  if (mountCss(req, res) || mountImage(req, res) || uri=='favicon.ico') return; // here be static file.

  templater(uri, function(err, render) {

    if (err) throw err;

    respond(res, 200, render);

  });

}).listen(3000);


/**
 * render a template link map
 */

var renderMap = function(req, res) {

  var m = [
    'mock/presentation',
    'newsletter/event/full',
    'newsletter/agenda/full',
    'newsletter/admin/index',
    'newsletter/admin/campaignForm',
    'newsletter/admin/templateForm'
  ];

  respond(res, 200, '<ul>' + m.map(function(uri) {
    return '<li><a href="/' + uri + '">' + uri + '</a></li>';
  }).join('') + '</ul>');

},


/**
 * respond with given body
 */

respond = function(res, code, body) {

  res.writeHead(code, {
    "Content-Type": "text/html; charset=utf-8",
    'Cache-Control': 'no-cache'
  });

  res.write(body);
  res.end();

};