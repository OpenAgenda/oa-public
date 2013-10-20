var makeLooseGetFake = function(params) {

  params = extend({
    onResponse: false,
    data: [],
    lag: 400,
    lagVar: 200
  }, params);

  var pending = false, queued = false, count = 0,

  get = function(query, onResponse) {

    if (pending)
      _queue(query, onResponse);
    else
      _send(query, onResponse);

  },

  _send = function(query, onResponse) {

    if (params.debug) query.format = 'jsonp';

    pending = true;

    count++;

    if (params.debug) console.log(count);

    var lag = Math.ceil(Math.random()*params.lagVar - params.lagVar) + params.lag;

    setTimeout(function() {

      var data = [];

      var start = Math.floor(Math.random()*8)
        , length = Math.floor(Math.random()*10);

      for (var i=start; i<Math.min(params.data.length, start+length); i++) {

        data.push(params.data[i]);

      }

      pending = false;

      if (params.onResponse) params.onResponse(data);
      if (onResponse) onResponse(data);

      _processQueue();

    }, lag);

  },

  _queue = function(query, onResponse) {
    queued = query;
    queuedResponse = onResponse
  },

  _processQueue = function() {
    if (queued) _send(queued, queuedResponse);
    queued = false;
    queuedResponse = false;
  };

  return get;

}