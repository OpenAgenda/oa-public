"use strict";

module.exports = req => {

  return /\.[a-z][a-z]([a-z]|)([a-z]|)$/.test( req.originalUrl );

}
