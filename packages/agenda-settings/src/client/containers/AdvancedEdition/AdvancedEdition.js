import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import openFormRequest from '@openagenda/call-to-action/dist/openRequestForm';
import Modal from '@openagenda/react-components/build/Modal';
import { KeysManager, InboxSettingsForm, TrackingSettingsForm } from '../../components';
import * as  agendaActions from '../../redux/modules/agenda';
import * as  modalsActions from '../../redux/modules/modals';
import * as  keysActions from '../../redux/modules/keys';

const zendeskRes = {
  official: 'https://openagenda.zendesk.com/hc/articles/115001581185',
  private: 'https://openagenda.zendesk.com/hc/fr/articles/115001584389'
};

@connect(
  state => ({
    agenda: state.agenda.data,
    modals: state.modals
  }),
  { ...modalsActions, removeKey: keysActions.remove, editAgenda: agendaActions.edit }
)
export default class ContributionEdition extends Component {

  static contextTypes = {
    getLabel: PropTypes.func,
    lang: PropTypes.string
  };

  state = {
    activeTab: null,
    agendaIndexed: Boolean( this.props.agenda.indexed )
  }

  setTab( tab ) {

    this.setState( {
      ...this.state,
      activeTab: tab
    } );

  }

  renderTableRow( tabName, description, closedComponent, openedComponent ) {

    const { activeTab } = this.state;

    return (
      <tr
        className={classNames( { inactive: activeTab !== tabName } )}
        onClick={activeTab !== tabName ? () => this.setTab( tabName ) : null}
      >
        <td
          className="col-md-3"
          style={{ cursor: 'pointer' }}
          onClick={activeTab === tabName ? () => this.setTab( null ) : null}
        >
          {description}
        </td>
        {activeTab === tabName ?
          <td>
            <div
              className="margin-bottom-sm"
              style={{ cursor: 'pointer' }}
              onClick={() => this.setTab( null )}
            >
              {closedComponent}
            </div>
            {openedComponent}
          </td> :
          <td style={{ cursor: 'pointer' }}>{closedComponent}</td>}
      </tr>
    );

  }

  render() {
    const { agenda, modals, closeModal, removeKey, editAgenda } = this.props;
    const { getLabel, lang } = this.context;

    const removeModal = modals[ 'removeKey' ] || {};

    return (
      <div className="advanced">
        <h2 className="margin-bottom-lg">{getLabel( 'advanced' )}</h2>

        <div className="table-responsive">
          <table className="table">
            <tbody>

            {this.renderTableRow(
              'keys',
              <b>{getLabel( 'accessKeys' )}</b>,
              getLabel( 'manageKeys' ),
              <KeysManager />
            )}

            {this.renderTableRow(
              'official',
              <b>{getLabel( 'labeling' )}</b>,
              <b className="text-muted">{getLabel( agenda.official ? 'officialAgenda' : 'nonOfficialAgenda' )}</b>,
              <div>
                {agenda.official
                  ? <a href={zendeskRes.official} target="_blank">{getLabel( 'learnMore' )}</a>
                  : <div>
                    <a
                      className="margin-right-sm"
                      style={{ cursor: 'pointer' }}
                      onClick={() => openFormRequest( { lang, agenda: agenda.slug, subject: 'officialAgenda' } )}
                    >
                      {getLabel( 'requestOfficialAgenda' )}
                    </a>
                    <a
                      href={zendeskRes.official}
                      target="_blank"
                    >
                      {getLabel( 'learnMore' )}
                    </a>
                  </div>}
              </div>
            )}

            {this.renderTableRow(
              'private',
              <b>{getLabel( 'visibility' )}</b>,
              <b className="text-muted">
                {getLabel( agenda.private ? 'privateAgenda' : 'publicAgenda' )}
                {' '}-{' '}
                {getLabel( agenda.indexed ? 'indexedAgenda' : 'notIndexedAgenda' )}
              </b>,
              <div>
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      defaultChecked={this.state.agendaIndexed}
                      onChange={() => {
                        const agendaIndexed = !this.state.agendaIndexed;
                        editAgenda( { indexed: agendaIndexed } )
                          .then( () => {
                            this.setState( {
                              ...this.state,
                              agendaIndexed,
                            } );
                          } );
                      }}
                    />{' '}{getLabel( 'indexedAgendaDesc' )}
                  </label>
                </div>
                {agenda.private
                  ? <div>
                    <a
                      className="margin-right-sm"
                      style={{ cursor: 'pointer' }}
                      onClick={() => openFormRequest( { lang, agenda: agenda.slug, subject: 'publicAgenda' } )}
                    >
                      {getLabel( 'requestPublicAgenda' )}
                    </a>
                    <a
                      href={zendeskRes.private}
                      target="_blank"
                    >
                      {getLabel( 'learnMore' )}
                    </a>
                  </div>
                  : <div>
                    <a
                      className="margin-right-sm"
                      style={{ cursor: 'pointer' }}
                      onClick={() => openFormRequest( { lang, agenda: agenda.slug, subject: 'privateAgenda' } )}
                    >
                      {getLabel( 'requestPrivateAgenda' )}
                    </a>
                    <a
                      href={zendeskRes.private}
                      target="_blank"
                    >
                      {getLabel( 'learnMore' )}
                    </a>
                  </div>}
              </div>
            )}

            {this.renderTableRow(
              'inbox',
              <b>{getLabel( 'inbox' )}</b>,
              getLabel( 'inboxTabDescription' ),
              <InboxSettingsForm onSubmit={data => editAgenda( { settings: { inbox: { mailto: data } } } )} />
            )}

            {this.renderTableRow(
              'analytics',
              <b>{getLabel( 'stats' )}</b>,
              getLabel( 'statsTabDescription' ),
              <TrackingSettingsForm onSubmit={data => editAgenda( { settings: { tracking: data } } )} />
            )}
            </tbody>
          </table>
        </div>

        {removeModal.visible &&
        <Modal
          onClose={() => closeModal( 'removeKey' )}
          title={getLabel( 'removeKey' )}
        >
          <p>{getLabel( 'removeKeyWarning' )}</p>
          <button className="btn btn-primary" onClick={() => closeModal( 'removeKey' )}>
            {getLabel( 'close' )}
          </button>
          <button
            className="btn btn-danger pull-right"
            onClick={() => removeKey( removeModal.options.key )
              .then( () => closeModal( 'removeKey' ) ).catch( () => closeModal( 'removeKey' ) )}
          >
            {getLabel( 'remove' )}
          </button>
        </Modal>}
      </div>
    );
  }

}
