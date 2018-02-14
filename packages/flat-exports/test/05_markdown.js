"use strict";

const should = require( 'should' );
const moment = require( 'moment-timezone' );
const md = require( '../lib/markdown' );
const event = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/fixtures/acces-libre.json', 'utf-8' ) );

describe( 'flat-exports - unit - md', () => {

  describe( 'helpers', () => {

    test( 'markdown head', () => {

      const head = md.head( 'txt', {
        slug: 'la-gargouille',
        identifier: 123,
        type: 'agenda',
        lang: 'fr',
        title: 'La Gargouille',
        description: 'Evénements à Paris'
      } );

      expect( head ).toBe(
`La Gargouille - Evénements à Paris
https://openagenda.com/la-gargouille


`     );

    } );

    test( 'text event', () => {

      const markdownEventItem = md.parseEvent( 'txt', { lang: 'fr', genUrl: e => '#' + e.uid }, event );

      expect( markdownEventItem ).toBe(
`## Accès libre

Accès libre accompagné
2 octobre - 29 décembre
MMN13 - 47 rue du javelot 75013

l'accès libre est gratuit sous conditions de reservation. 12 postes disponibles

#48919824


`    )

    } );

  } );

} );