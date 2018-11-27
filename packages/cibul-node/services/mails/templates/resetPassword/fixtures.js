const _ = require( 'lodash' );

module.exports = {
  _,
  root: 'https://d.openagenda.com',
  resetLink: 'https://d.openagenda.com/password/reset/5e35adbc21a06210939de13b3d3b00d0dec7cf98',
  isRegisteredUser: true
};

module.exports.$labels = require( '@openagenda/labels/mails/resetPassword' );
