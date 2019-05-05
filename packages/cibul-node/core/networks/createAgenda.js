"use strict";

const _ = require( 'lodash' );

const createAgenda = require( '../agendas/create' );

module.exports = ( networkUid, data ) => createAgenda( { ...data, networkUid } );
