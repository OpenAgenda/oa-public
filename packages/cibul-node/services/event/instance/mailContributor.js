"use strict";

const w = require( 'when' );
const _ = require( 'lodash' );
const mails = require( '@openagenda/mails' );
const agendasSvc = require( '@openagenda/agendas' );
const log = require( '@openagenda/logs' )( 'services/event/mailContributor' );
const genUrl = require( '../../genUrl' );
const { ife } = require( '../../../lib/promises' );
const config = require( '../../../config' );

let agendaSvc;

/**
 * temp solution before streams arrive
 */

module.exports = function ( instance, agenda ) {

  log( 'mail contributor on event %s publication', instance.slug );

  if ( !agendaSvc ) agendaSvc = require( '../../agenda' ); // circular ref if up.

  w( {
    instance,
    agenda,
    contributor: false,
    isAdministrator: false,
    message: false,
    firstPublicationFlag: true
  } )

    .then( _loadAgenda )

    .then( _checkFirstPublicationFlag )

    .then( ife( { firstPublicationFlag: false }, _retrieveContributor ) )

    .then( ife( { firstPublicationFlag: false }, _checkAdmin ) )

    .then( ife( { firstPublicationFlag: false }, _retrieveAgendaCustomMessage ) )

    .then( ife( { firstPublicationFlag: false }, _sendPublicationMail ) )

    .then( ife( { firstPublicationFlag: false }, _setFirstPublicationFlag ) )

    .done( () => {
    }, err => {
      log( 'error', err );
    } );

}


function _sendPublicationMail( v ) {

  if ( v.isAdministrator ) return v;

  log( 'sending publication mail' );

  const logo = v.agenda.image
    ? {
      src: config.aws.imageBucketPath + v.agenda.image.replace( '.com/', '.com/rwtb' ),
      width: '100px'
    }
    : {
      src: `${config.root}/images/openagenda.png`,
      width: '300px'
    };

  return mails( {
    template: 'eventPublishContributor',
    to: v.contributor.email,
    lang: v.contributor.lang,
    data: {
      logo,
      agendaTitle: v.agenda.title,
      eventTitle: v.instance.getTitle(),
      message: v.message,
      link: genUrl( 'agendaEventShow', {
        slug: v.agenda.slug,
        eventSlug: v.instance.slug,
      }, { abs: true, protocol: 'https://' } )
    }
  } );

}

function _loadAgenda( v ) {

  log( 'loading agenda' );

  if ( v.agenda.title && v.agenda.slug && v.agenda.isAdministrator && v.agenda.getStore ) {
    return v;
  }

  var d = w.defer();

  agendaSvc.get( v.agenda.id ? { id: v.agenda.id } : v.agenda, ( err, agenda ) => {

    log( 'agenda loaded (from cibulModel)' );

    if ( err ) return w.reject( err );

    v.agenda = agenda;

    agendasSvc.get( v.agenda.id ? { id: v.agenda.id } : v.agenda, { detailed: true }, ( err, agenda ) => {

      if ( err ) return w.reject( err );

      v.agenda2 = agenda;

      d.resolve( v );

    } );

  } );

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

  } );

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

  } );

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

  v.message = _.get( v.agenda2, 'settings.contribution.messages.publication', null );

  return v;

}
