'use strict';

const _ = require('lodash');
const sanitizeHtml = require('sanitize-html');

module.exports = {
  stripHtml: html => sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }),
  _,
  root: 'https://d.openagenda.com',
  logo: {
    src: 'https://cibuldev.s3.amazonaws.com/rwtbagenda43032271.jpg',
    width: '100px'
  },
  link: 'https://d.openagenda.com/test-zi',
  agenda: 'test zi',
  message: 'Hmm\n\n**OK** !',
  isMember: false,
  role: 'administrator',
  unsubscribeLink: 'https://d.openagenda.com/unsubscribe/u/0/s/stakeholder/i/106830/t/message',
  emailSettingsLink: 'https://d.openagenda.com/settings/unsubscribed',
  isRegisteredUser: true
};

module.exports.$makeLabelGetter = require('@openagenda/labels/makeLabelGetter');
module.exports.$labels = require('@openagenda/labels/mails/memberInvitation');
