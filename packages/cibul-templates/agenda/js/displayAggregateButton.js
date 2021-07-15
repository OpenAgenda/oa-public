const React = require('react');
const { useState, useEffect } = require('react');
const ReactDom = require('react-dom');

import { AggregatorModal } from '@openagenda/react-share-menus';
import { IntlProvider } from 'react-intl';
import locales from '../../locales-compiled';

const AggregatorModalContainer = ({ options, query }) => {
  const [display, setDisplay] = useState(false);
  const [success, setSuccess] = useState(false);

  const whiteLogo = 'https://oastatic.s3.eu-central-1.amazonaws.com/whitelogo22.png';
  const blueLogo = 'https://oastatic.s3.eu-central-1.amazonaws.com/openagenda-blue-22.png';
  const [logo, setLogo] = useState(whiteLogo);

  const lang = options.lang;

  const handleClose = () => {
    setDisplay(false);
    setSuccess(false);
  }

  useEffect(() => {
    if (query.includes('aggregateSuccess=1')) {
      setDisplay(true);
      setSuccess(true);
    }
  }, []);

  return (
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
      <a
        className="btn btn-default margin-bottom-xs"
        onClick={() => setDisplay(true)}
        onMouseOver={() => setLogo(blueLogo)}
        onMouseOut={() => setLogo(whiteLogo)}
        onFocus={() => setLogo(blueLogo)}
        onBlur={() => setLogo(whiteLogo)}
      >
        <img alt="logo" src={logo} />
        &nbsp; Agréger
      </a>
      {display ? (
        <AggregatorModal
          onClose={handleClose}
          targetAgenda={{ title: options.title, slug: options.slug }}
          res="/home/agendas"
          success={success}
        />
      ) : null}
    </IntlProvider>
  );
};

export default function displayAggregateButton(params, options, query) {
  const buttonLocation = document.querySelector(params.selectors.aggregate);
  return ReactDom.render(<AggregatorModalContainer options={options} query={query} />, buttonLocation);
}
