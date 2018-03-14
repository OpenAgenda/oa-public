"use strict";

const base64 = require( '@openagenda/utils/base64' );

const utils = require( '@openagenda/utils' );

const update = require( 'immutability-helper' );

const onTranslationCheck = require( '@openagenda/react-form-components/lib/onTranslationCheck' );

const async = require( 'async' );

const _ = {
  extend: require( 'lodash/extend' )
}

const translators = require( '@openagenda/translators' );

const du = require( '@openagenda/dom-utils' );

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

  function onProcess( lang ) {

    context.setState( {
      translation: update( context.state.translation, {
        translationProgress: { $set: [ sourceLanguage, lang ] }
      } )
    } )

  }

  translator( objToTranslate, sourceLanguage, destLanguages, {
    onProcess
  }, ( err, translatedObj, timeouts ) => {

    if ( err ) {

      context.setState( {
        translation: update( context.state.translation, { 
          translating: { $set: false },
          message: { $set: 'Could not complete translation' }
        } )
      } );

      return cb( err );

    }

    updated.languages = { 
      $set: utils.unique( context.state.languages.concat( sourceLanguage ) ) 
    }

    translatedObj = _truncateOverflows( translatedObj, {
      title: 140,
      description: 255,
      freeText: 10000,
      keywords: 255,
      conditions: 255
    } );

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

      context.onChange( field )( newState[ field ] || {} );

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

      translator = translators.reverso( _.extend( { timeout: 10000, }, config ) );

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


function _truncateOverflows( texts, max ) {

  let truncated = {};

  Object.keys( texts ).forEach( field => {

    Object.keys( texts[ field ] ).forEach( lang => {

      if ( !truncated[ field ] ) truncated[ field ] = {};

      if ( texts[ field ][ lang ].length <= max[ field ] ) {

        truncated[ field ][ lang ] = texts[ field ][ lang ];

      } else {

        truncated[ field ][ lang ] = texts[ field ][ lang ].substr( 0, max[ field ] - 3 ) + '...';

      }

    } );

  } );


  console.log( truncated );

  return truncated;

}