import { SubmissionError, change as changeFieldValue, reset as resetForm } from 'redux-form';

const LOAD = 'user-apps/userSettings/LOAD';
const LOAD_SUCCESS = 'user-apps/userSettings/LOAD_SUCCESS';
const LOAD_FAIL = 'user-apps/userSettings/LOAD_FAIL';
const UPDATE_USER = 'user-apps/userSettings/UPDATE_USER';
const UPDATE_USER_SUCCESS = 'user-apps/userSettings/UPDATE_USER_SUCCESS';
const UPDATE_USER_FAIL = 'user-apps/userSettings/UPDATE_USER_FAIL';
const CHANGE_EMAIL = 'user-apps/userSettings/CHANGE_EMAIL';
const CHANGE_EMAIL_SUCCESS = 'user-apps/userSettings/CHANGE_EMAIL_SUCCESS';
const CHANGE_EMAIL_FAIL = 'user-apps/userSettings/CHANGE_EMAIL_FAIL';
const CHANGE_PASSWORD = 'user-apps/userSettings/CHANGE_PASSWORD';
const CHANGE_PASSWORD_SUCCESS = 'user-apps/userSettings/CHANGE_PASSWORD_SUCCESS';
const CHANGE_PASSWORD_FAIL = 'user-apps/userSettings/CHANGE_PASSWORD_FAIL';
const GENERATE_APIKEY = 'user-apps/userSettings/GENERATE_APIKEY';
const GENERATE_APIKEY_SUCCESS = 'user-apps/userSettings/GENERATE_APIKEY_SUCCESS';
const GENERATE_APIKEY_FAIL = 'user-apps/userSettings/GENERATE_APIKEY_FAIL';
const DELETE_ACCOUNT = 'user-apps/userSettings/DELETE_ACCOUNT';
const DELETE_ACCOUNT_SUCCESS = 'user-apps/userSettings/DELETE_ACCOUNT_SUCCESS';
const DELETE_ACCOUNT_FAIL = 'user-apps/userSettings/DELETE_ACCOUNT_FAIL';
const DISPLAY_DELETE_ACCOUNT_CONFIRMATION = 'user-apps/userSettings/DISPLAY_DELETE_ACCOUNT_CONFIRMATION';
const DISPLAY_MODAL = 'user-apps/userSettings/DISPLAY_MODAL';
const DISPLAY_MESSAGE = 'user-apps/userSettings/DISPLAY_MESSAGE';


function getFormFirstErrors( validatorErrors ) {
  let errors = {};

  if ( validatorErrors ) {
    let oneErrorPerField = validatorErrors.filter( ( e, i, a ) => {
      return a.findIndex( _e => e.field === _e.field ) === i
    } );

    for ( let error of oneErrorPerField ) {
      errors[ error.field ] = error.code;
    }
  }

  return errors;
}

const initialState = {
  loading: false,
  loaded: false,
  user: null,
  modal: {},
  successMessagesDisplayed: {
    updateProfile: false,
    changeEmail: false,
    changePassword: false
  }
};

export default function reducer( state = initialState, action ) {
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
        user: action.result
      };
    case LOAD_FAIL:
      return {
        ...state,
        user: null,
        error: action.error,
        loading: false
      };
    case UPDATE_USER_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.result
        }
      };
    case GENERATE_APIKEY_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.result
        }
      };
    case DELETE_ACCOUNT_SUCCESS:
      return {
        ...state,
        user: null
      };
    case DISPLAY_MODAL:
      return {
        ...state,
        modal: action.modal
      };
    case DISPLAY_DELETE_ACCOUNT_CONFIRMATION:
      return {
        ...state,
        deleteAccountConfirmationIsOpen: action.visible
      };
    case DISPLAY_MESSAGE:
      return {
        ...state,
        successMessagesDisplayed: {
          ...state.successMessagesDisplayed,
          [ action.name ]: action.visible
        }
      };
    default:
      return state;
  }
}

export function isLoaded( globalState ) {
  return globalState.userSettings && globalState.userSettings.loaded;
}

export function load() {
  return {
    types: [ LOAD, LOAD_SUCCESS, LOAD_FAIL ],
    promise: async ( { client }, { getState, dispatch } ) => {
      const { res } = getState();

      const user = await client.get( res.getMe, {
        params: {
          $client: {
            includeImagePath: true
          }
        }
      } );

      dispatch( changeFieldValue( 'profileSettings', 'fullName', user.fullName ) );
      dispatch( changeFieldValue( 'profileSettings', 'culture', user.culture ) );
      // dispatch( changeFieldValue( 'emailSettings', 'newEmail', user.email ) );
      dispatch( changeFieldValue( 'apiKeySettings', 'apiKey', user.apiKey ) );
      dispatch( changeFieldValue( 'apiKeySettings', 'apiSecret', user.apiSecret ) );

      return user;
    }
  };
}

