import debug from 'debug';
import iframeChild from './lib/iframe.child.js';

const iframeHandler = iframeChild();

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
