"use strict";

const schema = require( 'validators/schema' );

schema.register( {
  text: require( 'validators/text' ),
  integer: require( 'validators/integer' ),
  latitude: require( 'validators/latitude' ),
  longitude: require( 'validators/longitude' ),
  date: require( 'validators/date' )
} );

module.exports = schema( {
  uid: {
    type: 'integer',
    list: true
  },
  slug: {
    type: 'text',
    list: true
  },
  search: {
    type: 'text'
  },
  keyword: {
    type: 'text',
    list: true
  },
  lang: {
    type: 'text',
    list: true
  },
  locationUid: {
    type: 'integer',
    list: true
  },
  region: {
    type: 'text',
    list: true
  },
  department: {
    type: 'text',
    list: true
  },
  city: {
    type: 'text',
    list: true
  },
  countryCode: {
    type: 'text',
    min: 0,
    max: 2,
    list: true
  },
  contributorUid: {
    type: 'integer',
    list: true
  },
  geo: {
    fields: {
      northEast: {
        optional: false,
        fields: {
          lat: {
            type: 'latitude'
          },
          lng: {
            type: 'longitude'
          }
        }
      },
      southWest: {
        optional: false,
        fields: {
          lat: {
            type: 'latitude'
          },
          lng: {
            type: 'longitude'
          }
        }
      }
    }
  },
  localTime: {
    fields: {
      gte: {
        type: 'integer'
      },
      lte: {
        type: 'integer'
      }
    }
  },
  date: {
    fields: {
      gte: {
        type: 'date'
      },
      lte: {
        type: 'date'
      }
    }
  }
} );