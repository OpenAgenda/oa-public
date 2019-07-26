"use strict";

const formatReview = require( '@openagenda/legacy/rebuildSearchIndex/formatReview' );

module.exports = ( { update, knex } ) => {

  return async identifier => update(
    await formatReview( knex, identifier )
  );

}
