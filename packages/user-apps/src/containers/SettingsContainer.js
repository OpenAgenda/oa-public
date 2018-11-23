"use strict";

const React = require( 'react' );
const createReactClass = require( 'create-react-class' );
const PropTypes = require( 'prop-types' );
const { bindActionCreators } = require( 'redux' );
const { connect } = require( 'react-redux' );
const { routerActions } = require( 'react-router-redux' );
const { change: changeFieldValue, reset: resetForm } = require( 'redux-form' );
const request = require( 'superagent' );
const Spinner = require( '@openagenda/react-form-components/build/Spinner' );
const Modal = require( '@openagenda/react-components/build/Modal' );
const actions = require( '../actions' );
const ProfileSettings = require( '../components/ProfileSettings' );
const ImageSettings = require( '../components/ImageSettings' );
const EmailSettings = require( '../components/EmailSettings' );
const PasswordSettings = require( '../components/PasswordSettings' );
const ApiKeySettings = require( '../components/ApiKeySettings' );
const UnsubscribedSettings = require( '../components/UnsubscribedSettings' );


const SettingsContainer = createReactClass( {

  displayName: 'SettingsContainer',

  contextTypes: {
    getLabels: PropTypes.func
  },

  componentWillMount() {

    this.props.getMe()
      .then(
        () => this.props.setLoading( false ),
        () => this.props.setLoading( false )
      );

  },

  render() {

    const { getLabels } = this.context;

    const {
      loading, user, route: { activeTab }, routerActions, getUrl,
      updateUser, changeEmail, changePassword, deleteAccount,
      generateApiKey,
      displayModal, modal,
      successMessagesDisplayed: {
        updateProfile: profileMessageDisplayed,
        changeEmail: emailMessageDisplayed,
        changePassword: passwordMessageDisplayed
      },
      onChangeProfileImage
    } = this.props;

    return (
      <div className="table-responsive" style={{ padding: '15px 0', position: 'relative' }}>

        {loading ? <Spinner/> :
          <table className="table">
            <tbody>

            <ProfileSettings
              activeTab={activeTab == 'profile'}
              onSubmit={updateUser}
              deleteAccount={deleteAccount}
              displayModal={displayModal}
              successMessageDisplayed={profileMessageDisplayed}
            />

            <ImageSettings
              activeTab={activeTab == 'image'}
              routerActions={routerActions}
              onUpdate={onChangeProfileImage}
              uploadImageRes={getUrl( 'uploadProfileImageRes' )}
              removeImageRes={getUrl( 'removeProfileImageRes' )}
              image={user && user.image || ''}
            />

            <EmailSettings
              activeTab={activeTab == 'email'}
              onSubmit={changeEmail}
              successMessageDisplayed={emailMessageDisplayed}
            />

            <PasswordSettings
              activeTab={activeTab == 'password'}
              onSubmit={changePassword}
              successMessageDisplayed={passwordMessageDisplayed}
            />

            <ApiKeySettings
              activeTab={activeTab == 'apiKey'}
              generateApiKey={generateApiKey}
              displayModal={displayModal}
            />

            <UnsubscribedSettings
              activeTab={activeTab == 'unsubscribed'}
            />

            </tbody>
          </table>}

        <Modal visible={modal.visible || false} onClose={() => displayModal( { visible: false } )}
               title={modal.title || ''}>
          <div className="text-center">
            {modal.content || ''}
            <button
              className={modal.buttonClass || 'btn btn-danger'}
              onClick={() => {
                if ( modal.action ) modal.action();
                displayModal( { visible: false } )
              }}>
              {modal.actionText || ''}
            </button>
          </div>
        </Modal>

      </div>
    );
  }

} );

function mapStateToProps( { app: { appSettings, loading }, userSettings } ) {

  return {
    loading,
    appSettings,
    ...userSettings
  };

}

