var utils = require( '@openagenda/utils' );

module.exports = function( params ) {

  params = utils.extend({

    labels: {
      title: 'Title',
      description: 'Description',
      address: 'Address',
      location: 'Location',
      noLocation: 'No location is defined',
      placename: 'The name of the place',
      tags: 'The tags',
      freeText: 'The Free Text field',
      empty: '%noun% cannot be empty',
      max: '%noun% cannot exceed %max% characters',
      timings: 'Timings',
      noDates: 'There must be at least one date for each location'
    },

    title: { max: 140 },
    description: { max: 200 },
    tags: { max: 255 },
    freeText: { max: 10000 },
    placename: { max: 100 },
    address: { max: 255 },
    conditions: { max: 255 }

  }, params);

  var langs,

  updateLanguages = function( languages ) {

    langs = languages;

  },

  process = function(field, value) {

    _validators[field](value);

  },

  processFull = function(event) {

    var errors = [];


    // if some fields are missing in any of the languages, set them to empty
    /*utils.forEach(['title', 'description', 'tags', 'freeText', 'conditions' ], function(field) {
      if (typeof event[field] == 'undefined') event[field] = {};
    });*/

    /*utils.forEach(langs, function(lang) {

      try { process('title', event['title'][lang]) } catch(e) { errors.push( utils.extend( e, { lang: lang } ) ); }
      try { process('description', event['description'][lang]) } catch(e) { errors.push( utils.extend( e, { lang: lang } ) ); }
      try { process('tags', event['tags'][lang]) } catch(e) { errors.push( utils.extend( e, { lang: lang } ) ); }
      try { process('freeText', event['freeText'][lang]) } catch(e) { errors.push( utils.extend( e, { lang: lang } ) ); }
      try { process('conditions', event['conditions'][lang]) } catch(e) { errors.push( utils.extend( e, { lang: lang } ) ); }

    });*/

    
    if ( event.location ) {

      try { process('placename', event.location.name) } catch(e) { if (!contains(errors, e)) errors.push(e); }
      try { process('address', event.location.address) } catch(e) { if (!contains(errors, e)) errors.push(e); }

    } else {

      errors.push( {
        field: 'location',
        label: params.labels.location,
        message: params.labels.noLocation
      } );
      
    }

    try { process( 'timings', event.timings ) } catch(e) { if (!contains(errors, e)) errors.push(e); }

    return errors;

  },


  _validators = {

    location: function( value ) {



    },

    title: function ( value ) {

      _shouldNotBeEmpty('title', value);

      _maxLength('title', value);

    },

    description: function( value ) {

      _shouldNotBeEmpty('description', value);

      _maxLength('description', value);

    },

    tags: function( value ) {

      _maxLength('tags', value);

    },

    conditions: function( value ) {

      _maxLength( 'conditions', value );

    },

    freeText: function( value ) {

      _maxLength('freeText', value);

    },

    placename: function( value ) {

      if (typeof value !== 'string') value = '';

      _shouldNotBeEmpty( 'placename', value );

      _maxLength( 'placename', value );

    },

    address: function(value) {

      if (typeof value !== 'string') value = '';

      _shouldNotBeEmpty('address', value);

      _maxLength('address', value);

    },

    timings: function(timings) {

      if ( typeof timings != 'object' ) timings = [];

      if ( !timings.length ) {

        throw {
          field: 'timings',
          label: params.labels.timings,
          message: params.labels.noDates
        }

      }

    }

  },

  _maxLength = function(field, value) {

    if (typeof value == 'string' && value.length > params[field].max) {

      throw {
        field: field,
        label: params.labels[ field ],
        message: params.labels.max.replace( '%max%', params[field].max).replace( '%noun%', params.labels[field] )
      }

    }

  },

  _shouldNotBeEmpty = function( field, value ) {

    if (typeof value == 'undefined' || !value.length) {

      throw {
        field: field,
        label: params.labels[ field ],
        message: params.labels.empty.replace( '%noun%', params.labels[ field ] )
      }

    }

  };

  return {
    process: process,
    processFull: processFull,
    updateLanguages: updateLanguages
  }

};

function contains( arr, i ) {

  return arr.indexOf( i ) !== -1;

}