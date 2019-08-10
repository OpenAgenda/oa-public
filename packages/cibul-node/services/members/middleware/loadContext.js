"use strict";

const _ = require( 'lodash' );

module.exports = ( req, res, next ) => {
  req.context = _.merge( {
    lang: req.lang,
    sender: {
      userUid: req.user.uid,
      memberName: _.get( req, 'member.custom.contactName' ) || req.user.fullName
    }
  }, req.body.context );
  next();
}
