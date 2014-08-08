var cn = require('../../../../js/lib/common/common.mod.js');

module.exports = function( options ) {

  var params = cn.extend({
    preview: false,    // resource for previewing newsletter based on submission
    selectors: {
      form: false,     // customization controls form
      frame: false,    // target frame for refresh
      reloaders: false // elements triggering reload
    }
  }, options);

  instance( params );

};

/**
 * instantiate based on given params
 */

var instance = function( params ) {

  var formElem, frameElem, baseAction,

  run = function () {

    formElem = cn.el( params.selectors.form );

    frameElem = cn.el( params.selectors.frame );

    baseAction = formElem.getAttribute( 'action' );

    cn.forEach( cn.els( params.selectors.reloaders ), changeListener( refreshFrame ) );

  },

  /**
   * listen to change and trigger callback when its detected
   */

  changeListener = function( onChange ) {

    return function( elem ) {

      cn.addEvent( elem, 'change', onChange );

    };

  },


  /**
   * trigger submission of form towards frame
   */

  refreshFrame = function() {

    formElem.setAttribute( 'target', frameElem.getAttribute('name') );

    formElem.setAttribute( 'action', params.preview );

    formElem.submit();

    formElem.removeAttribute( 'target' );

    formElem.setAttribute( 'action', baseAction );

  };

  cn.addEvent( window, 'load', run );

};