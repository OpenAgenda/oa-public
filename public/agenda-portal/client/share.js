import debug from 'debug';

const iframeHandler = require('./lib/iframe.child')();

const log = debug('share');

/* global $ */

$(() => {
  $('a').on('click', function handePreviewClick(e) {
    e.preventDefault();

    const link = $(this).attr('href');

    const eventSlug = $(this).attr('data-event-slug');

    if (eventSlug) {
      log('event slug link clicked', eventSlug);
      iframeHandler.sendEventPreviewClick(eventSlug);
    } else {
      log('other link');
      iframeHandler.sendExternalLinkClick(link);
    }
  });
});
