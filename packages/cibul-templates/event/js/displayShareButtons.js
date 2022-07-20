import React, { useState, useEffect } from 'react';
import ReactDom from 'react-dom';

import { mergeLocales, getSupportedLocale } from '@openagenda/intl';
import { modalLocales } from '@openagenda/react-share-menus';
import { EventShareModal } from '@openagenda/react-share-menus';
import { IntlProvider, defineMessages, useIntl } from 'react-intl';
import appLocales from '../../locales-compiled';

const locales = mergeLocales(appLocales, modalLocales);

const messages = defineMessages({
    shareButton: {
      id: 'share-button',
      defaultMessage: 'Share on OpenAgenda',
    },
    moreButton: {
      id: 'more-button',
      defaultMessage: 'more'
    }
});

const ShareOAModalContainer = ({ params, userLogged }) => {
  const [display, setDisplay] = useState(false);
  const intl = useIntl();

  return (
    <>
      <button className="btn btn-primary" onClick={() => setDisplay(true)}>
        <img alt="logo" src="//oastatic.s3.eu-central-1.amazonaws.com/whitelogo22.png" />
        &nbsp; {intl.formatMessage(messages.shareButton)}
      </button>
      {display && (
        <EventShareModal
          onClose={() => setDisplay(false)}
          res={['/home/agendas', '/api/agendas?contributionType=1&useDefaultImage=1']}
          segment="openagenda"
          event={params}
          userLogged={userLogged}
        />
      )}
    </>
  );
};

const ShareEmailModalContainer = ({ params, userLogged }) => {
  const [display, setDisplay] = useState(false);

  return (
    <>
      <button className="btn btn-link" onClick={() => setDisplay(true)} disabled={!userLogged}>
        <i className="fa fa-envelope-o"></i>
      </button>
      {display && (
        <EventShareModal
          onClose={() => setDisplay(false)}
          res="/home/agendas"
          segment="email"
          event={params}
          userLogged={userLogged}
        />
      )}
    </>
  );
};


const ShareAllModalContainer = ({ params, userLogged, query }) => {
  const [display, setDisplay] = useState(false);

  const intl = useIntl();

  useEffect(() => {
    if(query.includes('sharemodal')) setDisplay(true);
  }, [query])

  return (
    <>
      <button className="btn btn-link" onClick={() => setDisplay(true)}>
        {intl.formatMessage(messages.moreButton)}
      </button>
      {display && (
        <EventShareModal onClose={() => setDisplay(false)} res="/home/agendas" event={params} userLogged={userLogged} />
      )}
    </>
  );
};

export default function displayShareButtons({agendaUid , uid, agendaSlug, agendaTitle, lang, selectors, root}, userLogged) {
  const query = window.location.href;

  const eventParams = {
    agendaUid,
    uid,
    agendaSlug,
    agendaTitle,
    lang,
    root
  };

  if (document.querySelector(selectors.shareOa)) {
    ReactDom.render(
      <IntlProvider
        key={lang}
        locale={lang}
        messages={locales[lang]}
        defaultLocale={getSupportedLocale(lang)}
      >
        <ShareOAModalContainer params={eventParams} userLogged={userLogged} />
      </IntlProvider>,
      document.querySelector(selectors.shareOa)
    );
  }
  if (document.querySelector(selectors.shareEmail)) {
    ReactDom.render(
      <IntlProvider
        key={lang}
        locale={lang}
        messages={locales[lang]}
        defaultLocale={getSupportedLocale(lang)}
      >
        <ShareEmailModalContainer params={eventParams} userLogged={userLogged} />
      </IntlProvider>,
      document.querySelector(selectors.shareEmail)
    );
  }
  if (document.querySelector(selectors.shareAll)) {
    ReactDom.render(
      <IntlProvider
        key={lang}
        locale={lang}
        messages={locales[lang]}
        defaultLocale={getSupportedLocale(lang)}
      >
        <ShareAllModalContainer params={eventParams} userLogged={userLogged} query={query} />
      </IntlProvider>,
      document.querySelector(selectors.shareAll)
    );
  }
}

