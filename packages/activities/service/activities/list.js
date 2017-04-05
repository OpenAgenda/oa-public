"use strict";

const _ = require( 'lodash' );
const parseListArguments = require( 'service-utils/parseListArguments' );
const promisePlusCb = require( 'service-utils/promisePlusCb' );
const schema = require( 'validators/schema' );
const validators = require( 'validators' );

let config;
let knex;
let service;

schema.register( {
  text: validators.text,
  pass: validators.pass,
  number: validators.number
} );

module.exports = Object.assign( list, { init } );

function init( { config: c, knex: k, service: s } ) {

  config = c;
  knex = k;
  service = s;

}

function list( identifiers ) {

  const args = parseListArguments.apply( null, Array.from( arguments ).slice( 1 ) );

  args.query = _.pick( args.query, [ 'actor', 'verb', 'object', 'target' ] );

  const validateArgs = schema( {
    query: {
      type: 'pass'
    },
    offset: {
      type: 'number'
    },
    limit: {
      type: 'number',
      max: 100
    },
    options: {
      type: 'pass'
    },
    cb: {
      type: 'pass'
    }
  } );

  const {
    query,
    offset: fromId,
    limit,
    options,
    cb
  } = validateArgs( args );

  const params = _.merge( {
    feeds: false // TODO get feeds in which the activities are
  }, options );

  const feedGetter = () => identifiers ? service.feed( identifiers ).get( { internal: true } ) : Promise.resolve();

  const promise = feedGetter()
    .then( feed => {

      const columnToSelect = [ 'id', 'actor', 'verb', 'object', 'target', 'store', 'created_at', 'updated_at' ]
        .reduce( ( prev, name ) => {
          prev.push( `${config.schemas.activity}.${name} as ${_.camelCase( name )}` );
          return prev;
        }, [] );

      const request = knex( config.schemas.activity ).column( columnToSelect )
        .where( query )
        .orderBy( 'id', 'desc' )
        .limit( limit );

      if ( fromId ) {
        request.where( 'id', '<', fromId );
      }

      if ( feed ) {
        request.join(
          config.schemas.feed_activity,
          config.schemas.feed_activity + '.activity_id',
          config.schemas.activity + '.id'
        );
      }

      return request
        .then( rows => {

          return rows.map( row => {

            row.store = JSON.parse( row.store );
            return row;

          } );

        } );

    } );

  return promisePlusCb( promise, cb );

};
