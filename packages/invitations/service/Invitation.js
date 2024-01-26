"use strict";

const _ = require( 'lodash' );
const schema = require( '@openagenda/validators/schema' );
const { text, email, pass, number } = require( '@openagenda/validators' );
const { mapSeries } = require( 'async' );

let config;
let service;
let knex;

schema.register( {
  text,
  email,
  pass,
  number
} );


class Invitation {

  constructor( data ) {
    data.store = JSON.parse( data.store || '{}' );
    this._data = data;
  }

  get id() {
    return this._data.id;
  }

  get email() {
    return this._data.email;
  }

  get token() {
    return this._data.token;
  }

  get data() {
    return this._data.store;
  }

  set email( value ) {
    this._data.email = value;
  }

  addAction( name, params ) {

    const { store } = this._data;

    if ( !store.actions ) store.actions = [];

    if ( !_.get( config.actions, name ) ) {

      return Promise.resolve( {
        errors: [ {
          code: 'action.notFound',
          message: 'action not found in config',
          origin: name
        } ]
      } );

    }

    const id = store.nextId = ++store.nextId || 1;
    const action = {
      id,
      name,
      params: [].concat( params )
    };

    store.actions.push( action );

    try {

      Invitation.validate( this._data );

    } catch ( e ) {

      console.log( 'NOT VALID', e );

      store.actions.pop();
      return Promise.resolve( { errors: e } );

    }

    return this.save()
      .then( () => new Promise( ( resolve, reject ) => {

        config.interfaces.onAssign( action, this, err => err ? reject( err ) : resolve( this ) );

      } ) );

  }

  removeAction( id ) {

    const { store } = this._data;

    if ( !store.actions ) store.actions = [];

    store.actions = store.actions.filter( action => action.id !== id );

    return this.save().then( () => this );

  }

  execute( data ) {

    const { store } = this._data;
    const errors = [];

    if ( !store.actions ) store.actions = [];

    return new Promise( ( resolve, reject ) => {

      mapSeries( store.actions, ( item, cb ) => {

        const action = _.get( config.actions, item.name );

        if ( !action ) {

          errors.push( {
            name: item.name,
            code: 'action.notExists',
            message: 'action is not found in config'
          } );

          return cb( null );

        }

        action.apply( null, [data, [].concat( item.params )].concat( cb ) );

      }, ( err, results ) => {

        if ( err ) reject( err );

        resolve( { results, errors } );

      } );

    } )
      .then( results => {

        return knex( config.schemas.invitation ).where( { id: this.id } )
          .update( { processedAt: new Date() } )
          .then( () => results );

      } );

  }

  remove() {

    return knex( config.schemas.invitation ).where( { id: this.id } )
      .del();

  }

  save() {

    return knex( config.schemas.invitation ).where( { id: this.id } )
      .update( {
        store: JSON.stringify( this.data ),
        email: this.email,
        token: this.token
      } );

  }

}

Invitation.init = ( c, s, k ) => {
  config = c;
  service = s;
  knex = k;
}

Invitation.validate = schema( {
  email: {
    type: 'email',
    optional: false
  },
  token: {
    type: 'text',
    optional: false
  },
  store: {
    fields: {
      nextId: {
        type: 'number'
      },
      actions: {
        list: true,
        fields: {
          name: {
            type: 'text',
            optional: false
          },
          params: {
            type: 'pass',
            list: true
          }
        }
      }
    }
  }
} );

module.exports = Invitation;
