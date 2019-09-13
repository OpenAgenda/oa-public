'use strict';

const { iff, isProvider, disallow } = require('feathers-hooks-common');
const update = require('immutability-helper');
const errors = require('@feathersjs/errors');
const Users = require('@openagenda/users');
const restrictToUnlogged = require('./hooks/restrictToUnlogged');
const restrictToCurrentUser = require('./hooks/restrictToCurrentUser');

const restrictToCurrentUserIfExternal = [
  iff(
    isProvider('external'),
    restrictToCurrentUser(),
  )
];

module.exports = update(Users.hooks, {
  before: {
    all: {
      $unshift: [
        context => {
          if (context.id !== 'me') {
            return;
          }

          if (!context.params.user || !context.params.user.uid) {
            throw new errors.NotAuthenticated('You should be logged');
          }

          context.id = context.params.user.uid;
        }
      ],
    },
    create: {
      $unshift: [
        iff(
          isProvider('external'),
          restrictToUnlogged()
        )
      ]
    },
    get: {
      $unshift: restrictToCurrentUserIfExternal
    },
    find: {
      $unshift: [
        disallow('external')
      ]
    },
    update: {
      $set: disallow()
    },
    patch: {
      $unshift: restrictToCurrentUserIfExternal
    },
    remove: {
      $unshift: restrictToCurrentUserIfExternal
    },
    setImageProfile: {
      $unshift: restrictToCurrentUserIfExternal
    },
    clearImageProfile: {
      $unshift: restrictToCurrentUserIfExternal
    },
    requestChangeEmail: {
      $unshift: restrictToCurrentUserIfExternal
    },
    // confirmChangeEmail: {
    //   $unshift: restrictToCurrentUserIfExternal
    // },
    changePassword: {
      $unshift: restrictToCurrentUserIfExternal
    },
    generateApiKey: {
      $unshift: restrictToCurrentUserIfExternal
    },
    setNewFlag: {
      $unshift: restrictToCurrentUserIfExternal
    },
    refresh: {
      $unshift: restrictToCurrentUserIfExternal
    },
  }
});
