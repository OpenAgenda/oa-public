"use strict";

const service = require( './service' );
const should = require( 'should' );
const config = require( '../testconfig' );
const helpers = require( './lib/helpers' );
const middleware = require( '../middleware' );
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

    it( '.loads all stakeholder data by default', done => {

      const req = {
        agenda: { id: 4608 },
        user: { id: 7674 }
      },

      res = {}; // not modified with load middleware

      middleware.agenda().load()( req, res, next );

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

      middleware.agenda().load()( req, res, next );

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

      middleware.agenda( 'a' ).load( {
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