"use strict";

var p = require( '../../../lib/promises' ), w = p.w,

async = require( 'async' ),

genUrl = require( '../../genUrl' ),

i18n = require( '../../../i18n/i18n' ),

utils = require( 'utils' ),

templater = require( 'cibulTemplates' ),

mailer = require( 'mailer' ),

log = require( 'logger' )( 'services/event/mailContributor' ),

agendaSvc;

/**
 * temp solution before streams arrive
 */

module.exports = function( instance, agenda ) {

  log( 'mail contributor on event %s publication', instance.slug );

  if ( !agendaSvc ) agendaSvc = require( '../../agenda' ); // circular ref if up.

  w( {
    instance: instance,
    agenda: agenda,
    contributor: false,
    isAdministrator: false,
    message: false,
    firstPublicationFlag: true
  } )

  .then( _loadAgenda )

  .then( _checkFirstPublicationFlag )

  .then( p.ife( { firstPublicationFlag : false }, _retrieveContributor ) )

  .then( p.ife( { firstPublicationFlag : false }, _checkAdmin ) )

  .then( p.ife( { firstPublicationFlag : false }, _sendPublicationMail ) )

  .then( p.ife( { firstPublicationFlag : false }, _setFirstPublicationFlag ) )

  .done( () => {}, err => { log( 'error', err ); } );

}


function _sendPublicationMail( v ) {

  if ( v.isAdministrator ) return v;

  log( 'sending publication mail' );

  var d = w.defer(),

  data = {
    lang: v.contributor.lang,
    env: process.env.NODE_ENV,
    title: {
      text: 'The agenda %title% published your event %event%',
      values: {
        '%title%' : v.agenda.title,
        '%event%' : v.instance.getTitle()
      },
      link: genUrl( 'agendaEventShow', {
        slug: v.agenda.slug,
        eventSlug: v.instance.slug
      }, { abs: true } )
    },
    description: v.message
  },

  renders = {};

  async.each( [ 'html', 'text' ], ( type, ecb ) => {

    templater( 'email/show', utils.extend( { type: type }, data ), ( err, render ) => {

      if ( err ) return ecb( err );

      renders[ type ] = render;

      ecb();

    } );

  }, ( err ) => {

    if ( err ) return d.reject( err );

    mailer({
      recipient: v.contributor.email,
      subject: i18n( data.title.text, data.title.values, v.contributor.lang ),
      text: renders.text,
      html: renders.html
    });

    d.resolve( v );

  });

  return d.promise;

}

function _loadAgenda( v ) {

  log( 'loading agenda' );

  var d = w.defer();

  agendaSvc.get( { id: v.agenda.id }, ( err, agenda ) => {

    log( 'agenda loaded' );

    if ( err ) return w.reject( err );

    v.agenda = agenda;

    d.resolve( v );

  });

  return d.promise;

}

function _checkAdmin( v ) {

  log( 'checking that contributor is not admin' );

  var d = w.defer();

  v.agenda.isAdministrator( v.contributor, ( err, is ) => {

    if ( err ) return d.reject( err );

    v.isAdministrator = is;

    log( 'contributor %s admin', is ? 'is' : 'is not' );

    d.resolve( v );

  });

  return d.promise;

}


function _retrieveContributor( v ) {

  log( 'retrieving contributor' );

  var d = w.defer();

  v.instance.getContributor( ( err, userData ) => {

    if ( err ) return d.reject( err );

    log( 'contributor retrieved' );

    v.contributor = userData;

    d.resolve( v );

  });

  return d.promise;

}

function _checkFirstPublicationFlag( v ) {

  var d = w.defer();

  v.instance.getFirstPublicationFlag( ( err, flag ) => {

    if ( err ) return d.reject( err );

    v.firstPublicationFlag = flag;

    d.resolve( v );

  } )

  return d.promise;

}

function _setFirstPublicationFlag( v ) {

  var d = w.defer();

  v.instance.setFirstPublicationFlag( err => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}



function _retrieveAgendaCustomMessage( v ) {

  v.message = v.agenda.getStore( 'publicationMessage' );
  
  return v;

}