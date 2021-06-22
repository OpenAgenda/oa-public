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
    }
  });

  const formats = [
    { type: 'PDF', id: 'pdf' },
    { type: 'JSON', id: 'json' },
    { type: 'Microsoft Excel (xlsx)', id: 'xl' },
    { type: 'Google Calendar', id: 'gcal' },
    { type: 'iCal', id: 'ical' },
    { type: 'ICS', id: 'ics' },
    { type: 'RSS', id: 'rss' },
    { type: 'CSV', id: 'csv' },
  ];

  const setChoice = (value, id) => {
    setFormatChoice({ value, id });
    setOptions(false);
    if (id === 'csv' || id === 'xl') {
      setOptions(true);
    }
    if (id === 'json' || id === 'rss') {
      setNewTab(true);
    }
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

  return (
    <Modal
      onClick={onClose}
      classNames={{ overlay: 'popup-overlay big' }}
      disableBodyScroll
    >
      <form className="export__form" onSubmit={handleSubmit}>
        <button className="export__close" type="button" onClick={onClose}>
          <i className="fa fa-times fa-lg" />
        </button>
        <h1 className="export__title--big">
          {intl.formatMessage(messages.modalTitle)}
        </h1>
        <h2 className="export__title--md">
          {intl.formatMessage(messages.inputFormat)}
        </h2>
        <div className="form-group">
          {formats.map(({ type, id }) => (
            <Radio
              content={type}
              name="format"
              key={id}
              id={id}
              setChoice={setChoice}
              span={id === 'json'}
            />
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
        <Button content={intl.formatMessage(messages.modalTitle)} />
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
