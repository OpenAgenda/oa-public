import _ from 'lodash';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import redial from 'redial';
import { IntlProvider } from 'react-intl';
import {
  withLayoutData,
  Spinner,
  Modal,
  locales as sharedLocales,
} from '@openagenda/react-shared';
import { getSupportedLocale, mergeLocales } from '@openagenda/intl';

import * as locales from '../locales-compiled/index.js';
import * as userSettingsActions from '../reducers/userSettings.js';
import * as userKeysActions from '../reducers/userKeys.js';
import {
  ProfileSettings,
  ImageSettings,
  EmailSettings,
  PasswordSettings,
  ApiKeySettings,
  UnlinkFacebookSettings,
  UnsubscribedSettings,
} from '../components/index.js';

const mergedLocales = mergeLocales(locales, sharedLocales);

function SettingsContainer({
  history,
  route,
  loading,
  user,
  lang,
  updateUser,
  changePassword,
  successMessagesDisplayed: {
    updateProfile: profileMessageDisplayed,
    changePassword: passwordMessageDisplayed,
  },
  displayModal,
  modal,
}) {
  return (
    <IntlProvider
      key={lang}
      locale={lang}
      messages={mergedLocales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <div
        className="table-responsive"
        style={{ padding: '15px 0', position: 'relative' }}
      >
        {loading ? (
          <div style={{ margin: '150px 0' }}>
            <Spinner />
          </div>
        ) : (
          <>
            <table className="table" role="grid">
              <tbody>
                <ProfileSettings
                  activeTab={route.activeTab === 'profile'}
                  onSubmit={updateUser}
                  initialValues={_.pick(user, 'fullName', 'culture')}
                  displayModal={displayModal}
                  successMessageDisplayed={profileMessageDisplayed}
                  user={user}
                  lang={lang}
                />

                <ImageSettings
                  activeTab={route.activeTab === 'image'}
                  history={history}
                  onUpdate={updateUser}
                  image={user?.image ?? ''}
                  user={user}
                  lang={lang}
                />

                {user.hasLocalAccount ? (
                  <>
                    <EmailSettings
                      activeTab={route.activeTab === 'email'}
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

                {user.facebookUid ? (
                  <UnlinkFacebookSettings
                    activeTab={route.activeTab === 'unlinkFacebook'}
                    user={user}
                    lang={lang}
                  />
                ) : null}

                <ApiKeySettings
                  activeTab={route.activeTab === 'apiKey'}
                  displayModal={displayModal}
                  canCreateSecretKeys={!!user.canCreateSecretKeys}
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
              onClose={() => displayModal({ visible: false })}
              title={modal.title || ''}
            >
              <div className={modal.containerClassName ?? 'text-center'}>
                {modal.content || ''}
                {modal.action ? (
                  <button
                    type="button"
                    className={modal.buttonClass || 'btn btn-danger'}
                    onClick={() => {
                      if (typeof modal.action === 'function') {
                        modal.action();
                      }
                      displayModal({ visible: false });
                    }}
                  >
                    {modal.actionText || ''}
                  </button>
                ) : null}
              </div>
            </Modal>
          </>
        )}
      </div>
    </IntlProvider>
  );
}

export default redial.provideHooks({
  fetch: async ({ store: { dispatch, getState } }) => {
    if (typeof window === 'undefined') return Promise.resolve();

    const promises = [dispatch(userSettingsActions.load())];

    // Keys are scoped to the authenticated user (no agenda switch), so a sticky
    // `loaded` flag is enough — load once, then reuse across settings tabs.
    if (!userKeysActions.isLoaded(getState())) {
      promises.push(dispatch(userKeysActions.load()));
    }

    return Promise.all(promises);
  },
})(
  withLayoutData('lang')(
    connect(
      (state) => ({
        res: state.res,
        loading: state.userSettings.loading,
        user: state.userSettings.user,
        successMessagesDisplayed: state.userSettings.successMessagesDisplayed,
        modal: state.userSettings.modal,
      }),
      userSettingsActions,
    )(withRouter(SettingsContainer)),
  ),
);
