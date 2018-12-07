"use strict";

const _ = require( 'lodash' );

const randomAgenda = require( './randomAgenda' );

module.exports = ( total, query, offset, limit, { detailed } ) => {

  const updatedAtGreaterThan = _.get( query, 'updatedAtGreaterThan' );

  return new Promise( rs => {

    const randomAgendaUids = [];

    for( let i = 0; i < limit; i++ ) {

      if ( offset + i > total ) continue;

      randomAgendaUids.push( Math.floor( Math.random() * 1000000 ) );

    }

    const agendas = randomAgendaUids.map( uid => randomAgenda( uid, detailed ) );

    rs( agendas.filter( a => !updatedAtGreaterThan || ( ( new Date( updatedAtGreaterThan ) ) < a.updatedAt ) ) );

  } );

}
