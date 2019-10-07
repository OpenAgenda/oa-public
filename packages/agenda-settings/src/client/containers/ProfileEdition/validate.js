import agendaSchema from '@openagenda/agendas/service/validate/public';
import { checkSlug } from '../../reducers/agenda';

export const schema = agendaSchema.struct;

export function validate( values ) {
  const errors = {};

  try {

    agendaSchema( values );

  } catch ( e ) {

    Object.assign( errors, ...e.map( v => ({ [v.field]: v.code }) ) );

  }

  if ( values.description && values.description.split( /\r\n|\r|\n/ ).length > 4 ) {
    errors.description = 'description.tooManyLines';
  }

  if ( Object.keys( errors ).length ) {
    return errors;
  }

  return true;
}

export function asyncValidate( values, dispatch, props ) {

  return dispatch( checkSlug( {
    slug: values.slug,
    excludeUid: props.initialValues.uid
  } ) )
    .then( ( { error } ) => {
      if ( error && error.errors ) {
        throw Object.assign( ...error.errors.map( v => ({ [v.field]: v.code }) ) );
      }
    } );
}