export function displayMessage( name, visible ) {
  return {
    type: DISPLAY_MESSAGE,
    name,
    visible
  };
}

export function displayModal( modal ) {
  return {
    type: DISPLAY_MODAL,
    modal
  }
}

export function updateUser( data = {} ) {
  return {
    types: [ UPDATE_USER, UPDATE_USER_SUCCESS, UPDATE_USER_FAIL ],
    promise: async ( { client }, { getState, dispatch } ) => {
      const { res, userSettings } = getState();

      try {
        const result = await client.patch( res.updateProfile, data, {
          params: {
            $client: {
              includeImagePath: true
            }
          }
        } );

        dispatch( displayMessage( 'updateProfile', true ) );
        if ( userSettings.user.culture !== result.culture ) {
          location.reload();
        }
        setTimeout( () => dispatch( displayMessage( 'updateProfile', false ) ), 2000 );

        return result;
      } catch ( error ) {
        const errors = getFormFirstErrors( error.errors );

        if ( Object.keys( errors ).length ) {
          throw new SubmissionError( errors );
        } else if ( error.message ) {
          throw new SubmissionError( { _error: error.message } );
        }
      }
    }
  };
}

export function deleteAccount() {
  return {
    types: [ DELETE_ACCOUNT, DELETE_ACCOUNT_SUCCESS, DELETE_ACCOUNT_FAIL ],
    promise: ( { client }, { getState } ) => {
      const { res } = getState();

      return client.delete( res.deleteAccount )
        .then( res => {
          window.location.href = res.redirectTo || '/signout';
        } );
    }
  };
}

export function changeEmail( data ) {
  return {
    types: [ CHANGE_EMAIL, CHANGE_EMAIL_SUCCESS, CHANGE_EMAIL_FAIL ],
    promise: async ( { client }, { getState, dispatch } ) => {
      const { res } = getState();

      try {
        const result = await client.patch( res.changeEmail, data, {
          params: {
            $client: {
              includeImagePath: true
            }
          }
        } );

        dispatch( displayMessage( 'changeEmail', true ) );
        setTimeout( () => dispatch( displayMessage( 'changeEmail', false ) ), 2000 );
        dispatch( resetForm( 'emailSettings' ) );

        return result;
      } catch ( error ) {
        if ( error.message === 'Already exist' ) {
          error.errors = [
            {
              field: 'newEmail',
              code: 'email.alreadytaken'
            }
          ];
        }

        const errors = getFormFirstErrors( error.errors );

        if ( Object.keys( errors ).length ) {
          throw new SubmissionError( errors );
        } else if ( error.message ) {
          throw new SubmissionError( { _error: error.message } );
        }
      }
    }
  };
}

export function changePassword( data ) {
  return {
    types: [ CHANGE_PASSWORD, CHANGE_PASSWORD_SUCCESS, CHANGE_PASSWORD_FAIL ],
    promise: async ( { client }, { getState, dispatch } ) => {
      const { res } = getState();

      try {
        const result = await client.patch( res.changePassword, data, {
          params: {
            $client: {
              includeImagePath: true
            }
          }
        } );

        dispatch( displayMessage( 'changePassword', true ) );
        setTimeout( () => dispatch( displayMessage( 'changePassword', false ) ), 2000 );
        dispatch( resetForm( 'passwordSettings' ) );

        return result;
      } catch ( error ) {
        const errors = getFormFirstErrors( error.errors );

        if ( Object.keys( errors ).length ) {
          throw new SubmissionError( errors );
        } else if ( error.message ) {
          throw new SubmissionError( { _error: error.message } );
        }
      }
    }
  };
}

export function generateApiKey( secret ) {
  return {
    types: [ GENERATE_APIKEY, GENERATE_APIKEY_SUCCESS, GENERATE_APIKEY_FAIL ],
    promise: async ( { client }, { getState } ) => {
      const { res } = getState();

      return client.get( res.generateApiKey, {
        params: {
          $client: {
            includeImagePath: true,
            [ secret ? 'secretKey' : 'publicKey' ]: true
          }
        }
      } );
    }
  };
}
