"use strict";

let schema = require( 'validators/schema' ),

utils = require( 'utils' );

schema.register( {
  text: require( 'validators/text' ),
  boolean: require( 'validators/boolean' ),
  link: require( 'validators/link' ),
  number: require( 'validators/number' ),
  date: require( 'validators/date' )
} );

module.exports = schema( utils.extend( {},
  require( './privateFields' ), 
  require( './publicFields' ) 
) );

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
    protected: true,
    list: false
  },
  'slug',
  {
    db: 'uid',
    obj: 'uid',
    protected: true
  },
  {
    db: 'official',
    obj: 'official',
    protected: true
  },
  'title',
  'description',
  'url',
  {
    db: 'image',
    obj: 'image',
    protected: true
  },
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
    type: 'json',
    list: false
  },
  {
    db: 'credentials',
    obj: 'credentials',
    type: 'json',
    internal: true,
    protected: true,
    list: false
  }
];