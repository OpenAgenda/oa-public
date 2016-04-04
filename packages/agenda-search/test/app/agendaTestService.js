"use strict";

const total = 1000,

// inject those randomly in titles for
// search testing
titleParts = {
  jardin: 2
}

module.exports = {
  list: list
}

function list( offset, limit, options, cb ) {

  var randomAgendaUids = [];

  if ( offset + limit >= 1000 ) {

    return cb( null, [] );

  } 

  for( let i = 0; i < limit; i++ ) {

    randomAgendaUids.push( Math.floor( Math.random() * 1000000 ) );

  }

  cb( null, randomAgendaUids.map( _randomAgenda ) );

}

function _randomAgenda( uid ) {

  let upcoming = Math.ceil( Math.random() * 1000 );

  return {
    title: _appendTitleParts( 'Agenda title ' + uid ),
    description: 'description ' + uid,
    publishedEvents: upcoming + Math.ceil( Math.random() * 1000 ),
    upcomingPublishedEvents: upcoming
  }

}

function _appendTitleParts( title ) {

  for( var p in titleParts ) {

    if ( titleParts[ p ] !== 0 ) {

      titleParts[ p ]--;

      return title + ' ' + p;

    }

  }

  return title;

}