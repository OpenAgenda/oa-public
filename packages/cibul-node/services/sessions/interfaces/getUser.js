'use strict';

const _ = require('lodash');
const VError = require('@openagenda/verror');
const log = require('@openagenda/logs')('sessions/interfaces/getUser');

module.exports = function getUser(services, imageBucketPath, query, cb) {
  log('info', 'requested user with %j', query);

  services.users.findOne({ query: _.pick(query, 'id', 'uid', 'email'), detailed: true })
    .then(user => {
      if (!user) {
        const error = new VError('failed to retrieve user: %j', _.pick(query, 'id', 'uid', 'email'));

        log('error', error);

        return cb(error);
      }

      log('info', 'retrieved user %j', user);

      cb(null, {
        id: user.id,
        uid: user.uid,
        name: user.fullName,
        thumbnail: user.image ? imageBucketPath + user.image : null,
        email: user.email,
        culture: user.culture,
        isNew: !!user.isNew,
        isBlacklisted: user.isBlacklisted,
        transverseApiAccess: user.transverseApiAccess,
      });
    })
    .catch(err => {
      log('error', new VError(err, 'failed to retrieve user: %j', _.pick(query, 'id', 'uid', 'email')));
      cb(err, null);
    });
};
