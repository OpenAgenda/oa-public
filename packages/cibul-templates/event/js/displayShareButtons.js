const React = require('react');
const { useState, useEffect } = require('react');
const ReactDom = require('react-dom');

import { mergeLocales } from '@openagenda/react-shared';
import { modalLocales } from '@openagenda/react-share-menus';
import { ShareModal } from '@openagenda/react-share-menus';
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
        <ShareModal
          onClose={() => setDisplay(false)}
          res="/home/agendas"
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
        <ShareModal
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
    if(query.includes('displayShareModal')) setDisplay(true);
  }, [query])
 
  return (
    <>
      <button className="btn btn-link" onClick={() => setDisplay(true)}>
        {intl.formatMessage(messages.moreButton)}
      </button>
      {display && (
        <ShareModal onClose={() => setDisplay(false)} res="/home/agendas" event={params} userLogged={userLogged} />
      )}
    </>
  );
};

export default function displayShareButtons({agendaUid , uid, agendaSlug, agendaTitle, lang, selectors}, userLogged) {
  const query = window.location.href;

  const eventParams = {
    agendaUid,
    uid,
    agendaSlug,
    agendaTitle,
    lang
  };
  
  ReactDom.render(
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}><ShareOAModalContainer params={eventParams} userLogged={userLogged} /></IntlProvider>,
    document.querySelector(selectors.shareOa)
  );
  ReactDom.render(
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}><ShareEmailModalContainer params={eventParams} userLogged={userLogged} /></IntlProvider>,
    document.querySelector(selectors.shareEmail)
  );
  ReactDom.render(
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}><ShareAllModalContainer params={eventParams} userLogged={userLogged} query={query} /></IntlProvider>,
    document.querySelector(selectors.shareAll)
  );
}

