var cn = require('../../js/lib/common/common.mod.js'),

urlStr = require('../../js/lib/urlStrings/urlStrings.mod.js'),

params = {
  selectors:  {
    select: '.js_code_lang',    // the select lang widget
    code: '.js_code',           // the widget code
    langInput: '.js_embed_lang', // embed config input field
    preview: '.js_preview'
  },
  attributeName: 'data-lang'
};

module.exports = function( options ) {

  cn.extend( params, options );

  var codeField = cn.el( params.selectors.code ),

  langField = cn.el( params.selectors.select ),

  previewElem = cn.el( params.selectors.preview ),

  iframeMode = ( codeField.value.indexOf('iframe')!==-1 );

  _onSelectChange( langField, function( lang ) {

    if ( iframeMode ) {

      _updateFrameLang( codeField, lang );      

    } else {

      _updateAttribute( codeField, lang );

    }

    _updatePreview( previewElem, lang );

    cn.el( params.selectors.langInput ).value = lang;

  });

}

var _updateFrameLang = function( codeElem, lang ) {

  var src = _extractCodeAttribute(codeElem, 'iframe', 'src'),

  newSrc = urlStr.addUrlParameters(src, { lang } );

  _insertCodeAttribute(codeElem, 'iframe', 'src', newSrc);

  _insertCodeAttribute(codeElem, 'iframe', 'data-lang', lang);

},

_updateAttribute = function( codeElem, lang ) {

  _insertCodeAttribute( codeElem, 'div', params.attributeName, lang);

},

_updatePreview = function( previewElem, lang ) {

  var src = previewElem.getAttribute( 'src' ),

  newSrc = urlStr.addUrlParameters( src, { lang: lang } );

  previewElem.setAttribute( 'src', newSrc );

},

_onSelectChange = function( selectElem, cb ) {

  cn.addEvent(selectElem, 'change', function() {

    cb(selectElem.value);

  });

},

_extractCodeAttribute = function( elem, mainCodeElemTagName, attribute) {

  var code = elem.value,

  div = document.createElement('div');

  div.innerHTML = code;

  return cn.el(div, mainCodeElemTagName).getAttribute(attribute);

},

_insertCodeAttribute = function( elem, mainCodeElemTagName, attribute, value ) {

  var code = elem.value,

  div = document.createElement('div');

  div.innerHTML = code;

  cn.el(div, mainCodeElemTagName).setAttribute(attribute, '[ATTR]');

  elem.value = div.innerHTML.replace('[ATTR]', value);

};
