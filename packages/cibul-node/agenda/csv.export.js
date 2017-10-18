"use strict";

const app = require( 'express' )();
const csv = require( 'flat-exports' ).csv();
const xlsx = require( 'flat-exports' ).xlsx();
const search = require( '../services/eventSearch' );
const labels = require( 'labels/event/exportFieldNames' );


module.exports = ( parentApp, path ) => {

  parentApp.use( path, app );

}

app.get( '/agendas/:agendaUid/events.v2.(csv|xlsx)', async ( req, res, next ) => {

  // here options must be separated from 
  req.stream = await search.agendas( req.params.agendaUid ).stream( req.query );

  next();

} );
  

app.get( '/agendas/:agendaUid/events.v2.xlsx', ( req, res, next ) => {

  xlsx( req.stream, {
    lang: req.query.lang,
    labels
  } ).pipe( res );

  res.writeHead( 200, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-disposition' : `attachment; filename="agenda.${req.params.agendaUid}.xlsx"`
  } );

} );

app.get( '/agendas/:agendaUid/events.v2.csv', ( req, res, next ) => {

  csv( req.stream, {
    lang: req.query.lang,
    labels
  } ).pipe( res );

  res.writeHead( 200, {
    'Content-Type' : 'text/csv',
    'Content-disposition' : `attachment; filename="agenda.${req.params.agendaUid}.csv"`
  } );

} );