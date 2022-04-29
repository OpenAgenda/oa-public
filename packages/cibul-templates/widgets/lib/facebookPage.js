"use strict";

var debug = require( 'debug' ), log,

cn = require( '../../js/lib/common' ),

pageHeight = require( './pageHeight' ),

params = {
  fbAppId: false
};

module.exports = function( pageOptions ) {

  cn.extend( params, pageOptions );

  _fbAsyncInit( params.fbAppId, function( err, FB ) {

    FB.Canvas.setAutoGrow();

    FB.Canvas.scrollTo( 0, 400 );

  } );

  return {
    contentChange: function() {}
  }

}

function _fbAsyncInit( fbAppId, cb ) {

  window.fbAsyncInit = function() {
    
    FB.init({
      appId      : fbAppId,
      xfbml      : true,
      version    : 'v2.4'
    });

    cb( null, FB );

  };


  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));

}
