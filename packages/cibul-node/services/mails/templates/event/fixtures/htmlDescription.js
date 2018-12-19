const _ = require( 'lodash' );

module.exports = {
  _,
  root: 'https://d.openagenda.com',
  logo: {
    src: 'https://cibuldev.s3.amazonaws.com/rwtbagenda43032271.jpg',
    width: '100px'
  },
  agendaTitle: 'Sorties Grand Verdun',
  event: {
    title: 'Apéro Moovjee ça continue !',
    description: 'Exposition - Projection musicale',
    freeText: '<p>Dans le cadre de son cycle de <strong>conférences-débats</strong>, l&#39;Espace Parent-Enfant vous accueille à l&#39;Espace Andrée Chedid pour :</p> <h2 id="l-cole-du-cerveau-par-olivier-houd-mardi-18-d-cembre-2018-20h30">L’école du cerveau par Olivier Houdé, mardi 18 décembre 2018 à 20h30</h2> <p><strong>La conférence-débat « L’école du cerveau » est complète, les inscriptions sont closes</strong></p> <p>De Montessori, Freinet, Piaget aux sciences cognitives, il sera question de faire le point sur les grands jalons de l’histoire de l’éducation et de la psychologie de l’enfant mais aussi de découvrir la synthèse des résultats les plus actuels des sciences cognitives et du cerveau sur les apprentissages : lire, écrire, compter, penser et respecter autrui.</p> <p><strong>Olivier Houdé</strong> est professeur de psychologie à l’<a href="https://www.univ-paris5.fr/" class="url" target="_blank">Université Paris-Descartes</a>, directeur du <a href="https://www.lapsyde.com/" class="url" target="_blank">laboratoire CNRS de Psychologie du Développement et de l’Éducation de l’enfant</a>, Membre de l’<a href="https://www.academie-technologies.fr/" class="url" target="_blank">Académie française des technologies</a>. Auteur de nombreux ouvrages : <a href="https://www.editionsmardaga.com/catalogue/lecole-du-cerveau/" class="url" target="_blank">L’école du cerveau</a>, <a href="https://www.editions-lepommier.fr/apprendre-resister" class="url" target="_blank">Apprendre à résister</a>…</p> <p><div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.2493%;"><iframe src="https://www.youtube.com/embed/s3xzBkxbNHc?rel=0&amp;showinfo=0" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no"></iframe></div></p> <p><em>Pour des raisons d’affluence, et au vu des possibilités restreintes de la salle, les places sont réservées pour les personnes inscrites jusqu&#39;à 20h25. Les personnes sont invitées à nous prévenir au plus vite de leur annulation ou empêchement afin de faire profiter le plus grande nombre.</em></p>',
    image: 'http://cibul.s3.amazonaws.com/evfevent_apero-moovjee-ca-continue_978399.jpg',
    credits: '© Jean-Momo',
    dateRange: 'mardi 29 juillet à 21:30',
    pricingInfo: 'Gratuit pour les enfants',
    ticketLink: 'https://google.fr',
    placeName: 'Restaurant Le Médicis',
    address: 'Tuileries Garden, 113 Rue de Rivoli, 75001 Paris, France',
    timings: [
      {
        start : "2018-07-29T19:30:00.000Z",
        end : "2018-07-29T21:30:00.000Z"
      },
      {
        start : "2018-07-30T19:30:00.000Z",
        end : "2018-07-30T21:30:00.000Z"
      }
    ],
    dates: [
      {
        label: 'dimanche 29 août',
        timings: [ {
          startLabel: '21:30',
          endLabel: '23:30'
        } ]
      }, {
        label: 'lundi 30 août',
        timings: [ {
          startLabel: '21:30',
          endLabel: '23:30'
        } ]
      }
    ]
  },
  customData: {
    Public: [ 'Tout public' ],
    'Thématiques': [
      'Les métiers de l’agriculture',
      'A propos des services de l’agriculture',
      'Concours Général Agricole'
    ],
    Pavillon: [ 'Pavillon 1' ]
  },
  map : {
    lat : 48.863492,
    lng : 2.327494,
    zoom : 14,
    accessToken : 'pk.eyJ1Ijoia2FvcmUiLCJhIjoidDZ1UW5HWSJ9.VspmN8kRdEgRm2A91RjNow'
  },
  link: 'https://d.openagenda.com/test-zi/events/atelier-de-fabrication-de-bombe-pour-enfant',
  isRegisteredUser: true,
  unsubscribeLink: 'https://d.openagenda.com/unsubscribe/u/0/s/email/i/kevin.bertho@gmail.com/t/eventEmail',
  emailSettingsLink: 'https://d.openagenda.com/settings/unsubscribed'
};

module.exports.$labels = require( '@openagenda/labels/mails/event' );
