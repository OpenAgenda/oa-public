import { useContext, useState } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl, defineMessages } from 'react-intl';
import {
  a11yButtonActionHandler,
  Modal,
  useLayoutData,
} from '@openagenda/react-shared';
import statusMessages from '@openagenda/common-labels/event/statuses';
import {
  KeysManager,
  InboxSettingsForm,
  TrackingSettingsForm,
  LabSettingsForm,
  StatusesForm,
  PassSettings,
  FiltersSettings,
  DeleteAgenda,
  IdentifierInformation,
} from '../../components/index.js';
import * as modalsActions from '../../reducers/modals.js';
import * as keysActions from '../../reducers/keys.js';
import I18nContext from '../../contexts/I18nContext.js';
import * as agendaActions from '../../reducers/agenda.js';

const docRes = {
  official: 'https://doc.openagenda.com/les-agendas-officiels-sur-openagenda',
  private: 'https://doc.openagenda.com/visibilite-des-agendas',
};

const messages = defineMessages({
  filtersTitle: {
    id: 'AgendaSettings.AdvancedEdition.filtersMenuTitle',
    defaultMessage: 'Filters',
  },
  filtersDescription: {
    id: 'AgendaSettings.AdvancedEdition.filtersMenuDescription',
    defaultMessage:
      'Define which filters you want to show on the front page of the agenda as well as in the administration',
  },
  statusesTitle: {
    id: 'AgendaSettings.AdvancedEdition.statusesTitle',
    defaultMessage: 'Statuses',
  },
  statusesDescription: {
    id: 'AgendaSettings.AdvancedEdition.statusesDescription',
    defaultMessage: 'Selection of states offered to contributors',
  },
  deleteTitle: {
    id: 'AgendaSettings.AdvancedEdition.deleteTitle',
    defaultMessage: 'Delete',
  },
  deleteDescription: {
    id: 'AgendaSettings.AdvancedEdition.deleteDescription',
    defaultMessage: 'Deleting an agenda is irrevocable',
  },
  identifier: {
    id: 'AgendaSettings.AdvancedEdition.identifier',
    defaultMessage: 'Identifier',
  },
});

const statusesMap = {
  2: 'rescheduled',
  3: 'movedOnline',
  4: 'postponed',
  5: 'full',
  6: 'cancelled',
};

function TableRow({
  activeTab,
  setActiveTab,
  tabName,
  description,
  closedComponent,
  openedComponent,
}) {
  const selectTab = a11yButtonActionHandler(() => {
    if (activeTab !== tabName) {
      setActiveTab(tabName);
    }
  });

  const unselectTab = a11yButtonActionHandler(() => {
    if (activeTab === tabName) {
      setActiveTab(null);
    }
  });

  return (
    <tr
      role="button"
      className={classNames({ inactive: activeTab !== tabName })}
      onClick={selectTab}
      onKeyPress={selectTab}
      tabIndex="0"
    >
      <td
        role="gridcell"
        className="col-md-3"
        style={{ cursor: 'pointer' }}
        onClick={unselectTab}
        onKeyPress={unselectTab}
      >
        {description}
      </td>
      {activeTab === tabName ? (
        <td>
          <button
            type="button"
            className="margin-bottom-sm"
            style={{
              cursor: 'pointer',
              border: 'none',
              padding: 0,
              margin: 0,
              background: 'transparent',
              textAlign: 'left',
            }}
            onClick={() => setActiveTab(null)}
          >
            {closedComponent}
          </button>
          {openedComponent}
        </td>
      ) : (
        <td style={{ cursor: 'pointer' }}>{closedComponent}</td>
      )}
    </tr>
  );
}

