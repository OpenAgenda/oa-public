var loadJs = require( '../../js/lib/loadJs/loadJs.mod.js' ),

cn = require( '../../js/lib/common/common.mod.js' ),

defaults = {
  all : {
    controllersPath : '//cibul.net/js/embed/cibulControllers.js'
  },
  dev : {
    controllersPath : '//d.cibul.net/js/embed/cibulControllers.js'
  },
  tpl : {
    controllersPath : '/js/browserified/widgetsControllerMain.js'
  }
},

env = window.env ? window.env : 'prod',

params = cn.extend( defaults.all, defaults[ env ] ? defaults[ env ] : {} );


module.exports = function( cb ) {

  getRegister( cb );

}


var getRegister = function( cb ) {

  if ( window.cibulRegisterWidget ) {

    cb( window.cibulRegisterWidget );

  } else {

    loadJs( params.controllersPath, function() {

      cb( window.cibulRegisterWidget );

    } );

  }

}