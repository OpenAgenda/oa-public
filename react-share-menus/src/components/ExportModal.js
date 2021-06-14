import React, { useState } from 'react';
import PropTypes from 'prop-types';

import ReactSelectInput from '../../../react-shared/src/components/ReactSelectInput';
import Button from './Button';
import Radio from './Radio';

const ExportModal = ({ res, languages }) => {
  const [formatChoice, setFormatChoice] = useState({ value: '', id: '' });
  const [options, setOptions] = useState(false);

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
  };

  const handleSubmit = e => {
    e.preventDefault();
    for (const item of res) {
      if (item.format === formatChoice.id) {
        const { url } = item;
        return window.open(url, '_blank');
      }
    }
  };

  return (
    <div className="popup-overlay big">
      <section className="export__form">
        <a className="export__close" href="/">
          <i className="fa fa-times fa-lg" />
        </a>
        <form className="popup-content" onSubmit={handleSubmit}>
          <h1 className="export__title--big">Exporter</h1>
          <h2 className="export__title--md">Sélectionner le format</h2>
          <div className="form-group">
            {formats.map(({ type, id }) => {
              return (
                <Radio
                  content={type}
                  name="format"
                  key={id}
                  id={id}
                  setChoice={setChoice}
                />
              );
            })}
            {options && (
              <>
                <h2 className="export__title--md">Sélectionner une langue</h2>
                <ReactSelectInput
                  name="langue"
                  placeholder="Choisissez une langue"
                  options={languages}
                />
              </>
            )}
          </div>
          <Button content="Exporter" />
        </form>
      </section>
    </div>
  );
};

export default ExportModal;

ExportModal.propTypes = {
  res: PropTypes.arrayOf(
    PropTypes.shape({ format: PropTypes.string, url: PropTypes.string })
  ).isRequired,
  languages: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string, value: PropTypes.string })
  ).isRequired,
};

// TODO: gestion des labels
