import agendaSchema from 'agendas/service/validate/public';
import { checkSlug } from '../../redux/modules/agenda';

export const schema = agendaSchema.struct;

export function validate( values ) {
  try {

    agendaSchema( values );

  } catch ( e ) {

    return Object.assign( ...e.map( v => ({ [v.field]: v.code }) ) );

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
        return Object.assign( ...error.errors.map( v => ({ [v.field]: v.code }) ) );
      }
      return true;
    } );
}
