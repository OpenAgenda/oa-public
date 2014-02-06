var handleEmptyProgram = function(params) {

  params = extend({
    canvasElem: false,
    control: false,
    user: false,
    res: false,
    debug: false
  }, params);

  if (Object.size(params.control.a)) return;

  var data = { type: (!params.user || (params.user !== params.control.o))?'visitor':'editor' };

  if (params.debug) data.format = 'jsonp';
    
  remote.get(params.res, { data: data }, function(success, data) {
    
    if (!success || !data.success) return;

    var li = document.createElement('li');

    li.innerHTML = data.partial;

    params.canvasElem.appendChild(li);

  }, !params.debug);

};