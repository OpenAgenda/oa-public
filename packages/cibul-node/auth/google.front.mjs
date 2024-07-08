import _ from 'lodash';
import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import cmn from '../lib/commons-app.js';
import config from '../config/index.js';
import Auth from './lib/auth.mjs';

const auth = Auth('google');

const googleOptions = {
  clientID: _.get(config, 'auth.google.id'),
  clientSecret: _.get(config, 'auth.google.secret'),
  passReqToCallback: true,
};

/**
 * controllers
 */

function signin(req, res, next) {
  auth.saveOptionals(req, res, req.agenda ? { agenda: req.agenda.slug } : {});

  passport.authenticate('google-signin', {
    scope: ['email', 'profile'],
    callbackURL: req.app.services.genUrl.abs('googleSigninCallback'),
  })(req, res, next);
}

function signup(req, res, next) {
  auth.saveOptionals(req, res, req.agenda ? { agenda: req.agenda.slug } : {});

  passport.authenticate('google-signup', {
    scope: ['email', 'profile'],
    callbackURL: req.app.services.genUrl.abs('googleSignupCallback'),
  })(req, res, next);
}

function _loadGoogleProfile(req, token, refreshToken, profile, done) {
  const extracted = {
    id: profile.id,
    fullName: profile.displayName,
  };

  if (profile.emails && profile.emails.length > 0) {
    extracted.email = profile.emails[0].value;
  }

  done(null, extracted);
}

export default app => {
  const { sessions, agendas, genUrl } = app.services;

  const preMw = [
    cmn.loadBaseData(auth.layoutData, 'oa-main.css'),
    sessions.mw.ifLogged((req, res) => res.redirect(302, '/')),
  ];

  if (_.get(config, 'auth.google.id')) {
    passport.use('google-signin', new GoogleStrategy(
      {
        callbackURL: genUrl.abs('googleSigninCallback'),
        ...googleOptions,
      },
      _loadGoogleProfile,
    ));
    passport.use('google-signup', new GoogleStrategy(
      {
        callbackURL: genUrl.abs('googleSignupCallback'),
        ...googleOptions,
      },
      _loadGoogleProfile,
    ));
  }

  app.get('/google/signin', preMw, signin);

  app.get('/:agendaSlug/google/signin', agendas.mw.load, preMw, signin);

  app.get('/google/signin/callback', preMw, auth.serviceCallback(auth.process('google', 'signin')));

  app.post('/google/signup', preMw, signup);

  app.post('/:agendaSlug/google/signup', agendas.mw.load, preMw, signup);

  app.get('/google/signup/callback', preMw, auth.serviceCallback(auth.process('google', 'signup')));
};
