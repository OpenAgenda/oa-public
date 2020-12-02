const handleIFrame = require('./lib/iframe.parent');

const selector = 'data-oa-portal';

const iframes = document.querySelectorAll(`[${selector}]`);

for (const iframe of iframes) {
  handleIFrame(iframe, {
    selector,
    monitorHash: true
  });
}
