var all = {
  host: '127.0.0.1',
  port: 1337
};

module.exports = function() {

  var env = process.env.NODE_ENV || 'development';

  return all;

};