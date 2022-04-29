"use strict";

exports.setOnReady = setOnReady;

var UID = 0, MODE = 1,

cn = require(  '../../js/lib/common' ),

wLib = require(  '../lib/widgetLib' ),

debug = require( 'debug' ),

dom = require( './dom.js' ),

onReady;

if ( window.env == 'tpl' ) debug.enable( '*' );


var widget = function( elem, options ) {

  var log,

  view = dom( elem ),

  field = 'org',

  controller,

  enabled = false,

  selectedOrg = false,

  selectedLabel = false,

  organizations = [],

  orgsInTime,

  selectedContributor = null,

  activeOrgs = [],  // categories which are within current event selection
  
  init = function() {

    var uid = options.anchorConfig[ UID ];

    log = debug( 'organizations widget ' + uid );

    log( 'initing' );

    controller = options.register( wLib.interface( 'organizations', uid, {
      enable : enable,
      disable : disable,
      clear : clear,
      include : include
    } ) );

    if ( options.anchorConfig[ MODE ] ) {

      view.setMode( options.anchorConfig[ MODE ] );

    }

    view.setOnSelect( _onSelect );

    view.setOnUnselect( _onUnselect );

    controller.getControlData( function( data ) {

      log( 'fetched agenda control data' );

      if ( !data.org ) {

        log( 'no organizations are set for this agenda' );

      } else {

        _setOrganizations( data );

        if ( !data.ebd || data.ebd.dcss ) view.setDefaultStyle();

        log( 'init complete, enable to render' );
        
      }

      if ( onReady ) onReady();

    } );

  },

  enable = function( reqParams ) {

    enabled = true;

    log( 'enabling organizations widget' );

    if ( typeof reqParams == 'undefined' ) reqParams = {};

    selectedOrg = null;

    selectedLabel = null;

    if ( reqParams.org ) {

      selectedOrg = reqParams.org;

      cn.forEach( organizations, function( organization ) {

        if ( organization.s == selectedOrg ) {

          selectedLabel = organization.l;

        }

      });

    }

    _render();

  },

  clear = function() {

    log( 'clearing, awaiting enable or disable to render' );

    activeOrgs = [];

    selectedContributor = null;

  },

  include = function( eventItem ) {

    if ( eventItem.org && !cn.contains( activeOrgs, eventItem.org ) ) {

      activeOrgs.push( eventItem.org.s );

    }

  },

  disable = function() {

    enabled = false;

    _render();

  },

  _onSelect = function( organization ) {

    log( 'selected %s with slug %s', organization.label, organization.slug );

    if ( !cn.contains( activeOrgs, organization.slug ) ) {

      log( 'organization is not active. Running it anyways' );

    }

    selectedOrg = organization.slug;

    selectedLabel = organization.label;

    _update();

  },

  _onUnselect = function( organization ) {

    log( 'unselect %s with slug %s', organization.label, organization.slug );

    if ( selectedOrg !== organization.slug ) {

      log( 'unselect organization "%s" is not as expected "%s"', organization.slug, selectedOrg );

      return;

    }

    selectedOrg = null;

    selectedLabel = null;

    _update();

  },


  _update = function() {

    var updatedParams = { org : selectedOrg, orgLabel : selectedLabel };

    if ( orgsInTime[ selectedOrg ] ) {

      updatedParams.passed = '1';

    }

    log( 'updating request params with org at "%s"', selectedOrg );

    controller.update( 'organizations', updatedParams );

  },


  _setOrganizations = function( data ) {

    var today = new Date();

    orgsInTime = {}; // org indexed by slug, with bool passed

    today = today.getFullYear() + '-' + _fZ( today.getMonth() + 1 ) + '-' + _fZ( today.getDate() );


    log( 'defining widget organizations' );

    for( var a in data.a ) {

      if ( typeof data.a[ a ].org !== 'undefined' ) {

        if ( typeof orgsInTime[ data.a[ a ].org.s ] == 'undefined' ) {

          orgsInTime[ data.a[ a ].org.s ] = true;

        }

        for( var l in data.a[ a ].l ) {

          for( var d in data.a[ a ].l[ l ].d ) {

            if ( data.a[ a ].l[ l ].d[ d ] >= today ) {

              orgsInTime[ data.a[ a ].org.s ] = false;

              break;
              break;

            }
            
          }

        }

      }

    }

    
    organizations = ( data.org ? data.org : [] ).filter( function( o ) {

      return o.s && o.s.length;

    } );

    cn.forEach( organizations, function( org ) {

      if ( typeof orgsInTime[ org.s ] == 'undefined' ) {

        orgsInTime[ org.s ] = true;

      }

    });

    log( 'widget initialized with %d organizations', organizations.length );

  },

  _render = function() {

    log( 'rendering as %s', enabled ? 'enabled' : 'disabled' );

    var data = {
      enabled : enabled,
      organizations : []
    };

    cn.forEach( organizations, function( organization ) {

      data.organizations.push( {
        label : organization.l,
        slug : organization.s,
        active : enabled && cn.contains( activeOrgs, organization.s ),
        selected : selectedOrg == organization.s,
        className : undefined
      } );

    });

    view.render( data );

  };

  init();

}

function setOnReady( cb ) {

  onReady = cb;

}

function _fZ( n ) {
  return (n>9?'':'0') + n;
}


require( '../lib/loader' )( {
  selector: '.cbpgor',
  widget: widget,
  backup: {
    selector: '[data-oaor]',
    classNames: 'cibulOrganizations'
  }
} );
