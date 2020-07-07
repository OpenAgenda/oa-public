import debug from 'debug';
import readPageProps from './lib/readPageProps';

const iframeHandler = require('./lib/iframe.child')();

const log = debug('preview');

/* global $ */

$(() => {
  const pageProps = readPageProps($);

  $('a').on('click', function handePreviewClick(e) {
    e.preventDefault();

    let link = $(this).attr('href');

    const eventSlug = $(this).attr('data-event-slug');

    if (eventSlug) {
      const agendaRoot = pageProps.iframable
        ? `${pageProps.iframeParent}#`
        : pageProps.root;

      link = `${agendaRoot}/events/${eventSlug}`;
    }

    log('preview link clicked', link);

    iframeHandler.sendExternalLinkClick(link);
  });
});
