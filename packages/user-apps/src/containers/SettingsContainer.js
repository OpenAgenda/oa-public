import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { provideHooks } from 'redial';
import { withLayoutData, Spinner, Modal } from '@openagenda/react-shared';
import * as userSettingsActions from '../reducers/userSettings';
import {
  ProfileSettings,
  ImageSettings,
  EmailSettings,
  PasswordSettings,
  ApiKeySettings,
  UnsubscribedSettings
} from '../components';

@provideHooks( {
  fetch: async ( { store: { dispatch } } ) => typeof window !== 'undefined'
    ? dispatch(userSettingsActions.load())
    : Promise.resolve()
} )
@withLayoutData('lang')
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
      route,
      loading,
      user,
      lang,
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
          ? (
            <div style={{ margin: '150px 0' }}>
              <Spinner />
            </div>
          )
          : (
            <>
              <table className="table">
                <tbody>
                <ProfileSettings
                  activeTab={route.activeTab === 'profile'}
                  onSubmit={updateUser}
                  initialValues={_.pick( user, 'fullName', 'culture' )}
                  deleteAccount={deleteAccount}
                  displayModal={displayModal}
                  successMessageDisplayed={profileMessageDisplayed}
                  user={user}
                  lang={lang}
                />

                <ImageSettings
                  activeTab={route.activeTab === 'image'}
                  history={history}
                  onUpdate={updateUser}
                  image={user && user.image || ''}
                  user={user}
                  lang={lang}
                />

                {user.hasLocalAccount ? (
                  <>
                    <EmailSettings
                      activeTab={route.activeTab === 'email'}
                      onSubmit={changeEmail}
                      successMessageDisplayed={emailMessageDisplayed}
                      user={user}
                      lang={lang}
                    />
                    <PasswordSettings
                      activeTab={route.activeTab === 'password'}
                      onSubmit={changePassword}
                      successMessageDisplayed={passwordMessageDisplayed}
                      user={user}
                      lang={lang}
                    />
                  </>
                ) : null}

                <ApiKeySettings
                  activeTab={route.activeTab === 'apiKey'}
                  generateApiKey={generateApiKey}
                  displayModal={displayModal}
                  user={user}
                  lang={lang}
                />

                <UnsubscribedSettings
                  activeTab={route.activeTab === 'emails'}
                  user={user}
                  lang={lang}
                />
                </tbody>
              </table>

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
            </>
          )}
      </div>
    );
  }
}
