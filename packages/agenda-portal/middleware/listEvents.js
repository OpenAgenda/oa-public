"use strict";

const _ = require( 'lodash' );
const qs = require( 'qs' );

const paginate = require( '../lib/paginate' );

module.exports = ( req, res, next ) => {

  const parsers = req.app.get( 'parsers' );

  req.app.get( 'proxy' ).list(
    res.locals.agendaUid,
    _.assign( {}, req.query, {
      page: parseInt( _.get( req, 'params.page', 1 ) )
    } )
  ).then( ( { total, offset, limit, events } ) => {

    req.data = _.assign( req.data || {}, {
      query: req.query,
      searchString: qs.stringify( req.query ),
      total: total,
      events: events.map( ( e, index ) => parsers.event( e, req, res, { total, index: offset + index } ) ),
      pages: paginate( { offset, limit, total } )
    } );

    next();

  } );

}
