var cibulEventValidator = function(params) {

  params = extend({

    labels: {
      title: 'The title',
      description: 'The description',
      address: 'The address',
      placename: 'The name of the place',
      tags: 'The tags',
      freeText: 'The Free Text field',
      empty: '%noun% cannot be empty',
      max: '%noun% cannot exceed %max% characters',
      noDates: 'There must be at least one date for each location'
    },

    title: { max: 140 },
    description: { max: 200 },
    tags: { max: 255 },
    freeText: { max: 10000 },
    placename: { max: 100 },
    address: { max: 255 }

  }, params);

  var process = function(field, value) {

    _validators[field](value);

  },

  processFull = function(event) {

    var langs = _extractLanguages(event)
      , errors = [];


    // if some fields are missing in any of the languages, set them to empty
    forEach(['title', 'description', 'tags', 'freeText'], function(field) {
      if (typeof event[field] == 'undefined') event[field] = {};
    });

    forEach(langs, function(lang) {

      try { process('title', event['title'][lang]) } catch(e) { if (!contains(errors, e)) errors.push(e); }
      try { process('description', event['description'][lang]) } catch(e) { if (!contains(errors, e)) errors.push(e); }
      try { process('tags', event['tags'][lang]) } catch(e) { if (!contains(errors, e)) errors.push(e); }
      try { process('freeText', event['freeText'][lang]) } catch(e) { if (!contains(errors, e)) errors.push(e); }

    });

    forEach(event.locations, function(location) {

      try { process('placename', location.name) } catch(e) { if (!contains(errors, e)) errors.push(e); }
      try { process('address', location.address) } catch(e) { if (!contains(errors, e)) errors.push(e); }
      try { process('dates', location.dates) } catch(e) { if (!contains(errors, e)) errors.push(e); }

    });

    return errors;

  },

  _extractLanguages = function(event) {

    var langs = [];

    forEach(['title', 'description', 'tags', 'freeText'], function(field) {

      for (var lang in event[field])
        if (!contains(langs, lang))  langs.push(lang);

    });

    return langs;

  },

  _validators = {

    title: function (value) {

      _shouldNotBeEmpty('title', value);

      _maxLength('title', value);

    },

    description: function(value) {

      _shouldNotBeEmpty('description', value);

      _maxLength('description', value);

    },

    tags: function(value) {

      _maxLength('tags', value);

    },

    freeText: function(value) {

      _maxLength('freeText', value);

    },

    placename: function(value) {

      if (typeof value !== 'string') value = '';

      _shouldNotBeEmpty('placename', value);

      _maxLength('placename', value);

    },

    address: function(value) {

      if (typeof value !== 'string') value = '';

      _shouldNotBeEmpty('address', value);

      _maxLength('address', value);

    },

    dates: function(dates) {

      if (typeof dates != 'object') dates = [];

      if (!dates.length) throw params.labels.noDates;

    }

  },

  _maxLength = function(field, value) {

    if (typeof value == 'string' && value.length > params[field].max) throw params.labels.max.replace('%max%', params[field].max).replace('%noun%', params.labels[field]);

  },

  _shouldNotBeEmpty = function(field, value) {
    
    if (typeof value == 'undefined' || !value.length) throw params.labels.empty.replace('%noun%', params.labels[field]);

  };

  return {
    process: process,
    processFull: processFull
  }

};