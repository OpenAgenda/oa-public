import '@openagenda/widgets/src/index';

if (
  document.readyState === 'complete'
  || document.readyState === 'interactive'
) {
  readyHandler();
} else {
  window.addEventListener('DOMContentLoaded', readyHandler);
}

function readyHandler() {
  let elems = document.querySelectorAll('.cbpgbdy');

  if (!elems.length) {
    elems = document.querySelectorAll('[data-oabdy]');
  }

  for (const elem of elems) {
    try {
      const agendaUid = (elem.dataset.src || elem.src).match(/[0-9]+/g)[0];

      elem.style.display = 'none';
      elem.src = 'about:blank';

      const newElem = document.createElement('blockquote');
      newElem.className = 'oa-agenda';
      newElem.setAttribute('align', 'center');
      newElem.innerHTML = `<a href="https://openagenda.com/agendas/${agendaUid}"></a>`;
      elem.replaceWith(newElem);
    } catch (e) {
      console.log('Failed to replace old iframes', e);
    }
  }

  window.oa.widgets.load();
}
