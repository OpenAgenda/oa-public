"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' );

const svc = require( './service' );

const config = require( '../testconfig' );

const knex = require( 'knex' );

describe( 'form-schemas - functional (server): legacy', function() {

  this.timeout( 5000 );

  before( done => {

    svc.initAndLoad( config, [
      config.schemas.formSchema,
      config.schemas.network,
      config.legacy.schemas.agenda,
      config.legacy.schemas.tagSet,
      config.legacy.schemas.categorySet,
      config.legacy.schemas.event + '_few',
      config.legacy.schemas.agendaEvent + '_few',
      config.legacy.schemas.agendaEventTag + '_few'
    ], done );

  } );

  after( () => svc.shutdown );

  it( '.agendaEventGet transfers multichoice to checkbox field type', async () => {

    ( await svc.legacy.agendaEventGet( 7292, 152412 ) )

      .should.eql( {
        detailedcoms: 'Avec Cetim, Symop, CeA List, Mbway ( soutien Arts et Métiers Alumni)',
        organizertype: 7,
        expectedcount: 75,
        otherorganizer: 'Expert Robot Start PmE, labellisé Industrie du futur, intervenant dans l\'école Mbway',
        internetsite: null,
        facebookurl: null,
        twitterurl: null
      } );

  } );

  it( '.agendaEventGet transfers checkbox type set to false', async () => {

    ( await svc.legacy.agendaEventGet( 7796, 166062 ) )

      .should.eql( {
        custom_description: 'hip',
        recurring: null,
        intermunicipal_interest: null
      } );

  } );

  it( '.agendaEventGet transfers checkbox type set to true', async () => {

    ( await svc.legacy.agendaEventGet( 7796, 186834 ) )

      .should.eql( {
        custom_description: null,
        intermunicipal_interest: 1,
        recurring: null
      } );

  } );


} );
