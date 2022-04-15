const React = require('react');
const { useState, useEffect } = require('react');
const ReactDom = require('react-dom');

import { mergeLocales } from '@openagenda/intl';
import { modalLocales } from '@openagenda/react-share-menus';
import { AggregatorModal } from '@openagenda/react-share-menus';
import { IntlProvider, defineMessages, useIntl } from 'react-intl';
import appLocales from '../../locales-compiled';

const AggregatorModalContainer = ({ options, query, userLogged }) => {
  const [display, setDisplay] = useState(false);

  const whiteLogo = 'https://oastatic.s3.eu-central-1.amazonaws.com/whitelogo22.png';
  const blueLogo = 'https://oastatic.s3.eu-central-1.amazonaws.com/openagenda-blue-22.png';
  const [logo, setLogo] = useState(whiteLogo);

  const intl = useIntl();

  const messages = defineMessages({
    aggregateButton: {
      id: 'aggregate-button',
      defaultMessage: 'Aggregate',
    },
  });

  const handleClose = () => {
    setDisplay(false);
  }

  useEffect(() => {
    if (query.includes('displayAggregatorModal=1')) setDisplay(true);
  }, []);

  return (
    <>
      <a
        className="btn btn-default aggregate-button"
        onClick={() => setDisplay(true)}
        onMouseOver={() => setLogo(blueLogo)}
        onMouseOut={() => setLogo(whiteLogo)}
        onFocus={() => setLogo(blueLogo)}
        onBlur={() => setLogo(whiteLogo)}
      >
        <img alt="logo" src={logo} className="aggregate-logo" />
        &nbsp; {intl.formatMessage(messages.aggregateButton)}
      </a>
      {display ? (
        <AggregatorModal
          onClose={handleClose}
          targetAgenda={{ title: options.title, slug: options.slug }}
          res="/home/agendas"
          userLogged={userLogged}
          root={options.root}
        />
      ) : null}
    </>
  );
};

export default function displayAggregateButton(params, options, query, userLogged) {
  const buttonLocation = document.querySelector(params.selectors.aggregate);
  const lang = options.lang;
  const locales = mergeLocales(appLocales, modalLocales);

  return ReactDom.render(<IntlProvider messages={locales[lang]} locale={lang} key={lang}><AggregatorModalContainer options={options} query={query} userLogged={userLogged} /></IntlProvider>, buttonLocation);
}
