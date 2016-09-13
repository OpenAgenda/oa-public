import { actionTypes as formActionTypes, SubmissionError } from 'redux-form';
import { generate as generateSlug } from 'agendas/service/slugs';

const CREATE = 'agenda-settings/agenda/CREATE';
const CREATE_SUCCESS = 'agenda-settings/agenda/CREATE_SUCCESS';
const CREATE_FAIL = 'agenda-settings/agenda/CREATE_FAIL';
const CHECK_SLUG = 'agenda-settings/agenda/CHECK_SLUG';
const CHECK_SLUG_SUCCESS = 'agenda-settings/agenda/CHECK_SLUG_SUCCESS';
const CHECK_SLUG_FAIL = 'agenda-settings/agenda/CHECK_SLUG_FAIL';

const initialState = {};

const catchValidation = res => {
  if ( res.errors ) {
    throw new SubmissionError( Object.assign( ...res.errors.map( v => ({ [v.field]: v.message }) ) ) );
  }
  if ( res.response && res.response.error && res.response.error.message ) {
    throw new SubmissionError( { _error: res.response.error.message } );
  }
  return Promise.reject( res );
};

export default function reducer( state = initialState, action = {} ) {

  switch ( action.type ) {
    default:
      return state;
  }

};

export function formPlugin( state, action ) {

  switch ( action.type ) {
    case formActionTypes.CHANGE:
      if ( !state.values ) {
        return {
          ...state,
          slugModified: false
        };
      }
      if ( action.meta.field === 'slug' ) {
        return {
          ...state,
          slugModified: action.payload !== ''
        }
      }
      if ( action.meta.field !== 'title' || state.slugModified ) {
        return state;
      }
      return {
        ...state,
        values: {
          ...state.values,
          slug: generateSlug( action.payload )
        }
      };
    default:
      return state;
  }

}

export function create( data ) {
  return {
    types: [ CREATE, CREATE_SUCCESS, CREATE_FAIL ],
    promise: client => client.post( '', { data } ).catch( catchValidation )
  };
}

export function checkSlug( data ) {
  return {
    types: [ CHECK_SLUG, CHECK_SLUG_SUCCESS, CHECK_SLUG_FAIL ],
    promise: client => client.post( 'slugs/available', { data } )
  };
}
