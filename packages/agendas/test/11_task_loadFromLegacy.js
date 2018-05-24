"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' ),

svc = require( '../service/test' ),

config = require( '../testconfig' ),

mysql = require( 'mysql' ),

async = require( 'async' );

describe( 'agendas - functional (server): tasks/loadFromLegacy', function() {

  this.timeout( 60000 );

  before( () => {
    svc.init( config );
  } );

  before( svc.test.fixtures );

  it( 'scans through agendas and updates new structure with legacy data', done => {

    let test = {
      agendaRowBefore: false,
      agendaRowrowAfter: false,
      credRowBefore: false,
      credRowrowAfter: false,
      result: false
    }

    let con = mysql.createConnection( config.mysql );

    async.waterfall( [
      wcb => {

        con.query( 'select * from agenda where id = ?', 4878, ( err, rows ) => {

          test.agendaRowBefore = rows[ 0 ];

          wcb();

        } );

      },
      wcb => {

        con.query( 'select * from legacy_credential_set where review_id = ?', 4878, ( err, rows ) => {

          test.credRowBefore = rows[ 0 ];

          wcb();

        } );

      },
      wcb => {

        svc.tasks.loadFromLegacy( ( err, result ) => {

          test.result = result;

          wcb( err );

        } );

      },
      wcb => {

        con.query( 'select * from agenda where id = ?', 4878, ( err, rows ) => {

          test.agendaRowAfter = rows[ 0 ];

          wcb();

        } );

      },
      wcb => {

        con.query( 'select * from legacy_credential_set where review_id = ?', 4878, ( err, rows ) => {

          test.credRowAfter = rows[ 0 ];

          wcb();

        } );

      }
    ], err => {

      con.end();

      should( err ).equal( undefined );

      let settings = JSON.parse( test.agendaRowAfter.settings ),

      credentials = JSON.parse( test.agendaRowAfter.credentials );

      credentials.should.eql( {
        moderators: !!test.credRowBefore.moderators,
        tags: !!test.credRowBefore.tags,
        embedsHead: !!test.credRowBefore.custom_head,
        embedsTemplates:!!test.credRowBefore.custom_templates,
        indesign: !!test.credRowBefore.indesign,
        invitationMessage: false,
        calendarView: false,
        activatingInvitations: !!test.credRowBefore.activating_invitation,
        prioritizedAggregator: false,
        emailstrategie: !!test.credRowBefore.emailstrategie,
        aggregator: !!test.credRowBefore.aggregator,
        docxExport: false
      } );

      [ 'moderator', 'tags', 'custom_templates', 'custom_head', 'indesign' ].forEach( f => {

        test.credRowBefore[ f ].should.equal( test.credRowAfter[ f ] );

      } );

      done();

    } );

  } );

} );