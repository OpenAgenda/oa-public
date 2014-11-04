var UID = 0,

cn = require(  '../../js/lib/common/common.mod.js' ),

wLib = require(  '../lib/widgetLib' ),

debug = require( 'debug' ),

dom = require( './dom.js' );

if ( window.env == 'tpl' ) debug.enable( '*' );


var widget = function( elem, options ) {

  var log,

  view = dom( elem ),

  field = 'org',

  controller,

  enabled = false,

  selectedOrg = false,

  selectedLabel = false,

  orgs = [], orgSlugs = [],

  activeOrgs = [],  // categories which are within current event selection
  
  init = function() {

    var uid = options.anchorConfig[ UID ];

    log = debug( 'organizations widget ' + uid );

    log( 'initing' );

    controller = options.register( wLib.interface( 'organzations', uid, {
      enable : enable,
      disable : disable,
      clear : clear,
      include : include
    } ) );

    view.setOnSelect( _onSelect );

    view.setOnUnselect( _onUnselect );

    controller.getControlData( function( data ) {

      log( 'fetched agenda control data' );

      _setOrganizations( data );

      if ( !data.ebd || data.ebd.dcss ) view.setDefaultStyle();

      log( 'init complete, enable to render' );

    });

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

      log( 'organization is not active. ignoring' );

      return;

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

    log( 'updating request params with org at "%s"', selectedOrg );

    controller.update( 'organizations', { org : selectedOrg, orgLabel : selectedLabel } );

  },


  _setOrganizations = function( data ) {

    log( 'defining widget organizations' );

    organizations = data.org;

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

require( '../lib/controllerLoader' )( function( register ) {

  wLib.forEachAnchor( '.cbpgor', { register: register }, widget );

} );