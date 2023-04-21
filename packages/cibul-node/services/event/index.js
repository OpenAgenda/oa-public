"use strict";

const coms = require( '../../lib/coms' );
const config = require( '../../config' );
const model = require( '../model' );
const getSocialLinks = require( './lib/getSocialLinks' );

module.exports = {
  initless: true,
  get,
  search: () => new Error('event.search is no longer available'),
  create,
  getSocialLinks,
  list: model.events().list,
  instanciate: require('./instance'),
  STATETYPES: model.events().STATETYPES,
  getIcsHead: require('./instance/ics').head
};

module.exports.mw = require( './middleware' )( module.exports );

module.exports.exports = require( './exportLib' )( module.exports );

function get( params, cb ) {

  model.events().get( params, ( err, result ) => {

    if ( err ) return cb( err );

    cb( null, result ? module.exports.instanciate( result ) : null );

  } );

}


function create( data, cb ) {

  model.events().create( data, function( err, created ) {

    if ( err ) return cb(err);

    coms.publish( config.mainChannel, {
      name: 'event.publish',
      values: { id: created.id }
    } );

    get( { id: created.id }, cb );

  } );

}
