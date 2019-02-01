import { actionTypes as formActionTypes, SubmissionError } from 'redux-form';
import { generate as generateSlug } from '@openagenda/agendas/service/slugs';

const LOAD = 'agenda-settings/agenda/LOAD';
const LOAD_SUCCESS = 'agenda-settings/agenda/LOAD_SUCCESS';
const LOAD_FAIL = 'agenda-settings/agenda/LOAD_FAIL';
const CREATE = 'agenda-settings/agenda/CREATE';
const CREATE_SUCCESS = 'agenda-settings/agenda/CREATE_SUCCESS';
const CREATE_FAIL = 'agenda-settings/agenda/CREATE_FAIL';
const EDIT = 'agenda-settings/agenda/EDIT';
const EDIT_SUCCESS = 'agenda-settings/agenda/EDIT_SUCCESS';
const EDIT_FAIL = 'agenda-settings/agenda/EDIT_FAIL';
const IMAGE_UPLOADED = 'agenda-settings/agenda/IMAGE_UPLOADED';
const CHECK_SLUG = 'agenda-settings/agenda/CHECK_SLUG';
const CHECK_SLUG_SUCCESS = 'agenda-settings/agenda/CHECK_SLUG_SUCCESS';
const CHECK_SLUG_FAIL = 'agenda-settings/agenda/CHECK_SLUG_FAIL';
const REMOVE = 'agenda-settings/agenda/REMOVE';
const REMOVE_SUCCESS = 'agenda-settings/agenda/REMOVE_SUCCESS';
const REMOVE_FAIL = 'agenda-settings/agenda/REMOVE_FAIL';

const initialState = {
  loaded: false
};

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
    case LOAD:
      return {
        ...state,
        loading: true
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        data: action.result,
        error: null
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        data: null,
        error: typeof action.error === 'string' ? action.error : 'Error'
      };
    case IMAGE_UPLOADED:
      if ( action.error ) return state;
      return {
        ...state,
        imageChanged: true,
        data: {
          ...state.data,
          image: action.image || null
        }
      };
    case EDIT_SUCCESS:
      return {
        ...state,
        data: action.result.agenda
      };
    default:
      return state;
  }

};

export function formPlugin( state = {}, action ) {

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

export function isLoaded( globalState ) {
  return globalState.agenda && globalState.agenda.loaded;
}

export function load() {
  return {
    types: [ LOAD, LOAD_SUCCESS, LOAD_FAIL ],
    promise: ( client, { res, agenda } ) => client.get( res.get.replace( ':uid', agenda.uid ) )
  };
}

export function create( data ) {
  return {
    types: [ CREATE, CREATE_SUCCESS, CREATE_FAIL ],
    promise: ( client, { res } ) => client.post( res.create, { data } ).catch( catchValidation )
  };
}

export function edit( data ) {
  return {
    types: [ EDIT, EDIT_SUCCESS, EDIT_FAIL ],
    promise: ( client, { res, agenda } ) => client.post( res.set.replace( ':slug', agenda.data.slug ), { data } )
      .catch( catchValidation )
  };
}

export function imageUploaded( image, error ) {
  return {
    type: IMAGE_UPLOADED,
    image,
    error
  };
}

export function checkSlug( data ) {
  return {
    types: [ CHECK_SLUG, CHECK_SLUG_SUCCESS, CHECK_SLUG_FAIL ],
    promise: ( client, { res } ) => client.post( res.slugAvailable, { data } )
  };
}

export function remove() {
  return {
    types: [ REMOVE, REMOVE_SUCCESS, REMOVE_FAIL ],
    promise: ( client, { res, agenda } ) => client.post( res.remove.replace( ':slug', agenda.data.slug ) )
  };
}
