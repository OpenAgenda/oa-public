var net = require('net'),

debug = require('debug'),

log = debug('run'),

config = require('./server/config.js')(),

templater = require('./server/templater.js')(),

run = function() {

  log('listening to tcp port %s on host %s', config.port, config.host);

  socketHandler(function(data, cb) {

    log('received request for template %s', data.template);

    templater(data.template, data, function(err, render) {

      log('serving rendered template %s', data.template);

      cb(null, render);

    });

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