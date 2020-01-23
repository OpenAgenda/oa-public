'use strict';

const config = require('../../config');

module.exports = async function getUsersDetails(services, usersToBeDetailed) {
  const usersSvc = services.users;

  if (usersToBeDetailed.length === 0) {
    return [];
  }

  return (await usersSvc.find({
    query: {
      uid: {
        $in: usersToBeDetailed.map(v => v.userUid)
      },
      $skip: 0,
      $limit: 100
    },
    removed: null
  }))
    .data
    .map(user => ({
      uid: user.uid,
      name: user.fullName,
      avatar: user.image ? config.aws.imageBucketPath + user.image : config.aws.defaultImagePath
    }));

};
