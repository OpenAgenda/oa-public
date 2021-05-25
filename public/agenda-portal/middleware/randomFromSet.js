'use strict';

const _ = require('lodash');
const shuffleArray = require('../utils/shuffleArray');
//const qs = require('qs');

module.exports = (req, res, next) => {

  if(req.query && req.query.subsetRandom){
    shuffleArray(req.data.events);
    req.data = _.assign(req.data || {}, {
      events: req.data.events.slice(0, req.query.subsetRandom)
    });
  }
  
  next();
};