export default function AdvancedEdition() {
  const layoutData = useLayoutData();
  const { agenda, agendaSchema } = layoutData;

  const { getLabel } = useContext(I18nContext);

  const dispatch = useDispatch();

  const removeModal = useSelector((state) => state.modals.removeKey || {});
  const loading = useSelector((state) => state.agenda.loading);

  const deleteRes = useSelector((state) =>
    state.res.delete.replace(':uid', agenda.uid));

  const [activeTab, setActiveTab] = useState(null);

  const intl = useIntl();

  return (
    <div className="advanced">
      <div className="table-responsive">
        <table role="grid" className="table">
          <tbody>
            <TableRow
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabName="uid"
              description={<b>{intl.formatMessage(messages.identifier)}</b>}
              closedComponent={agenda.uid}
              openedComponent={<IdentifierInformation agenda={agenda} />}
            />
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
                <b className="text-muted">
                  {getLabel(
                    agenda.official ? 'officialAgenda' : 'nonOfficialAgenda',
                  )}
                </b>
              )}
              openedComponent={(
                <div>
                  {agenda.official ? (
                    <a href={docRes.official} target="_blank" rel="noreferrer">
                      {getLabel('learnMore')}
                    </a>
                  ) : (
                    <div>
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
                        rel="noreferrer"
                      >
                        {getLabel('learnMore')}
                      </a>
                    </div>
                  )}
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
                  {getLabel(agenda.private ? 'privateAgenda' : 'publicAgenda')}{' '}
                  -{' '}
                  {getLabel(
                    agenda.indexed ? 'indexedAgenda' : 'notIndexedAgenda',
                  )}
                </b>
              )}
              openedComponent={(
                <div>
                  <div className="checkbox">
                    <label htmlFor="displayIndexMenu">
                      <input
                        id="displayIndexMenu"
                        type="checkbox"
                        checked={agenda.indexed}
                        onChange={() =>
                          dispatch(
                            agendaActions.edit({ indexed: !agenda.indexed }),
                          )}
                      />{' '}
                      {getLabel('indexedAgendaDesc')}
                    </label>
                  </div>
                  {agenda.private ? (
                    <div>
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
                  ) : (
                    <div>
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
                    </div>
                  )}
                </div>
              )}
            />

            <TableRow
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tableName="statuses"
              description={<b>{intl.formatMessage(messages.statusesTitle)}</b>}
              closedComponent={(
                <>
                  {intl.formatMessage(messages.statusesDescription)}
                  <br />
                  {!agenda.settings?.contribution?.status?.enabled
                  || agenda.settings?.contribution?.status?.enabled?.length ? (
                    <b className="text-muted">
                      {intl.formatList(
                        (
                          agenda.settings?.contribution?.status?.enabled || [
                            2, 5, 6,
                          ]
                        ).map((v) =>
                          intl.formatMessage(statusMessages[statusesMap[v]])),
                        { style: 'narrow' },
                      )}
                    </b>
                    ) : null}
                </>
              )}
              openedComponent={<StatusesForm />}
            />

            <TableRow
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tableName="filters"
              description={<b>{intl.formatMessage(messages.filtersTitle)}</b>}
              closedComponent={intl.formatMessage(messages.filtersDescription)}
              openedComponent={(
                <FiltersSettings
                  settings={agenda.settings}
                  onSubmit={(patch) =>
                    dispatch(agendaActions.edit({ settings: patch }))}
                  loading={loading}
                  schema={agendaSchema}
                />
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
              tabName="pass"
              description={<b>{getLabel('pass')}</b>}
              closedComponent={getLabel('passTabDescription')}
              openedComponent={<PassSettings />}
            />

            <TableRow
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabName="lab"
              description={<b>{getLabel('lab')}</b>}
              closedComponent={getLabel('labTabDescription')}
              openedComponent={<LabSettingsForm />}
            />

            <TableRow
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabName="delete"
              description={(
                <b className="text-danger">
                  {intl.formatMessage(messages.deleteTitle)}
                </b>
              )}
              closedComponent={(
                <span className="text-danger">
                  {intl.formatMessage(messages.deleteDescription)}
                </span>
              )}
              openedComponent={<DeleteAgenda deleteRes={deleteRes} />}
            />
          </tbody>
        </table>
      </div>

      {removeModal.visible && (
        <Modal
          onClose={() => dispatch(modalsActions.closeModal('removeKey'))}
          title={getLabel('removeKey')}
        >
          <p>{getLabel('removeKeyWarning')}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => dispatch(modalsActions.closeModal('removeKey'))}
          >
            {getLabel('close')}
          </button>
          <button
            type="button"
            className="btn btn-danger pull-right"
            onClick={() =>
              dispatch(keysActions.remove(removeModal.options.id))
                .then(() => dispatch(modalsActions.closeModal('removeKey')))
                .catch(() => dispatch(modalsActions.closeModal('removeKey')))}
          >
            {getLabel('remove')}
          </button>
        </Modal>
      )}
    </div>
  );
}
