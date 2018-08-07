"use strict";

// middleware to be given to service so session can be loaded
// 
module.exports = ( req, res, next ) => {

  req.user = {
    name: 'Kaoré',
    uid: 1234,
    id: 12
  }

  console.log( 'loading user' )  

  next();

}