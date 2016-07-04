"use strict";

const fixtures = require( 'fixtures' ),

svc = require( '../../' ),

app = require( 'test-app' )( {
  frontWrapper: __dirname + '/front.js',
  excludeDefaultStyles: true,
  styles: [
    __dirname + '/../../node_modules/bs-templates/compiled/main.css'
  ],
  webpack: true,
  babelServer: true
} ),

fs = require( 'fs' );

app.get( '/events', ( req, res, next ) => { setTimeout( () => { next(); } , 2000 ); } );

app.get( '/events', svc.mw.events );

app.get( '/events', ( req, res ) => { res.json( req.events ); } );

app.getAndListen();

let testEvents = JSON.parse( fs.readFileSync( __dirname + '/events.json' ) );

svc.init( {
  interface: {
    events: ( agendaId, query, cb ) => {

      cb( null, testEvents

      .filter( e => {

        if ( query.exclude && utils.isArray( query.exclude ) ) {

          if ( query.exclude.map( x => parseInt( x ) ).indexOf( e.uid ) !== -1 ) return false;

        }

        if ( !query.search ) return true;

        return [ e.title, e.location.name, e.location.address ].filter( text => {

          return text.toLowerCase().indexOf( query.search.toLowerCase() ) !== -1;

        } ).length ? true : false;

      } )

      .filter( e => {;

        if ( !query.uids ) return true;

        return query.uids.map( parseInt ).indexOf( e.uid ) !== -1;

      } ) );

    }
  }
})