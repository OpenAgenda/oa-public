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
    description: 'Les apéros Moovjee continuent tout l\'été et prend ses quartiers au Jardin des Tuileries. Le traiteur LeCointre nous accueille une fois encore au restaurant le Médicis.',
    freeText: 'Ces apéros ont pour objectif de réunir la communauté des jeunes entrepreneurs, porteurs de projet, mentors et partenaires du Moovjee. Ces bulles estivales sont placées sous les signes de la convivialité et de l\'échange.\nDes tarifs spéciaux spécial Moovjee seront proposés.',
    image: 'http://cibul.s3.amazonaws.com/evfevent_apero-moovjee-ca-continue_978399.jpg',
    dateRange: 'Restaurant Le Médicis, le mardi 29 juillet à 19:30',
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
  unsubscribeLink: 'https://d.openagenda.com/unsubscribe/u/0/s/email/i/kevin.bertho@gmail.com/t/eventEmail'
};

module.exports.$labels = require( '@openagenda/labels/mails/event' );
