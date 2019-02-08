import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { provideHooks } from 'redial';
import Spinner from '@openagenda/react-components/build/Spinner';
import Modal from '@openagenda/react-components/build/Modal';
import * as userSettingsActions from '../redux/modules/userSettings';
import {
  ProfileSettings,
  ImageSettings,
  EmailSettings,
  PasswordSettings,
  ApiKeySettings,
  UnsubscribedSettings
} from '../components';


@provideHooks( {
  fetch: async ( { store: { dispatch, getState } } ) => {
    const state = getState();
    const promises = [];

    if ( !userSettingsActions.isLoaded( state ) ) {
      promises.push( dispatch( userSettingsActions.load() ) );
    }

    return Promise.all( __CLIENT__ ? [] : promises );
  }
} )
@connect(
  state => ({
    res: state.res,
    loading: state.userSettings.loading,
    user: state.userSettings.user,
    successMessagesDisplayed: state.userSettings.successMessagesDisplayed,
    modal: state.userSettings.modal
  }),
  userSettingsActions
)
@withRouter
export default class SettingsContainer extends Component {
  render() {
    const {
      history,
      res,
      loading,
      activeTab,
      user,
      updateUser,
      deleteAccount,
      changeEmail,
      changePassword,
      generateApiKey,
      successMessagesDisplayed: {
        updateProfile: profileMessageDisplayed,
        changeEmail: emailMessageDisplayed,
        changePassword: passwordMessageDisplayed
      },
      displayModal,
      modal
    } = this.props;

    return (
      <div className="table-responsive" style={{ padding: '15px 0', position: 'relative' }}>
        {loading
          ? <Spinner />
          : (
            <table className="table">
              <tbody>
              <ProfileSettings
                activeTab={activeTab === 'profile'}
                onSubmit={updateUser}
                initialValues={_.pick( user, 'fullName', 'culture' )}
                deleteAccount={deleteAccount}
                displayModal={displayModal}
                successMessageDisplayed={profileMessageDisplayed}
              />

              <ImageSettings
                activeTab={activeTab === 'image'}
                history={history}
                onUpdate={image => updateUser( { image } )}
                uploadImageRes={res.uploadProfileImage}
                removeImageRes={res.removeProfileImage}
                image={user && user.image || ''}
              />

              {!(user.facebookUid || user.twitterId || user.googleId) ? (
                <EmailSettings
                  activeTab={activeTab === 'email'}
                  onSubmit={changeEmail}
                  successMessageDisplayed={emailMessageDisplayed}
                />
              ) : null}

              {!(user.facebookUid || user.twitterId || user.googleId) ? (
                <PasswordSettings
                  activeTab={activeTab === 'password'}
                  onSubmit={changePassword}
                  successMessageDisplayed={passwordMessageDisplayed}
                />
              ) : null}

              <ApiKeySettings
                activeTab={activeTab === 'apiKey'}
                generateApiKey={generateApiKey}
                displayModal={displayModal}
              />

              <UnsubscribedSettings
                activeTab={activeTab === 'emails'}
              />
              </tbody>
            </table>
          )}

        <Modal
          visible={modal.visible || false}
          onClose={() => displayModal( { visible: false } )}
          title={modal.title || ''}
        >
          <div className="text-center">
            {modal.content || ''}
            <button
              className={modal.buttonClass || 'btn btn-danger'}
              onClick={() => {
                if ( typeof modal.action === 'function' ) {
                  modal.action();
                }
                displayModal( { visible: false } )
              }}>
              {modal.actionText || ''}
            </button>
          </div>
        </Modal>
      </div>
    );
  }
}
