import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { AuthenticateAndConfirm, Modal } from '@openagenda/react-shared';
import qs from 'qs';
import I18nContext from '../contexts/I18nContext';

class EmailSettings extends Component {
  static contextType = I18nContext;

  constructor(props) {
    super(props);
    this.state = { payload: null, error: null, success: null };
  }

  handleEmailFormSubmit(e) {
    e.preventDefault();

    this.setState({
      error: null,
      success: null,
      payload: {
        newEmail: e.target.newEmail.value,
      },
    });
  }

  render() {
    const { getLabel } = this.context;
    const { activeTab, prefix, history, user, changeEmailRes, onSuccess } = this.props;

    const { payload, error, success } = this.state;

    return (
      <>
        {payload ? (
          <Modal>
            <AuthenticateAndConfirm
              onSuccess={() => {
                this.setState({
                  payload: null,
                  error: null,
                  success: true,
                });
                onSuccess();
              }}
              onFail={() => {
                this.setState({
                  payload: null,
                  error: 'email.alreadytaken',
                });
              }}
              className="margin-top-sm"
              onClose={() => this.setState({ payload: null })}
              payload={payload}
              res={`${changeEmailRes}?${qs.stringify({ $client: { includeImagePath: true, detailed: true } })}`}
              method="PATCH"
              validPasswordMemoryLifespan={3 * 60 * 1000}
            />
          </Modal>
        ) : null}
        <tr
          onClick={
            !activeTab
              ? () => history.push(`${prefix}/email`, { fromUserApps: true })
              : null
          }
          className={!activeTab ? 'inactive' : ''}
        >
          <td
            role="gridcell"
            onClick={
              activeTab
                ? () => history.push(`${prefix}/`, { fromUserApps: true })
                : null
            }
            className="col-md-3"
            style={{ cursor: 'pointer' }}
          >
            {getLabel('email')}
          </td>
          {activeTab ? (
            <td>
              <div style={{ padding: '0 5px' }}>
                <form
                  onSubmit={(e) => this.handleEmailFormSubmit(e)}
                  style={{ paddingBottom: '8px' }}
                >
                  <div className="form-group">
                    <label htmlFor="newEmail">{getLabel('newEmail')}</label>
                    <input
                      id="newEmail"
                      className="form-control"
                      type="email"
                    />
                    {error ? (
                      <div className="text-danger">{getLabel(error)}</div>
                    ) : null}
                  </div>
                  <div className="form-inline pull-left">
                    <button type="submit" className="btn btn-primary">
                      {getLabel('save')}
                    </button>
                    {success ? (
                      <div className="text-success">
                        <b>{getLabel('updateEmailSuccess')}</b>
                      </div>
                    ) : null}
                  </div>
                </form>
              </div>
            </td>
          ) : (
            <td style={{ cursor: 'pointer' }}>
              <b className="text-muted">{user.email}</b>
            </td>
          )}
        </tr>
      </>
    );
  }
}

export default connect((state) => ({
  prefix: state.settings.prefix,
  changeEmailRes: state.res.changeEmail,
}))(withRouter(EmailSettings));
