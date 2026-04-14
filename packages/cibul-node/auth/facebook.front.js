import _ from 'lodash';
import passport from 'passport';
import FacebookStrategy from 'passport-facebook';
import cmn from '../lib/commons-app.js';
import config from '../config/index.js';
import Auth from './lib/auth.js';

const auth = Auth('facebook');

const facebookOptions = {
  clientID: _.get(config, 'auth.facebook.id'),
  clientSecret: _.get(config, 'auth.facebook.secret'),
  scope: ['email', 'public_profile'],
  profileFields: ['id', 'email', 'name'],
};

/**
 * controllers
 */

function signin(req, res, next) {
  auth.saveOptionals(req, res, req.agenda ? { agenda: req.agenda.slug } : {});

  passport.authenticate('facebook-signin')(req, res, next);
}

function _loadFacebookProfile(accessToken, refreshToken, profile, done) {
  const extracted = {
    id: profile.id,
    fullName: `${profile.name.givenName} ${profile.name.familyName}`,
  };

  if (profile.emails && profile.emails.length > 0) {
    extracted.email = profile.emails[0].value;
  }

  done(null, extracted);
}

export default (app) => {
  const { sessions, agendas, genUrl } = app.services;

  const preMw = [
    cmn.loadBaseData(auth.layoutData, 'oa-main.css'),
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/')),
  ];

  if (_.get(config, 'auth.facebook.id')) {
    passport.use(
      'facebook-signin',
      new FacebookStrategy(
        {
          callbackURL: genUrl.abs('facebookSigninCallback'),
          ...facebookOptions,
        },
        _loadFacebookProfile,
      ),
    );
  }

  app.get('/facebook/signin', preMw, signin);

  app.get('/:agendaSlug/facebook/signin', agendas.mw.load, preMw, signin);

  app.get(
    '/facebook/signin/callback',
    preMw,
    auth.process('facebook', 'signin'),
  );
};
