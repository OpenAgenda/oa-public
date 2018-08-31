"use strict";

import _ from 'lodash';
import React from 'react';
import Serializer from 'slate-html-serializer';

module.exports = {
  serialize: slateObj => serializer.serialize( slateObj ),
  deserialize: html => html ? serializer.deserialize( html ) : null
}

const MARK_TAGS = {
  strong: 'bold',
  em: 'italic',
  u: 'underline',
  s: 'strikethrough',
  code: 'code',
}

const TAG_MARKS = _.keys( MARK_TAGS ).reduce( ( carry, key ) => _.set( carry, MARK_TAGS[ key ], key ), {} );

const BLOCK_TAGS = {
  p: 'paragraph',
  li: 'list-item',
  ul: 'bulleted-list',
  ol: 'numbered-list',
  blockquote: 'quote',
  pre: 'code',
  h1: 'heading-one',
  h2: 'heading-two',
  h3: 'heading-three',
  h4: 'heading-four',
  h5: 'heading-five',
  h6: 'heading-six',
}

const TAG_BLOCKS = _.keys( BLOCK_TAGS ).reduce( ( carry, key ) => _.set( carry, BLOCK_TAGS[ key ], key ), {} );

const RULES = [ 
  {
    serialize( obj, children ) {

      if ( obj.object !== 'block' ) return;

      const ReactElem = `${TAG_BLOCKS[ obj.type ]}`;

      return <ReactElem>{children}</ReactElem>

    },
    deserialize( el, next ) {

      const block = BLOCK_TAGS[ el.tagName.toLowerCase() ];

      if ( !block ) return;

      return {
        object: 'block',
        type: block,
        nodes: next( el.childNodes ),
      }

    }
  },
  {
    serialize( obj, children ) {

      if ( obj.object !== 'mark' ) return;

      const ReactElem = `${TAG_MARKS[ obj.type ]}`;

      return <ReactElem>{children}</ReactElem>

    },
    deserialize( el, next ) {

      const mark = MARK_TAGS[ el.tagName.toLowerCase() ];

      if ( !mark ) return;

      return {
        object: 'mark',
        type: mark,
        nodes: next( el.childNodes )
      }

    }
  },
  {
    serialize( obj, children ) {

      if ( obj.type !== 'link' ) return;

      return <a href={obj.data.get( 'href' )}>{children}</a>

    },
    // Special case for links, to grab their href.
    deserialize( el, next ) {

      if ( el.tagName.toLowerCase() !== 'a' ) return;

      return {
        object: 'inline',
        type: 'link',
        nodes: next(el.childNodes),
        data: {
          href: el.getAttribute('href'),
        },
      }

    }
  },
];

const serializer = new Serializer( { rules: RULES } );