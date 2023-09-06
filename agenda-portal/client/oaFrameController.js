const handleIFrame = require('./lib/iframe.parent');

const selector = 'data-oa-frame';

const iframes = document.querySelectorAll(`[${selector}]`);

for (const iframe of iframes) {
  handleIFrame(iframe, { selector });
}
