'use strict';

/* eslint-disable */

const fs = require( 'fs' );
const path = require( 'path' );
const _ = require( 'lodash' );
const { sync: globSync } = require( 'glob' );
const { sync: mkdirpSync } = require( 'mkdirp' );

const LANGS = [ 'en', 'fr' ];

const LABELS_MODULE_ROOT = path.dirname( require.resolve( '@openagenda/labels/package.json' ) );
const LABELS_PATTERN = `${LABELS_MODULE_ROOT}/abilities/**/*`;

const MESSAGES_PATTERN = './build/messages/**/*.json';
const LOCALE_SRC_DIR = './src/locales/';
const LOCALE_BUILD_DIR = './build/locales/';

// Aggregates the default messages that were extracted from the example app's
// React components via the React Intl Babel plugin. An error will be thrown if
// there are messages in different components that use the same `id`. The result
// is a flat collection of `id: message` pairs for the app's default locale.
const defaultMessages = globSync( MESSAGES_PATTERN )
  .map( filename => fs.readFileSync( filename, 'utf8' ) )
  .map( file => JSON.parse( file ) )
  .reduce( ( collection, descriptors ) => {
    descriptors.forEach( ( { id, defaultMessage } ) => {
      if ( Object.prototype.hasOwnProperty.call( collection, id ) ) {
        throw new Error( `Duplicate message id: ${id}` );
      }

      collection[ id ] = defaultMessage;
    } );

    return collection;
  }, {} );

// Aggregates all messages in all languages from @openagenda/labels
const defaultLabels = LANGS.reduce( ( result, lang ) => ( { ...result, [ lang ]: {} } ), {} );
const labels = globSync( LABELS_PATTERN )
  .map( filename => require( filename ) )
  .reduce( ( collection, messages ) => {
    LANGS.forEach( lang => {
      if ( !collection[ lang ] ) {
        return collection;
      }

      _.merge( collection[ lang ], _.mapValues( messages, lang ) );
    } );

    return collection;
  }, defaultLabels );

// For the purpose of this example app a fake locale: `en-UPPER` is created and
// the app's default messages are "translated" into this new "locale" by simply
// UPPERCASING all of the message text. In a real app this would be through some
// offline process to get the app's messages translated by machine or
// professional translators.

function extractLang( lang ) {
  // local translations (for dev)
  const existantLocales = JSON.parse( fs.readFileSync( `${LOCALE_SRC_DIR}${lang}.json`, 'utf8' ) );
  // TODO pull from online ICU editor

  const messages = _.merge(
    _.clone( defaultMessages ),
    existantLocales,
    labels[ lang ]
  );
  fs.writeFileSync( `${LOCALE_BUILD_DIR}${lang}.json`, JSON.stringify( messages, null, 2 ) );
}

mkdirpSync( LOCALE_BUILD_DIR );

LANGS.forEach( lang => {
  extractLang( lang );
} );
