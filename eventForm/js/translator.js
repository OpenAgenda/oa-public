"use strict";

const base64 = require( 'utils/base64' );

const utils = require( 'utils' );

const update = require( 'react-addons-update' );

const async = require( 'async' );

const translators = require( 'translators' );

module.exports = translate;

translate.init = init;

translate.change = change;

// EventForm component 'this'
let context, 

// names of fields to translate
  fields,

// translator
  translator;

function translate( cb ) {

  if ( !translator ) return cb();

  let sourceLanguage = context.state.translation.source,

  destLanguages = context.state.translation.checked,

  updated = {
    languages: { $set: utils.unique( context.state.languages.concat( destLanguages ).concat( sourceLanguage ) ) }
  };

  async.eachSeries( fields, ( field, ecb ) => {

    let sourceValue = context.state[ field ][ sourceLanguage ];

    updated[ field ] = {};

    translator( sourceValue, sourceLanguage, destLanguages, ( err, translations ) => {

      if ( err ) return ecb( err );

      Object.keys( translations ).forEach( lang => {

        updated[ field ][ lang ] = { $set: translations[ lang ] };

      } );

      ecb( null );

    } );

  }, err => {

    if ( err ) return cb( err );

    let newState = update( context.state, updated );

    context.setState( newState );

    Object.keys( updated ).forEach( field => {

      context.onChange( field )( newState[ field ] );

    } );

    cb();

  } );
 
}

function init( ctx, options, f ) {

  let config;

  context = ctx;

  fields = f;

  if ( options ) {

    try {

      config = JSON.parse( base64.decode( options ) );

      translator = translators.reverso( config );

    } catch( e ) {

      console.log( 'error parsing options: %s', e );

    }

  }

}


function change( check, language ) {

  let checked = context.state.translation.checked.concat( [] );

  if ( check ) {

    checked.push( language );

  } else {

    checked.splice( checked.indexOf( language ), 1, 0 );

  }

  context.setState( update( context.state, {
    translation: {
      checked: {
        $set: checked
      }
    }
  } ) );

}