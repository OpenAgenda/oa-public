var cn = require('../../js/lib/common/common.mod.js'),

remote = require('../../js/lib/remote/remote.mod.js'),

eh,

debug = require('debug'),

log = debug('embedded'),

canvas,

cover,

params = {
  routes: {
    new: '/addevent',
  },
  selectors: {
    action: '.js_action',
    canvas: '.js_frame_canvas'
  },
  events: {
    formSubmit: 'formsubmit',
    formComplete: 'formcomplete',
    contentClear: 'contentclear'
  },
  sandbox: false,
  requestTimeout: 12000
};

window.run = function(eventHandler, options) {

  if (options.debug) debug.enable('*');

  cn.extend(params, options);

  eh = eventHandler;

  canvas = cn.el(params.selectors.canvas);

  if (params.sandbox) return loadSandbox();

  // listen to form submitting and receiving the response.
  eh.on(params.events.formComplete, function(data) {

    controller(null, data);
    
  });

  eh.on(params.events.formSubmit, function(data) {

    disableCanvas();

  });

  for (var i in params.routes)
    params.routes[i] = params.base + params.routes[i];

  log('initing the controller on %s', params.routes.new);

  get(params.routes.new, controller);

  return eventHandler;

};

var controller = function(err, data) {

  log('controller');

  if (err) return handleErr(err);

  if (data.redirect) {

    log('controller: redirecting to %s', data.redirect);

    get(data.redirect, controller);

  } else if (data.partial) {

    log('controller: writing partial to dom');

    refreshCanvas(data.partial);

    eh.trigger(params.events.contentClear);

  }

},

get = function(res, callback) {

  disableCanvas();

  remote.getXmlHttp(res, {timeout: params.requestTimeout}, function(responseType, data) {

    if (responseType!=='success') return callback(responseType);

    callback(null, data);

  });

},

loadSandbox = function() {

  get(params.sandbox, function(err, data) {

    if (err) {
      log('loadSandbox: problem loading template');
      return;
    }

    refreshCanvas(data.partial, true);

  });

},

refreshCanvas = function(html, disableActions) {

  log('refreshCanvas: %s', 'clearing the canvas');

  var child;

  while (child = cn.childObject(canvas, 0))
    canvas.removeChild(child);

  log('refreshCanvas: %s', 'setting the partial content in');

  canvas.innerHTML = html;

  cn.forEach(cn.els(canvas, 'script'), stickScriptToHead);

  cn.forEach(cn.els(canvas, params.selectors.action), function(actionElem) {

    if (disableActions) {

      prepareDisabledAction(actionElem);

      return;

    }

    if (actionElem.getAttribute('type')=='submit')
      preparePostAction(actionElem);
    else
      prepareGetAction(actionElem);

  });

  enableCanvas();

},

enableCanvas = function () {

  if (cover) cover.style.display = 'none';

},

disableCanvas = function() {

  if (!cover) {

    cover = document.createElement('div');

    cover.setAttribute('style', [
      'position: absolute;',
      'top: 0;',
      'left: 0;',
      'width: 100%;',
      'height: 100%;',
      'z-index: 10000;',
      'cursor: wait;',
    ].join(''));

    cn.el('body').insertAdjacentElement('afterbegin', cover);

  } else {

    cover.style.display = 'block';

  }

},

preparePostAction = function(actionElem) {

  var form = cn.el(canvas, 'form'),

  res = form.getAttribute('action');

  addClickEvent(actionElem, function() {

    log('preparePostAction: sending post to %s', res);

    remote.postXmlHttp(res, {form: form, timeout: params.requestTimeout}, function(responseType, data) {
      controller(responseType=='success'?null:responseType, data);
    });

  });

},

prepareGetAction = function(actionElem) {

  var res = actionElem.getAttribute('href');

  addClickEvent(actionElem, function() {

    remote.getXmlHttp(res, {timeout: params.requestTimeout}, function(responseType, data) {
      controller(responseType=='success'?null:responseType, data);
    });

  });

},

prepareDisabledAction = function(actionElem) {

  addClickEvent(actionElem, function() {

    log('disabled action click. nothing happens');

  });

},

addClickEvent = function(elem, callback) {

  cn.addEvent(elem, 'click', function(e) {

    cn.preventDefault(e);

    disableCanvas();

    callback();

  });

},

stickScriptToHead = function(scriptElem) {

  var headScript = document.createElement('script'),

  scriptContent = (scriptElem.text || scriptElem.textContent || scriptElem.innerHTML || "" );

  try {
    headScript.appendChild(document.createTextNode(scriptContent));      
  } catch(e) {
    headScript.text = scriptContent;
  }

  cn.el('head').appendChild(headScript);

};

handleErr = function(err) {

  console.log('error');
  console.log(err);

};