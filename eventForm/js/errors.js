"use strict";

module.exports = {
  NOTINT: 0,
  NOTEMPTY: 1,
  TOOLONG: 2,
  TOOSHORT: 3,
  NOTNUM: 4,
  NOTURL: 5,
  NOTEMAIL: 6
}

module.exports.messages = function( lang ) {

  return {
    notURL: notURL,
    notEmail: notEmail,
    notNum: notNum,
    tooShort: tooShort,
    tooLong: tooLong,
    notInt: notInt,
    notEmpty: notEmpty,
  }

  function notNum() {

    return _message( lang, {
      en: 'this value must be a number',
      fr: 'cette valeur doit être un nombre'
    } );

  }

  function notEmail() {

    return _message( lang, {
      en: 'this value must be an email address',
      fr: 'cette valeur doit être une adresse email'
    } );

  }

  function notURL() {

    return _message( lang, {
      en: 'this value must be an url ( starting with http or https )',
      fr: 'cette valeur doit être une url ( commençant par http ou https )'
    } );

  }

  function notInt() {

    return _message( lang, {
      en: 'the value must be an integer',
      fr: 'la valeur doit être un entier'
    } );

  }

  function tooShort( min ) {

    return _message( lang, {
      en: 'this value should be at least %s characters long',
      fr: 'cette valeur doit au minimum avoir %s caractères'
    }, min );

  }

  function tooLong( max ) {

    return _message( lang, {
      en: 'this value cannot exceed %s characters',
      fr: 'cette valeur ne doit pas exceder %s caractères'
    }, max );

  }

  function notEmpty() {

    return _message( lang, {
      en: 'this field cannot be empty',
      fr: 'ce champ ne peut pas rester vide'
    } );

  }

}


function _message( lang, labels, value ) {

  var label;

  if ( !labels[ lang ] ) {

    for ( lang in labels ) break;

  }

  label = labels[ lang ];

  if ( !value ) return label;

  return label.replace( '%s', value );

}