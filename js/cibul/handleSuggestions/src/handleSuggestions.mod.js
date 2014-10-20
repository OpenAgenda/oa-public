var cn = require( '../../../lib/common/common.mod.js' ),

handleContextMenu =  require( '../../handleContextMenu/src/handleContextMenu.mod.js' ),

EJS = require( '../../../lib/clientEjs/ejs' ),

ehLib = require( '../../../lib/EventHandler/EventHandler' );

module.exports = function( inputElem, list, key, template, options ) {

  var contextMenu, contextDiv, possibles = [], 

  params = {
    contextMenuClass: false,
    onSelect: false,
    onChange: false,
    maxResults: 10,
    filter: false,
    invalidClass: 'invalid',
    match: 'loose', // either loose or direct - anything else is considered as loose
  },

  run = function() {

    cn.extend( params, options );

    contextDiv = document.createElement( 'div' );

    // create context menu element
    contextDiv.style.display = 'none';

    if ( options.contextMenuClass ) {

      cn.addClass( contextDiv, options.contextMenuClass );

    }

    inputElem.insertAdjacentElement( 'afterend', contextDiv );

    // give behavior to context menu element
    contextMenu = handleContextMenu( inputElem, contextDiv, ehLib.sEventHandler.getInstance(), { openOnClick: false } );

    // provide and show shortlist based on input value
    cn.addEvent( inputElem, 'keyup', function( e ){

      cn.removeClass( inputElem, options.invalidClass );

      if ( e.keyCode==13 ) {

        if ( possibles.length ) return _select( possibles[0] );

      }

      if ( options.onChange ) {

        options.onChange( inputElem.value );

      }

      possibles = _shortlist( inputElem.value, list, key );

      if (possibles.length === 0 || possibles.length > options.maxResults) {

        if ( !possibles.length ) {

          cn.addClass( inputElem, options.invalidClass );

        }

        contextMenu.hide();

        return;

      }
      
      _writeSuggestions( contextDiv, possibles, template, _select );

      contextMenu.show();

    });

  },

  _writeSuggestions = function( canvasElem, list, template, onClick ) {

    while ( canvasElem.hasChildNodes() ) {

      canvasElem.removeChild( canvasElem.childNodes[0] );

    }

    var ejs = new EJS({ text: template }), 

    newChild, 

    ul = document.createElement('ul'), 

    li;

    cn.forEach( list, function( listItem ) {

      li = document.createElement( 'li' );

      li.innerHTML = ejs.render( listItem );

      cn.addEvent( li, 'click', function() {

        onClick( listItem );

      });

      ul.appendChild( li );

    });

    canvasElem.appendChild( ul );

  },

  _shortlist = function( value, list, key ){

    var regex = _buildRegex( value ),

    selection = [];

    cn.forEach( list, function( listItem ) {

      if ( listItem[key].toLowerCase().match(regex) ){

        selection.push(listItem);

      }

    });

    return selection;

  },

  _buildRegex = function( value ) {

    var regex = '';

    var clean = value.toLowerCase();

    if ( options.filter ) clean = options.filter(clean);

    if ( options.match == 'direct' ) {

      regex = clean.toLowerCase();

    } else {

      cn.forEach( clean.toLowerCase(), function(c) {
        regex += '.*' + c;
      });

    }

    return new RegExp( regex );

  },

  _select = function( selectedItem ) {

    inputElem.value = selectedItem[key].replace( '&#039;', '\'' );

    contextMenu.hide();

    if ( options.onSelect ) {

      options.onSelect( selectedItem );

    }

  },

  _remove = function() {

    if ( contextDiv ) {

      contextDiv.parentNode.removeChild( contextDiv );

    }

  };

  run();

  return {
    remove: _remove
  };

};