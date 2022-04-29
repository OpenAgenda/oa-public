var cn = require( '../../js/lib/common' ),

debug = require('debug'),

log = debug('handleMessageLinks'),

lightbox = require( '../../js/lib/lightbox' ),

params = {
  lang: "fr",
  selectors: {
    link: '.js_message_confirm'
  },
  attributes: {
    message: 'data-confirm',
    ok: 'data-ok',
    cancel: 'data-cancel'
  },
  classes: {
    lightbox: {
      frame: 'wsq lightbox-frame',
      canvas: 'lightbox-canvas',
      buttonBox: 'lightbox-buttons',
      body: 'noscroll'
    }
  }
};

module.exports = function() {

  cn.forEach( cn.els( params.selectors.link ), function( linkElem ) {

    cn.addEvent( linkElem, 'click', function( e ) {

      cn.preventDefault( e );

      lightbox({
        message: linkElem.getAttribute( params.attributes.message ),
        classes: params.classes.lightbox,
        button: false,
        buttons: {
          ok: {
            className: 'btn btn-primary',
            label: linkElem.getAttribute( params.attributes.ok ),
            onClick: function() {

              window.location.href = linkElem.getAttribute( 'href' );

            }
          },
          cancel: {
            className: 'btn btn-default',
            label: linkElem.getAttribute( params.attributes.cancel )
          }
        }
      });

    });

  } );

}
