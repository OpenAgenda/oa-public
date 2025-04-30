import './page.css';

export default {
  title: 'Widgets/Iframe',
};

export const Main = () => `
  <section class="page">
    <h2>Agenda</h2>
    <blockquote class="oa-agenda" align="center"><p lang="fr">Voir les événements de <a href="https://d.openagenda.com/agendas/83549053"><b>Bordeaux Métropole</b></a></p></blockquote>
  </section>

  <!-- remove hash -->
  <script>history.replaceState({}, '', '#');</script>
  <script async src="/index.js" charset="utf-8"></script>
`;

export const Factory = () => `
  <section class="page">
    <h2>Agenda</h2>
    <blockquote class="oa-agenda" align="center"><p lang="fr">Voir les événements de <a href="https://d.openagenda.com/agendas/83549053"><b>Bordeaux Métropole</b></a></p></blockquote>
  </section>

  <!-- remove hash -->
  <script>history.replaceState({}, '', '#');</script>
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
      elem.insertAdjacentHTML('beforeend', '<blockquote class="oa-agenda" align="center"><p lang="fr">Voir les événements de <a href="https://d.openagenda.com/agendas/83549053"><b>Bordeaux Métropole</b></a></p></blockquote>');
      
      window.oa.widgets.load();
    }
  </script>

  <!-- remove hash -->
  <script>history.replaceState({}, '', '#');</script>
  <script async src="/index.js" charset="utf-8"></script>
`;

export const BaseUrl = () => `
  <section class="page">
    <h2>Agenda</h2>
    <blockquote class="oa-agenda" align="center" data-base-url="https://www.bordeaux-metropole.fr/agenda"><p lang="fr">Voir les événements de <a href="https://d.openagenda.com/agendas/83549053"><b>Bordeaux Métropole</b></a></p></blockquote>
  </section>

  <!-- remove hash -->
  <script>history.replaceState({}, '', '#');</script>
  <script async src="/index.js" charset="utf-8"></script>
`;

export const BaseUrlTarget = () => `
  <section class="page">
    <h2>Agenda</h2>
    <blockquote class="oa-agenda" align="center" data-base-url="https://ville-fosses95.fr/agenda/#!/fr/embed/agendas/21419846/events/" data-base-url-target="_blank"><p lang="fr">Voir les événements de <a href="https://d.openagenda.com/agendas/21419846"><b>Fosses</b></a></p></blockquote>
  </section>

  <!-- remove hash -->
  <script>history.replaceState({}, '', '#');</script>
  <script async src="/index.js" charset="utf-8"></script>
`;

export const Filters = () => `
  <section class="page">
    <h2>Agenda</h2>
    <blockquote class="oa-agenda" align="center" data-filters="timings,categories-agenda-metropolitain,search,geo"><p lang="fr">Voir les événements de <a href="https://d.openagenda.com/agendas/83549053?relative[]=passed&relative[]=current&relative[]=upcoming"><b>Bordeaux Métropole</b></a></p></blockquote>
  </section>

  <!-- remove hash -->
  <script>history.replaceState({}, '', '#');</script>
  <script async src="/index.js" charset="utf-8"></script>
`;

export const Prefilter = () => `
  <section class="page">
    <h2>Agenda</h2>
    <blockquote class="oa-agenda" align="center" data-base-url="https://www.bordeaux-metropole.fr/agenda" data-filters="categories-agenda-metropolitain,search,geo"><p lang="fr">Voir les événements de <a href="https://d.openagenda.com/agendas/83549053?categories-agenda-metropolitain%5B0%5D=47&categories-agenda-metropolitain%5B1%5D=51"><b>Bordeaux Métropole</b></a></p></blockquote>
  </section>

  <!-- remove hash -->
  <script>history.replaceState({}, '', '#');</script>
  <script async src="/index.js" charset="utf-8"></script>
`;

export const Sort = () => `
  <section class="page">
    <h2>Agenda</h2>
    <blockquote class="oa-agenda" align="center" data-base-url="https://www.bordeaux-metropole.fr/agenda" data-sort="timings.asc"><p lang="fr">Voir les événements de <a href="https://d.openagenda.com/agendas/83549053?categories-agenda-metropolitain%5B0%5D=47&categories-agenda-metropolitain%5B1%5D=51"><b>Bordeaux Métropole</b></a></p></blockquote>
  </section>

  <!-- remove hash -->
  <script>history.replaceState({}, '', '#');</script>
  <script async src="/index.js" charset="utf-8"></script>
`;

export const PrimaryColor = () => `
  <section class="page">
    <h2>Agenda</h2>
    <blockquote class="oa-agenda" align="center" data-base-url="https://www.bordeaux-metropole.fr/agenda" data-filters="categories-agenda-metropolitain,search,geo" data-primary-color="#c800ff"><p lang="fr">Voir les événements de <a href="https://d.openagenda.com/agendas/83549053?categories-agenda-metropolitain%5B0%5D=47&categories-agenda-metropolitain%5B1%5D=51"><b>Bordeaux Métropole</b></a></p></blockquote>
  </section>

  <!-- remove hash -->
  <script>history.replaceState({}, '', '#');</script>
  <script async src="/index.js" charset="utf-8"></script>
`;

