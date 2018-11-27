const _ = require( 'lodash' );

module.exports = {
  _,
  root: 'https://d.openagenda.com',
  logo: {
    src: 'https://cibuldev.s3.amazonaws.com/rwtbagenda43032271.jpg',
    width: '100px'
  },
  link: 'https://d.openagenda.com/test-zi',
  agenda: 'test zi',
  message: false,
  isStakeholder: true,
  credential: 'contributor',
  unsubscribeLink: 'https://d.openagenda.com/unsubscribe/u/0/s/stakeholder/i/106830/t/message',
  emailSettingsLink: 'https://d.openagenda.com/settings/unsubscribed',
  isRegisteredUser: true
};

module.exports.$labels = require( '@openagenda/labels/mails/stakeholderInvitation' );
