"use strict";

const _ = require('lodash');
const async = require('async');
const w = require('when');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const templater = require('@openagenda/cibul-templates');

const Registration = require( '@openagenda/registration/lib/Display' );

const config = require( '../../../config' );
const legacyEventSvc = require( '../../event' );
const log = require( '@openagenda/logs' )( 'services/event/middleware/components' );
const members = require('../../members');
const pickEventImage = require( '../lib/pickImage' );

module.exports = buildComponents;

function buildComponents( req, res, next ) {

  w( { req, res, referencesRender: null } )

  .then( _registration )

  .then( _timings )

  .done( v => next(), err => next( err ) );

}

function _timings( v ) {

  const d = w.defer();

  templater( 'event/hours', {
    lang: v.req.lang,
    event: {
      dates: v.req.formatted.dates
    }
  }, ( err, render ) => {

    if ( err ) return d.reject( err );

    v.req.formatted.timingsComponent = render;

    d.resolve( v );

  } );

  return d.promise;

}


function _registration( v ) {
  v.req.formatted.registrationComponent = renderComponent( Registration, {
    value: v.req.formatted.registration.map(({ value }) => value).join(', '),
    lang: v.req.lang
  } );

  return v;

}

function renderComponent( component, data ) {

  const rendered = ReactDOMServer.renderToStaticMarkup( React.createElement(component, data) );

  return rendered === '<noscript></noscript>' ? false : rendered;

}
