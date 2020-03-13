'use strict';

const handleIFrame = require('./lib/iframe.parent');

const iframes = document.querySelectorAll('[data-oa-portal]');

for (const iframe of iframes) {
  handleIFrame(iframe);
}
