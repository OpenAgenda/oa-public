"use strict";

const _ = {
  get: require( 'lodash/get' ),
  flatten: require( 'lodash/flatten' ),
  uniq: require( 'lodash/uniq' )
}

module.exports = {
  extractNextOptionId,
  fieldHasUnnassignedOptions,
  fieldAssignOptionIds,
  fieldHasSuperiorOptions
}

function fieldHasUnnassignedOptions( field ) {

  return !!_.get( field, 'options', [] ).filter( o => !o.id ).length;

}

function fieldHasSuperiorOptions( field, nextOptionId ) {

  return !!_.get( field, 'options', [] ).filter( o => o.id > nextOptionId ).length;

}


function fieldAssignOptionIds( field, nextOptionId ) {

  field.options.forEach( o => {

    if ( !o.id ) o.id = nextOptionId++;

  } );

  return nextOptionId;

}

function extractNextOptionId( formSchemaData ) {

  const definedNextOptionId = _.get( formSchemaData, 'nextOptionId', 0 );

  const optionIds = _.uniq( _.flatten( _.get( formSchemaData, 'fields', [] )
    .filter( f => f.options )
    .map( f => f.options )
  ) );

  const biggestId = optionIds.reduce( ( biggestId, optionId ) => biggestId < optionId ? optionId : biggestId, 0 );

  return definedNextOptionId > biggestId ? definedNextOptionId : biggestId + 1;

}
