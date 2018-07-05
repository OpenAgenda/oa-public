"use strict";

module.exports = [ {
  uid: 1111,
  timezone: 'Europe/Paris',
  search_internals_keywords: [ 'janine', 'ines', 'vitrine' ],
  timings: [ {
    begin: '2017-08-03T09:00:00Z',
    end: '2017-08-03T19:00:00Z'
  }, {
    begin: '2027-08-02T09:00:00Z',
    end: '2027-08-02T19:00:00Z'
  } ],
  location: {
    uid: 1,
    name: 'la boutique',
    latitude : 48.8675959,
    longitude : 2.3516408,
    department: 'Paris'
  },
  custom: {
    multichoicefield: [ 1, 4 ],
    singlechoicefield: 10,
    textfield: 'Hello, is there anybody out there'
  }
}, {
  uid: 2222,
  timezone: 'Europe/Paris',
  title: 'mocha',
  timings: [ {
    begin: '2017-08-05T09:00:00Z',
    end: '2017-08-05T19:00:00Z'
  }, {
    begin: '2017-08-05T09:00:00Z',
    end: '2017-08-05T19:00:00Z'
  } ],
  location: {
    uid: 2,
    name: 'Café de la Gaité',
    latitude : 48.866964,
    longitude : 2.353406,
    department: 'Paris'
  },
  custom: {
    multichoicefield: [ 12 ],
    singlechoicefield: 14
  }
}, {
  uid: 3333,
  timezone: 'Europe/Paris',
  title: 'franchement',
  timings: [ {
    begin: '2017-08-07T09:00:00Z',
    end: '2017-08-07T19:00:00Z'
  }, {
    begin: '2017-08-08T09:00:00Z',
    end: '2017-08-08T19:00:00Z'
  } ],
  location: {
    uid: 3,
    name: 'Monument A La Victoire',
    latitude : 49.16075,
    longitude : 5.38461,
    department: 'Meuse'
  }
}, {
  uid: 4444,
  timezone: 'Europe/Paris',
  title: 'plante',
  timings: [ {
    begin: '2017-08-05T10:00:00Z',
    end: '2017-08-05T12:00:00Z'
  }, {
    begin: '2017-08-05T15:00:00Z',
    end: '2017-08-05T19:00:00Z'
  } ],
  location: {
    uid: 3,
    name: 'Monument A La Victoire',
    latitude : 49.16075,
    longitude : 5.38461,
    department: 'Meuse'
  }
} ];
