var makeLooseGet = function(params) {

  params = extend({
    url: false,
    onResponse: false,
    debug: false
  }, params);

  var pending = false, queued = false, count = 0,

  get = function(query, onResponse) {

    if ( pending )
      _queue( query, onResponse );
    else
      _send( query, onResponse );

  },

  _send = function(query, onResponse) {

    if (params.debug) query.format = 'jsonp';

    pending = true;

    count++;

    //if (params.debug) console.log(count);

    remote.get( params.url, { data: query, timeout: 10000 }, function(success, data) {

      pending = false;

      if (!success) return;

      if (params.onResponse) params.onResponse(data);
      if (onResponse) onResponse(data);

      _processQueue();

    } ,false);

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