export const ImageListContain = () => `
  <section class="page">
    <h2>Agenda</h2>
    <blockquote class="oa-agenda" align="center" data-base-url="https://www.bordeaux-metropole.fr/agenda" data-filters="categories-agenda-metropolitain,search,geo" data-image-list="contain;maxHeight:400px"><p lang="fr">Voir les événements de <a href="https://d.openagenda.com/agendas/83549053?categories-agenda-metropolitain%5B0%5D=47&categories-agenda-metropolitain%5B1%5D=51"><b>Bordeaux Métropole</b></a></p></blockquote>
  </section>

  <!-- remove hash -->
  <script>history.replaceState({}, '', '#');</script>
  <script async src="/index.js" charset="utf-8"></script>
`;

export const ImageListCover = () => `
  <section class="page">
    <h2>Agenda</h2>
    <blockquote class="oa-agenda" align="center" data-base-url="https://www.bordeaux-metropole.fr/agenda" data-filters="categories-agenda-metropolitain,search,geo" data-image-list="cover;ratio:1"><p lang="fr">Voir les événements de <a href="https://d.openagenda.com/agendas/83549053?categories-agenda-metropolitain%5B0%5D=47&categories-agenda-metropolitain%5B1%5D=51"><b>Bordeaux Métropole</b></a></p></blockquote>
  </section>

  <!-- remove hash -->
  <script>history.replaceState({}, '', '#');</script>
  <script async src="/index.js" charset="utf-8"></script>
`;

export const MapHeight = () => `
  <section class="page">
    <h2>Agenda</h2>
    <blockquote class="oa-agenda" align="center" data-base-url="https://www.bordeaux-metropole.fr/agenda" data-filters="categories-agenda-metropolitain,search,geo" data-map-size="height:400px"><p lang="fr">Voir les événements de <a href="https://d.openagenda.com/agendas/83549053?categories-agenda-metropolitain%5B0%5D=47&categories-agenda-metropolitain%5B1%5D=51"><b>Bordeaux Métropole</b></a></p></blockquote>
  </section>

  <!-- remove hash -->
  <script>history.replaceState({}, '', '#');</script>
  <script async src="/index.js" charset="utf-8"></script>
`;

export const MapRatio = () => `
  <section class="page">
    <h2>Agenda</h2>
    <blockquote class="oa-agenda" align="center" data-base-url="https://www.bordeaux-metropole.fr/agenda" data-filters="categories-agenda-metropolitain,search,geo" data-map-size="ratio:16/9;maxHeight:400px"><p lang="fr">Voir les événements de <a href="https://d.openagenda.com/agendas/83549053?categories-agenda-metropolitain%5B0%5D=47&categories-agenda-metropolitain%5B1%5D=51"><b>Bordeaux Métropole</b></a></p></blockquote>
  </section>

  <!-- remove hash -->
  <script>history.replaceState({}, '', '#');</script>
  <script async src="/index.js" charset="utf-8"></script>
`;

export const WithUrl = () => `
  <section class="page">
    <h2>Agenda</h2>
    <blockquote class="oa-agenda" align="center" data-filters="categories-agenda-metropolitain,search,geo"><p lang="fr">Voir les événements de <a href="https://d.openagenda.com/agendas/83549053?categories-agenda-metropolitain%5B0%5D=47&categories-agenda-metropolitain%5B1%5D=51"><b>Bordeaux Métropole</b></a></p></blockquote>
  </section>

  <!-- add hash -->
  <script>history.replaceState({}, '', '#!/fr/embed/agendas/83549053?categories-agenda-metropolitain%255B0%255D=47');</script>
  <script async src="/index.js" charset="utf-8"></script>
`;

export const FixedHeight = () => `
  <section class="page">
    <h2>Agenda</h2>
    <blockquote class="oa-agenda" align="center" data-iframe-height="430px"><p lang="fr">Voir les événements de <a href="https://d.openagenda.com/agendas/83549053"><b>Bordeaux Métropole</b></a></p></blockquote>
  </section>

  <!-- remove hash -->
  <script>history.replaceState({}, '', '#');</script>
  <script async src="/index.js" charset="utf-8"></script>
`;

export const FixedLanguage = () => `
  <section class="page">
    <h2>Agenda</h2>
    <blockquote class="oa-agenda" align="center"><p lang="fr">Voir les événements de <a href="https://d.openagenda.com/br/agendas/43546027"><b>Mizvezh ar Brezhoneg | Le Mois du Breton</b></a></p></blockquote>
  </section>

  <!-- remove hash -->
  <script>history.replaceState({}, '', '#');</script>
  <script async src="/index.js" charset="utf-8"></script>
`;

export const WithoutLogo = () => `
  <section class="page">
    <h2>Agenda</h2>
    <blockquote class="oa-agenda" align="center" data-logo="hide"><p lang="fr">Voir les événements de <a href="https://d.openagenda.com/agendas/83549053"><b>Bordeaux Métropole</b></a></a></p></blockquote>
  </section>

  <!-- remove hash -->
  <script>history.replaceState({}, '', '#');</script>
  <script async src="/index.js" charset="utf-8"></script>
`;
