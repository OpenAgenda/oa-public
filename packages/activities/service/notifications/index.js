const _ = require( 'lodash' );
const addActivity = require( './addActivity' );
const count = require( './count' );
const get = require( './get' );
const list = require( './list' );
const markAs = require( './markAs' );
const remove = require( './remove' );

const addActivityTask = require( './tasks/addActivity' );
const prepareSummaryTask = require( './tasks/prepareSummary' );
const sendSummaryTask = require( './tasks/sendSummary' );

let config;
let knex;
let service;

module.exports = Object.assign( notifications, { init } );

function init( { config: c, knex: k, service: s } ) {

  config = c;
  knex = k;
  service = s;

  addActivity.init( { config, knex, service } );
  count.init( { config, knex, service } );
  get.init( { config, knex, service } );
  list.init( { config, knex, service } );
  markAs.init( { config, knex, service } );
  remove.init( { config, knex, service } );

  addActivityTask.init( { config, knex, service } );
  prepareSummaryTask.init( { config, knex, service } );
  sendSummaryTask.init( { config, knex, service } );

}

function notifications( identifiers ) {

  return _.mapValues( {
    addActivity,
    count,
    get,
    list,
    markAs,
    remove
  }, fn => fn.bind( null, identifiers ) );

}

