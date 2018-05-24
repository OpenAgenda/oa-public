"use strict";

const React = require( 'react' ),

  createReactClass = require( 'create-react-class' ),

  PropTypes = require( 'prop-types' ),

  { bindActionCreators } = require( 'redux' ),

  { connect } = require( 'react-redux' ),

  { routerActions } = require( 'react-router-redux' ),

  { change: changeFieldValue, reset: resetForm } = require( 'redux-form' ),

  get = require( '@openagenda/utils/get' ),

  request = require( 'superagent' ),

  actions = require( '../actions' ),

  Spinner = require( '@openagenda/react-form-components/build/Spinner' ),

  ProfileSettings = require( '../components/ProfileSettings' ),

  ImageSettings = require( '../components/ImageSettings' ),

  EmailSettings = require( '../components/EmailSettings' ),

  PasswordSettings = require( '../components/PasswordSettings' ),

  ApiKeySettings = require( '../components/ApiKeySettings' ),

  UnsubscribedSettings = require( '../components/UnsubscribedSettings' ),

  Modal = require( '@openagenda/react-components/build/Modal' );


const SettingsContainer = createReactClass( {

  displayName: 'SettingsContainer',

  contextTypes: {
    getLabels: PropTypes.func
  },

  componentWillMount() {

    this.props.getMe()
      .then( () => this.props.listUnsubscriptions() )
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
      onChangeProfileImage,
      removeUnsubscription
    } = this.props;

    return (
      <div className="table-responsive" style={{ padding: '15px 0', position: 'relative' }}>

        {loading ? <Spinner /> :
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
              removeUnsubscription={removeUnsubscription}
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
    deleteAccount,
    listUnsubscriptions,
    removeUnsubscription
  };

  return Object.assign( {}, ownProps, stateProps, mapDispatchToProps );

  function setLoading( value ) {

    dispatch( actions.setLoading( value ) );

  }

  function getMe() {
    dispatch( actions.getMe( 'request' ) );

    return new Promise( ( resolve, reject ) => {

      get( getUrl( 'getMe' ), ( err, result ) => {
        if ( err ) {
          reject( err );
        } else {
          dispatch( actions.getMe( 'response', result ) );
          if ( result.user ) {
            dispatch( changeFieldValue( 'profileSettings', 'full_name', result.user.full_name ) );
            dispatch( changeFieldValue( 'profileSettings', 'culture', result.user.culture ) );
            dispatch( changeFieldValue( 'emailSettings', 'email', result.user.email ) );
            dispatch( changeFieldValue( 'apiKeySettings', 'apiKey', result.user.api_key ) );
            dispatch( changeFieldValue( 'apiKeySettings', 'apiSecret', result.user.api_secret ) );
            resolve( result.user );
          } else {
            reject();
          }
        }
      } );
    } );
  }

  function updateUser( { full_name, culture } ) {
    dispatch( actions.updateUser( 'request' ) );

    return new Promise( ( resolve, reject ) => {
      get( getUrl( 'updateProfile' ), { full_name, culture }, ( err, result ) => {
        if ( !err ) {
          let errors = getFormFirstErrors( result.errors );

          if ( Object.keys( errors ).length ) {
            reject( errors );
          } else {
            dispatch( actions.displayMessage( 'updateProfile', true ) );
            if ( stateProps.user.culture !== result.user.culture ) {
              location.reload();
            }
            setTimeout( () => {
              dispatch( actions.displayMessage( 'updateProfile', false ) );
            }, 2000 );
            resolve( result );
          }

          if ( result.success ) {
            dispatch( actions.updateUser( 'response', result ) );
          }
        }
      } );
    } );
  }

  function onChangeProfileImage( image, err ) {

    dispatch( actions.updateUser( 'response', { image } ) );

  }

  function changeEmail( { email, password } ) {
    dispatch( actions.changeEmail( 'request' ) );

    return new Promise( ( resolve, reject ) => {

      get( getUrl( 'changeEmail' ), { email, password }, ( err, result ) => {
        if ( !err ) {
          let errors = getFormFirstErrors( result.errors );

          if ( Object.keys( errors ).length ) {
            reject( errors );
          } else {
            dispatch( actions.displayMessage( 'changeEmail', true ) );
            setTimeout( () => dispatch( actions.displayMessage( 'changeEmail', false ) ), 2000 );
            resolve();
          }

          dispatch( actions.changeEmail( 'response', result ) );
        }
      } );

    } )
      .then( () => {
        dispatch( resetForm( 'emailSettings' ) );
      } );
  }

  function changePassword( { old_password, new_password, confirmation } ) {
    dispatch( actions.changePassword( 'request' ) );

    return new Promise( ( resolve, reject ) => {

      get( getUrl( 'changePassword' ), { old_password, new_password, confirmation }, ( err, result ) => {
        if ( !err ) {
          let errors = getFormFirstErrors( result.errors );

          if ( Object.keys( errors ).length ) {
            reject( errors );
          } else {
            dispatch( actions.displayMessage( 'changePassword', true ) );
            setTimeout( () => dispatch( actions.displayMessage( 'changePassword', false ) ), 2000 );
            resolve();
          }
          dispatch( actions.changePassword( 'response', result ) );
        }
      } );

    } )
      .then( () => {
        dispatch( resetForm( 'passwordSettings' ) );
      } );
  }

  function generateApiKey( secret = 0 ) {
    dispatch( actions.generateApiKey( 'request' ) );

    request.get( getUrl( 'generateApiKey' ) )
      .query( { secret } )
      .set( 'X-Requested-With', 'XMLHttpRequest' )
      .end( ( err, result ) => {
        if ( !err ) {
          let errors = getFormFirstErrors( result.body.errors );

          if ( !Object.keys( errors ).length ) {
            dispatch( actions.generateApiKey( 'response', { ...result.body, secret } ) );
            dispatch( changeFieldValue( 'apiKeySettings', secret ? 'apiSecret' : 'apiKey', result.body.key ) );
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

    request.post( getUrl( 'deleteAccount' ) )
      .set( 'X-Requested-With', 'XMLHttpRequest' )
      .send( { _csrf: appSettings.csrfToken } )
      .end( ( err, res ) => {
        dispatch( actions.deleteAccount( 'response' ) );
        if ( !err && res.ok ) {
          window.location.href = res.body.redirectTo || '/signout';
        }
      } );
  }

  function listUnsubscriptions() {
    dispatch( actions.listUnsubscriptions( 'request' ) );

    return new Promise( ( resolve, reject ) => {

      request.get( appSettings.urls[ 'listUnsubscriptions' ].replace( ':userUid', stateProps.user.uid ) )
        .end( ( err, result ) => {
          if ( err ) return reject( err );
          dispatch( actions.listUnsubscriptions( 'response', result.body ) );
          resolve( result.body.unsubscriptions );
        } );

    } );
  }

  function removeUnsubscription( unsubscription ) {
    dispatch( actions.removeUnsubscription( 'request' ) );

    return new Promise( ( resolve, reject ) => {

      let url = appSettings.urls[ 'removeUnsubscription' ]
        .replace( ':userUid', stateProps.user.uid )
        .replace( ':subject', unsubscription.subject )
        .replace( '.:identifier', unsubscription.identifier ? '.' + unsubscription.identifier : '' )
        .replace( ':type', unsubscription.type );

      if ( unsubscription.type === null ) {
        url = url.replace( '/t/null', '' );
      }

      if ( unsubscription.type === undefined ) {
        url = url.replace( '/t/undefined', '' );
      }

      request.get( url )
        .end( ( err, result ) => {
          if ( err ) return reject( err );
          dispatch( actions.removeUnsubscription( 'response', Object.assign( result.body, { unsubscription } ) ) );
          resolve( result.body );
        } );

    } );
  }

  function getUrl( name ) {
    return appSettings.prefix + appSettings.urls[ name ];
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