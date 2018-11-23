'use strict';

const moment = require( 'moment' );

module.exports = {
  root: 'https://d.openagenda.com',
  logo: {
    src: 'https://cibuldev.s3.amazonaws.com/rwtbagenda43032271.jpg',
    width: '100px'
  },
  nbr: 1,
  date: moment().subtract( 1 , 'day' ).format( 'LLL' ),
  link: 'https://d.openagenda.com/test-zi',
  agenda: {
    title: 'test zi'
  },
  message: '<span style="font-size: 12px">Jeudi 16 août 2018 12:08</span><br /><a href="https://d.openagenda.com/agendas/82290100" style="color: gray; text-decoration: none"><span style="color: #413a42">Yacine Bensalem - OpenAgenda</span> a créé <span style="color: #413a42">fregresgre et 2 autres événements</span> sur <span style="color: #413a42">Diocèse de Paris</span>.</a>',
  senderName: 'Jean-Edouard-Jacques',
  unsubscribeLink: 'https://d.openagenda.com/unsubscribe/u/0/s/stakeholder/i/106830/t/message',
  emailSettingsLink: 'https://d.openagenda.com/settings/unsubscribed'
};

module.exports.$labels = require( '@openagenda/labels/mails/notificationsSummary' );
