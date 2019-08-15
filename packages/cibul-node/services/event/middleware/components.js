"use strict";

const pickEventImage = require( '../lib/pickImage' );

const config = require( '../../../config' );

var w = require( 'when' ),

React = require( 'react' ),

ReactDOMServer = require( 'react-dom/server' ),

Registration = React.createFactory( require( '@openagenda/registration/lib/Display' ) ),

References = React.createFactory( require( '@openagenda/agenda-event-references/react/build/Show' ) ),

aer = require( '@openagenda/agenda-event-references' ),

templater = require( '@openagenda/cibul-templates' ),

genUrl = require( '../../genUrl' ),

async = require( 'async' ),

eventSvc = require( '../../event' );

module.exports = Object.assign( buildComponents, {
  getReferences
} );


function getReferences( req, res, next ) {

  w( {
    req,
    res,
    referencesRender: null,
    includeUnpublished: !!req.access
  } )

  .then( _references )

  .then( v => {

    req.referencesRender = v.referencesRender;

    req.references = v.references;

    next();

  } );

}


function buildComponents( req, res, next ) {

  w( { req, res, referencesRender: null } )

  .then( _registration )

  .then( _timings )

  .done( v => next(), err => next( err ) );

}

function _references( v ) {

  if ( !v.req.agenda ) return v;

  let d = w.defer();

  // get references if any, then fetch from db, then render component.
  aer( v.req.agenda.id ).get( v.req.event.id, ( err, eventIds ) => {

    if ( err ) return d.reject( err );

    if ( !eventIds.length ) return d.resolve( v );

    v.req.agenda.events.list( {
      ids: eventIds,
      isPublished: null,
      limit: 200
    }, ( err, events ) => {

      if ( err ) return d.reject( err );

      if ( !events.length ) {

        return d.resolve( v );

      }

      const ev = {
        lang: v.req.lang,
        events: []
      }

      async.eachSeries( events, ( event, ecb ) => {

        const e = eventSvc.instanciate( event );

        e.getState( ( err, state ) => {

          if ( !v.includeUnpublished && state!==2 ) return ecb();

          ev.events.push( ( {
            uid: e.uid,
            image: pickEventImage( config, e, 'thumbnail' ),
            link: `/${v.req.agenda.slug}/events/${e.slug}`,
            title: e.title,
            location: {
              name: e.locations[ 0 ].name,
              address: e.locations[ 0 ].address,
            },
            dateRange: {
              fr: e.getRange( 'fr' ),
              en: e.getRange( 'en' )
            }
          } ) );

          ecb();

        } );

      }, err => {

        if ( err ) return d.reject( err );

        v.referencesRender = renderComponent( References, ev );

        v.references = ev.events;

        d.resolve( v );

      } );

    } );

  } );

  return d.promise;

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
    value: v.req.event.getTicketLink( true ) || '',
    lang: v.req.lang
  } );

  return v;

}

function renderComponent( component, data ) {

  let rendered = ReactDOMServer.renderToStaticMarkup( component( data ) );

  return rendered === '<noscript></noscript>' ? false : rendered;

}
