import _ from 'lodash';

import React, { Component } from 'react';
import { Editor } from 'slate-react';

import classNames from 'classnames';
import { Value } from 'slate';

import richTextLabels from '@openagenda/labels/form-schemas/richText';
import flatten from '@openagenda/labels/flatten';

import nl2br from '@openagenda/react-utils/dist/nl2br';

const DEFAULT_NODE = 'paragraph';

const DEFAULT_DOC = {
  document: {
    nodes: [ {
      object: 'block',
      type: 'paragraph',
      nodes: [ {
        object: 'text',
        leaves: [ { text: '' } ]
      } ]
    } ]
  }
};

module.exports = class SlateField extends Component {

  constructor( props ) {

    super( props );

    let value;

    if ( this.props.value instanceof Value ) {

      value = this.props.value;

    } else if ( !this.props.value ) {

      value = Value.fromJSON( DEFAULT_DOC );

    } else if ( _.isString( this.props.value ) ) {

      value = Value.fromJSON( JSON.parse( this.props.value ) );

    } else {

      value = Value.fromJSON( this.props.value );

    }

    this.state = { value }

  }

  onChange( { value } ) {

    this.setState( { value } );

    this.props.onChange( this.props.raw ? value : value.toJSON() )

  }

  toggleMark( type, e ) {

    if ( e ) e.preventDefault();

    this.onChange( this.state.value.change().toggleMark( type ) );

  }

  toggleLink( { value, change } ) {

    if ( this.hasLinks() ) {

      change.unwrapInline( 'link' );

    } else if ( value.isExpanded ) {

      const href = window.prompt( 'Enter the URL of the link:' );

      change.wrapInline( {
        type: 'link',
        data: { href }
      } );

    } else {

      const href = window.prompt( 'Enter the URL of the link:' );
      const text = window.prompt( 'Enter the text for the link:' );

      if ( text && text.length ) {

        change
          .insertText( text )
          .extend( 0 - text.length );

        change.wrapInline( { type: 'link', data: { href } } );

      }

    }

  }

  toggleList( { value, change, document, type } ) {

    // Handle the extra wrapping required for list buttons.
    const isList = this.hasBlock( 'list-item' );

    const isType = value.blocks.some( block => {

      return !!document.getClosest( block.key, parent => parent.type == type );

    } );

    if ( isList && isType ) {

      change
        .setBlocks( DEFAULT_NODE )
        .unwrapBlock( 'bulleted-list' )
        .unwrapBlock( 'numbered-list' );

    } else if (isList) {

      change
        .unwrapBlock(
          type == 'bulleted-list' ? 'numbered-list' : 'bulleted-list'
        )
        .wrapBlock( type );

    } else {

      change.setBlocks( 'list-item' ).wrapBlock( type );

    }

  }

  toggleBlock( type, e ) {

    const { value } = this.state;
    const change = value.change();
    const { document } = value;

    if ( e ) e.preventDefault();

    if ( type === 'link' ) {

      this.toggleLink( { value, change } );

    } else if ( [ 'bulleted-list', 'numbered-list' ].includes( type ) ) {

      this.toggleList( { value, change, document, type } );

    } else {

      const isActive = this.hasBlock( type );

      const isList = this.hasBlock( 'list-item' );

      if ( isList ) {

        change
          .setBlocks( isActive ? DEFAULT_NODE : type )
          .unwrapBlock( 'bulleted-list' )
          .unwrapBlock( 'numbered-list' );

      } else {

        change.setBlocks( isActive ? DEFAULT_NODE : type );

      }

    }

    this.onChange( change );

  }

  hasLinks() {

    return this.state.value.inlines.some( inline => inline.type === 'link' );

  }

  hasBlock( type ) {

    return this.state.value.blocks.some( node => node.type === type );

  }

  renderBlockButton( type, label ) {

    let isActive = this.hasBlock( type );

    if ( type === 'bulleted-list' ) {

      const { value } = this.state;

      const parent = value.blocks.size && value.document.getParent( value.blocks.first().key );

      isActive = this.hasBlock( 'list-item' ) && parent && parent.type === type;

    }

    return <a
      className={classNames( {
        btn: true,
        'btn-default' : !isActive,
        'btn-primary' : isActive
      } )}
      onMouseDown={this.toggleBlock.bind( this, type)}
      >
      {label}
    </a>

  }

  renderMarkButton( type ) {

    const isActive = this.state.value.activeMarks.some( mark => mark.type === type );

    return <a
      className={classNames( {
        btn: true,
        'btn-default' : !isActive,
        'btn-primary' : isActive
      } )}
      onMouseDown={this.toggleMark.bind( this, type )}
    >
      <i className={'fa fa-' + type}></i>
    </a>

  }



  renderMark( props ) {

    const { children, mark, attributes } = props;

    if ( mark.type === 'bold' ) {

      return <strong {...attributes}>{children}</strong>;

    } else if ( mark.type === 'italic' ) {

      return <em {...attributes}>{children}</em>

    }

  }

  renderNode( props ) {

    const { attributes, children, node } = props;

    if ( node.type === 'bulleted-list' ) {

      return <ul {...attributes}>{children}</ul>;

    } else if ( node.type === 'heading-two' ) {

      return <h2 {...attributes}>{children}</h2>;

    } else if ( node.type === 'heading-three' ) {

      return <h3 {...attributes}>{children}</h3>;

    } else if ( node.type === 'list-item' ) {

      return <li {...attributes}>{children}</li>

    } else if ( node.type === 'link' ) {

      return <a {...attributes} href={node.data.get( 'href' )}>
        {children}
      </a>

    }

  }

  isEmpty() {

    let empty = false;

    try {

      const nodes = _.get( this.state.value, 'document.nodes' );

      if ( !nodes.size ) {

        empty = true;

      } else if ( nodes.size === 1 && !nodes.get( 0 ).text.length ) {

        empty = true;

      }

    } catch ( e ) {

      console.error( e );

    }

    return empty;

  }

  render() {

    const labels = flatten( richTextLabels, this.props.lang, true );

    return <div className="rich-textarea margin-top-xs">
      <div className="toolbar">
        {this.renderBlockButton( 'heading-two', labels.heading )}
        {this.renderBlockButton( 'heading-three', labels.subHeading )}
        {this.renderMarkButton( 'bold' )}
        {this.renderMarkButton( 'italic' )}
        {this.renderBlockButton( 'bulleted-list', <i className="fa fa-list"></i> )}
        {this.renderBlockButton( 'link', <i className="fa fa-link"></i> )}
      </div>
      <div className="textarea-canvas">
        { this.isEmpty() && this.props.field.placeholder ? <div className="textarea-placeholder">
          {nl2br( this.props.field.placeholder )}
        </div> : null }
        <Editor
          spellCheck={false}
          value={this.state.value}
          renderMark={this.renderMark}
          renderNode={this.renderNode}
          onChange={this.onChange.bind( this )} />
      </div>
    </div>

  }

}
/*placeholder={this.props.field.placeholder}*/
