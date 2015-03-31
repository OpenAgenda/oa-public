"use strict";

var debug = require( 'debug' ),

log = debug( 'parser' );

module.exports = parser;

function parser( struct ) {

  var log = debug( 'parser ' + struct.name );

  if ( !struct ) throw 'parser structure missing';

  var attributes = struct.attributes,

  template,

  templateAttributes, // attributes which are in template

  templateAttributeBlocks; // attributes which are in template

  if ( struct.children ) {

    log( 'children' );

    _createChildrenParsers( struct.children );

  }

  return {
    load: load,
    render: render
  };

  /**
   * load template (validate, while you are at it)
   */

  function load( tpl ) {

    // cut bits down to hand over to children
    if ( struct.children ) {

      struct.children.forEach( function( child ) {

        log( 'loading template in child' );

        tpl = _childLoadAndSlice( child, tpl );

      });

    } 

    // spot blocks and variables. any unknown throws errors
    templateAttributes = _extractTemplateAttributes( attributes, tpl );

    templateAttributeBlocks = _extractTemplateAttributeBlocks( attributes, tpl );

    template = tpl;

  }


  function render( data ) {

    var clean = _mergeExpected( data, templateAttributes, struct.children );

    if ( !template ) throw 'template is undefined';

    var rendered = template;

    for( var i in clean ) {

      // process the children blocks
      
      if ( _isArray( clean[ i ] ) ) {

        // find child and process
        rendered = _renderChild( i, clean[ i ], struct.children, rendered );

      }
      
      // process the attribute blocks

      if ( templateAttributeBlocks[ i ] !== undefined ) {

        if ( !data[ i ] ) {

          rendered = _removeBlock( rendered, templateAttributeBlocks[ i ] );

        } 

      }

      // process the attributes
      
      if ( templateAttributes[ i ] !== undefined ) {

        rendered = rendered.replace( new RegExp( '{' + templateAttributes[ i ] + '}', 'g'), data[ i ] );

      }

    }

    rendered = _removeRemainingStatements( rendered );

    return rendered;

  }

}


/**
 * creates a parser for each
 * child of current parser
 */

function _createChildrenParsers( children ) {

  children.forEach( function( child ) {

    child.parser = parser( child );

  });

}

/**
 * from given template, extract bit relevent to
 * given child and return stripped template
 */

function _childLoadAndSlice( child, tpl ) {

  var indexes = _findBlockIndexes( tpl, child.name );

  var childTemplate = tpl.substr( indexes[ 2 ], indexes[ 1 ] - indexes[ 2 ] );

  child.parser.load( childTemplate );

  return tpl.replace( childTemplate, '' );

}


function _renderChild( key, arr, children, rendered ) {

  var child = children.filter( function( child ) { 
    return child.mapTo == key 
  } )[ 0 ],

  indexes = _findBlockIndexes( rendered, child.name ),

  childRender = '';

  arr.forEach( function( childData ) {

    childRender += child.parser.render( childData );

  } );

  return rendered.substr( 0, indexes[ 0 ] )

  + childRender

  + rendered.substr( indexes[ 3 ] );

}


/**
 * extract blocks corresponding to attributes
 */

function _extractTemplateAttributeBlocks( attributes, template ) {

  var filteredTpl = _removeBlocks( attributes, template ),

  attributeBlocks = {};

  attributes.forEach( function( attr ) {

    try {

      _findBlockIndexes( filteredTpl, attr.name );
      
      attributeBlocks[ attr.mapTo ] = attr.name;

    } catch( e ) {};

  });

  return attributeBlocks;

}


function _findBlockIndexes( tpl, blockName ) {

  var openingStatement = '{block:' + blockName + '}',

  closingStatement = '{/block:' + blockName + '}',

  opening, closing;

  opening = tpl.indexOf( openingStatement );

  if ( opening == -1 ) throw 'opening block statement not found';

  closing = tpl.indexOf( closingStatement );

  if ( closing == -1 ) throw 'closing block statement not found: ' + '{/block:' + blockName + '}';

  if ( closing < opening ) throw 'closing block statement should come after opening block statement: ' + '{block:' + attr.name + '}';

  return [ opening, closing, opening + openingStatement.length, closing + closingStatement.length ];

}



/**
 * extract attributes which are effectively present in template
 */

function _extractTemplateAttributes( attributes, template ) {

  // strip template of blocks which are not attribute blocks
  
  var filteredTpl = _removeBlocks( attributes, template ),

  templateAttributes = {};

  attributes.forEach( function( attr ) {

    var matches = filteredTpl.match( new RegExp( '{' + attr.name + '}', 'g' ) );

    templateAttributes[ attr.mapTo ] = attr.name;

  });

  return templateAttributes;

}


function _removeBlocks( attributes, template ) {

  var stripped = template,

  attributeNames = attributes.map( function( a ) {
    return a.name;
  }),

  opening = template.match(/{block:[a-z|A-Z]+}/g);

  if ( !opening ) return template;

  opening.forEach( function( o ) {

    var name = o.replace( /{block:|}/g, '' );

    if ( attributeNames.indexOf( name ) == -1 ) {

      // it is not an attribute block;
      // kill it with the edge of the sword.
      
      stripped = _removeBlock( stripped, name );

    }

  });

  return stripped;

}

function _removeBlock( tpl, name ) {

  var o = '{block:' + name + '}', cl,

  // start from where the opening block is
  sub = tpl.substr( tpl.indexOf( o ) );

  // find closing index
  cl = sub.indexOf( o.replace(/^{/, '{/') );

  if ( cl == -1 ) {

    throw 'closing statement of block not found: ' + o.replace(/^{/, '{/');

  }

  // remove the bit after the closing index
  sub = sub.substr( 0, cl + o.replace( /^{/, '{/' ).length );

  return tpl.replace( sub, '' );

}


function _removeBlockStatement( tpl, name ) {

  return tpl.replace( new RegExp( '{(|/)block:' + name + '}', 'g' ), '' );

}

function _mergeExpected( data, tplAttributes, children ) {

  var clean = {};

  for( var i in tplAttributes ) {

    clean[ i ] = null;

    if ( typeof data[ i ] !== 'undefined' ) {

      clean[ i ] = data[ i ];

    }

  }

  if ( children ) children.forEach( function( child ) {

    clean[ child.mapTo ] = [];

    if ( typeof data[ child.mapTo ] !== 'undefined' ) {

      clean[ child.mapTo ] = data[ child.mapTo ];

    }

  });


  return clean;

}

function _removeRemainingStatements( tpl ) {

  return tpl.replace( /{(|\/)(block:|)([a-z]|[A-Z])+}/g , '');

}

function _isArray( obj ) {

  return Object.prototype.toString.call(obj) === '[object Array]';

}