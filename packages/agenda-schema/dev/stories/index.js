"use strict";

module.exports = [ {
  name: 'Limited',
  description: 'This is the story where only one extra field is allowed',
  slug: 'limited',
  config: require( './limited' ),
  req: { lang: 'fr' }
}, {
  name: 'Main',
  description: 'Users can update any label and add up to 10 extra fields',
  slug: 'main',
  config: require( './main' ),
  req: { lang: 'fr' }
}, {
  name: 'Debug',
  description: 'Hi',
  slug: 'debug',
  config: require( './debug' ),
  req: { lang: 'fr' }
} ]
