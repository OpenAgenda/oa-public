import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import axios from 'axios';

import { Modal } from '@openagenda/react-shared';
import Radio from '../Radio';
import SpreadsheetOptions from './SpreadsheetOptions';
import ExternalCalendarOptions from './ExternalCalendarOptions';

const messages = defineMessages({
  modalTitle: {
    id: 'ReactShareMenus.ExportModal.title',
    defaultMessage: 'Export',
  },
  inputFormat: {
    id: 'ReactShareMenus.ExportModal.inputFormat',
    defaultMessage: 'Choose a format',
  },
  close: {
    id: 'ReactShareMenus.ExportModal.close',
    defaultMessage: 'Close',
  },
  cancel: {
    id: 'ReactShareMenus.ExportModal.cancel',
    defaultMessage: 'Cancel',
  },
  logIn: {
    id: 'ReactShareMenus.ExportModal.login',
    defaultMessage: 'Please log in to access the export link directly from this menu',
  },
  exportJson: {
    id: 'ReactShareMenus.ExportModal.exportJson',
    defaultMessage: 'Use the previous JSON export version',
  },
  exportAll: {
    id: 'ReactShareMenus.ExportModal.exportAll',
    defaultMessage: 'Export all events',
  },
  exportSelection: {
    id: 'ReactShareMenus.ExportModal.exportSelection',
    defaultMessage: 'Expect current event selection',
  },
  jsonDoc1: {
    id: 'ReactShareMenus.ExportModal.jsonDoc1',
    defaultMessage: 'Documentation',
  },
  jsonDoc2: {
    id: 'ReactShareMenus.ExportModal.jsonDoc2',
    defaultMessage: 'here',
  },
  documentation: {
    id: 'ReactShareMenus.ExportModal.documentation',
    defaultMessage: 'See the documentation',
  },
  detailedFormat: {
    id: 'ReactShareMenus.ExportModal.detailedFormat',
    defaultMessage: 'Use the detailed format',
  },
});

