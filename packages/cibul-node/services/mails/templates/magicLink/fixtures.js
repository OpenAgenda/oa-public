import _ from 'lodash';

export default {
  _,
  root: 'https://d.openagenda.com',
  // Token + callbackURL live in the URL fragment (#…), never sent to the
  // server — that is what keeps an email scanner from consuming the one-time
  // token. Mirror the real shape built by onSendMagicLink.
  magicLink:
    'https://d.openagenda.com/auth/magic-link/confirm#token=5e35adbc21a06210939de13b3d3b00d0dec7cf98&callbackURL=%2Fpost-activate%3Fnext%3D%252Fhome',
};
