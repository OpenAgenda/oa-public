"use strict";

module.exports.getLocations = (uids, options, cb) => {
  cb(null, [{
    name: 'Alice',
    address: '8 rue Alice',
    city: 'Courbevoie'
  }]);
}
