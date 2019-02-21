"use strict";

const _ = require( 'lodash' );

const navigation = require( '../lib/navigation' );

module.exports = ( req, res, next ) => {

  _.assign( req.data, {
    navigation: {
      list: navigation.listLink( req.app.locals.root, req.query )
    }
  } );

  next();

}
