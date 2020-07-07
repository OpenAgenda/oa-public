import debug from 'debug';

const registeredLinks = [];

const log = debug('handleFrameLinkEvents');

export default (jQuery, iframeHandler) => {
  for (const elem of jQuery('a')) {
    const el = jQuery(elem);

    if (!el.attr('href')) {
      log('no href, ignoring');
      continue;
    }

    const href = el.attr('href');

    if (el.attr('target') === '_blank') {
      log('target blank, ignoring', href);
      continue;
    }

    if (registeredLinks.filter(registered => registered.is(el)).length) {
      log('already registered, ignoring', href);
      continue;
    }

    registeredLinks.push(el);

    const isRelative = href.substr(0, 1) === '/';

    if (
      isRelative
      || window.location.href.split('/').shift() === href.split('/').shift()
    ) {
      log('internal link', href);
      el.on('click', () => {
        iframeHandler.sendInternalLinkClick(href);
      });
    } else {
      log('external link', href);
      el.on('click', e => {
        e.preventDefault();
        iframeHandler.sendExternalLinkClick(href);
      });
    }
  }
};