const ExportModal = ({
  res,
  languages,
  onClose,
  userLogged,
  mode: modeFromProps,
}) => {
  const [formatChoice, setFormatChoice] = useState({ value: '', id: '' });
  const [spreadsheetForm, setSpreadsheetForm] = useState(false);
  const [jsonOptions, setJsonOptions] = useState(false);
  const [jsonDetailed, setJsonDetailed] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [gCal, setGCal] = useState(false);
  const [outlook, setOutlook] = useState(false);
  const [newTab, setNewTab] = useState(false);
  const [displayButton, setDisplayButton] = useState(false);
  const [fields, setFields] = useState([]);
  const [mode, setMode] = useState(modeFromProps);
  const [spreadsheetOptions, setSpreadsheetOptions] = useState({
    format: 'xlsx',
    fields: [],
    languages: [],
  });

  const intl = useIntl();

  const formats = [
    { type: 'Tableur (Excel / CSV)', id: 'spreadsheet' },
    { type: 'PDF', id: 'pdf' },
    { type: 'JSON / API', id: 'jsonV2' },
    { type: 'Google Agenda', id: 'gcal' },
    { type: 'Outlook', id: 'outlook' },
    { type: 'iCal', id: 'ical' },
    { type: 'ICS', id: 'ics' },
    { type: 'RSS', id: 'rss' },
  ];

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(res.me);
      setPublicKey(response.data.apiKey);

      const columns = await axios.get(res.agendaExportSettings);

      setFields(columns.data.spreadsheetColumns);
    }
    fetchData();
  }, [res]);

  const setChoice = (value, id) => {
    setDisplayButton(false);
    setGCal(false);
    setOutlook(false);
    setSpreadsheetForm(false);
    setJsonOptions(false);
    setFormatChoice({ value, id });
    if (id === 'spreadsheet') setSpreadsheetForm(true);
    if (id === 'jsonV2' || id === 'rss') setNewTab(true);
    if (id === 'gcal') return setGCal(true);
    if (id === 'jsonV2') return setJsonOptions(true);
    if (id === 'outlook') return setOutlook(true);
    setDisplayButton(true);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (userLogged && formatChoice.id === 'jsonV2') {
      const jsonUrl = new URL(res[mode].jsonV2);
      if (jsonDetailed) {
        jsonUrl.searchParams.append('detailed', 1);
      } else {
        jsonUrl.searchParams.delete('detailed');
      }
      jsonUrl.searchParams.append('key', publicKey);
      window.open(jsonUrl);
      return onClose();
    }

    if (newTab) {
      window.open(res[mode][formatChoice.id]);
      return onClose();
    }

    if (formatChoice.id === 'spreadsheet') {
      const formatUrl = spreadsheetOptions.format === 'xlsx' ? new URL(res[mode].xlsx) : new URL(res[mode].csv);

      if (spreadsheetOptions.languages.length) {
        spreadsheetOptions.languages.map(l => formatUrl.searchParams.append('includeLanguages[]', l));
      }

      if (spreadsheetOptions.fields.length) {
        spreadsheetOptions.fields.map(f => formatUrl.searchParams.append('includeFields[]', f));
      }

      if (spreadsheetOptions.distributeFields) {
        spreadsheetOptions.distributeFields.map(f => formatUrl.searchParams.append('distributeOptionalFields[]', f));
      }

      window.open(formatUrl, '_self');
      return onClose();
    }

    window.open(res[mode][formatChoice.id], '_self');
    return onClose();
  };

  const handleSpreadsheetOptions = options => {
    setSpreadsheetOptions(options);
  };

  return (
    <Modal classNames={{ overlay: 'popup-overlay big' }} disableBodyScroll onClose={onClose}>
      <form className="export export-form" onSubmit={handleSubmit}>
        <button className="close" type="button" onClick={onClose}>
          <i className="margin-right-z fa fa-times fa-lg" />
        </button>
        <h2 className="export-title">{intl.formatMessage(messages.modalTitle)}</h2>
        <div className="form-group margin-top-sm">
          <div className="radio" onChange={() => setMode('all')}>
            <label htmlFor="export-all">
              <input defaultChecked={mode === 'all'} name="mode" type="radio" id="export-all" />
              {intl.formatMessage(messages.exportAll)}
            </label>
          </div>
          <div className="radio" onChange={() => setMode('selection')}>
            <label htmlFor="export-selection">
              <input defaultChecked={mode === 'selection'} name="mode" type="radio" id="export-selection" />
              {intl.formatMessage(messages.exportSelection)}
            </label>
          </div>
        </div>
        <strong>{intl.formatMessage(messages.inputFormat)}</strong>
        <div className="form-group">
          {formats.map(({ type, id }) => (
            <React.Fragment key={id}>
              <Radio content={type} name="format" id={id} setChoice={setChoice} />
              {spreadsheetForm && id === formatChoice.id && (
              <SpreadsheetOptions
                languages={languages}
                setChoice={handleSpreadsheetOptions}
                fields={fields}
                options={spreadsheetOptions}
              />
              )}
              {gCal && id === 'gcal' && (
                <ExternalCalendarOptions type={id} exportUrl={res[mode].gcal} />
              )}
              {outlook && id === 'outlook' && (
                <ExternalCalendarOptions type={id} exportUrl={res[mode].gcal} />
              )}
              {jsonOptions && id === formatChoice.id && (
                <>
                  {!userLogged && <p>{intl.formatMessage(messages.logIn)}</p>}
                  <div className="flex-container margin-bottom-xs margin-left-md">
                    <button type="submit" className="btn btn-primary" disabled={!userLogged}>
                      {intl.formatMessage(messages.modalTitle)}
                    </button>
                    <div className="checkbox margin-left-sm">
                      <label htmlFor="detailed" className={userLogged ? '' : 'text-muted'}>
                        <input id="detailed" type="checkbox" name="detailed" disabled={!userLogged} onChange={() => setJsonDetailed(!jsonDetailed)} /> {intl.formatMessage(messages.detailedFormat)}
                      </label><br />
                      <a href="https://developers.openagenda.com/10-lecture/" target="_blank" rel="noreferrer">{intl.formatMessage(messages.documentation)}</a>
                    </div>
                  </div>
                  <a href={res[mode].jsonV1} target="_blank" rel="noreferrer" className="margin-left-md">{intl.formatMessage(messages.exportJson)}</a> ({intl.formatMessage(messages.jsonDoc1)}<a href="https://developers.openagenda.com/export-json-dun-agenda/" target="_blank" rel="noreferrer"> {intl.formatMessage(messages.jsonDoc2)}</a>)
                </>
              )}
              {displayButton && id === formatChoice.id && (
                <div className="margin-left-md">
                  <button type="submit" className="btn btn-primary">
                    {intl.formatMessage(messages.modalTitle)}
                  </button>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </form>
    </Modal>
  );
};

export default ExportModal;

ExportModal.propTypes = {
  res: PropTypes.shape({
    all: PropTypes.shape({
      jsonV1: PropTypes.string,
      jsonV2: PropTypes.string,
      pdf: PropTypes.string,
      xlsx: PropTypes.string,
      gcal: PropTypes.string,
      ical: PropTypes.string,
      csv: PropTypes.string,
      ics: PropTypes.string,
      rss: PropTypes.string,
    }),
    selection: PropTypes.shape({
      jsonV1: PropTypes.string,
      jsonV2: PropTypes.string,
      pdf: PropTypes.string,
      xlsx: PropTypes.string,
      gcal: PropTypes.string,
      ical: PropTypes.string,
      csv: PropTypes.string,
      ics: PropTypes.string,
      rss: PropTypes.string,
    }),
    me: PropTypes.string,
    agendaExportSettings: PropTypes.string,
  }).isRequired,
  mode: PropTypes.string,
  languages: PropTypes.arrayOf(PropTypes.string),
  onClose: PropTypes.func.isRequired,
  userLogged: PropTypes.bool.isRequired,
};

ExportModal.defaultProps = {
  languages: undefined,
  mode: 'all',
};
