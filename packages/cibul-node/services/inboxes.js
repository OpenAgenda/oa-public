"use strict";

const _ = require( 'lodash' );
const inboxes = require( '@openagenda/inboxes' );
const inboxMw = require( '@openagenda/inboxes/lib/middleware' );
const userSvc = require( '@openagenda/users' );

const interfaces = {
  async getUsersDetails( usersToBeDetailed ) {

    console.log( 'usersToBeDetailed', usersToBeDetailed );

    return Promise.all(
      usersToBeDetailed.map( async userToBeDetailed => {
        return {
          name: 'JP',
          avatar: ''
        }
      } )
    );
  },
  async getInboxesDetails( inboxesToBeDetailed ) {

    console.log( 'inboxesToBeDetailed', inboxesToBeDetailed );

    return Promise.all(
      inboxesToBeDetailed.map( async inboxToBeDetailed => {
        return {
          name: 'Agenda',
          avatar: ''
        }
      } )
    );

  }
};

module.exports.init = async config => {
  await inboxes.init(
    _.merge( config, {
      migrations: {
        tableName: 'inboxes_migrations'
      },
      interfaces
    } )
  );
  await inboxMw.init( _.merge( config, { interfaces } ) );
};
