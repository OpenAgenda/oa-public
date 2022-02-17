import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import axios from 'axios';

import { Modal } from '@openagenda/react-shared';
import Radio from '../Radio';
import SpreadsheetOptions from './SpreadsheetOptions';
import ExternalCalendarOptions from './ExternalCalendarOptions';

const ExportModal = ({
  res, languages, onClose, userLogged
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
  const [spreadsheetOptions, setSpreadsheetOptions] = useState({
    format: 'xlsx',
    fields: [],
    languages: []
  });

  const intl = useIntl();

  const messages = defineMessages({
    modalTitle: {
      id: 'modal-title',
      defaultMessage: 'Export',
    },
    inputFormat: {
      id: 'input-format',
      defaultMessage: 'Choose a format',
    },
    close: {
      id: 'close',
      defaultMessage: 'Close',
    },
    cancel: {
      id: 'cancel',
      defaultMessage: 'Cancel',
    },
    logIn: {
      id: 'login',
      defaultMessage: 'Please log in to access the export link directly from this menu'
    },
    exportJson: {
      id: 'exportJson',
      defaultMessage: 'Use the previous JSON export version'
    },
    jsonDoc1: {
      id: 'jsonDoc1',
      defaultMessage: 'Documentation'
    },
    jsonDoc2: {
      id: 'jsonDoc2',
      defaultMessage: 'here'
    },
    documentation: {
      id: 'documentation',
      defaultMessage: 'See the documentation'
    },
    detailedFormat: {
      id: 'detailed-format',
      defaultMessage: 'Use the detailed format'
    }
  });

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
      const jsonUrl = new URL(res.export.jsonV2);
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
      window.open(res.export[formatChoice.id]);
      return onClose();
    }

    if (formatChoice.id === 'spreadsheet') {
      const formatUrl = spreadsheetOptions.format === 'xlsx' ? new URL(res.export.xlsx) : new URL(res.export.csv);

      if (spreadsheetOptions.languages.length) {
        spreadsheetOptions.languages.map(l => formatUrl.searchParams.append('includeLanguages[]', l));
      }

      if (spreadsheetOptions.fields.length) {
        spreadsheetOptions.fields.map(f => formatUrl.searchParams.append('includeFields[]', f));
      }

      window.open(formatUrl, '_self');
      return onClose();
    }

    window.open(res.export[formatChoice.id], '_self');
    return onClose();
  };

  const handleSpreadsheetOptions = options => {
    setSpreadsheetOptions(options);
  };

  return (
    <Modal classNames={{ overlay: 'popup-overlay big' }} disableBodyScroll onClose={onClose}>
      <form className="export export-form" onSubmit={handleSubmit}>
        <button className="export-close" type="button" onClick={onClose}>
          <i className="fa fa-times fa-lg" />
        </button>
        <h1 className="export-title-big">{intl.formatMessage(messages.modalTitle)}</h1>
        <h2 className="export-title-md">{intl.formatMessage(messages.inputFormat)}</h2>
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
                <ExternalCalendarOptions type={id} exportUrl={res.export.gcal} />
              )}
              {outlook && id === 'outlook' && (
                <ExternalCalendarOptions type={id} exportUrl={res.export.gcal} />
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
                  <a href={res.export.jsonV1} target="_blank" rel="noreferrer" className="margin-left-md">{intl.formatMessage(messages.exportJson)}</a> ({intl.formatMessage(messages.jsonDoc1)}<a href="https://developers.openagenda.com/export-json-dun-agenda/" target="_blank" rel="noreferrer"> {intl.formatMessage(messages.jsonDoc2)}</a>)
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
    export: PropTypes.shape({
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
    agendaExportSettings: PropTypes.string
  }).isRequired,
  languages: PropTypes.arrayOf(PropTypes.string),
  onClose: PropTypes.func.isRequired,
  userLogged: PropTypes.bool.isRequired
};

ExportModal.defaultProps = {
  languages: undefined,
};
