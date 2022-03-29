import React, { useContext, useState } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, useLayoutData } from '@openagenda/react-shared';
import {
  KeysManager,
  InboxSettingsForm,
  TrackingSettingsForm,
  LabSettingsForm
} from '../../components';
import * as  modalsActions from '../../reducers/modals';
import * as  keysActions from '../../reducers/keys';
import I18nContext from '../../contexts/I18nContext';
import * as agendaActions from '../../reducers/agenda';

const docRes = {
  official: 'https://doc.openagenda.com/les-agendas-officiels-sur-openagenda',
  private: 'https://doc.openagenda.com/visibilite-des-agendas'
};

function TableRow({
  activeTab,
  setActiveTab,
  tabName,
  description,
  closedComponent,
  openedComponent
}) {
  return (
    <tr
      className={classNames({ inactive: activeTab !== tabName })}
      onClick={activeTab !== tabName ? () => setActiveTab(tabName) : null}
    >
      <td
        className="col-md-3"
        style={{ cursor: 'pointer' }}
        onClick={activeTab === tabName ? () => setActiveTab(null) : null}
      >
        {description}
      </td>
      {activeTab === tabName ?
        <td>
          <div
            className="margin-bottom-sm"
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveTab(null)}
          >
            {closedComponent}
          </div>
          {openedComponent}
        </td> :
        <td style={{ cursor: 'pointer' }}>{closedComponent}</td>}
    </tr>
  );
}

export default function AdvancedEdition() {
  const { agenda } = useLayoutData();

  const { getLabel } = useContext(I18nContext);

  const dispatch = useDispatch();


  const removeModal = useSelector(state => (state.modals['removeKey'] || {}));

  const [activeTab, setActiveTab] = useState(null);

  return (
    <div className="advanced">
      <div className="table-responsive">
        <table className="table">
          <tbody>
          <TableRow
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabName="keys"
            description={<b>{getLabel('accessKeys')}</b>}
            closedComponent={getLabel('manageKeys')}
            openedComponent={<KeysManager />}
          />

          <TableRow
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabName="official"
            description={<b>{getLabel('labeling')}</b>}
            closedComponent={(
              <b className="text-muted">{getLabel(agenda.official ? 'officialAgenda' : 'nonOfficialAgenda')}</b>
            )}
            openedComponent={(
              <div>
                {agenda.official
                  ? <a href={docRes.official} target="_blank">{getLabel('learnMore')}</a>
                  : <div>
                    <a
                      className="margin-right-sm"
                      style={{ cursor: 'pointer' }}
                      href={`/support?origin=${encodeURIComponent(window.location.pathname)}&subject=officialAgenda`}
                    >
                      {getLabel('requestOfficialAgenda')}
                    </a>
                    <a
                      href={docRes.official}
                      target="_blank"
                    >
                      {getLabel('learnMore')}
                    </a>
                  </div>}
              </div>
            )}
          />

          <TableRow
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabName="private"
            description={<b>{getLabel('visibility')}</b>}
            closedComponent={(
              <b className="text-muted">
                {getLabel(agenda.private ? 'privateAgenda' : 'publicAgenda')}
                {' '}-{' '}
                {getLabel(agenda.indexed ? 'indexedAgenda' : 'notIndexedAgenda')}
              </b>
            )}
            openedComponent={(
              <div>
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={agenda.indexed}
                      onChange={() => dispatch(agendaActions.edit({ indexed: !agenda.indexed }))}
                    />{' '}{getLabel('indexedAgendaDesc')}
                  </label>
                </div>
                {agenda.private
                  ? <div>
                    <a
                      className="margin-right-sm"
                      style={{ cursor: 'pointer' }}
                      href={`/support?origin=${encodeURIComponent(window.location.pathname)}&subject=publicAgenda`}
                    >
                      {getLabel('requestPublicAgenda')}
                    </a>
                    <a
                      href={docRes.private}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {getLabel('learnMore')}
                    </a>
                  </div>
                  : <div>
                    <a
                      className="margin-right-sm"
                      style={{ cursor: 'pointer' }}
                      href={`/support?origin=${encodeURIComponent(window.location.pathname)}&subject=privateAgenda`}
                    >
                      {getLabel('requestPrivateAgenda')}
                    </a>
                    <a
                      href={docRes.private}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {getLabel('learnMore')}
                    </a>
                  </div>}
              </div>
            )}
          />

          <TableRow
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabName="inbox"
            description={<b>{getLabel('inbox')}</b>}
            closedComponent={getLabel('inboxTabDescription')}
            openedComponent={<InboxSettingsForm />}
          />

          <TableRow
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabName="analytics"
            description={<b>{getLabel('stats')}</b>}
            closedComponent={getLabel('statsTabDescription')}
            openedComponent={<TrackingSettingsForm />}
          />

          <TableRow
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabName="lab"
            description={<b>{getLabel('lab')}</b>}
            closedComponent={getLabel('labTabDescription')}
            openedComponent={<LabSettingsForm />}
          />
          </tbody>
        </table>
      </div>

      {removeModal.visible &&
        <Modal
          onClose={() => dispatch(modalsActions.closeModal('removeKey'))}
          title={getLabel('removeKey')}
        >
          <p>{getLabel('removeKeyWarning')}</p>
          <button className="btn btn-primary" onClick={() => dispatch(modalsActions.closeModal('removeKey'))}>
            {getLabel('close')}
          </button>
          <button
            className="btn btn-danger pull-right"
            onClick={() => dispatch(keysActions.remove(removeModal.options.key))
              .then(() => dispatch(modalsActions.closeModal('removeKey')))
              .catch(() => dispatch(modalsActions.closeModal('removeKey')))}
          >
            {getLabel('remove')}
          </button>
        </Modal>}
    </div>
  );
}
