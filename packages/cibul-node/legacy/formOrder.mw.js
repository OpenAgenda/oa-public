"use strict";

const _ = require( 'lodash' );

const agendas = require( '@openagenda/agendas' );
const formSchemas = require( '@openagenda/form-schemas' );

const standardFields = [ 'image', 'title', 'description', 'keywords', 'longDescription', 'conditions', 'registration', 'accessibility', 'age', 'references', 'location', 'timings' ];

module.exports = async ( req, res, next ) => {

  const agenda = await _getAgenda( req.params.slug );

  const fs = await ( agenda.formSchemaId
    ? formSchemas.get( agenda.formSchemaId )
    : formSchemas.legacy.get( agenda.id ) );

  // fs.fields is the order!
  //const order = fs.fields.map( f => f.field );

  const order = ( agenda.formSchemaId ? _customOrder : _defaultOrder )( fs ? fs.fields : [] );

  // if a form schema is defined, it is the reference for order.
  // if it derives from store custom fields, legacy order applies.

  res.json( order );

}


function _customOrder( fields ) {

  const specifiedOrder = fields.map( f => _.pick( f, [ 'field', 'origin' ] ) );

  const remainingStandardFields = standardFields.filter( f => !specifiedOrder.map( o => o.field ).includes( f ) );

  return specifiedOrder.concat( remainingStandardFields.map( f => ( { field: f } ) ) );

}


function _defaultOrder( fields ) {

  // separate tag fields from category fields from custom fields

  const defaultOrder = fields.filter( f => f.origin === 'categories' ).map( f => _.pick( f, [ 'field', 'origin' ] ) )

    .concat( fields.filter( f => f.origin === 'tags' ).map( f => _.pick( f, [ 'field', 'origin' ] ) ) )

    .concat( standardFields.map( f => ( { field: f } ) ) );

  const customFieldNames = fields.filter( f => f.origin === 'custom' ).map( f => _.pick( f, [ 'field', 'origin' ] ) );

  defaultOrder.splice.apply( defaultOrder, [ defaultOrder.map( o => o.field ).indexOf( 'age' ) + 1, 0 ].concat( customFieldNames ) );

  return defaultOrder;

}


function _getAgenda( slug, field = null ) {

  return new Promise( ( rs, rj ) => {

    agendas.get( { slug }, { internal: true, private: null }, ( err, agenda ) => {

      if ( err ) return rj( err );

      if ( !agenda ) return rs( null );

      if ( field === null ) return rs( agenda );

      rs( agenda[ field ] );

    } );

  } );

}