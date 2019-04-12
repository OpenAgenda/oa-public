"use strict";

const cn = require( '../../js/lib/common/common.mod.js' ),

  selectForm = require( '../../js/lib/selectForm/selectForm.mod.js' ),

  tagOptions = require( './tagOptions.js' ),

  codeLang = require( './codeLang.js' ),

  debug = require( 'debug' ),

  log = debug( 'embedMenu' ),

  deepExtend = require( 'deep-extend' );

let params = {
  selectForm: {
    selectors: {
      title: '.js_title',
      subtitle: '.js_subtitle',
      detail: '.js_detail',
      canvas: '.js_customize',
      submit: '.js_submit',
      wrapper: 'div',
      wrapperClass: 'select-menu form-inline'
    }
  },
  codeLang: {
    selectors:  {
      select: '.js_code_lang',
      code: '.js_code',
      langInput: '.js_embed_lang',
      preview: '.js_preview'
    },
    attribute: false
  },
  tagOptions: false,  // run when on tag embed page
  formOptions: false,  // run when on formOptions embed page
  mapOptions: false,
};

window.run = function(options) {

  deepExtend(params, options);

  cn.addEvent(window, 'load', function() {

    if (params.selectForm) _runSelectForm(params.selectForm);

    if (params.tagOptions) tagOptions(params.tagOptions);

    if (params.formOptions) _runFormOptions(params.formOptions);

    if (params.mapOptions) _runMapOptions(params.mapOptions);

    if (params.codeLang) codeLang(params.codeLang);

  });

};

var _runSelectForm = function(params) {

  selectForm(params.selectors.title, params.selectors.subtitle, params.selectors.detail, {
    canvas: cn.el(params.selectors.canvas),
    submit: cn.els(params.selectors.submit),
    wrapper: params.selectors.wrapper,
    wrapperClass: params.selectors.wrapperClass
  });

  cn.removeClass( cn.el(params.selectors.canvas), 'display-none' );

},

_runFormOptions = function(options) {

  var params = cn.extend({
    selectors: {
      sandbox: '.js_sandbox_frame'
    }
  }, options);

  window.adjustFrameHeight = function( newHeight ) {

    if (newHeight === false) {

      cn.el(params.selectors.sandbox).removeAttribute('height');

    } else {

      cn.el(params.selectors.sandbox).setAttribute('height', newHeight + 40);

    }

  };

},

_runMapOptions = function(options) {

  var params = cn.extend({
    selectors: {
      cornersInput: '.js_map_corners'
    }
  }, options);

  window.onBoundsChange = function(newBounds) {

    cn.el(params.selectors.cornersInput).value = [newBounds.neLat, newBounds.neLng, newBounds.swLat, newBounds.swLng].join('|');

  };

}
