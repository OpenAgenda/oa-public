import './page.css';

export default {
  title: 'Widgets/Iframe',
};

export const Main = () => `
  <section class="page">
    <h2>Agenda</h2>
    <blockquote class="oa-agenda" align="center">Voir les événements de <a href="https://d.openagenda.com/jep-2024-grand-est"><b>Fête de la musique</b></a></blockquote>
  </section>

  <script async src="/index.js" charset="utf-8"></script>
`;

export const Factory = () => `
  <section class="page">
    <h2>Agenda</h2>
    <blockquote class="oa-agenda" align="center">Voir les événements de <a href="https://d.openagenda.com/jep-2024-grand-est"><b>Fête de la musique</b></a></blockquote>
  </section>

  <script>window.oa = (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0],
      t = window.oa || {};
    if (d.getElementById(id)) return t;
    js = d.createElement(s);
    js.id = id;
    js.src = '/index.js';
    js.async = true;
    fjs.parentNode.insertBefore(js, fjs);
  
    t._e = [];
    t.ready = function(f) {
      t._e.push(f);
    };
  
    return t;
  }(document, 'script', 'oa-wjs'));</script>
`;

export const Manual = () => `
  <section class="page">
    <button onClick="addIframe()">Add iFrame</button>
  </section>

  <script>
    function addIframe() {
      const elem = document.querySelector('.page');
      elem.insertAdjacentHTML('beforeend', '<blockquote class="oa-agenda" align="center">Voir les événements de <a href="https://d.openagenda.com/jep-2024-grand-est"><b>Fête de la musique</b></a></blockquote>');
      
      window.oa.widgets.load();
    }
  </script>

  <script async src="/index.js" charset="utf-8"></script>
`;
