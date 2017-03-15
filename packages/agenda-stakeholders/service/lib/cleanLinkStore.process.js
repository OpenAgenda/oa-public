"use strict";

/**
 * a store that is used for associating
 * temporary data useful for linking a stakeholder reference to a user.
 */
module.exports = ( user, linkStore, cb ) => cb( null, user ? null : linkStore );


/**
 * stakeholders can only have a linkStore if they are not linked to a user
 */
module.exports.byStakeholder = ( stakeholder, userId, linkStore, cb ) => {

  if ( !stakeholder ) {

    return cb( null, null );

  }

  if ( !linkStore && stakeholder.linkStore ) {

    linkStore = stakeholder.linkStore;

  }

  if ( userId ) {

    linkStore = null;

  }

  cb( null, linkStore );

}