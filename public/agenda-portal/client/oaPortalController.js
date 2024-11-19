import handleIFrame from './lib/iframe.parent.js';

const selector = 'data-oa-portal';

const iframes = document.querySelectorAll(`[${selector}]`);

for (const iframe of iframes) {
  handleIFrame(iframe, {
    selector,
    monitorHash: true,
  });
}
