import React, { useImperativeHandle, useEffect, useState } from 'react';
import qs from 'qs';
import ReactDom from 'react-dom';
import { mergeLocales, getSupportedLocale } from '@openagenda/intl';
import { modalLocales } from '@openagenda/react-share-menus';
import { ExportModal } from '@openagenda/react-share-menus';
import { IntlProvider, defineMessages, useIntl } from 'react-intl';
import appLocales from '../../locales-compiled';

const ExportModalContainer = React.forwardRef(({ controller, agendaUid, res, options, exportType, query, userLogged }, ref) => {
  const [display, setDisplay] = useState(false);
  const [displayedButton, setDisplayedButton] = useState(() => !!Object.keys(controller.getCurrentQuery()).length);

  const intl = useIntl();

  useImperativeHandle(ref, () => ({
    displayButton: value => setDisplayedButton(value)
  }));

  useEffect(() => {
    // both all/selection are evaluated at load
    // not useful to display both if sharemodal is in query
    if (exportType.exportAll) {
      return;
    }
    if (query.includes('sharemodal')) {
      setDisplay(true);
    }
  }, [query]);

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
          handleQuery(controller)
      }),
      {}
    );

    return url;
  }

  return (
    <>
      {exportType.exportAll ? (
        <a className="btn btn-default margin-bottom-xs" onClick={() => setDisplay(true)}>
          <i className="fa fa-share-alt"></i> {intl.formatMessage(messages.exportAllButton)}
        </a>
      ) :
        displayedButton ?
        (
          <button className="js_export_button btn btn-link export-link" type="button" onClick={() => setDisplay(true)}>
            <i className="fa fa-external-link" />
            <span>&nbsp; {intl.formatMessage(messages.exportSelectButton)}</span>
          </button>
        )
        : null}
      {display ? (
        <ExportModal
          onClose={() => setDisplay(false)}
          res={{
            export: formatExportLinks(res.export, agendaUid, controller),
            me: res.me,
            agendaExportSettings: res.agendaExportSettings.replace(':agendaUid', agendaUid)
          }}
          languages={options.languages}
          userLogged={userLogged}
          root={options.root}
          lang={options.lang}
        />
      ) : null}
    </>
  );
});

export default function displayExportButton(
  ref,
  params,
  routes,
  agendaUid,
  controller,
  options,
  exportType,
  userLogged
) {
  const buttonElem = document.querySelector(params.selectors[exportType.exportAll ? 'exportAll' : 'export']);

  if (!buttonElem) {
    return;
  }

  const lang = options.lang;
  const locales = mergeLocales(appLocales, modalLocales);
  const query = window.location.href;

  return ReactDom.render(
    <IntlProvider
      key={lang}
      locale={lang}
      messages={locales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <ExportModalContainer
        ref={ref}
        controller={controller}
        agendaUid={agendaUid}
        options={options}
        res={routes}
        exportType={exportType}
        query={query}
        userLogged={userLogged}
      />
    </IntlProvider>,
    buttonElem
  );
}
