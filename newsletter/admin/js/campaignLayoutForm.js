window.env = 'dev'

var cn = require('../../../js/lib/common/common.mod.js'),

selectForm = require('../../../js/lib/selectForm/selectForm.mod.js'),

frameLoader = require('./lib/frameLoader'),

lightboxPage = require('./lib/lightboxPage');

window.run = function( options ) {

  frameLoader( options, {
    onRefresh: _frameHeightAdjust,
    onReady: _frameHeightAdjust
  });

  _runSelectForm( options.folded );

  lightboxPage( options.lightbox );

};


/**
 * hide geographic menus in a select menu
 */

var _runSelectForm = function( options ) {

  cn.addEvent(window, 'load', function() {

    var params = cn.extend({
      title: '.js_title',
      canvas: '.js_folded',
      subtitle: '.js_subtitle',
      detail: '.js_detail',
      wrapper: 'div',
      wrapperClass: 'select-menu'
    }, options);

    selectForm(params.title, params.subtitle, params.detail, {
      canvas: cn.el(params.canvas),
      wrapper: params.wrapper, 
      wrapperClass: params.wrapperClass
    });

  });

  
},

_frameHeightAdjust = function( frameElem ) {

  frameElem.setAttribute('height', _estimateFrameHeight());

  setTimeout(function() { // approximation for image load

    frameElem.setAttribute('height', _estimateFrameHeight());

  }, 3000);

},

_estimateFrameHeight = function() {

  return window.frames[0].document.getElementsByTagName('html')[0].offsetHeight;

};