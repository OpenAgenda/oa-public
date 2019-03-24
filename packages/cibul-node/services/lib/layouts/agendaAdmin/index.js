"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const ih = require( 'immutability-helper' );

const agendaParser = require( '../agenda' ).parser;

const flattenLabels = require( '@openagenda/labels/flatten' );

const tabReference = require( './tabs.json' );

const headerLabels = require( '@openagenda/labels/agenda-admin/header' );
const tabLabels = require( '@openagenda/labels/agenda-admin/tabs' );

module.exports = {
  parent: 'main',
  render: _.template( fs.readFileSync( __dirname + '/layout.tpl', 'utf-8' ) ),
  parser
}

function parser( data ) {

  const { agenda, lang, selectedTab } = data;

  const tabs = tabReference
    .filter( tab => _includeTab( agenda, tab ) )
    .map( tab => _formatTab( { agenda, tab, lang, selectedTab } ) );

  return ih( agendaParser( data ), {
    adminLabels: { $set: flattenLabels( headerLabels, data.lang ) },
    sections: { $set: [ 'manage', 'export', 'settings' ].map( s => ( {
      label: headerLabels[ s ][ lang ],
      tabs: tabs.filter( t => t.section === s )
    } ) ) }
  } );

}

function _includeTab( agenda, tab ) {

  if ( !tab.credential ) return true;

  return agenda.credentials[ tab.credential ];

}

function _formatTab( { agenda, tab, lang, selectedTab } ) {

  return ih( tab, {
    label: {
      $set: tabLabels[ tab.name ][ lang ]
    },
    link: {
      $set: `${_phpLinkPrefix( tab )}/${agenda.slug}/admin${tab.route !== undefined ? tab.route : '/' + tab.name }`
    },
    selected: {
      $set: selectedTab === tab.name
    }
  } );

}

function _phpLinkPrefix( tab ) {

  if ( process.env.NODE_ENV !== 'development' ) return '';

  return tab.php ? '/frontend_dev.php' : '';

}
