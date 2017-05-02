"use strict";

const service = require( './service' );
const should = require( 'should' );
const config = require( '../testconfig' );
const helpers = require( './lib/helpers' );
const stakeholderMw = require( '../middleware' );
const credentialTypes = require( '../iso/credentialTypes' );

describe( 'agenda-stakeholders - functional (server): middleware', function () {

  this.timeout( 60000 );

  before( done => {

    service.initAndLoad( config, done );

  } );

  beforeEach( () => {

    helpers.init( config );

  } );

  it( 'throw an error when agenda id is not found', done => {

    const req = {
        agenda: {}
      },
      res = {};

    try {

      stakeholderMw.agenda().load()( req, res, () => {
      } );

    } catch ( e ) {

      e.should.eql( new Error( 'agendaId is not a number' ) );
      done();

    }

  } );

  describe( '.load', () => {

    it( 'loads stakeholder agenda interface', done => {

      const req = {
          agenda: { id: 4608 }
        },

        res = {};

      stakeholderMw.agenda().load()( req, res, next );

      function next() {

        // stakeholders agenda interface is loaded
        // and ready to be used
        req.stakeholders.list( 0, 1, ( err, items, total ) => {

          items[ 0 ].id.should.equal( 6856 );

          done();

        } );

      }

    } );

  } );

  describe( '.list', () => {

    it( 'lists stakeholders', done => {

      const req = {
        agenda: { id: 4608 },
        query: { page: 1 }
      },

      res = {}; // not modified with load middleware

      stakeholderMw.agenda().list()( req, res, next );

      function next() {

        req.stakeholders.length.should.equal( 20 );
        req.total.should.equal( 564 );

        done();

      }

    } );

  } );

  describe( '.stats', () => {

    it( 'get stats on stakholders of an agenda', done => {

      const req = {
          agenda: { id: 4608 }
        },

        res = {};

      stakeholderMw.agenda().stats()( req, res, next );

      function next() {

        req.stats.should.eql( {
          total: 564,
          credentialTotals: {
            contributor: 508,
            administrator: 11,
            moderator: 45
          }
        } );

        done();

      }

    } );

  } );


  describe( '.bulk', () => {

    it( 'create multiple stakeholders', done => {

      const req = {
        agenda: { id: 4608 },
        data: {
          stakeholders: [ {
            email: 'post-itspar-tout@merci.yacine'
          } ],
          credential: credentialTypes.get( 'administrator' )
        },
        allowPartial: true
      }, res = {};

      stakeholderMw.agenda().bulk( { allowPartial: true } )( req, res, next );

      function next() {

        req.result.queued.should.equal( false );

        req.result.results.length.should.equal( 1 );

        let firstCreate = req.result.results[ 0 ],

          [ err, result ] = firstCreate;

        result.stakeholder.custom.email.should.equal( 'post-itspar-tout@merci.yacine' );

        done();

      }

    } );

  } );


  describe( '.message', () => {

    it( 'send message to multiple stakeholders', done => {

      const req = {
        agenda: { id: 4608 },
        message: '**Bla bla bla**'
      }, res = {};

      stakeholderMw.agenda().message( { actionsCounterEqualZero: true } )( req, res, next );

      function next() {

        req.result.queued.should.equal( true );

        done();

      }

    } );

  } );


  describe( '.update', () => {

    it( 'updates a stakeholder', done => {

      const req = {
          agenda: { id: 4608 },
          user: { id: 7773 },
          data: {
            fieldValues: {
              organization: 'Latouche International Corp',
              email: 'gaetan@latouche.com',
              contactNumber: '06',
              contactName: 'Gaetan Latouche',
              contactPosition: 'Overlord'
            }
          }
        },

        res = {};

      stakeholderMw.agenda().update()( req, res, next );

      function next() {

        req.result.should.eql( {
          success: true,
          valid: true,
          errors: [],
          fieldValues: {
            organization: {
              label: 'Latouche International Corp',
              slug: 'latouche-international-corp'
            },
            email: 'gaetan@latouche.com',
            contactNumber: '06',
            contactName: 'Gaetan Latouche',
            contactPosition: 'Overlord'
          }
        } );

        done();

      }

    } );

    it( 'updates a stakeholder identified by his id', done => {

      const req = {
          agenda: { id: 4608 },
          identifiers: { id: 7255 },
          data: {
            fieldValues: {
              organization: 'Latouche International Corp',
              email: 'gaetan@latouche.com',
              contactNumber: '06',
              contactName: 'Gaetan Latouche',
              contactPosition: 'Overlord'
            }
          }
        },

        res = {};

      stakeholderMw.agenda().update()( req, res, next );

      function next() {

        req.result.should.eql( {
          success: true,
          valid: true,
          errors: [],
          fieldValues: {
            organization: {
              label: 'Latouche International Corp',
              slug: 'latouche-international-corp'
            },
            email: 'gaetan@latouche.com',
            contactNumber: '06',
            contactName: 'Gaetan Latouche',
            contactPosition: 'Overlord'
          }
        } );

        done();

      }

    } );

    it( 'updates a stakeholder with credentials', done => {

      const req = {
          agenda: { id: 4608 },
          user: { id: 7773 },
          data: {
            fieldValues: {
              organization: 'Latouche International Corp',
              email: 'gaetan@latouche.com',
              contactNumber: '06',
              contactName: 'Gaetan Latouche',
              contactPosition: 'Overlord'
            },
            credential: 3
          }
        },

        res = {};

      stakeholderMw.agenda().update( { credential: true } )( req, res, next );

      function next() {

        req.result.should.eql( {
          success: true,
          valid: true,
          errors: [],
          fieldValues: {
            organization: {
              label: 'Latouche International Corp',
              slug: 'latouche-international-corp'
            },
            email: 'gaetan@latouche.com',
            contactNumber: '06',
            contactName: 'Gaetan Latouche',
            contactPosition: 'Overlord'
          },
          credential: 3
        } );

        done();

      }

    } );

  } );


  describe( '.remove', () => {

    it( 'removes a stakeholder', done => {

      const req = {
          agenda: { id: 4608 },
          user: { id: 7830 }
        },

        res = {};

      stakeholderMw.agenda().remove()( req, res, next );

      function next() {

        req.result.success.should.equal( true );

        done();

      }

    } );

    it( 'removes a stakeholder with his id', done => {

      const req = {
          agenda: { id: 4608 },
          identifiers: { id: 7258 }
        },

        res = {};

      stakeholderMw.agenda().remove()( req, res, next );

      function next() {

        req.result.success.should.equal( true );

        done();

      }

    } );

  } );


  describe( '.get', () => {

    it( 'loads all stakeholder data by default', done => {

      const req = {
        agenda: { id: 4608 },
        user: { id: 7674 }
      },

      res = {}; // not modified with load middleware

      stakeholderMw.agenda().get()( req, res, next );

      function next() {

        Object.keys( req.stakeholder ).should.eql( [
          'id', 'agendaId', 'userId', 'credential', 'deletedUser',
          'updatedAt', 'createdAt', 'custom', 'actionsCounter', 'linkStore'
        ] );

        done();

      }

    } );


    it( 'loads instance as well', done => {

      /**
       * the instance .get method gives exactly the
       * required data for a front Stakeholder instance
       */

      const req = {
          agenda: { id: 4608 },
          user: { id: 7674 }
        },

        res = {};

      stakeholderMw.agenda().get()( req, res, next );

      function next() { // normally this is the next middleware

        req.stakeholderInstance.get().should.eql( {
          organization: {
            label: 'écomusée des monts du forez',
            slug: 'ecomusee-des-monts-du-forez'
          },
          contact_number: '0477506797',
          contact_name: 'Séverine DEVIN',
          contact_position: 'Chargée des expositions et de la communication'
        } );

        done();

      }

    } );


    it( 'allows for namespace changes', done => {

      const req = {
          a: { id: 4608 },
          u: { id: 7674 }
        },

        res = {};

      stakeholderMw.agenda( 'a' ).get( {
        namespaces: {
          user: 'u',
          stakeholder: 's',
          instance: 'i'
        }
      } )( req, res, next );

      function next() {

        // the instance is loaded in the given namespace
        req.i.get().contact_name.should.equal( 'Séverine DEVIN' );

        // the stakeholder object is loaded in the given namespace
        req.s.agendaId.should.equal( 4608 );

        done();

      }

    } );


    it( 'get with id', done => {

      const req = {
          a: { id: 4608 },
          identifiers: { id: 6975 }
        },

        res = {};

      stakeholderMw.agenda( 'a' ).get( {
        namespaces: {
          identifiers: 'identifiers',
          stakeholder: 's',
          instance: 'i'
        }
      } )( req, res, next );

      function next() {

        // the instance is loaded in the given namespace
        req.i.get().contact_name.should.equal( 'Isabelle Boucher-Doigneau' );

        // the stakeholder object is loaded in the given namespace
        req.s.agendaId.should.equal( 4608 );

        done();

      }

    } );

  } );

} );
