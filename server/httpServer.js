var http = require('http'),

url = require('url'),

templater = require('./templater.js');

http.createServer(function(req, res) {

  var uri = url.parse(req.url).pathname.substr(1);

  if (!uri.length) return renderMap(req, res);

  templater(uri, function(err, render) {

    // need here the data used for the render as well
    // like load the mock data or not
    // the requested language
    // the css resources.. the main ones should be loaded,
    // the specific ones should be too
    // and given as a map to the templater

  });

  respond(res, 200, 'sboom!');

}).listen(3000);

var renderMap = function(req, res) {

  var m = [
    'mock/presentation'
  ];

  respond(res, 200, '<ul>' + m.map(function(uri) {
    return '<li><a href="/' + uri + '">' + uri + '</a></li>';
  }).join('') + '</ul>');

},

respond = function(res, code, body) {

  res.writeHead(code, {"Content-Type": "text/html"});
  res.write(body);
  res.end();

};