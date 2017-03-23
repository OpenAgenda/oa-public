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

translate.sourceChange = sourceChange;

// EventForm component 'this'
let context, 

// names of fields to translate
  fields,

// translator
  translator;

function translate( cb ) {

  if ( !translator ) return cb();

  let sourceLanguage = context.state.translation.source,

  destLanguages = context.state.translation.sets.filter( s => s.source === sourceLanguage )[ 0 ].checked,

  updated = {};

  context.setState( {
    translation: update( context.state.translation, { translating: { $set: true } } )
  } );

  let objToTranslate = {};

  fields.forEach( f => objToTranslate[ f ] = context.state[ f ] ? context.state[ f ][ sourceLanguage ] : '' );

  translator( objToTranslate, sourceLanguage, destLanguages, ( err, translatedObj, timeouts ) => {

    if ( err ) {

      context.setState( {
        translation: update( context.state.translation, { 
          translating: { $set: false },
          message: { $set: 'Could not complete translation' }
        } )
      } );

      return cb( err );

    }

    updated.languages = { 
      $set: utils.unique( context.state.languages.concat( sourceLanguage ) ) 
    }

    Object.keys( translatedObj ).forEach( field => {

      let translations = translatedObj[ field ];

      updated[ field ] = context.state[ field ] ? {} : { $set: {} };

      Object.keys( translations ).forEach( lang => {

        if ( updated.languages[ '$set' ].indexOf( lang ) === -1 ) {

          updated.languages[ '$set' ].push( lang );

        }

        if ( context.state[ field ] ) {

          updated[ field ][ lang ] = { $set: translations[ lang ] }

        } else {

          updated[ field ][ '$set' ][ lang ] = translations[ lang ];

        }

      } );

    } );

    updated.translation = {
      translating: { $set: false },
      timeouts: { $set: timeouts }
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

      translator = translators.reverso( Object.assign( { timeout: 10000, }, config ) );

    } catch( e ) {

      console.log( 'error parsing options: %s', e );

    }

  }

}


function change( check, sourceLanguage, language ) {

  context.setState( {
    translation: onTranslationCheck( context.state.translation, check, language )
  } );

}

function sourceChange( newSource ) {

  context.setState( {
    translation: update( context.state.translation, {
      source: { $set: newSource }
    } )
  } );

}