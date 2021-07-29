import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';

import Modal from '@openagenda/react-shared/src/components/Modal';
import ReactSelectInput from '@openagenda/react-shared/src/components/ReactSelectInput';
import Button from './Button';
import Radio from './Radio';

const ExportModal = ({
  res, languages, onClose, exportLanguage
}) => {
  const [formatChoice, setFormatChoice] = useState({ value: '', id: '' });
  const [options, setOptions] = useState(false);
  const [gCal, setGCal] = useState(false);
  const [newTab, setNewTab] = useState(false);

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
    inputLanguage: {
      id: 'input-language',
      defaultMessage: 'Choose a language',
    },
    allLanguages: {
      id: 'all-languages',
      defaultMessage: 'All',
    },
    close: {
      id: 'close',
      defaultMessage: 'Close'
    },
    cancel: {
      id: 'cancel',
      defaultMessage: 'Cancel'
    },
    instructions: {
      id: 'instructions',
      defaultMessage: 'Instructions'
    },
    instructionsStep1: {
      id: 'instructionsStep1',
      defaultMessage: 'Copy the link in the field above'
    },
    instructionsStep2: {
      id: 'instructionsStep2',
      defaultMessage: 'Open '
    },
    instructionsStep3: {
      id: 'instructionsStep3',
      defaultMessage: 'In the left section, open "Other Calendars > Add by URL"'
    },
    instructionsStep4: {
      id: 'instructionsStep4',
      defaultMessage: 'Follow the instructions by pasting the link you copied in step 1'
    }
  });

  const formats = [
    { type: 'PDF', id: 'pdf' },
    { type: 'JSON', id: 'json' },
    { type: 'Microsoft Excel (xlsx)', id: 'xl' },
    { type: 'Google Agenda', id: 'gagenda' },
    { type: 'iCal', id: 'ical' },
    { type: 'ICS', id: 'ics' },
    { type: 'RSS', id: 'rss' },
    { type: 'CSV', id: 'csv' },
  ];

  const setChoice = (value, id) => {
    setFormatChoice({ value, id });
    setGCal(false);
    setOptions(false);
    if (id === 'csv' || id === 'xl') setOptions(true);
    if (id === 'json' || id === 'rss') setNewTab(true);
    if (id === 'gagenda') setGCal(true);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (newTab) {
      window.open(res[formatChoice.id]);
      return onClose();
    }
    window.open(res[formatChoice.id], '_self');
    return onClose();
  };

  const setLanguages = (lang = []) => {
    const languageList = lang.map(language => ({
      label: language.toUpperCase(),
      value: language,
    }));
    languageList.unshift({ label: intl.formatMessage(messages.allLanguages), value: 'all' });
    return languageList;
  };

  const selectLanguage = lang => (lang ? exportLanguage(lang.value) : null);

  const handleClick = e => e.target.select();

  const buttonText = () => {
    if (formatChoice.id === '') return intl.formatMessage(messages.cancel);
    if (formatChoice.id === 'gagenda') return intl.formatMessage(messages.close);
    return intl.formatMessage(messages.modalTitle);
  };

  return (
    <Modal classNames={{ overlay: 'popup-overlay big' }} disableBodyScroll onClose={onClose}>
      <form className="export__form" onSubmit={handleSubmit}>
        <button className="export__close" type="button" onClick={onClose}>
          <i className="fa fa-times fa-lg" />
        </button>
        <h1 className="export__title--big">{intl.formatMessage(messages.modalTitle)}</h1>
        <h2 className="export__title--md">{intl.formatMessage(messages.inputFormat)}</h2>
        <div className="form-group">
          {formats.map(({ type, id }) => (
            <Radio content={type} name="format" key={id} id={id} setChoice={setChoice} span={id === 'json'} />
          ))}
          {options && (
            <div className="input-container">
              <ReactSelectInput
                name="langue"
                placeholder={intl.formatMessage(messages.inputLanguage)}
                options={setLanguages(languages)}
                onChange={selectLanguage}
              />
            </div>
          )}
        </div>
        {gCal && (
          <div className="mg-bottom-sm">
            <input
              className="form-control url-input"
              value={`https://openagenda.com${res.gcal}`}
              readOnly
              onClick={handleClick}
            />
            <h4>{intl.formatMessage(messages.instructions)}</h4>
            <p>1. {intl.formatMessage(messages.instructionsStep1)}</p>
            <p>
              2. {intl.formatMessage(messages.instructionsStep2)}
              <a target="_blank" href="https://calendar.google.com" rel="noreferrer">
                Google Calendar
              </a>
            </p>
            <p>3. {intl.formatMessage(messages.instructionsStep3)}</p>
            <p>4. {intl.formatMessage(messages.instructionsStep4)}</p>
          </div>
        )}
        <Button content={buttonText} />
      </form>
    </Modal>
  );
};

export default ExportModal;

ExportModal.propTypes = {
  res: PropTypes.shape({
    json: PropTypes.string,
    pdf: PropTypes.string,
    xl: PropTypes.string,
    gcal: PropTypes.string,
    ical: PropTypes.string,
    csv: PropTypes.string,
    ics: PropTypes.string,
    rss: PropTypes.string,
  }).isRequired,
  languages: PropTypes.arrayOf(PropTypes.string),
  onClose: PropTypes.func.isRequired,
  exportLanguage: PropTypes.func.isRequired
};

ExportModal.defaultProps = {
  languages: undefined,
};
