var cibulEventSubmit = function(params) {

  params = extend({
    ajax: false,
    timeout: 5000,
    beforeNext: false, // in case submission is ajax, this callback can be called before the next form is loaded
    canvas: el('.js_form_canvas'),
    template: '<ul class="event-errors js_errors"></ul><div class="js_actions actions"></div>',
    allowDraft: false,
    classes: {
      main: 'submit',
      error: 'error',
      lightboxFrame: 'lightbox-frame wsq',
      lightboxCanvas: 'lightbox-canvas',
      lightboxButtons: 'lightbox-buttons'
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
      removeNo: 'Cancel'
    },
    events: {
      uidfetch: 'euidfetch',
      validate: 'evalidate',
      fetchEncoded: 'efetchencoded',
      heightChange: 'heightchange',
      complete: 'formcomplete',
      clear: 'eventclear',
      submit: 'formsubmit'
    }
  }, params);

  var elem,

  eh = sEventHandler.getInstance(), uid = false, draft = true,

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

        _addButton('remove');
      }

    });

  },

  _addButton = function(name) {

    var button = document.createElement('button');

    button.innerHTML = params.labels[name];

    if (params.classes[name]) button.className = params.classes[name];

    addEvent(button, 'click', function(e) {

      preventDefault(e);

      _process[name](function(encodedEvent) {

        var url = decodeURIComponent(params[name]).replace('{uid}', uid);

        if (encodedEvent)
          _post(url, encodedEvent);
        else
          window.location.href = url;
        
      });

    });

    el(elem, params.selectors.actions).appendChild(button);

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
      el('body').appendChild(form); //IE8

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

    el('body').innerHTML = newContent;

  },

  _clear = function() {

    var child;

    while (child = childObject(el('body'))) {

      el('body').removeChild(child);

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

    eh.trigger(params.events.validate, { onChange: _displayErrors, onSuccess: function() {

      if (postEvent) {

        eh.trigger(params.events.fetchEncoded, function(encodedEvent) {

          onSuccess(encodedEvent);

        });

      } else {
        onSuccess();
      }

    }});

  },

  _displayErrors = function(success, errors) {

    el(elem, params.selectors.errors).innerHTML = '';

    if (success) return;

    forEach(errors, function(error) {

      var er = document.createElement('li');

      er.innerHTML = error;

      er.className = params.classes.error;

      el(elem, params.selectors.errors).appendChild(er);

    });

    eh.trigger(params.events.heightChange);

  },

  _createElement = function() {

    elem = document.createElement('div');

    elem.className = params.classes.main;

    elem.innerHTML = new EJS({text: params.template }).render(params.labels);

    params.canvas.appendChild(elem);

  };

  run();

};