"use strict";

const _ = require( 'lodash' );
const search = require( '../../services/eventSearch' );

module.exports = ( app, route ) => {

  app.get( route, async ( req, res, next ) => {

    const query = _.extend( { sort: 'updatedAt.desc' }, req.query );

    const { events, total } = await search.agendas( req.params.agendaUid ).search( req.query, req.query, { detailed: true } );

    console.log( total );

  } );

}