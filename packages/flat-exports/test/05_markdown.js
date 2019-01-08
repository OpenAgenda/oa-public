"use strict";

const should = require( 'should' );
const moment = require( 'moment-timezone' );
const md = require( '../lib/markdown' );
const event = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/fixtures/acces-libre.json', 'utf-8' ) );

describe( 'flat-exports - unit - markdown and text', () => {

  describe( 'helpers - text', () => {

    test( 'text head', () => {

      const head = md.head( 'txt', {
        slug: 'la-gargouille',
        identifier: 123,
        type: 'agenda',
        lang: 'fr',
        title: 'La Gargouille',
        description: 'Evénements à Paris'
      } );

      expect( head ).toBe(
`La Gargouille
Evénements à Paris
https://openagenda.com/la-gargouille
=============================

`     );

    } );

    test( 'text event', () => {

      const markdownEventItem = md.parseEvent( 'txt', { lang: 'fr', genUrl: e => '#' + e.uid }, event, { previous: event } );

      expect( markdownEventItem ).toBe(
`Accès libre
#48919824

Accès libre accompagné

MMN13, 47 rue du javelot 75013
Itinéraire: https://www.google.com/maps/dir//48.824478,2.365424/@48.824478,2.365424,17z
2 octobre - 29 décembre

l'accès libre est gratuit sous conditions de reservation. 12 postes disponibles


Réservation: 0145707532

Accessibilité: Handicap auditif, Handicap psychique, Langue des signes, Handicap moteur
-----------------------------
`    )

    } );

  } );

  describe( 'helpers - markdown', () => {

    test( 'markdown event', () => {

      const markdownEventItem = md.parseEvent( 'md', {
        lang: 'fr',
        genUrl: e => '#' + e.uid,
        section: null
      }, event, { previous: event } );

      expect( markdownEventItem ).toBe(
`### [Accès libre](#48919824)

Accès libre accompagné

**MMN13**, 47 rue du javelot 75013 [Itinéraire](https://www.google.com/maps/dir//48.824478,2.365424/@48.824478,2.365424,17z)
**2 octobre - 29 décembre**

l'accès libre est gratuit sous conditions de reservation. 12 postes disponibles


**Réservation**: 0145707532

**Accessibilité**: Handicap auditif, Handicap psychique, Langue des signes, Handicap moteur

---

` );

    })

  } );

} );
