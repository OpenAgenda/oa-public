"use strict";

const createAgenda = require( '../agendas/create' );

module.exports = ( networkUid, data ) => createAgenda( { ...data, networkUid }, {
  updateLegacy: true
} );
