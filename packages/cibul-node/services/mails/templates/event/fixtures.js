module.exports = {
  root: 'https://d.openagenda.com',
  logo: {
    src: 'https://cibuldev.s3.amazonaws.com/rwtbagenda43032271.jpg',
    width: '100px'
  },
  agendaTitle: 'Sorties Grand Verdun',
  event: {
    title: 'Atelier de fabrication de bombe pour enfant',
    description: 'Vous avez déjà voulu échanger votre enfant, le jetter ou le recycler ? Nous avons la solution !',
    longDescription: 'Notre solution saura ravir les parents les plus ignobles:\n\nelle consiste à transformer votre immonde petit humain qui vous sert d\'enfant en bombe humaine, ce qui est parfait pour l\'emmener à la maternelle ou la crèche.',
    image: 'http://cibul.s3.amazonaws.com/evfevent_apero-moovjee-ca-continue_978399.jpg',
    dateRange: 'Restaurant Le Médicis, le mardi 29 juillet à 19:30',
    pricingInfo: null,
    ticketLink: null,
    placeName: 'Restaurant Le Médicis',
    address: 'Tuileries Garden, 113 Rue de Rivoli, 75001 Paris, France'
  },
  map : {
    lat : 48.863492,
    lng : 2.327494,
    zoom : 14,
    accessToken : 'pk.eyJ1Ijoia2FvcmUiLCJhIjoidDZ1UW5HWSJ9.VspmN8kRdEgRm2A91RjNow'
  },

  link: 'https://d.openagenda.com/test-zi/events/atelier-de-fabrication-de-bombe-pour-enfant'
};

module.exports.$labels = require( '@openagenda/labels/mails/event' );
