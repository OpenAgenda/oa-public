"use strict";

const service = require( './service' );
const should = require( 'should' );
const config = require( '../testconfig' );
const helpers = require( './lib/helpers' );
const stakeholderMw = require( '../middleware' );
const _ = require( 'lodash' );

describe( 'agenda-stakeholders - functional (server): middleware', function() {

  this.timeout( 60000 );

  before( done => {

    service.initAndLoad( config, done );

  } );

  beforeEach( () => {

    helpers.init( config );

  } );

  describe( '.load', done => {

    it( 'loads stakeholder agenda interface', done => {

      const req = {
        agenda: { id: 4608 }
      },

      res = {};

      stakeholderMw.agenda().load()( req, res, next);

      function next() {

        // stakeholders agenda interface is loaded
        // and ready to be used
        req.stakeholders.list( 0, 1, ( err, items, total ) => {

          items[ 0 ].id.should.equal( 6478 );

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
            administrator: 10,
            moderator: 46 
          }
        } );

        done();

      }

    } );

  } );


  describe( '.update', done => {

    it( 'updates a stakeholder', done => {

      const req = {
        agenda: { id: 4608 },
        user: { id: 7773 },
        data: {
          organization: 'Latouche International Corp',
          email: 'gaetan@latouche.com',
          contact_number: '06',
          contact_name: 'Gaetan Latouche',
          contact_position: 'Overlord'
        }
      },

      res = {};

      stakeholderMw.agenda().update()( req, res, next );

      function next() {

        req.result.should.eql( {
          success: true,
          valid: true,
          errors: []
        } );

        done();

      }

    } );

  } );


  describe( '.remove', done => {

    it( 'removes a stakeholder', done => {

      const req = {
        agenda: { id: 4608 },
        stakeholder: { id: 7255 }
      },

        res = {};

      stakeholderMw.agenda().remove()( req, res, next );

      function next() {

        req.result.success.should.equal( true );

        done();

      }

    } );

  } );


  describe( '.get', done => {

    it( 'loads all stakeholder data by default', done => {

      const req = {
        agenda: { id: 4608 },
        user: { id: 7674 }
      },

      res = {}; // not modified with load middleware

      stakeholderMw.agenda().get()( req, res, next );

      function next() {

        Object.keys( req.stakeholder ).should.eql( [
          'id', 'agendaId', 'userId', 'credential',
          'updatedAt', 'createdAt', 'custom' 
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

  } );

} );