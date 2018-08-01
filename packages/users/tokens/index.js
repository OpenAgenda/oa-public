'use strict';

const Service = require( './Service' );
const config = require( '../config' );

let serviceInstance = null;

function init() {
  // raw service instance
  serviceInstance = new Service( {
    Model: config.knex,
    name: config.schemas.userToken,
    id: 'id',
    paginate: config.paginate
  } );
}


module.exports = () => serviceInstance;

module.exports.init = init;
