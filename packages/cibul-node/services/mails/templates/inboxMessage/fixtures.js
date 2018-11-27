'use strict';

module.exports = {
  root: 'https://d.openagenda.com',
  logo: {
    src: 'https://cibuldev.s3.amazonaws.com/rwtbagenda43032271.jpg',
    width: '100px'
  },
  link: 'https://d.openagenda.com/test-zi',
  agenda: 'test zi',
  message: 'Bonjour,\n' +
    '\n' +
    'Le ministère nous demande de vous diffuser le lien suivant :\n' +
    '\n' +
    '[https://journeesdupatrimoine.culture.gouv.fr/Composants/Surete-et-la-securite](https://journeesdupatrimoine.culture.gouv.fr/Composants/Surete-et-la-securite)\n' +
    '\n' +
    'Le lien fourni pointe vers un questionnaire de sécurité destiné à fluidifier la transmission d\'information vers les services préfectoraux afin de permettre à ces derniers d’adapter leur accompagnement site par site sur les questions de sécurité.\n' +
    '\n' +
    'Ce questionnaire n\'a pas pour objectif de lister des mesures à mettre en place obligatoirement mais vise à informer les forces de sécurité intérieures qui pourraient avoir à intervenir sur les sites.\n' +
    '\n' +
    'Ce questionnaire d\'information est accompagné en barre latérale d\'une fiche de recommandation et de conseils pratiques qui peuvent être fortement utiles aux responsables des sites organisateurs.\n' +
    '\n' +
    '```\n' +
    '<iframe style="width:100%;" frameborder="0" scrolling="no" allowtransparency="allowtransparency" class="cibulFrame cbpgbdy" data-oabdy src="//openagenda.com/agendas/48959239/embeds/46744426/events?lang=fr"></iframe><script type="text/javascript" src="//openagenda.com/js/embed/cibulBodyWidget.js"></script>\n' +
    '```' +
    '\n' +
    'Ce formulaire ayant été mis en ligne après l\'ouverture de la base open agenda, les sites inscrits avant le 24 mai ne l\'ont pas vu et n\'ont donc pas pu le remplir.\n' +
    '\n' +
    'Bien cordialement\n',
  senderName: 'Jean-Edouard-Jacques',
  unsubscribeLink: 'https://d.openagenda.com/unsubscribe/u/0/s/stakeholder.106830/t/message',
  memberUnsubscribeLink: 'https://d.openagenda.com/unsubscribe/u/0/s/stakeholder.106830/t/message',
  emailSettingsLink: 'https://d.openagenda.com/settings/unsubscribed',
  isRegisteredUser: true
};

module.exports.$makeLabelGetter = require( '@openagenda/labels/makeLabelGetter' );
module.exports.$labels = require( '@openagenda/labels/mails/inboxMessage' );
