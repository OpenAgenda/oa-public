"use strict";

var utils = require( 'utils' ),

rUtils = require( '../reactUtils' ),

eventValidator = require( './eventValidator' );

module.exports = function( params ) {

  params = utils.extend({
    event: {},
    events: {
      log: 'log',
      fetch: 'eventfetch',
      description: {
        fetch: 'edescriptionfetch',
        write: 'edescriptionfieldsend',
        remove: 'edescriptionfieldremove'
      },
      location: {
        fetch: 'elocationfetch',
        remove: 'elocationremove',
        write: 'elocationsend',
      },
      image: {
        fetch: 'eimagefetch',
        remove: 'eimageremove',
        write: 'eimagesend'
      },
      agenda: {
        fetch: 'eagendafetch',
        write: 'eagendawrite'
      },
      customfields: {
        write: 'ecustomfieldssend'
      },
      singleField: {
        write: 'esinglesend'
      },
      uidfetch: 'euidfetch',
      validate: 'evalidate',
      fetchEncoded: 'efetchencoded',
      languageChange: 'elanguageschange',
      fetchLanguages: 'elanguagesfetch',
      clear: 'eventclear'
    },
    descriptionFields: ['title', 'description', 'tags', 'freeText']

  }, params);

  var eh = rUtils.eh,

  validator = eventValidator({labels: params.labels}),

  nextLocationIndex = 0,

  currentErrors = {},

  event = params.event, onValidate = false, languages = [],

  callbackIds = [], // keep track of callbacks used by event handler

  init = function() {

    if (Object.prototype.toString.call(event) === '[object Array]') event = {};

    _on( params.events.log, function() {

      console.log( event );

    } );

    _on( params.events.fetch, function( cb ) {

      cb( JSON.parse( JSON.stringify( event ) ) );

    } );

    _on( params.events.description.fetch, function( cb ) {

      cb({
        title: event.title,
        description: event.description,
        tags: event.tags,
        freeText: event.freeText,
        conditions: event.conditions
      });

    });

    _on( params.events.description.write, function( data ) {

      currentErrors = data.errors;

      if ( !event[data.name] ) event[ data.name ] = {};

      event[ data.name ] = JSON.parse( JSON.stringify( data.value ) );

      if (data.callback) data.callback(error);

      _evaluate();

    });

    _on( params.events.location.fetch, function(cb) {

      cb( event.location, event.timings );

    });

    _on( params.events.location.write, function( location ) {

      if ( location.timings ) {

        event.timings = JSON.parse( JSON.stringify( location.timings ) );

      }

      event.location = JSON.parse( JSON.stringify( location ) );

      if ( event.location.timings ) delete event.location.timings;

      _evaluate();

    });

    // get agenda information

    _on(params.events.agenda.fetch, function( data ) {

      if (event.agendas) for (var a in event.agendas) {

        if (event.agendas[a].uid == data.uid) return data.callback(event.agendas[a]);

      }

      data.callback(false);

    });


    // write agenda information in existing or new entry

    _on(params.events.agenda.write, function( data ) {

      if (!event.agendas) event.agendas = [];

      for (var i = event.agendas.length - 1; i >= 0; i--) {
        if (event.agendas[i].uid == data.uid) return event.agendas[i] = data;
      }

      event.agendas.push(data);

    });


    // update agenda information

    _on( params.events.image.fetch, function(callback) {

      callback(event.image?{image: event.image }:false);

    });

    _on( params.events.image.remove, function() {

      event.image = false;

      _evaluate();

    });

    _on( params.events.image.write, function(data) {

      if (data.image) event.image = data.image;

      _evaluate();

    });

    _on( params.events.singleField.write, function( data ) {

      currentErrors = data.errors;

      event[ data.name ] = JSON.parse( JSON.stringify( data.value ) );

    });

    _on( params.events.customfields.write, function( data ) {

      event.custom = data.values;

      currentErrors = data.errors;

      _evaluate();

    } );

    _on( params.events.uidfetch, function( cb ) {

      cb( {
        uid: event.uid || false, 
        draft: !!event.draft
      } );

    });

    _on( params.events.validate, function(callbacks) {

      onValidate = callbacks.onChange;

      _evaluate( callbacks.onSuccess );

    } );

    _on( params.events.fetchEncoded, function( cb ) {

      cb( JSON.stringify( event ) );

    });

    _on( params.events.fetchLanguages, function( cb ) {

      cb( languages );

    });

    _on(params.events.languageChange, _updateLanguages );

    _on(params.events.clear, function() {

      // unregister methods
      utils.forEach(callbackIds, function(id) { 
        eh.cancel(id);
      });

    });

  },

  _on = function(eventName, callback) {

    callbackIds.push(eh.on(eventName, callback));

  },

  _validate = function(field, value) {

    validator.process(field, value);

  },

  _evaluate = function(onSuccess) {

    if ( onValidate || onSuccess ) _validateEvent( _getCurrentErrors(), function(success, errors ) {

      if (success && onSuccess) onSuccess();

      if (onValidate) onValidate(success, errors );

    });

  },

  _getCurrentErrors = function() {

    var errs = [];

    for ( var i in currentErrors ) {

      errs.push( currentErrors[ i ] );

    }

    return errs;

  },

  _setCurrentErrors = function( newErrors ) {

    for ( var i in newErrors ) {

      if ( !newErrors[ i ] ) {

        delete currentErrors[ i ];

      } else {

        currentErrors[ i ] = newErrors[ i ];

      }

    }

  },

  _extract = function( attr, obj, filterIfFalse ) {

    var extract = {};

    if ( typeof filterIfFalse == 'undefined' ) filterIfFalse = false;

    for( var i in obj ) {

      if ( !filterIfFalse || ( obj[ i ][ attr ] !== false ) ) {

        extract[ i ] = obj[ i ][ attr ];

      }

    }

    return extract;

  },

  _validateEvent = function(preErrors, callback) {

    var errors = validator.processFull( event ),

    concatenated = preErrors.concat( errors );

    console.log( errors );

    callback( concatenated.length?false:true, concatenated );

  },

  _updateLanguages = function( newLanguages ) {

    // compare with existing

    if (!_compareArrays(newLanguages, languages)) {

      // remove each deleted language from event object
      
      languages.filter( function( l ) {

        return newLanguages.indexOf( l ) == -1;

      }).forEach( function( l ) {

        [ 'title', 'description', 'freeText', 'tags', 'conditions' ].forEach( function( field ) {

          delete event[ field ][ l ];

        } );

      });
      
      languages = newLanguages;

      validator.updateLanguages( languages );

      eh.trigger( params.events.languageChange, languages );

    }

  },

  //http://stackoverflow.com/questions/7837456/comparing-two-arrays-in-javascript
  _compareArrays = function(a, b) {

    // if the other array is a falsy value, return
    if (!a) return false;

    // compare lengths - can save a lot of time
    if (b.length != a.length) return false;

    for (var i = 0; i < b.length; i++) {
      // Check if we have nested arrays
      if (b[i] instanceof Array && a[i] instanceof Array) {
        // recurse into the nested arrays
        if (!b[i].compare(a[i]))
          return false;
      }
      else if (b[i] != a[i]) {
        // Warning - two different object instances will never be equal: {x:20} != {x:20}
        return false;
      }
    }
    return true;
  };

  init();

};