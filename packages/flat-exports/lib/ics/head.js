"use strict";

const schema = require( '@openagenda/validators/schema' );
const esc = require( './escape' );
const _ = require( 'lodash' );

schema.register( {
  text: require( '@openagenda/validators/text' )
} );

const validate = schema( {
  slug: {
    type: 'text',
    optional: false
  },
  identifier: {
    type: 'text',
    optional: false
  },
  type: {
    type: 'text',
    default: 'agenda'
  },
  lang: {
    type: 'text',
    default: 'fr'
  },
  title: {
    type: 'text',
    default: 'ics'
  },
  description: {
    type: 'text',
    default: 'agenda export'
  }
} )

module.exports = data => {

  const {
    slug,
    identifier,
    type,
    lang,
    title,
    description
  } = _.mapValues( validate( data ), esc );

  return [
    `BEGIN:VCALENDAR`,
    `VERSION:2.0`,
    `PRODID:-//${slug}//${type}//${lang}`,
    `METHOD:PUBLISH`,
    `X-WR-CALNAME:${title}`,
    `X-WR-CALDESC: ${description}`,
    `X-WR-RELCALID: ${identifier}`
  ].join( '\r\n' ) + '\r\n';

}