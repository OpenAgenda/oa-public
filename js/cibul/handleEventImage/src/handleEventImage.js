var handleEventImage = function(params) {

  params = extend({
    canvas: false,
    templates: {
      main: '<div class="form-section"><div class="js_remove remove-action"><a class="action" href="#"><i class="fa fa-trash"></i></a><span class="js_remove_loader"></span><span class="js_remove_message info error"></span></div><h2><%= imageSection %></h2><div class="upload-image"><button><%= upload %></button><span class="js_loader loader"></span><span class="js_message info"></span></div><div class="canvas js_image_canvas"></div><div class="separator"></div></div>',
      empty: '<div><%= noImage %></div>'
    },
    classes: {
      main: 'event-image',
      error: 'error',
      success: 'success',
      disabled: 'disabled'
    },
    selectors: {
      button: 'button',
      imageCanvas: '.js_image_canvas',
      info: '.js_message',
      loader: '.js_loader',
      removeLoader: '.js_remove_loader',
      remove: '.js_remove',
      removeMessage: '.js_remove_message'
    },
    frameName: 'imageframe',
    labels: {
      upload: 'load image',
      info: 'image should be at least 300px wide',
      error: 'There was a problem while loading the image. Reload the page and try again.',
      success: 'Image successfully loaded',
      imageSection: 'Image',
      removeImage: 'remove image',
      removeMessage: 'There was a problem regarding the removal of the image. Reload the page and try again.',
      noImage: 'No image is currently associated with this event.'
    },
    spinner: { lines: 7, length: 1, width: 2, radius: 3, corners: 0, rotate: 0},
    upload: false,
    remove: false,
    callbackName: 'image_upload_result',
    initName: false,
    onSuccess: false,
    onRemove: false,
    onImageLoad: false,
    prefix: false,
    path: false // path where images are found
  }, params);

  var elem, removeElem, form, fileInput, spinner, imageLoaded = false, locked = false,

  run = function() {

    _createElem();

    _createFrame();

    _createForm();

    _declareCallback();

    _displayMessage();

    if (params.initName) {
      imageLoaded = true;
      _displayImage(params.initName);
    } else {
      _displayEmptyMessage();
    }

    _toggleRemove();

  },

  _createForm = function() {

    form = document.createElement('form');
    
    form.setAttribute('method', 'post');
    form.setAttribute('enctype', 'multipart/form-data');
    form.setAttribute('target', params.frameName);
    form.setAttribute('action', params.upload + (params.upload.indexOf('?')==-1?'?':'&') + 'callback=' + params.callbackName);

    fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('name', 'image');

    addEvent(fileInput, 'change', _fileChosen);

    addEvent(fileInput, 'click', function(e) {
      if (locked) preventDefault(e);
    });

    form.appendChild(fileInput);

    extend(form.style, {
      width: el(elem, params.selectors.button).offsetWidth + 'px',
      height: el(elem, params.selectors.button).offsetHeight + 'px',
      position: 'absolute',
      overflow: 'hidden'
    });

    extend(fileInput.style, {
      opacity: 0,
      filter: 'alpha(opacity=0)',
      cursor: 'pointer',
      position: 'absolute',
      right: 0
    });

    el(elem, params.selectors.button).insertAdjacentElement('beforebegin', form);

  },

  _createFrame = function() {

    var iframe = document.createElement('iframe');

    iframe.setAttribute('name', params.frameName);

    iframe.style.display = 'none';

    elem.appendChild(iframe);

  },

  _fileChosen = function(e) {

    if (!fileInput.value.length) return;

    form.submit();

    _lock(params.selectors.loader);

  },

  _imageUploaded = function(res) {

    if (res.success) {

      _displayImage(res.name);

      _displayMessage(res.message, 'success');

      imageLoaded = true;

      _toggleRemove();

      if (params.onSuccess) params.onSuccess(res.name);
    
    } else {

      _displayMessage(res.message, 'error');

    }

    _unlock();

  },

  _displayImage = function(name) {

    el(elem, params.selectors.imageCanvas).innerHTML = '';

    if (!name) return _displayEmptyMessage();

    var img = document.createElement('img');

    img.setAttribute('src', params.path + params.prefix + name + '?' + Math.random());

    addEvent(img, 'load', function(){
      params.onImageLoad();
    });

    el(elem, params.selectors.imageCanvas).appendChild(img);

  },

  _displayEmptyMessage = function() {

    el(elem, params.selectors.imageCanvas).innerHTML = new EJS({text: params.templates.empty}).render(params.labels);

  },

  _displayMessage = function(message, type) {

    if (!message)
      if (type=='error')
        message = params.labels.error;
      else if (type=='success')
        message = params.labels.success;
      else
        message = params.labels.info;

    var infoElem = el(elem, params.selectors.info);

    removeClass(infoElem, params.classes.error);
    removeClass(infoElem, params.classes.success);

    if (type == 'error')
      addClass(infoElem, params.classes.error);
    else if (type == 'success')
      addClass(infoElem, params.classes.success);

    infoElem.innerHTML = message;

  },

  _toggleRemove = function() {

    if (!removeElem) {

      removeElem = el(elem, params.selectors.remove);

      addEvent(el(removeElem, 'a'), 'click', function(e) {
        preventDefault(e);

        if (locked) return;

        _lock(params.selectors.removeLoader);

        remote.get(params.remove, {timeout: 10000}, function(success, data) {

          _unlock();

          if (!success) return;

          if (!data.success) {

            el(elem, params.selectors.removeMessage).innerHTML = data.message?data.message:params.labels.removeError;

            return;
          }

          imageLoaded = false;

          if (params.onRemove) params.onRemove();

          _displayImage(false);

          _toggleRemove();

        }, true);

      });

    }

    el(elem, params.selectors.removeMessage).innerHTML = '';

    removeElem.style.display = imageLoaded?'block':'none';

  },

  _declareCallback = function() {

    window[params.callbackName] = function(response) {
      _imageUploaded(response);
    };

  },

  _lock = function(selector) {

    locked = true;

    el(elem, params.selectors.button).setAttribute('disabled', 'disabled');

    addClass(el(elem, params.selectors.remove), params.classes.disabled);

    if (!spinner) spinner = new Spinner(params.spinner);

    spinner.spin();

    el(elem, selector).appendChild(spinner.el);

  },

  _unlock = function() {

    locked = false;

    el(elem, params.selectors.button).removeAttribute('disabled');

    removeClass(el(elem, params.selectors.remove), params.classes.disabled);

    spinner.stop();

  },

  _fireEvent = function(elem, types) {

    if (elem === null || elem === undefined) return;
    if (typeof types == 'string') types = [types];
    forEach(types, function(type){
      if ("fireEvent" in elem) {
        elem.fireEvent('on' + type);
      } else {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(type, false, true);
        elem.dispatchEvent(evt);
      }
    });

  },

  _createElem = function() {

    elem = document.createElement('div');
    elem.className = params.classes.main;

    elem.innerHTML = new EJS({text: params.templates.main }).render(params.labels);

    params.canvas.appendChild(elem);

  };

  run();

};