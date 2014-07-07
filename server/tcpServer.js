var net = require('net'),

ejs = require('ejs'),

fs = require('fs'),

async = require('async'),

debug = require('debug'),

log = debug('run'),

cn = require('../js/lib/common/common.mod.js'),

config = require('./config.js')(),

run = function() {

  log('listening to tcp port %s on host %s', config.port, config.host);

  socketHandler(function(data, cb) {

    log('received request for template %s', data.template);

    loadFiles(data, function(err, template, labels) {

      var translator = loadTranslator(labels);

      var rendered = ejs.render(template, cn.extend(data, {'__' : translator}), cb);

      log('serving rendered template %s', data.template);

      cb(null, rendered);

    });

  });

},


/**
 * prepare translator function used for template rendering
 */

loadTranslator = function(labels) {

  return function(label, values) {

    if (!values) values = {};

    var translation = labels[label];

    if (translation == undefined) translation = label;

    for (var key in values) {

      translation = translation.replace(key, values[key]);

    }

    return translation;

  };

},


/**
 * load layout, template and int labels
 */

loadFiles = function(data, cb) {

  async.parallel([
    async.apply(fs.readFile, '../layout/footer.layout.ejs', 'utf8'),
    async.apply(fs.readFile, '../layout/header.layout.ejs', 'utf8'),
    async.apply(fs.readFile, '../' + data.template + '.fr.json', 'utf8'),
    async.apply(fs.readFile, '../' + data.template + '.ejs', 'utf8')
  ],

  function (err, results) {

    if (err) return cb(err);

    cb(null, results[1] + results[3] + results[0], JSON.parse(results[2]));

  });

},


/**
 * create tcp server and handle requests and responses
 */

socketHandler = function(cb) {

  var server = net.createServer(function(socket) {

    socket.on('data', function(data){

      // reading request

      var requestData = JSON.parse(data.toString().trim());

      if (!requestData) {

        socketRespond(socket, 'could not read request');

        return;

      }

      // request could be read ok

      cb(requestData, function(err, responseData) {

        socketRespond(socket, err, responseData);

      });

    });
    
  });

  server.listen(config.port, config.host);

},


/**
 * send response through socket and play with noodle.
 */

socketRespond = function(socket, err, data) {

  socket.write(JSON.stringify([err, data]));

  socket.pipe(socket);

  socket.end();

};

run();