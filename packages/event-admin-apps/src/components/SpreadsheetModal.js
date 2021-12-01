import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import qs from 'qs';
import axios from 'axios';
import { Modal } from '@openagenda/react-shared';
import { SpreadsheetOptions } from '@openagenda/react-share-menus';
import exportsMessages from '../messages/exports';

export default function SpreadsheetModal({
  onClose,
  agendaUid,
  queryString = '',
}) {
  const [fields, setFields] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [spreadsheetOptions, setSpreadsheetOptions] = useState({
    format: 'xlsx',
    fields: [],
    languages: [],
  });

  const intl = useIntl();

  useEffect(() => {
    async function fetchData() {
      const { data } = await axios.get(
        `/agendas/${agendaUid}/settings/exports`
      );
      setLanguages(data.languages);
      setFields(data.spreadsheetColumns);
    }

    fetchData();
  }, [agendaUid]);

  const handleSubmit = e => {
    e.preventDefault();

    const parsedQuery = qs.parse(queryString);
    const newQuery = qs.stringify(
      {
        ...parsedQuery,
        includeFields: spreadsheetOptions.fields,
        includeLanguages: spreadsheetOptions.languages,
      },
      {
        addQueryPrefix: true,
        arrayFormat: 'brackets',
        skipNulls: true,
      }
    );

    const url = `/agendas/${agendaUid}/admin/events.v2.${spreadsheetOptions.format}${newQuery}`;
    window.open(url, '_self');
    return onClose();
  };

  const handleOptions = options => {
    setSpreadsheetOptions(options);
  };

  return (
    <Modal
      onClose={onClose}
      classNames={{ overlay: 'popup-overlay big' }}
      disableBodyScroll
    >
      <form className="export export-form" onSubmit={handleSubmit}>
        <button className="export-close" type="button" onClick={onClose}>
          <i className="fa fa-times fa-lg" />
        </button>
        <h1 className="export-title-big">Options</h1>
        <SpreadsheetOptions
          languages={languages}
          setChoice={options => handleOptions(options)}
          fields={fields}
          options={spreadsheetOptions}
        />
        <div className="margin-left-md">
          <button type="submit" className="btn btn-primary">
            {intl.formatMessage(exportsMessages.export)}
          </button>
        </div>
      </form>
    </Modal>
  );
}
