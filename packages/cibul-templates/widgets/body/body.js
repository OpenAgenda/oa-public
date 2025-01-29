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

  window.oa = (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0],
      t = window.oa || {};
    if (d.getElementById(id)) return t;
    js = d.createElement(s);
    js.id = id;
    js.src = 'https://openagenda.com/js/newEmbed.js';
    js.async = true;
    fjs.parentNode.insertBefore(js, fjs);

    t._e = [];
    t.ready = function(f) {
      t._e.push(f);
    };

    return t;
  }(document, 'script', 'oa-wjs'));

  for (const elem of elems) {
    try {
      const agendaUid = (elem.dataset.src || elem.src).match(/[0-9]+/g)[0];

      elem.style.display = 'none';
      elem.src = 'about:blank';

      window.oa.ready(() => {
        const newElem = document.createElement('blockquote');
        newElem.className = 'oa-agenda';
        newElem.setAttribute('align', 'center');
        newElem.innerHTML = `<a href="https://openagenda.com/agendas/${agendaUid}"></a>`;
        elem.replaceWith(newElem);
        window.oa.widgets.load();
      });
    } catch (e) {
      console.log('Failed to replace old iframes', e);
    }
  }
}
