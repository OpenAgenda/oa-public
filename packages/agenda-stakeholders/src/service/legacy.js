"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );

const defaultFields = require( '../iso/defaults' ).fields;

const defaultSettings = {
  fields: []
};

let knex, schemas;

module.exports = Object.assign( agendaId => {

  return {
    get,
    setDefault,
    clear
  }

  function get( cb ) {

    w().then( () => {

      return knex( schemas.agenda )

      .where( {
        id: agendaId
      } )

      .limit( 1 ).offset( 0 );

    } )

    .then( rows => {

      let store = {},

      s =  _.extend( {}, defaultSettings );

      if ( !rows.length ) {

        return s;

      }

      try {

        store = JSON.parse( rows[ 0 ].store || '{}' );

      } catch( e ) {

        log( 'error', 'could not parse store: %s', rows[ 0 ].store );

        return s;

      }

      if ( !store.cFields ) {

        return s;

      }

      return  _.extend( {}, defaultSettings, {
        
        fields: Object.keys( store.cFields )

        .map( f => defaultFields.filter( lf => lf.field == f )[ 0 ] )

      } )

    } )

    .done( settings => cb( null, settings ), cb );

  }

  function clear( cb ) {

    w().then( () => {

      return knex( schemas.agenda )

        .select( 'store' )

        .where( {
          id: agendaId
        } );

    } )

    .then( rows => {

      let store;

      if ( !rows.length ) {

        throw new Error( 'agenda not found: ' + agendaId );

      }

      try {

        store = JSON.parse( rows[ 0 ].store );

      } catch( e ) {

        throw new Error( 'could not parse store of agenda ' + agendaId );

      }

      return store;

    } )

    .then( store => {

      store.cFields = undefined;

      return knex( schemas.agenda )

        .update( { store: JSON.stringify( store ) } )

        .where( { id: agendaId } );

    } )

    .then( affected => {

      if ( !affected ) {

        throw new Error( 'could not complete store update of agenda ' + agendaId );

      }

    } )

    .done( () => cb(), cb );

  }

  function setDefault( cb ) {

    w().then( () => {

      return knex( schemas.agenda )

      .select( 'store' )

      .where( { id: agendaId } )

      .then( rows => {

        if ( !rows.length ) {

          throw new Error( 'did not find agenda ' + agendaId );

        }

        try {

          return JSON.parse( rows[ 0 ].store || '{}' );

        } catch( e ) {

          throw new Error( 'could not parse store of agenda ' + agendaId );

        }

      } );

    } )

    .then( store => {

      store.cFields = {};

      defaultFields.forEach( d => {

        store.cFields[ d.field ] = [];

      } );

      return store;

    } )

    .then( store => {

      return knex( schemas.agenda )

      .update( { store: JSON.stringify( store ) } )

      .where( { id: agendaId } );

    } )

    .then( affected => {

      if ( !affected ) throw new Error( 'could not update store of agenda ' + agendaId );

    } )

    .done( () => cb(), cb );

  }

}, { init } );


function init( c ) {

  knex = c.knex;

  schemas = c.schemas;

}