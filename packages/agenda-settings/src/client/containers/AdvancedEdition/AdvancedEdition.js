import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { withLayoutData, Modal } from '@openagenda/react-shared';
import {
  KeysManager,
  InboxSettingsForm,
  TrackingSettingsForm,
  LabSettingsForm
} from '../../components';
import * as  agendaActions from '../../reducers/agenda';
import * as  modalsActions from '../../reducers/modals';
import * as  keysActions from '../../reducers/keys';
import I18nContext from '../../contexts/I18nContext';

const docRes = {
  official: 'https://doc.openagenda.com/les-agendas-officiels-sur-openagenda',
  private: 'https://doc.openagenda.com/visibilite-des-agendas'
};

@withLayoutData('agenda')
@connect(
  state => ({
    modals: state.modals
  }),
  { ...modalsActions, removeKey: keysActions.remove, editAgenda: agendaActions.edit }
)
export default class ContributionEdition extends Component {

  static contextType = I18nContext;

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
    const { getLabel } = this.context;

    const removeModal = modals[ 'removeKey' ] || {};

    return (
      <div className="advanced">
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
                  ? <a href={docRes.official} target="_blank">{getLabel( 'learnMore' )}</a>
                  : <div>
                    <a
                      className="margin-right-sm"
                      style={{ cursor: 'pointer' }}
                      href={`/support?origin=${encodeURIComponent(window.location.pathname)}&subject=officialAgenda`}
                    >
                      {getLabel( 'requestOfficialAgenda' )}
                    </a>
                    <a
                      href={docRes.official}
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
                      href={`/support?origin=${encodeURIComponent(window.location.pathname)}&subject=publicAgenda`}
                    >
                      {getLabel( 'requestPublicAgenda' )}
                    </a>
                    <a
                      href={docRes.private}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {getLabel( 'learnMore' )}
                    </a>
                  </div>
                  : <div>
                    <a
                      className="margin-right-sm"
                      style={{ cursor: 'pointer' }}
                      href={`/support?origin=${encodeURIComponent(window.location.pathname)}&subject=privateAgenda`}
                    >
                      {getLabel( 'requestPrivateAgenda' )}
                    </a>
                    <a
                      href={docRes.private}
                      target="_blank"
                      rel="noopener noreferrer"
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
              <InboxSettingsForm
                agenda={agenda}
                onSubmit={data => editAgenda( { settings: { inbox: { mailto: data } } } )}
              />
            )}

            {this.renderTableRow(
              'analytics',
              <b>{getLabel( 'stats' )}</b>,
              getLabel( 'statsTabDescription' ),
              <TrackingSettingsForm
                agenda={agenda}
                onSubmit={data => editAgenda( { settings: { tracking: data } } )}
              />
            )}

            {this.renderTableRow(
              'lab',
              <b>{getLabel( 'lab' )}</b>,
              getLabel( 'labTabDescription' ),
              <LabSettingsForm
                agenda={agenda}
                onSubmit={data => editAgenda( { settings: { lab: data } } )}
              />
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
