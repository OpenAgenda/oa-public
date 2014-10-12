// switch to require
var templates = {
  main : [
    '<ul class="tags<% if ( !enabled ) { %> disabled<% } %>"></ul>'
  ],
  item : [
    '<li><a class="<% if ( selected ) { %>selected<% } %><% if ( active ) { %> active<% } %>"><%= label %></a></li>'
  ].join('')
}
  
].join(''),

// switch to require file
style = [
  '.cibulTags ul { margin: 0; padding: 0; }',
  '.cibulTags li { display: inline-block; cursor: pointer; padding-right: 1em; color: {{ disabledColor }}; font-size: 0.9em; }',
  '.cibulTags li.active { color: {{ activeColor }}; }',
  '.cibulTags li.selected { color: {{ selectedColor }}; }',
  '.cibulTags.disabled li { cursor: wait; color: {{ disabledColor }} }'
].join(''),

EJS = require( '../../js/lib/clientEjs/ejs' ),

cn = require( '../../js/lib/common/common.mod.js' );

module.exports = function( anchorElem ) {

  var _onSelect = false, _onUnselect = false,

  init = function() {

    return {
      render: render,
      setOnSelect: setOnSelect,
      setOnUnselect: setOnUnselect
    }
    
  },

  render = function( data ) {

    anchorElem.innerHTML = new EJS( { text: templates.main } ).render( data );

    cn.forEach( data.tags, function( tag ) {

      var tagWrapper = document.createElement( 'ul' ),

      tagElem;

      tagWrapper.innerHTML = new EJS( { text: templates.item } ).render( tag );

      tagElem = cn.el( tagWrapper, 'li' );

      cn.addEvent( tagElem, 'click', function( e ) {

        cn.preventDefault( e );

        if ( !data.enabled || !tag.active ) return;

        if ( tag.selected ) {

          _select( tag );

        } else {

          _unselect( tag );

        }

      });

      cn.el( 'ul' ).appendChild( tagElem );

    } );

  },

  setOnSelect = function( cb ) {

    _onSelect = cb;

  },

  setOnUnselect = function( cb ) {

    _onUnselect = cb;

  },

  _select = function( tag ) {

    log( 'tag %s is selected', tag.label );

    if ( _onSelect ) _onSelect( tag );

  },

  _unselect = function( tag ) {

    log( 'tag %s is unselected', tag.label );

    if ( _onUnselect ) _onUnselect( tag );

  };

  return init();

}