import _ from 'lodash';

import React, { Component } from 'react';
import { Editor } from 'slate-react';

import classNames from 'classnames';
import { Value } from 'slate';

import richTextLabels from '@openagenda/labels/form-schemas/richText';
import flatten from '@openagenda/labels/flatten';
import { nl2br } from '@openagenda/react-shared';

const DEFAULT_NODE = 'paragraph';

const DEFAULT_DOC = {
  document: {
    nodes: [{
      object: 'block',
      type: 'paragraph',
      nodes: [{
        object: 'text',
        leaves: [{ text: '' }]
      }]
    }]
  }
};

function renderMark(props) {
  const {
    children,
    mark,
    attributes
  } = props;

  if (mark.type === 'bold') {
    return <strong {...attributes}>{children}</strong>;
  }

  if (mark.type === 'italic') {
    return <em {...attributes}>{children}</em>;
  }
}

function renderNode(props) {
  const {
    attributes,
    children,
    node
  } = props;

  if (node.type === 'bulleted-list') {
    return <ul {...attributes}>{children}</ul>;
  }

  if (node.type === 'heading-two') {
    return <h2 {...attributes}>{children}</h2>;
  }

  if (node.type === 'heading-three') {
    return <h3 {...attributes}>{children}</h3>;
  }

  if (node.type === 'list-item') {
    return <li {...attributes}>{children}</li>;
  }

  if (node.type === 'link') {
    return (
      <a {...attributes} href={node.data.get('href')}>
        {children}
      </a>
    );
  }
}

export default class SlateField extends Component {
  constructor(props) {
    super(props);

    let update;
    const {
      value
    } = this.props;

    if (value instanceof Value) {
      update = value;
    } else if (!value) {
      update = Value.fromJSON(DEFAULT_DOC);
    } else if (_.isString(value)) {
      update = Value.fromJSON(JSON.parse(value));
    } else {
      update = Value.fromJSON(value);
    }

    this.state = {
      value: update,
      changed: false
    };
  }

  // slate triggers an onChange on load.
  // The first can be ignored
  onChange({ value }) {
    const {
      onChange,
      raw
    } = this.props;
    const {
      changed: stateChangedValue,
      value: stateValue
    } = this.state;

    const changed = stateChangedValue || (
      JSON.stringify(value.toJSON()) !== JSON.stringify(stateValue.toJSON())
    );

    this.setState({ value, changed });

    if (!changed) return;

    onChange(raw ? value : value.toJSON());
  }

  toggleMark(type, e) {
    if (e) e.preventDefault();

    const {
      value
    } = this.state;

    this.onChange(value.change().toggleMark(type));
  }

  toggleLink({ value, change }) {
    if (this.hasLinks()) {
      change.unwrapInline('link');
    } else if (value.isExpanded) {
      /* eslint-disable */
      const href = window.prompt('Enter the URL of the link:');
      /* eslint-enable */

      change.wrapInline({
        type: 'link',
        data: { href }
      });
    } else {
      /* eslint-disable */
      const href = window.prompt('Enter the URL of the link:');
      const text = window.prompt('Enter the text for the link:');
      /* eslint-enable */

      if (text && text.length) {
        change
          .insertText(text)
          .extend(0 - text.length);

        change.wrapInline({ type: 'link', data: { href } });
      }
    }
  }

  toggleList({
    value, change, document, type
  }) {
    // Handle the extra wrapping required for list buttons.
    const isList = this.hasBlock('list-item');

    const isType = value.blocks.some(block => (
      !!document.getClosest(block.key, parent => parent.type === type)
    ));

    if (isList && isType) {
      change
        .setBlocks(DEFAULT_NODE)
        .unwrapBlock('bulleted-list')
        .unwrapBlock('numbered-list');
    } else if (isList) {
      change
        .unwrapBlock(
          type === 'bulleted-list' ? 'numbered-list' : 'bulleted-list'
        )
        .wrapBlock(type);
    } else {
      change.setBlocks('list-item').wrapBlock(type);
    }
  }

  toggleBlock(type, e) {
    const { value } = this.state;
    const change = value.change();
    const { document } = value;

    if (e) e.preventDefault();

    if (type === 'link') {
      this.toggleLink({ value, change });
    } else if (['bulleted-list', 'numbered-list'].includes(type)) {
      this.toggleList({
        value, change, document, type
      });
    } else {
      const isActive = this.hasBlock(type);

      const isList = this.hasBlock('list-item');

      if (isList) {
        change
          .setBlocks(isActive ? DEFAULT_NODE : type)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list');
      } else {
        change.setBlocks(isActive ? DEFAULT_NODE : type);
      }
    }

    this.onChange(change);
  }

  hasLinks() {
    const {
      value
    } = this.state;

    return value.inlines.some(inline => inline.type === 'link');
  }

  hasBlock(type) {
    const {
      value
    } = this.state;

    return value.blocks.some(node => node.type === type);
  }

  isEmpty() {
    let empty = false;

    const {
      value
    } = this.state;

    try {
      const nodes = value?.document?.nodes;

      if (!nodes.size) {
        empty = true;
      } else if (nodes.size === 1 && !nodes.get(0).text.length) {
        empty = true;
      }
    } catch (e) {
      console.error(e);
    }

    return empty;
  }

  renderBlockButton(type, label) {
    let isActive = this.hasBlock(type);

    if (type === 'bulleted-list') {
      const { value } = this.state;

      const parent = value.blocks.size && value.document.getParent(value.blocks.first().key);

      isActive = this.hasBlock('list-item') && parent && parent.type === type;
    }

    return (
      <button
        type="button"
        className={classNames({
          btn: true,
          'btn-default': !isActive,
          'btn-primary': isActive
        })}
        onMouseDown={this.toggleBlock.bind(this, type)}
      >
        {label}
      </button>
    );
  }

  renderMarkButton(type) {
    const {
      value
    } = this.state;

    const isActive = value.activeMarks.some(mark => mark.type === type);

    return (
      <button
        type="button"
        className={classNames({
          btn: true,
          'btn-default': !isActive,
          'btn-primary': isActive
        })}
        onMouseDown={this.toggleMark.bind(this, type)}
      >
        <i className={`fa fa-${type}`} />
      </button>
    );
  }

  render() {
    const {
      value
    } = this.state;

    const {
      lang,
      field
    } = this.props;

    const {
      placeholder
    } = field;

    const labels = flatten(richTextLabels, lang, true);

    return (
      <div className="rich-textarea margin-top-xs">
        <div className="toolbar">
          {this.renderBlockButton('heading-two', labels.heading, { tab: 0 })}
          {this.renderBlockButton('heading-three', labels.subHeading, { tab: 1 })}
          {this.renderMarkButton('bold', { tab: 2 })}
          {this.renderMarkButton('italic', { tab: 3 })}
          {this.renderBlockButton('bulleted-list', <i className="fa fa-list" />, { tab: 4 })}
          {this.renderBlockButton('link', <i className="fa fa-link" />, { tab: 5 })}
        </div>
        <div className="textarea-canvas">
          { this.isEmpty() && placeholder ? (
            <button
              type="button"
              onKeyDown={() => this.editor.focus()}
              onClick={() => this.editor.focus()}
              className="textarea-placeholder"
            >
              {nl2br(placeholder)}
            </button>
          ) : null }
          <Editor
            ref={el => { this.editor = el; }}
            spellCheck={false}
            value={value}
            renderMark={renderMark}
            renderNode={renderNode}
            onChange={params => this.onChange(params)}
          />
        </div>
      </div>
    );
  }
}
