"use strict";

var w = require( 'when' ),

React = require( 'react' ),

ReactDOMServer = require( 'react-dom/server' ),

Registration = React.createFactory( require( 'registration/lib/Display' ) ),

References = React.createFactory( require( 'agenda-event-references/react/build/Show' ) ),

aer = require( 'agenda-event-references' ),

genUrl = require( '../../genUrl' ),

async = require( 'async' ),

eventSvc = require( '../../event' );

module.exports = buildComponents;

module.exports.getReferences = getReferences;


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

    next();

  } );

}


function buildComponents( req, res, next ) {

  w( { req, res, referencesRender: null } )

  .then( _registration )

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
      ids: eventIds
    }, ( err, events ) => {

      if ( err ) return d.reject( err );

      if ( !events.length ) {

        return d.resolve( v );

      }

      let ev = {
        lang: v.req.lang,
        events: []
      }

      async.eachSeries( events, ( event, ecb ) => {

        let e = eventSvc.instanciate( event );

        e.getPublished( ( err, isPublished ) => {

          if ( !v.includeUnpublished && !isPublished ) return ecb();

          ev.events.push( ( {
            image: e.getThumbnail( false ),
            link: genUrl( 'agendaEventShow', { 
              slug: v.req.agenda.slug, 
              eventSlug: e.slug 
            } ),
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

        d.resolve( v );

      } );

    } );

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