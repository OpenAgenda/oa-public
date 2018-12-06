"use strict";

const add = require( './add' );
const get = require( './get' )
const create = require( './create' );
const remove = require( './remove' );
const update = require( './update' );
const validate = require( './validate' );

module.exports = agendaUid => {

  return {
    get: get.bind( null, agendaUid ),
    create: create.bind( null, agendaUid ),
    add: add.bind( null, agendaUid ),
    remove: remove.bind( null, agendaUid ),
    update: update.bind( null, agendaUid ),
    validate: validate.bind( null, agendaUid )
  }

}
