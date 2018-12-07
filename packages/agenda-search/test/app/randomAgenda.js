"use strict";

// inject those randomly in titles for
// search testing
const titleParts = {
  jardin: 2
};

module.exports = ( uid, detailed ) => {

  const upcoming = Math.ceil( Math.random() * 1000 );

  const agenda = {
    id: uid * 10,
    official: uid % 10 === 0,
    title: _appendTitleParts( 'Agenda title ' + uid ),
    description: 'description ' + uid,
    publishedEvents: upcoming + Math.ceil( Math.random() * 1000 ),
    upcomingPublishedEvents: upcoming,
    uid: uid,
    updatedAt: new Date()
  };

  if ( detailed ) agenda.keywords = [ 'truc', 'machin', 'chose' ];

  return agenda;

}

function _appendTitleParts( title ) {

  for( const p in titleParts ) {

    if ( titleParts[ p ] !== 0 ) {

      titleParts[ p ]--;

      return title + ' ' + p;

    }

  }

  return title;

}
