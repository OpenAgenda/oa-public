'use strict';

const { createElement: el } = require('react');
const { Helmet } = require('react-helmet-async');

module.exports = () => {
  return el(
    Helmet,
    { title: 'OpenAgenda', defaultTitle: 'OpenAgenda' },
    el('title', null, 'OpenAgenda'),
    el('link', { rel: 'shortcut icon', href: '/images/favicon.ico' }),
    el('meta', { charSet: 'utf-8' }),
    el('meta', { httpEquiv: 'X-UA-Compatible', content: 'IE=edge' }),
    el('meta', { name: 'title', content: 'Openagenda' }),
    el('meta', { name: 'description', content: 'Communicate efficiently on your events' }),
    el('meta', { name: 'keywords', content: 'openagenda, events, agendas, open data, networked' }),
    el('meta', { name: 'robots', content: 'index, follow' }),
    el('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
    el('meta', { name: 'language', content: 'fr' })
    );
};