function mergeProps( stateProps, dispatchProps, ownProps ) {

  const { dispatch } = dispatchProps;

  const { appSettings } = stateProps;

  const mapDispatchToProps = {
    setLoading,
    getUrl,
    routerActions: bindActionCreators( routerActions, dispatch ),
    getMe,
    updateUser,
    onChangeProfileImage,
    changeEmail,
    changePassword,
    generateApiKey,
    displayModal,
    deleteAccount
  };

  return Object.assign( {}, ownProps, stateProps, mapDispatchToProps );

  function setLoading( value ) {

    dispatch( actions.setLoading( value ) );

  }

  async function getMe() {
    dispatch( actions.getMe( 'request' ) );

    const result = (await request.get( getUrl( 'getMe' ) )).body;

    dispatch( actions.getMe( 'response', { user: result } ) );

    dispatch( changeFieldValue( 'profileSettings', 'fullName', result.fullName ) );
    dispatch( changeFieldValue( 'profileSettings', 'culture', result.culture ) );
    dispatch( changeFieldValue( 'emailSettings', 'newEmail', result.email ) );
    dispatch( changeFieldValue( 'apiKeySettings', 'apiKey', result.apiKey ) );
    dispatch( changeFieldValue( 'apiKeySettings', 'apiSecret', result.apiSecret ) );

    return result;
  }

  async function updateUser( { fullName, culture } ) {
    try {
      dispatch( actions.updateUser( 'request' ) );

      const result = (await request.patch( getUrl( 'updateProfile' ) )
        .send( { fullName, culture } )).body;

      dispatch( actions.updateUser( 'response', result ) );
      dispatch( actions.displayMessage( 'updateProfile', true ) );
      if ( stateProps.user.culture !== result.culture ) {
        location.reload();
      }
      setTimeout( () => dispatch( actions.displayMessage( 'updateProfile', false ) ), 2000 );

      return result;
    } catch ( e ) {
      const body = e.response && e.response.body || {};
      const errors = getFormFirstErrors( body.errors );

      if ( Object.keys( errors ).length ) {
        throw errors;
      }
    }
  }

  function onChangeProfileImage( image, err ) {

    dispatch( actions.updateUser( 'response', { image } ) );

  }

  async function changeEmail( { newEmail, password } ) {
    try {
      dispatch( actions.changeEmail( 'request' ) );

      const result = (await request.patch( getUrl( 'changeEmail' ) )
        .send( { newEmail, password } )).body;

      dispatch( actions.changeEmail( 'response', result ) );
      dispatch( actions.displayMessage( 'changeEmail', true ) );
      setTimeout( () => dispatch( actions.displayMessage( 'changeEmail', false ) ), 2000 );

      dispatch( resetForm( 'emailSettings' ) );

      return result;
    } catch ( e ) {
      const body = e.response && e.response.body || {};

      if ( body.message === 'Already exist' ) {
        body.errors = [ {
          field: 'newEmail',
          code: 'email.alreadytaken'
        } ];
      }

      const errors = getFormFirstErrors( body.errors );

      if ( Object.keys( errors ).length ) {
        throw errors;
      } else if ( body.message ) {
        throw { _error: body.message }
      }
    }
  }

  async function changePassword( { oldPassword, password, confirmation } ) {
    try {
      dispatch( actions.changePassword( 'request' ) );

      const result = (await request.patch( getUrl( 'changePassword' ) )
        .send( { oldPassword, password, confirmation } )).body;

      dispatch( actions.changePassword( 'response', result ) );
      dispatch( actions.displayMessage( 'changePassword', true ) );
      setTimeout( () => dispatch( actions.displayMessage( 'changePassword', false ) ), 2000 );

      dispatch( resetForm( 'passwordSettings' ) );

      return result;
    } catch ( e ) {
      const body = e.response && e.response.body || {};

      const errors = getFormFirstErrors( body.errors );

      if ( Object.keys( errors ).length ) {
        throw errors;
      } else if ( body.message ) {
        throw { _error: body.message }
      }
    }
  }

  function generateApiKey( secret ) {
    dispatch( actions.generateApiKey( 'request' ) );

    request.get( getUrl( 'generateApiKey' ) )
      .query( { $client: { [ secret ? 'secretKey' : 'publicKey' ]: true } } )
      .set( 'X-Requested-With', 'XMLHttpRequest' )
      .end( ( err, result ) => {
        if ( !err ) {
          let errors = getFormFirstErrors( result.body.errors );

          if ( !Object.keys( errors ).length ) {
            const key = result.body[ secret ? 'apiSecret' : 'apiKey' ];

            if ( key ) {
              dispatch( actions.generateApiKey( 'response', { key, secret } ) );
              dispatch( changeFieldValue( 'apiKeySettings', secret ? 'apiSecret' : 'apiKey', key ) );
            }
          }
        }
      } );
  }

  function displayModal( modal, e ) {
    if ( e ) e.preventDefault();
    dispatch( actions.displayModal( modal ) );
  }

  function deleteAccount() {
    dispatch( actions.deleteAccount( 'request' ) );

    request.del( getUrl( 'deleteAccount' ) )
      .set( 'X-Requested-With', 'XMLHttpRequest' )
      .end( ( err, res ) => {
        dispatch( actions.deleteAccount( 'response' ) );
        if ( !err && res.ok ) {
          window.location.href = res.body.redirectTo || '/signout';
        }
      } );
  }

  function getUrl( name ) {
    return appSettings.urls[ name ];
  }

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

}

module.exports = connect( mapStateToProps, dispatch => ({ dispatch }), mergeProps )( SettingsContainer );
