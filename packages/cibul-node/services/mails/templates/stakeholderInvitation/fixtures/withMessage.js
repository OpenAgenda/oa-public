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
  message: 'Hmm\n\n**OK** !',
  isStakeholder: true,
  credential: 'contributor'
};

module.exports.$labels = require( '@openagenda/labels/mails/stakeholderInvitation' );
