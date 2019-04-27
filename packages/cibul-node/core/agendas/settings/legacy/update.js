"use strict";

const _ = require( 'lodash' );

const updateTagSetFromSchema = require( './updateTagSetFromSchema' );
const updateCustomFromSchema = require( './updateCustomFromSchema' );
const controlData = require( '../../../../services/legacy' ).controlData;

module.exports = async ( config, agendaOrUid, force = false ) => {

  const agenda = _.isObject( agendaOrUid ) ? agendaOrUid : await getAgenda( agendaOrUid );

  return {
    tags: await updateTagSetFromSchema( config, agenda, force ),
    custom: await updateCustomFromSchema( config, agenda, force ),
    controlData: await controlData.setTags( agenda.uid )
  }

}
