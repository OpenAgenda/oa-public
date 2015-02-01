var cn = require('../../js/lib/common/common.mod.js'),

mobileMonitor = require('./handleMobileMonitor.js'),

messageLinks = require('./handleMessageLinks.js'),

confirmMessage = require( './confirmMessage' ),

loadZopim = require('./zopimLoader.js'),

handleSession = require( './handleSession' ),

headerProfile = require( './headerProfile' ),

debug = require('debug'),

log = debug('globals'),

flash = require('./handleFlashMessage.js'),

eh = require('../../js/lib/EventHandler/EventHandler.js').sEventHandler.getInstance(),

ran = false,

hooks = [],

params = {};

cn.addEvent( window, 'load', function() {

  var options = _getOptions( 'body' );

  cn.extend( params, options );

  if ( typeof window.eh !== 'undefined' ) eh = window.eh;

  if ( options.env == 'dev' || window.env == 'dev' ) debug.enable( '*' );

  mobileMonitor( document, window, navigator, eh );

  messageLinks( eh );

  confirmMessage();

  if ( window.env !== 'test' ) {

    loadZopim( document, window, eh, { env: window.env } );

  }

  flash();

  _languageMenu( options.langHeadMenu );

  headerProfile( options.profile );

  cn.forEach( hooks, function( hook ) {

    hook( params );

  });

} );


/**
 * provide hook for page specific script launchers
 */

window.hook = function( cb ) {

  if ( ran ) return cb( params );

  hooks.push( cb );

};

/**
 * provide function to retrieve session data
 */

window.getSession = handleSession();



function _getOptions( selector ) {

  var options = {}, 

  stringified = cn.el( selector ).getAttribute( 'data-options' );

  if ( !stringified ) return options;

  try {

    options = JSON.parse( stringified );

  } catch( e ) {

    log( 'could not parse options' );

  }

  return options;

}


/**
 * toggle language menu display
 */

function _languageMenu( options ) {

  var params = cn.extend( {
    selectors: {
      main: 'header',
      langMenu: '.js_language_menu',
    }
  }, options ? options : {} ),

  langOn = false,

  headElem = cn.el( params.selectors.main ),

  langMenuElem = cn.el( headElem, params.selectors.langMenu );

  if ( !langMenuElem ) return;

  var langList = cn.el( langMenuElem, 'ul' );

  cn.addEvent( langMenuElem, 'click', function( e ) {

    if ( !langOn ) {

      langList.style.display = 'block';

    } else {

      langList.removeAttribute('style');

    }

    langOn = !langOn;

  });

}