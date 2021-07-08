const React = require('react');
const { useState } = require('react');
const ReactDom = require('react-dom');

import { AggregatorModal } from '@openagenda/react-share-menus';
import { IntlProvider } from 'react-intl';
import locales from '../../locales-compiled';

const AggregatorModalContainer = ({ options }) => {
  const [display, setDisplay] = useState(false);
  const lang = options.lang;

  return (
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
      <a className="btn btn-default margin-bottom-xs" onClick={() => setDisplay(true)}>
        <img alt="logo" src="https://oastatic.s3.eu-central-1.amazonaws.com/whitelogo22.png" />
        &nbsp; Agréger
      </a>
      {display ? (
        <AggregatorModal
          onClose={() => setDisplay(false)}
          targetAgenda={{ title: options.title, slug: options.slug }}
          res="/home/agendas"
        />
      ) : null}
    </IntlProvider>
  );
};

export default function displayAggregateButton(params, options) {
  const buttonLocation = document.querySelector(params.selectors.aggregate);
  return ReactDom.render(<AggregatorModalContainer options={options} />, buttonLocation);
}
