"use strict";

const _ = require('lodash');

var cn = require('../../js/lib/common/common.mod.js'),

  controlDataFetch = require( '../../js/lib/controlDataFetch/controlDataFetch' ),

  total,

  selectedSlugs = [],

  UID = 0, TAGS = 1,

  canvas,

  config,

params = {
  selectors: {
    elem: '.js_tags_selection_canvas',
    codeElem: '.js_code',
    frame: 'iframe'
  },
  elem: false, // where to put dom stuff
  codeElem: false,
  uid: false,
  embedUid: false,
  attributes: {
    slug: 'data-slug',
    config: 'data-cbctl'
  },
  classes: {
    canvas: 'line'
  },
  templates: {
    canvas: '<ul></ul>',
    option: '<li class="line" data-slug="<%= s %>"><input checked="checked" type="checkbox"/><label><%= t %></label></li>'
  },
  onSelectionChange: false
};

module.exports = function(options) {

  cn.extend( params, options );

  controlDataFetch( {
    uid: params.uid,
    embedUid: params.embedUid
  }, function( err, ctl ) {

      if ( err ) return console.error( 'could not fetch control data' );

      var tags = ctl.t;

      total = tags.length;

      if ( params.onSelectionChange ) _onSelectionChange = params.onSelectionChange;

      if ( !total ) return;

      _createCanvas();

      cn.forEach(tags, function(tag) {

        selectedSlugs.push(tag.s);

        _createOption(tag);

      });

    });

}


function _onSelectionChange( newConfig ) {

  var src = cn.el(params.selectors.frame).src;

  cn.el(params.selectors.frame).src = (src.indexOf('?')!==-1?src.substr(0, src.indexOf('?')):src) + '?config=' + newConfig;

}


function _removeTag( tag ) {

  selectedSlugs.splice(selectedSlugs.indexOf(tag.s),1);

  if (params.onSelectionChange) params.onSelectionChange(config);

  _updateCode();

}


function _addTag( tag ) {

  selectedSlugs.push(tag.s);

  _onSelectionChange(config);

  _updateCode();

}

// pick the code from the field, shove it in an element, use dom to update config attribute

function _updateCode() {

  var code = cn.el(params.selectors.codeElem).value;

  var div = document.createElement('div');

  div.innerHTML = code;

  config = cn.el(div, 'div').getAttribute(params.attributes.config).split('|');

  if (selectedSlugs.length == total) {

    if (config.length == 2) config.pop();

  } else {

    var newSlugList = selectedSlugs.join(',');

    if (config.length < 2) {
      config.push(newSlugList);
    } else {
      config[TAGS] = newSlugList;
    }

  }

  cn.el(div, 'div').setAttribute(params.attributes.config, config.join('|'));

  cn.el(params.selectors.codeElem).value = div.innerHTML;

}


function _createCanvas() {

  cn.el(params.selectors.elem).innerHTML = params.templates.canvas;

  canvas = cn.childObject(cn.el(params.selectors.elem), 0);

  if (params.classes.canvas) canvas.className = params.classes.canvas;

}


function _createOption( tag ) {

  var ul = document.createElement('ul');

  ul.innerHTML = _.template( params.templates.option )( tag );

  var li = cn.el( ul, 'li' );

  cn.addEvent(li, 'click', function(e) {

    if (!cn.contains(selectedSlugs, tag.s)) {

      _addTag(tag);

      cn.el(li, 'input').checked = true;

    } else {

      _removeTag(tag);

      cn.el(li, 'input').checked = false;

    }

  });

  canvas.appendChild(cn.el(ul, 'li'));

};
