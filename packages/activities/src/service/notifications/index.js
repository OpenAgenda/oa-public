const _ = require( 'lodash' );
const addActivity = require( './addActivity' );
const count = require( './count' );
const get = require( './get' );
const list = require( './list' );
const markAs = require( './markAs' );
const remove = require( './remove' );

module.exports = function notifications( config, identifiers ) {

  return {
    addActivity: addActivity( config ).bind( null, identifiers ),
    count: count.bind( null, config, identifiers ),
    get: get.bind( null, config, identifiers ),
    list: list.bind( null, config, identifiers ),
    markAs: markAs.bind( null, config, identifiers ),
    remove: remove.bind( null, config, identifiers )
  };

};
