var cn = require( '../../js/lib/common/common.mod.js' ),

defaults = {
  styles: {
    disabledColor: '#ccc',
    defaultColor: '#333',
    activeColor: '#333',
    selectedColor: 'blue',
    preselectedColor: '#f0f0f0'
  }
},

sheet,

style = '',

styler = function( styleToAppend, styleVars, w, d ) {

  if ( !w ) w = window;

  if ( !d ) d = document;

  if ( !sheet ) _createSheet( w, d );

  styles = cn.extend( {}, defaults.styles, styleVars ? styleVars : {} );

  style += _format( styleToAppend, styles );

  if (sheet.styleSheet) {

    sheet.styleSheet.cssText = style;

  } else {

    sheet.innerHTML += style;

  }

},

_createSheet = function( w, d ) {

  sheet = d.createElement( 'style' );

  sheet.type = 'text/css';

  sheet.media = 'all';

  if ( d.readyState === "complete" ) {

    _stickSheet( d );

  } else {

    cn. addEvent( w, 'load', function() {

      _stickSheet( d );

    } );
  }

},

_stickSheet = function( d ) {

  d.body.appendChild( sheet );

},

_format = function( tpl, ctx ) {

  return tpl.replace( /\{\{([a-zA-Z ]*)\}\}/g, function( m, g ) {

      return ctx[ g.replace(/^\s+|\s+$/g, '') ] || '';

  });

};

module.exports = styler;