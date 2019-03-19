"use strict";

const validate = require( '../service/validate' );
const should = require( 'should' );

const publicValidate = require( '../service/validate/public' );

describe( 'agendas - unit (server): validate', () => {

  describe( 'public validator', () => {

    it( 'validates exposable agenda data', () => {

      let errors = [],

      clean,

      data = {
        title: 'Title of the agenda',
        description: 'Description of the agenda',
        slug: 'title-of-the-agenda'
      }

      try {

        clean = publicValidate( data );

      } catch( e ) {

        errors = e;

      }

      errors.length.should.equal( 0 );

      clean.should.eql( {
        title: 'Title of the agenda',
        description: 'Description of the agenda',
        slug: 'title-of-the-agenda',
        official: false,
        settings: {
          inbox: {
            mailto: {
              enabled: false,
              email: null,
              subject: null,
              body: null
            }
          },
          mailing: {
            eventAggregation: false
          },
          tracking: {
            googleAnalytics: null
          },
          contribution: {
            allowLocationCreate: true,
            defaultLang: null,
            defaultState: 2,
            message: null,
            messages: {
              instructions: null,
              complete: null,
              publication: null
            },
            type: 2,
            moderateOnChangeBy: [],
            useFields: false,
            authorizedIPAddresses: [],
            canPublish: [ 'administrators', 'moderators' ],
            survey: false
          },
          translation: {
            enabled: false,
            sets: [],
            options: null,
            service: 'reverso',
            source: 'fr'
          }
        },
        url: undefined
      } );

    } );

    it( 'validate configured translation', () => {

      let errors = [],

      clean,

      data = {
        title: 'Title of the agenda',
        description: 'Description of the agenda',
        slug: 'title-of-the-agenda',
        settings: {
          inbox: {
            mailto: {
              enabled: false,
              email: null,
              subject: null,
              body: null
            }
          },
          translation: {
            enabled: true,
            source: 'en',
            sets: [ {
              source: 'fr',
              target: [ 'en', 'de' ],
              checked: []
            }, {
              source: 'en',
              target: [ 'fr', 'it' ],
              checked: [ 'fr', 'it' ]
            } ]
          }
        }
      };

      try {

        clean = publicValidate( data );

      } catch( e ) {

        errors = e;

      }

      errors.length.should.equal( 0 );

      clean.settings.translation.should.eql( {
        enabled: true,
        source: 'en',
        options: null,
        service: 'reverso',
        sets: [ {
          source: 'fr',
          target: [ 'en', 'de' ],
          checked: []
        }, {
          source: 'en',
          target: [ 'fr', 'it' ],
          checked: [ 'fr', 'it' ]
        } ]
      } );

    } );

  } );

  describe( 'complete validator', () => {

    it( 'validates data', () => {

      let clean, errors = [],

      now = new Date();

      try {

        clean = validate( {
          uid: 122312,
          ownerId: 1,
          title: 'La gargouille',
          slug: 'la-gargouille',
          description: 'Un agenda de tests',
          updatedAt: now,
          createdAt: now
        } );

      } catch( e ) {

        errors = e;

      }

      errors.length.should.equal( 0 );

      clean.should.eql( {
        title: 'La gargouille',
        slug: 'la-gargouille',
        uid: 122312,
        official: false,
        officializedAt: null,
        private: false,
        indexed: true,
        ownerId: 1,
        formSchemaId: null,
        networkUid: null,
        settings: {
          tracking: {
            googleAnalytics: null
          },
          inbox: {
            mailto: {
              enabled: false,
              email: null,
              subject: null,
              body: null
            }
          },
          mailing: {
            eventAggregation: false
          },
          contribution: {
            allowLocationCreate: true,
            defaultLang: null,
            defaultState: 2,
            message: null,
            messages: {
              instructions: null,
              complete: null,
              publication: null
            },
            type: 2,
            useFields: false,
            authorizedIPAddresses: [],
            canPublish: [ 'administrators', 'moderators' ],
            moderateOnChangeBy: [],
            survey: false
          },
          translation: {
            enabled: false,
            sets: [],
            options: null,
            service: 'reverso',
            source: 'fr'
          }
        },
        updatedAt: now,
        createdAt: now,
        description: 'Un agenda de tests',
        image: null,
        url: undefined,
        credentials: {
          useContributeApp: false,
          multiCustomFields: false,
          activatingInvitations: false,
          emailstrategie: false,
          indesign: false,
          invitationMessage: false,
          calendarView: false,
          moderators: false,
          tags: false,
          embedsHead: false,
          embedsTemplates: false,
          prioritizedAggregator: false,
          aggregator: false,
          docxExport: false,
          eventOwnershipTransfer: false
        }
      } );

    } );

  } );



} );
