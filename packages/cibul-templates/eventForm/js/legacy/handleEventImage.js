"use strict";

const _ = {
  extend: require( 'lodash/extend' )
}
const ejs = require( 'ejs' );
const Spinner = require( 'spin.js' );

const du = require( '@openagenda/dom-utils' );

var rUtils = require( '../reactUtils' );
const remote = require( '../../../js/lib/remote/remote.mod' );

module.exports = function( params ) {

  params = _.extend({
    canvas: false,
    templates: {
      main: `
        <div class="form-section">
          <label><%= imageSection %></label>
          <div class="upload-image">
            <button class="btn btn-default"><%= upload %></button>
            <span class="js_loader loader display-none"></span>
            <span class="js_message info"></span>
          </div>
          <div class="canvas js_image_canvas"></div>
          <div class="js_image_credits">
            <% if ( imageCreditsLabel ) { %><label><%= imageCreditsLabel %></label><% } %>
            <% if ( imageCreditsInfo ) { %><div><%= imageCreditsInfo %></div><% } %>
            <input placeholder="<%= imageCreditsPlaceholder %>" name="image_credits" type="text" class="form-control margin-top-sm">
          </div>
          <div class="js_remove remove-action">
            <a class="btn btn-danger" href="#"><%= removeImage %></a>
            <span class="js_remove_loader"></span>
            <span class="js_remove_message info error"></span>
          </div>
          <div class="separator"></div>
        </div>`,
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
      noImage: 'No image is currently associated with this event.',
      imageCreditsPlaceholder: 'Image credits'
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

    if ( !_createElem() ) return;

    _createFrame();

    _createForm();

    _declareCallback();

    _displayMessage();

    _monitorCredits();

    if (params.initName) {

      imageLoaded = true;

      _displayImage( params.initName );

      if ( _useImageCredits() ) _enableImageCredits( params.initCredits );

    } else {

      _displayEmptyMessage();

      _disableImageCredits();

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

    du.addEvent( fileInput, 'change', _fileChosen );

    du.addEvent(fileInput, 'click', function(e) {
      if (locked) du.preventDefault(e);
    });

    form.appendChild(fileInput);

    _.extend(form.style, {
      width: du.el(elem, params.selectors.button).offsetWidth + 'px',
      height: du.el(elem, params.selectors.button).offsetHeight + 'px',
      position: 'absolute',
      overflow: 'hidden'
    });

    _.extend(fileInput.style, {
      opacity: 0,
      filter: 'alpha(opacity=0)',
      cursor: 'pointer',
      position: 'absolute',
      right: 0
    });

    du.el(elem, params.selectors.button).insertAdjacentElement('beforebegin', form);

  },

  _disableImageCredits = function() {

    du.addClass( du.el( '.js_image_credits' ), 'display-none' );

    params.onCreditsUpdate( '' );

  },

  _useImageCredits = function() {

    return du.el( params.canvas ).getAttribute( 'attr-credits-display' ) === '1';

  },

  _enableImageCredits = function( credits = null ) {

    let imageCreditsInput = du.el( du.el( '.js_image_credits' ), 'input' );

    du.removeClass( du.el( '.js_image_credits' ), 'display-none' );

    if ( credits ) {

      imageCreditsInput.value = credits;

    }

    params.onCreditsUpdate( imageCreditsInput.value );

  },

  _monitorCredits = function() {

    du.addEvent( du.el( '.js_image_credits' ), 'keyup', e => {

      params.onCreditsUpdate( e.target.value );

    } );

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

    _lock();

  },

  _imageUploaded = function(res) {

    if (res.success) {

      _displayImage(res.name);

      _displayMessage(res.message, 'success');

      imageLoaded = true;

      _toggleRemove();

      if ( _useImageCredits() ) _enableImageCredits();

      if (params.onSuccess) params.onSuccess(res.name);

    } else {

      _displayMessage(res.message, 'error');

    }

    _unlock();

  },

  _displayImage = function(name) {

    du.el(elem, params.selectors.imageCanvas).innerHTML = '';

    if (!name) return _displayEmptyMessage();

    var img = document.createElement( 'img' );

    img.setAttribute( 'src', params.path + params.prefix + name + '?' + Math.random() );

    du.addEvent(img, 'load', function(){

      params.onImageLoad();

    });

    du.el(elem, params.selectors.imageCanvas).appendChild(img);

  },

  _displayEmptyMessage = function() {

    du.el(elem, params.selectors.imageCanvas).innerHTML = ejs.render( params.templates.empty, params.labels );

  },

  _displayMessage = function(message, type) {

    if (!message)
      if (type=='error')
        message = params.labels.error;
      else if (type=='success')
        message = params.labels.success;
      else
        message = params.labels.info;

    var infoElem = du.el(elem, params.selectors.info);

    du.removeClass(infoElem, params.classes.error);
    du.removeClass(infoElem, params.classes.success);

    if (type == 'error')
      du.addClass(infoElem, params.classes.error);
    else if (type == 'success')
      du.addClass(infoElem, params.classes.success);

    infoElem.innerHTML = message;

  },

  _toggleRemove = function() {

    if ( !removeElem ) {

      removeElem = du.el(elem, params.selectors.remove);

      du.addEvent(du.el(removeElem, 'a'), 'click', function(e) {

        du.preventDefault(e);

        if (locked) return;

        _lock();

        remote.get(params.remove, {timeout: 10000}, function(success, data) {

          _unlock();

          if (!success) return;

          if (!data.success) {

            du.el(elem, params.selectors.removeMessage).innerHTML = data.message?data.message:params.labels.removeError;

            return;
          }

          imageLoaded = false;

          if (params.onRemove) params.onRemove();

          _disableImageCredits();

          _displayImage(false);

          _toggleRemove();

        }, true);

      });

    }

    du.el(elem, params.selectors.removeMessage).innerHTML = '';

    removeElem.style.display = imageLoaded?'block':'none';

  },

  _declareCallback = function() {

    window[params.callbackName] = function(response) {
      _imageUploaded(response);
    };

  },

  _lock = function() {

    const loaderCanvas = du.el( params.selectors.loader );

    locked = true;

    du.el(elem, params.selectors.button).setAttribute( 'disabled', 'disabled' );

    du.addClass( du.el(elem, params.selectors.remove), params.classes.disabled);

    if (!spinner) spinner = new Spinner( params.spinner );

    spinner.spin();

    loaderCanvas.appendChild(spinner.el);

    du.removeClass( loaderCanvas, 'display-none' );

  },

  _unlock = function() {

    const loaderCanvas = du.el( params.selectors.loader );

    locked = false;

    du.el(elem, params.selectors.button).removeAttribute('disabled');

    du.removeClass(du.el(elem, params.selectors.remove), params.classes.disabled);

    du.addClass( loaderCanvas, 'display-none' );

    spinner.stop();

  },

  _fireEvent = function(elem, types) {

    if (elem === null || elem === undefined) return;
    if (typeof types == 'string') types = [types];
    du.forEach(types, function(type){
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

    if ( !du.el( params.canvas ) ) return false;

    elem = document.createElement('div');
    elem.className = params.classes.main;

    _.extend( params.labels, {
      imageCreditsLabel: JSON.parse( du.el( params.canvas ).getAttribute( 'attr-credits-label' ) ),
      imageCreditsInfo: JSON.parse( du.el( params.canvas ).getAttribute( 'attr-credits-info' ) ),
      imageCreditsPlaceholder: JSON.parse( du.el( params.canvas ).getAttribute( 'attr-credits-placeholder' ) ) || params.labels.imageCreditsPlaceholder
    } );

    elem.innerHTML = ejs.render( params.templates.main, params.labels );

    du.el( params.canvas ).appendChild(elem);

    return true;

  };

  run();

};
