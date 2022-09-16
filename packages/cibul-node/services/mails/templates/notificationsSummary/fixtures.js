'use strict';

const moment = require('moment');
const sanitizeHtml = require('sanitize-html');

module.exports = {
  stripHtml: html => sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }),
  root: 'https://d.openagenda.com',
  logo: {
    src: 'https://cibuldev.s3.amazonaws.com/rwtbagenda43032271.jpg',
    width: '100px',
  },
  nbr: 1,
  date: moment().subtract(1, 'day').format('LLL'),
  link: 'https://d.openagenda.com/test-zi',
  agenda: {
    title: 'test zi',
  },
  notifications: [
    {
      label: '<span style="color: #413a42">Kévin Berthommier - OpenAgenda</span> added <span style="color: #413a42">Romain Lange, Cofondateur OpenAgenda</span> as <span style="color: #413a42">administrator</span> on <span style="color: #413a42">Test notif 54948</span>.',
      url: '/agendas/3032271/admin/members',
      date: 'Mardi 6 septembre 2022 07:57',
    },
    {
      label: '<span style="color: #413a42">Kévin Berthommier - OpenAgenda</span> invited <span style="color: #413a42">romain@openagenda.com</span> as <span style="color: #413a42">contributor</span> on <span style="color: #413a42">Test notif 54948</span>.',
      url: '/agendas/3032271/admin/members',
      date: 'Mardi 6 septembre 2022 07:55',
    },
    {
      label: '<span style="color: #413a42">Kévin Berthommier - OpenAgenda</span> invited <span style="color: #413a42">romain@openagenda.com</span> as <span style="color: #413a42">administrator</span> on <span style="color: #413a42">Test notif 54948</span>.',
      url: '/agendas/3032271/admin/members',
      date: 'Mardi 6 septembre 2022 07:51',
    },
    {
      label: '<span style="color: #413a42">Kévin Berthommier - OpenAgenda</span> invited <span style="color: #413a42">gfdsgfd@fgfdbfd.fr</span> as <span style="color: #413a42">contributor</span> on <span style="color: #413a42">Test notif 54948</span>.',
      url: '/agendas/3032271/admin/members',
      date: 'Mardi 6 septembre 2022 07:50',
    },
  ],
  senderName: 'Jean-Edouard-Jacques',
  unsubscribeLink: 'https://d.openagenda.com/unsubscribe/u/0/s/stakeholder/i/106830/t/message',
  emailSettingsLink: 'https://d.openagenda.com/settings/unsubscribed',
  isRegisteredUser: true,
};
