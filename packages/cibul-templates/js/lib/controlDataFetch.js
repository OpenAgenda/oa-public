"use strict";

var domain = require( '../../domain' );

var cn = require( './common' ),

remote = require( './remote' ),

res = {
  production: {
    agenda : '//' + domain + '/agendas/{uid}/controldata',
    embed : '//' + domain + '/agendas/{uid}/embeds/{embedUid}/controldata'
  },
  development: {
    agenda : '//' + domain + '/agendas/{uid}/controldata',
    embed : '//' + domain + '/agendas/{uid}/embeds/{embedUid}/controldata'
  },
  test: {
    agenda : '//d.openagenda.com/agendas/{uid}/controldata',
    embed : '//d.openagenda.com/agendas/{uid}/embeds/{embedUid}/controldata'
  },
  tpl: {
    agenda : '/server/testdata/' + ( window.testControlData ? window.testControlData : 'controldata-pepite.json' ),
    embed : '/server/testdata/' + ( window.testControlData ? window.testControlData : 'embedcontroldata-pepite.json' )
  }
},

defaults = {
  uid: false, // required. the uid of the agenda
  embedUid: false, // optional. the uid of the embed
  jsonp: false
};

res.dev = res.development;

module.exports = fetch;

function fetch( options, cb ) {

  var params = cn.extend( {}, defaults, options ),

  fetchRes = res[ window.env || 'production' ][ params.embedUid ? 'embed' : 'agenda' ]

  .replace( '{uid}', params.uid );

  if ( params.embedUid ) {

    fetchRes = fetchRes.replace( '{embedUid}', params.embedUid );

  }

  if ( window.controlData ) {

    fetchRes = window.controlData;

  }

  if ( params.jsonp ) {

    fetchRes += '?callback=cb' + params.uid + ( params.embedUid || '' );

  }

  remote.get( fetchRes, { timeout: 20000 }, function( responseType, data ) {

    if ( responseType !== 'success' ) {

      return cb( responseType );

    }

    cb( null, data.data );

  }, !params.jsonp );

}
