"use strict";

const config = require( '../../testconfig' ),

  React = require( 'react' ),

  { connect } = require( 'react-redux' ),

  { push } = require( 'react-router-redux' ),

  actions = require( '../actions' ),

  ProfileSettings = require( '../components/ProfileSettings' ),

  EmailSettings = require( '../components/EmailSettings' ),

  PasswordSettings = require( '../components/PasswordSettings' ),

  ApiKeySettings = require( '../components/ApiKeySettings' );


const SettingsContainer = React.createClass( {

  displayName: 'SettingsContainer',

  render() {

    const { route: { activeTab }, onSetProfile } = this.props;

    return (
      <div>
        <ProfileSettings activeTab={activeTab == 'profile'} onSubmit={onSetProfile}/>
        <EmailSettings activeTab={activeTab == 'email'} onSubmit={() => {}}/>
        <PasswordSettings activeTab={activeTab == 'password'} onSubmit={() => {}}/>
        <ApiKeySettings activeTab={activeTab == 'apiKey'} onSubmit={() => {}}/>
      </div>
    );
  }

} );

function mapStateToProps( store ) {

  return {};
  
}

function mapDispatchToProps( dispatch ) {

  return {
    onSetProfile
  };

  function onSetProfile( data ) {
    console.log( data );
  }

}

module.exports = connect( mapDispatchToProps )( SettingsContainer );