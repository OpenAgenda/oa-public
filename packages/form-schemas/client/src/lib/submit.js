"use strict";

import _ from 'lodash';
import sa from 'superagent';

export default ( { res, formSchema, values } ) => {

  const fields = formSchema.getFields();

  const fileFieldsWithFiles = fields
    .filter( f => [ 'image', 'file' ].includes( f.fileType ) )
    .filter( f => values[ f.field ] && !_.isString( values[ f.field ] ) )
    .map( f => f.field );

  const otherFields = fields
    .filter( f => !fileFieldsWithFiles.includes( f.field ) )
    .map( f => f.field );

  const req = sa.post( res );

  fileFieldsWithFiles.forEach( fieldName => {

    req.attach( fieldName, values[ fieldName ] );

  } );

  otherFields.forEach( fieldName => {

    req.field( fieldName, values[ fieldName ] );

  } );

  return new Promise( ( rs, rj ) => {

    req.end( ( err, res ) => err ? rj( err ) : rs( res ) );

  } );

}
