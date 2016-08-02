"use strict";

let schema = require( 'validators/schema' );

schema.register( {
  text: require( 'validators/text' ),
  boolean: require( 'validators/boolean' ),
  link: require( 'validators/link' ),
  number: require( 'validators/number' ),
  date: require( 'validators/date' )
} );

module.exports = agendaSchema();

module.exports.map = [
  {
    db: 'id',
    obj: 'id',
    internal: true,
    protected: true
  },
  {
    db: 'owner_id',
    obj: 'ownerId',
    internal: true,
    protected: true
  },
  'slug',
  {
    db: 'uid',
    obj: 'uid',
    protected: true
  },
  'title',
  'description',
  'url',
  {
    db: 'updated_at',
    obj: 'updatedAt'
  },
  {
    db: 'created_at',
    obj: 'createdAt'
  },
  {
    db: 'settings',
    obj: 'settings',
    type: 'json'
  },
  {
    db: 'credentials',
    obj: 'credentials',
    type: 'json',
    internal: true,
    protected: true
  }
];

function agendaSchema() {

  // this is in a function to keep module.exports on top

  return schema( {
    title: { 
      type: 'text', 
      min: 2, 
      max: 255, 
      optional: false
    },
    slug: {
      type: 'text',
      min: 2,
      max: 255,
      optional: false
    },
    uid: {
      type: 'number',
      optional: false
    },
    ownerId: {
      type: 'number',
      optional: false
    },
    updatedAt: {
      type: 'date',
      optional: false
    },
    createdAt: {
      type: 'date',
      optional: false
    },
    description: {
      type: 'text',
      max: 150
    },
    image: {
      type: 'text'
    },
    url: {
      type: 'link'
    },
    credentials: {
      moderators: {
        type: 'boolean',
        default: false
      },
      tags: {
        type: 'boolean',
        default: false
      },
      embedsHead: {
        type: 'boolean',
        default: false
      },
      embedsTemplates: {
        type: 'boolean',
        default: false
      }
    }

  } );
  
}