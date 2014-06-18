var cn = require('../../js/lib/common/common.mod.js'),

remote = require('../../js/lib/remote/remote.mod.js'),

debug = require('debug'),

log = debug('main'),

canvas,

params = {
  routes: {
    new: '/addevent'
  }
};

window.run = function(options) {

  cn.extend(params, options);

  for (var i in params.routes)
    params.routes[i] = params.base + params.routes[i];

  canvas = cn.el(params.selectors.canvas);

  controller(params.routes.new);

};

var controller = function(res) {

  get(res, function(err, data) {

    if (err) return handleErr(err);

    if (data.origin) {

      complete();

    } else if (data.redirect) {

      controller(data.redirect);

    } else if (data.partial) {

      refreshCanvas(data.partial);

    }

  });

},

get = function(res, callback) {

  remote.getXmlHttp(res, {timeout: 3000}, function(responseType, data) {

    if (responseType!=='success') return callback(responseType);

    callback(null, data);

  });

},

refreshCanvas = function(html) {

  

},

handleErr = function(err) {

  console.log('error');
  console.log(err);

};