"use strict";

module.exports = parser;

function parser( struct ) {

  if ( !struct ) throw 'parser structure missing';

  var attributes = struct.attributes,

  template,

  templateAttributes,

  childrenParsers = _createChildrenParsers( struct.children ),

  templateAttributeBlocks; // attributes which are in template

  return {
    load: load,
    render: render
  };

  /**
   * load template (validate, while you are at it)
   */

  function load( tpl ) {

    // spot blocks and variables. any unknown throws errors
    templateAttributes = _extractTemplateAttributes( attributes, tpl );

    templateAttributeBlocks = _extractTemplateAttributeBlocks( attributes, tpl );

    template = tpl;

  }

  function render( data ) {

    var clean = _mergeExpected( data, templateAttributes );

    if ( !template ) throw 'template is undefined';

    var rendered = template;

    for( var i in clean ) {

      // process the children-blocks
      
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


function _createChildrenParsers( children ) {

  var parsers = {};

  children.forEach( function( child ) {

    // slightly more complicated here as we
    // are dealing with lists
    parsers[ child.mapTo ] = parser( parser( child ) )

  });

}


/**
 * extract blocks corresponding to attributes
 */

function _extractTemplateAttributeBlocks( attributes, template ) {

  var filteredTpl = _removeBlocks( attributes, template ),

  attributeBlocks = {};

  attributes.forEach( function( attr ) {

    var opening, closing;

    opening = filteredTpl.indexOf( '{block:' + attr.name + '}' );

    if ( opening == -1 ) return;

    closing = filteredTpl.indexOf( '{/block:' + attr.name + '}');

    if ( closing == -1 ) throw 'closing block statement not found: ' + '{/block:' + attr.name + '}';

    if ( closing < opening ) throw 'closing block statement should come after opening block statement: ' + '{block:' + attr.name + '}';

    attributeBlocks[ attr.mapTo ] = attr.name;

  });

  return attributeBlocks;

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

function _mergeExpected( data, tplAttributes ) {

  var clean = {};

  for( var i in tplAttributes ) {

    clean[ i ] = null;

  }

  for( i in data ) {

    clean[ i ] = data[ i ];

  }

  return clean;

}

function _removeRemainingStatements( tpl ) {

  return tpl.replace( /{(|\/)(block:|)([a-z]|[A-Z])+}/g , '');

}

function isArray( obj ) {

  return Object.prototype.toString.call(obj) === '[object Array]';

};
