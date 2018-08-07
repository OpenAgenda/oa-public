"use strict";

module.exports = ( req, res, next ) => {

  req.lang = 'fr';

  next();

}