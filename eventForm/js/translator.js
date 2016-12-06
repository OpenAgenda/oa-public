"use strict";

const base64 = require( 'utils/base64' );

const utils = require( 'utils' );

const update = require( 'react-addons-update' );

const onTranslationCheck = require( 'react-form-components/lib/onTranslationCheck' );

const async = require( 'async' );

const translators = require( 'translators' );

const du = require( 'dom-utils' );

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

  context.setState( {
    translation: update( context.state.translation, { translating: { $set: true } } )
  } );

  let objToTranslate = {};

  fields.forEach( f => objToTranslate[ f ] = context.state[ f ] ? context.state[ f ][ sourceLanguage ] : '' );

  translator( objToTranslate, sourceLanguage, destLanguages, ( err, translatedObj ) => {

    if ( err ) {

      context.setState( {
        translation: update( context.state.translation, { 
          translating: { $set: false },
          message: { $set: 'Could not complete translation' }
        } )
      } );

      return cb( err );

    }

    Object.keys( translatedObj ).forEach( field => {

      let translations = translatedObj[ field ];

      updated[ field ] = context.state[ field ] ? {} : { $set: {} };

      Object.keys( translations ).forEach( lang => {

        if ( context.state[ field ] ) {

          updated[ field ][ lang ] = { $set: translations[ lang ] }

        } else {

          updated[ field ][ '$set' ][ lang ] = translations[ lang ];

        }

      } );

    } );

    updated.translation = {
      translating: { $set: false }
    }

    let newState = update( context.state, updated );

    context.setState( newState );

    fields.forEach( field => {

      context.onChange( field )( newState[ field ] );

    } );

    setTimeout( () => {

      du.scrollTo( 'bottom' );

    }, 200 );

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

  context.setState( update( context.state, {
    translation: {
      checked: {
        $set: onTranslationCheck( context.state.translation.checked, check, language )
      }
    }
  } ) );

}