var cn = require( '../../../../js/lib/common/common.mod.js' ),

params = {
  selectors: {
    checkbox: '.js_exclude',
    options: '.js_selection_options'
  }
},

checkbox, optionsElem;

module.exports = function( options ) {

  cn.extend( params, options );

  checkbox = cn.el( params.selectors.checkbox );

  optionsElem = cn.el( params.selectors.options );

  if ( !checkbox ) return;

  _hide();

  cn.addEvent( window, 'load', function() {

    if ( !checkbox.checked ) {

      _show();

    }

    cn.addEvent( checkbox, 'click', function() {

      if ( checkbox.checked ) {

        _hide();

      } else {

        _show();

      }

    } );

  });  

};

function _show() {

  cn.removeProperty( optionsElem.style, 'display' );

};

function _hide() {

  optionsElem.style.display = 'none';

};