"use strict";

var utils = require( '@openagenda/utils' ),

rUtils = require( '../reactUtils' ),

du = require( '../../../js/lib/domUtils' ),

_ = require( 'lodash' ),

remote = require( '../../../js/lib/remote/remote.mod' );

module.exports = function( params ) {

  params = utils.extend({
    ajax: false,
    timeout: 5000,
    beforeNext: false, // in case submission is ajax, this callback can be called before the next form is loaded
    canvas: '.js_form_canvas_below',
    template: '<div class="event-errors js_errors display-none"><p><%= hasErrors %></p><ul></ul></div><div class="js_actions submit-actions"></div>',
    allowDraft: false,
    classes: {
      main: 'submit cform',
      error: 'err',
      lightboxFrame: 'lightbox-frame wsq',
      lightboxCanvas: 'lightbox-canvas',
      lightboxButtons: 'lightbox-buttons',
      create: 'btn btn-primary',
      update: 'btn btn-primary',
      remove: 'btn btn-danger'
    },
    selectors: {
      actions: '.js_actions',
      errors: '.js_errors'
    },
    create: false,
    createdraft: false,
    update: false,
    publish: false,
    remove: false,
    labels: {
      create: 'Publish',
      createdraft: 'Create without publishing',
      update: 'Update',
      publish: 'Publish',
      remove: 'Remove',
      removeMessage: 'Are you sure you want to delete this event?',
      removeYes: 'Yes',
      removeNo: 'Cancel',
      hasErrors: 'Some fields need to be looked at before the form can be submitted'
    },
    events: {
      uidfetch: 'euidfetch',
      validate: 'evalidate',
      fetchEncoded: 'efetchencoded',
      heightChange: 'heightchange',
      complete: 'formcomplete',
      clear: 'eventclear',
      submit: 'formsubmit'
    },
    beforeSubmit: function( cb ) { cb() }
  }, params);

  var elem,

  eh = rUtils.eh, uid = false, draft = true,

  run = function() {

    _createElement();

    eh.trigger(params.events.uidfetch, function(data) {

      uid = data.uid;
      draft = data.draft;

      if (!uid) {
        // event is not created
        _addButton('create');
        if (params.allowDraft && params.createdraft) _addButton('createdraft');

      } else {

        _addButton('update');
        if (draft && params.allowDraft && params.publish) _addButton('publish');

      }

    });

  },

  _addButton = function( name ) {

    var button = document.createElement('button');

    button.innerHTML = params.labels[name];

    if (params.classes[name]) button.className = params.classes[name];

    du.addEvent(button, 'click', _evaluateSubmit.bind( null, name ) );

    du.el(elem, params.selectors.actions).appendChild(button);

  },

  _evaluateSubmit = function( name, e ) {

    if ( e ) du.preventDefault( e );

    params.beforeSubmit( function() {

      _process[ name ]( function( encodedEvent ) {

        params.onSubmit();

        var url = decodeURIComponent(params[name]).replace('{uid}', uid);

        if ( encodedEvent ) {

          _post( url, encodedEvent );

        } else {

          window.location.href = url;

        }

      });

    } );

  },

  _post = function(url, encodedEvent) {

    if (!params.ajax) {

      var form = document.createElement('form');
      form.setAttribute('method', 'post');
      form.setAttribute('action', url);

      var field = document.createElement('input');
      field.setAttribute('name', 'event');
      field.value = encodedEvent;

      form.appendChild(field);

      form.style.display = 'none'; //IE8
      du.el('body').appendChild(form); //IE8

      form.submit();

    } else {

      eh.trigger(params.events.submit);

      // maybe handover to the form controller here (taking err and response)

      remote.postXmlHttp(url, {data: {event: encodedEvent}, timeout: params.timeout}, function(responseType, data) {

        if (responseType !== 'success') throw 'submission response error';

        if (data.next || data.redirect) {

          _clear();

          eh.trigger(params.events.complete, data);

        } else if (data.partial) {

          _overwrite(data.partial);

        }

      });

    }

  },

  _overwrite = function(newContent) {

    _clear();

    du.el('body').innerHTML = newContent;

  },

  _clear = function() {

    var child;

    while (child = childObject(du.el('body'))) {

      du.el('body').removeChild(child);

    }

    eh.trigger(params.events.clear);

  },

  _process = {
    create: function(callback) { _checkValidation(callback, true); },
    createdraft: function(callback) { _checkValidation(callback, true); },
    update: function(callback) { _checkValidation(callback, true); },
    publish: function(callback) { _checkValidation(callback, true); },
    remove: function(callback) {
      lightbox({
        classes: {
          frame: params.classes.lightboxFrame,
          canvas: params.classes.lightboxCanvas,
          buttonBox: params.classes.lightboxButtons
        },
        message: params.labels.removeMessage,
        buttons: {
          ok: {label: params.labels.removeYes, onClick: callback },
          cancel: {label: params.labels.removeNo }
        }
      });
    }
  },

  _checkValidation = function(onSuccess, postEvent) {

    eh.trigger(params.events.validate, {
      onChange: _displayErrors,
      onSuccess: function() {

      if (postEvent) {

        eh.trigger(params.events.fetchEncoded, function(encodedEvent) {

          onSuccess(encodedEvent);

        });

      } else {
        onSuccess();
      }

    }});

  },

  _displayErrors = function( success, errors ) {

    var errorElem = du.el( elem, params.selectors.errors );

    if ( !errors.length || success ) {

      du.addClass( errorElem, 'display-none' );

    } else {

      var flattened = [];

      du.forEach( errors, function( error ) {

        if ( typeof error.message !== 'string' ) {

          for ( var l in error.message ) {

            flattened.push( {
              field: error.field,
              label: error.label,
              message: error.message[ l ],
              lang: l
            } );

          }

        } else {

          flattened.push( error );

        }

      } );

      du.el( errorElem, 'ul' ).innerHTML = '';

      du.forEach( flattened, function( error ) {

        var er = document.createElement('li');

        er.innerHTML =  '- <strong>' + error.label

        + ( error.lang ? ' (' + error.lang.toUpperCase() + ')' : '' )

        + '</strong>: ' + error.message;

        er.className = params.classes.error;

        du.el( errorElem, 'ul' ).appendChild( er );

      });

      du.removeClass( errorElem, 'display-none' );

    }

    eh.trigger( params.events.heightChange );

  },

  _createElement = function() {

    elem = document.createElement( 'div' );

    elem.className = params.classes.main;

    elem.innerHTML =  _.template( params.template )( params.labels );

    du.el( params.canvas ).appendChild(elem);

  };

  run();

};
