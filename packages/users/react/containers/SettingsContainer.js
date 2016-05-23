"use strict";

const React = require( 'react' ),

  { connect } = require( 'react-redux' ),

  { push } = require( 'react-router-redux' ),

  { change: changeFieldValue } = require( 'redux-form' ),

  get = require( 'utils/get' ),

  actions = require( '../actions' ),

  ProfileSettings = require( '../components/ProfileSettings' ),

  EmailSettings = require( '../components/EmailSettings' ),

  PasswordSettings = require( '../components/PasswordSettings' ),

  ApiKeySettings = require( '../components/ApiKeySettings' );


const SettingsContainer = React.createClass( {

  displayName: 'SettingsContainer',

  componentWillMount() {

    this.props.getMe();

  },

  render() {

    const { route: { activeTab }, user, updateProfile, changeEmail, changePassword } = this.props;

    return (
      <div style={{padding: '15px 0'}}>
        <ProfileSettings activeTab={activeTab == 'profile'} onSubmit={updateProfile}/>
        <EmailSettings activeTab={activeTab == 'email'} onSubmit={changeEmail}/>
        <PasswordSettings activeTab={activeTab == 'password'} onSubmit={changePassword}/>
        <ApiKeySettings activeTab={activeTab == 'apiKey'}/>
      </div>
    );
  }

} );

function mapStateToProps( { app: { appSettings }, userSettings: { user } } ) {

  return {
    appSettings,
    user
  };

}

function mergeProps( stateProps, dispatchProps, ownProps ) {

  const { dispatch } = dispatchProps;

  const { appSettings } = stateProps;

  const mapDispatchToProps = {
    getMe,
    updateProfile,
    changeEmail,
    changePassword
  };

  return Object.assign( {}, ownProps, stateProps, mapDispatchToProps );


  function getMe() {
    dispatch( actions.getMe( 'request' ) );

    get( url( 'getMe' ), ( err, result ) => {
      if ( !err ) {
        dispatch( actions.getMe( 'response', result ) );
        dispatch( changeFieldValue( 'profileSettings', 'fullname', result.user.full_name ) );
        dispatch( changeFieldValue( 'profileSettings', 'culture', result.user.culture ) );
        dispatch( changeFieldValue( 'emailSettings', 'email', result.user.email ) );
        dispatch( changeFieldValue( 'apiKeySettings', 'apiKey', result.user.api_key ) );
      }
    } );
  }

  function updateProfile( { fullname, culture } ) {
    dispatch( actions.updateProfile( 'request' ) );

    get( url( 'updateProfile' ), { full_name: fullname, culture }, ( err, result ) => {
      if ( !err ) {
        dispatch( actions.updateProfile( 'response', result ) );
      }
    } );
  }

  function changeEmail( { email, password } ) {
    dispatch( actions.changeEmail( 'request' ) );

    get( url( 'changeEmail' ), { email, password }, ( err, result ) => {
      if ( !err ) {
        dispatch( actions.changeEmail( 'response', result ) );
      }
    } );
  }

  function changePassword( { old_password, new_password, confirmation } ) {
    dispatch( actions.changePassword( 'request' ) );

    get( url( 'changePassword' ), { old_password, new_password, confirmation }, ( err, result ) => {
      if ( !err ) {
        dispatch( actions.changePassword( 'response', result ) );
      }
    } );
  }

  function url( name ) {
    return appSettings.prefix + appSettings.urls[ name ];
  }

}

module.exports = connect( mapStateToProps, dispatch => ({ dispatch }), mergeProps )( SettingsContainer );