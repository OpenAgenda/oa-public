const React = require('react');
const {useState} = require('react');
const ReactDom = require('react-dom');
const qs = require('qs');

import { mergeLocales } from '@openagenda/react-shared';
import { modalLocales } from '@openagenda/react-share-menus';
import { ExportModal } from '@openagenda/react-share-menus';
import { IntlProvider, defineMessages, useIntl } from 'react-intl';
import appLocales from '../../locales-compiled';

const ExportModalContainer = ({ controller, agendaUid, res, options, exportType }) => {
  const [display, setDisplay] = useState(false);
  const [languageQuery, setLanguageQuery] = useState('');

  const intl = useIntl();

  const messages = defineMessages({
    exportAllButton: {
      id: 'export-all-button',
      defaultMessage: 'Export',
    },
    exportSelectButton: {
      id: 'export-select-button',
      defaultMessage: 'Export the selection',
    },
  });

  const handleExportLanguage = (format) => {
    return (format === 'csv' || format === 'xl') && languageQuery !== 'all' ? `&cols.lang=${languageQuery}` : '';
  }

  const handleQuery = (controller) => {
    let query = '';
    if (exportType.exportAll) {
      return query = '?oaq[passed]=1';
    }
    const currentSearchValues = controller.getCurrentQuery();
    return query = qs.stringify(
      { oaq: currentSearchValues },
      { addQueryPrefix: true }
    );
  }

  const formatExportLinks = (res, agendaUid, controller) => {
    const url = Object.keys(res).reduce(
      (urls, key) => ({
        ...urls,
        [key]:
          res[key].replace(':agendaUid', agendaUid) +
          handleQuery(controller) +
          handleExportLanguage(key),
      }),
      {}
    );

    return url;
  } 

  const handleQueryLanguage = (lang) => {
    setLanguageQuery(lang);
    return languageQuery;
  };

  return (
    <>
      {exportType.exportAll ? (
        <a className="btn btn-default margin-bottom-xs" onClick={() => setDisplay(true)}>
          <i className="fa fa-share-alt"></i> {intl.formatMessage(messages.exportAllButton)}
        </a>
      ) : (
        <button className="js_export_button btn btn-link export__link" type="button" onClick={() => setDisplay(true)}>
          <i className="fa fa-external-link" />
          <span>&nbsp; {intl.formatMessage(messages.exportSelectButton)}</span>
        </button>
      )}
      {display ? (
        <ExportModal
          onClose={() => setDisplay(false)}
          res={formatExportLinks(res, agendaUid, controller)}
          languages={options.languages}
          exportLanguage={lang => handleQueryLanguage(lang)}
        />
      ) : null}
    </>
  );
};

export default function displayExportButton(
  params,
  agendaUid,
  controller,
  options,
  exportType
) {
  let buttonLocation;
  exportType.exportAll
    ? (buttonLocation = document.querySelector(params.selectors.exportAll))
    : (buttonLocation = document.querySelector(params.selectors.export));
  const lang = options.lang;
  const locales = mergeLocales(appLocales, modalLocales);

  return ReactDom.render(
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}><ExportModalContainer
      controller={controller}
      agendaUid={agendaUid}
      options={options}
      res={params.res.export}
      exportType={exportType}
    /></IntlProvider>,
    buttonLocation
  );
}
