var cn = require('../../js/lib/common/common.mod.js'),

urlStr = require('../../js/lib/urlStrings/urlStrings.mod.js'),

params = {
  selectors:  {
    select: '.js_code_lang',    // the select lang widget
    code: '.js_code',           // the widget code
    langInput: '.js_embed_lang' // embed config input field
  },
  attributeName: 'data-lang'
};

module.exports = function( options ) {

  cn.extend(params, options);

  var codeField = cn.el(params.selectors.code),

  langField = cn.el(params.selectors.select);

  var iframeMode = (codeField.value.indexOf('iframe')!==-1);

  _onSelectChange(langField, function(lang) {

    if (iframeMode) {

      _updateFrameSrc(codeField, lang);      

    } else {

      _updateAttribute(codeField, lang);

    }

    cn.el(params.selectors.langInput).value = lang;

  });

}

var _updateFrameSrc = function( codeElem, lang ) {

  var src = _extractCodeAttribute(codeElem, 'iframe', 'src');

  var newSrc = urlStr.addUrlParameter(src, 'lang', lang);

  _insertCodeAttribute(codeElem, 'iframe', 'src', newSrc);

},

_updateAttribute = function( codeElem, lang ) {

  _insertCodeAttribute(codeElem, 'div', params.attributeName, lang);

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