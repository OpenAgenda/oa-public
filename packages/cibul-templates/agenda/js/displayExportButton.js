const React = require('react');
const {useState} = require('react');
const ReactDom = require('react-dom');
const qs = require('qs');

import du from '@openagenda/dom-utils';
import { ExportModal } from '@openagenda/react-share-menus';
import { IntlProvider } from 'react-intl';
import locales from '../../locales-compiled';

const ExportModalContainer = ({ controller, agendaUid, res, options }) => {
  const [display, setDisplay] = useState(false);
  const [languageQuery, setLanguageQuery] = useState('');

  const lang = options.lang;
  
  const handleExportLanguage = (format) => {
    return (format === 'csv' || format === 'xl') && languageQuery !== 'all' ? `&cols.lang=${languageQuery}` : '';
  }

  const formatExportLinks = (res, agendaUid, controller) => {
    const currentSearchValues = controller.getCurrentQuery();
    const query = qs.stringify(
      { oaq: currentSearchValues },
      { addQueryPrefix: true }
    );
    const url = Object.keys(res).reduce(
      (urls, key) => ({
        ...urls,
        [key]:
          res[key].replace(':agendaUid', agendaUid) +
          query +
          handleExportLanguage(key),
      }),
      {}
    );
    return url;
  } 

  const handleQuery = (lang) => {
    setLanguageQuery(lang);
    console.log('ICIIIII', options);
    return languageQuery;
  };

  return (
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
      <button
        className="js_export_button btn btn-link export__link"
        type="button"
        onClick={() => setDisplay(true)}
      >
        <i className="fa fa-external-link" />
        <span>&nbsp; Exporter la sélection</span>
      </button>
      {display ? (
        <ExportModal
          onClose={() => setDisplay(false)}
          res={formatExportLinks(res, agendaUid, controller)}
          languages={options.languages}
          exportLanguage={(lang) => handleQuery(lang)}
        />
      ) : null}
    </IntlProvider>
  );
};

export default function displayExportButton(
  params,
  agendaUid,
  controller,
  options
) {
  ReactDom.render(
    <ExportModalContainer
      controller={controller}
      agendaUid={agendaUid}
      options={options}
      res={params.res.export}
    />,
    du.el(params.selectors.export)
  );
}
