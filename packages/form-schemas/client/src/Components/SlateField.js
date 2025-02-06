// import _ from 'lodash';

// import debug from 'debug';
import { Component } from 'react';
import { createEditor, Transforms, Editor, Node } from 'slate';
import { ReactEditor, Slate, Editable, withReact } from 'slate-react';
import classNames from 'classnames';

import richTextLabels from '@openagenda/labels/form-schemas/richText.js';
import formSchemaLabels from '@openagenda/labels/form-schemas/index.js';
import makeLabelGetter from '@openagenda/labels';
import flatten from '@openagenda/labels/flatten.js';
import { nl2br, bodyScroll } from '@openagenda/react-shared';

import flattenFieldLabels from '../lib/flatten.js';
import FieldCounter from './FieldCounter.js';
import Info from './Info.js';
import Sub from './Sub.js';

const getLabel = makeLabelGetter(formSchemaLabels);

// const log = debug('SlateField');

const DEFAULT_VALUE = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

const DEFAULT_NODE_TYPE = 'paragraph';

const SHORTCUTS = [
  {
    type: 'heading-two',
    label: 'ctrl+1',
    keys: ['1', '&'],
    method: 'toggleBlock',
  },
  {
    type: 'heading-three',
    label: 'ctrl+2',
    keys: ['2', 'é'],
    method: 'toggleBlock',
  },
  {
    type: 'bold',
    label: 'ctrl+b',
    keys: ['b'],
    method: 'toggleMark',
  },
  {
    type: 'italic',
    label: 'ctrl+i',
    keys: ['i'],
    method: 'toggleMark',
  },
  {
    type: 'link',
    label: 'ctrl+k',
    keys: ['k'],
    method: 'toggleBlock',
  },
  {
    type: 'bulleted-list',
    label: 'ctrl+l',
    keys: ['l'],
    method: 'toggleBlock',
  },
];

export default class SlateField extends Component {
  constructor(props) {
    super(props);

    this.editor = withReact(createEditor());

    const { value } = this.props;

    let initialValue;

    if (!value) {
      initialValue = DEFAULT_VALUE;
    } else if (typeof value === 'string') {
      try {
        initialValue = JSON.parse(value);
      } catch (e) {
        initialValue = DEFAULT_VALUE;
      }
    } else if (Array.isArray(value)) {
      initialValue = value;
    } else {
      initialValue = value.document
        ? value.document.nodes || DEFAULT_VALUE
        : DEFAULT_VALUE;
    }

    this.state = {
      value: initialValue,
      changed: false,
      fullscreen: false, // Pour la gestion de l’écran plein
    };
  }

  onChange = (newValue) => {
    const { onChange, raw } = this.props;
    const { changed: alreadyChanged, value: oldValue } = this.state;

    const changed = alreadyChanged || JSON.stringify(newValue) !== JSON.stringify(oldValue);

    this.setState({ value: newValue, changed });

    if (!changed) return;

    onChange(raw ? newValue : newValue);
  };

  onKeyDown(e) {
    if (!e.ctrlKey) {
      return;
    }

    const match = SHORTCUTS.find((s) => s.keys.includes(e.key));

    if (!match) {
      return;
    }

    e.preventDefault();

    this[match.method](match.type);
  }

  setFullscreen(fullscreen) {
    if (fullscreen) {
      bodyScroll.disable();
    } else {
      bodyScroll.enable();
    }

    this.setState({
      fullscreen,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  renderElement = ({ attributes, children, element }) => {
    switch (element.type) {
      case 'heading-two':
        return <h2 {...attributes}>{children}</h2>;
      case 'heading-three':
        return <h3 {...attributes}>{children}</h3>;
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>;
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      case 'link':
        return (
          <a {...attributes} href={element.url}>
            {children}
          </a>
        );
      default:
        return <p {...attributes}>{children}</p>;
    }
  };

  // eslint-disable-next-line class-methods-use-this
  renderLeaf = ({ attributes, children, leaf }) => {
    let child = children;
    if (leaf.bold) {
      child = <strong>{child}</strong>;
    }
    if (leaf.italic) {
      child = <em>{child}</em>;
    }
    return <span {...attributes}>{child}</span>;
  };

  toggleMark = (mark) => {
    const isActive = this.isMarkActive(mark);

    if (isActive) {
      Editor.removeMark(this.editor, mark);
    } else {
      Editor.addMark(this.editor, mark, true);
    }
  };

  isMarkActive = (mark) => {
    const [match] = Editor.nodes(this.editor, {
      match: (n) => n[mark] === true,
      universal: true,
    });
    return !!match;
  };

  toggleBlock = (type) => {
    const isActive = this.isBlockActive(type);
    const isList = this.isBlockActive('list-item');

    if (type === 'link') {
      // On gère les liens de façon particulière
      this.toggleLink();
    } else if (type === 'bulleted-list') {
      // Gestion d'une liste non ordonnée
      if (isList) {
        // On unwrap la liste si elle est déjà active
        Transforms.unwrapNodes(this.editor, {
          match: (n) => n.type === 'bulleted-list',
          split: true,
        });
        // On repasse en type paragraph
        Transforms.setNodes(this.editor, { type: DEFAULT_NODE_TYPE });
      } else {
        // On set le bloc courant en list-item
        Transforms.setNodes(this.editor, { type: 'list-item' });
        // On wrap le tout dans 'bulleted-list'
        Transforms.wrapNodes(this.editor, {
          type: 'bulleted-list',
          children: [],
        });
      }
    } else {
      // Pour un heading-two, heading-three, etc.
      Transforms.setNodes(this.editor, {
        type: isActive ? DEFAULT_NODE_TYPE : type,
      });
    }
  };

  isBlockActive = (type) => {
    const [match] = Editor.nodes(this.editor, {
      match: (n) => n.type === type,
    });
    return !!match;
  };

  toggleLink = () => {
    const isLink = this.isBlockActive('link');

    if (isLink) {
      Transforms.unwrapNodes(this.editor, { match: (n) => n.type === 'link' });
    } else {
      const url = window.prompt('Enter the URL of the link:');
      if (!url) return;

      const { selection } = this.editor;

      const link = {
        type: 'link',
        url,
        children: [{ text: url }],
      };

      if (selection && Editor.string(this.editor, selection) === '') {
        Transforms.insertNodes(this.editor, link);
      } else {
        Transforms.wrapNodes(this.editor, link, { split: true });
      }
    }
  };

  isEmpty = () => {
    const { value } = this.state;
    if (!value || value.length === 0) return true;

    if (value.length === 1 && Node.string(value[0]) === '') {
      return true;
    }

    return false;
  };

  renderBlockButton = (type, label) => {
    let isActive = this.isBlockActive(type);

    if (type === 'bulleted-list') {
      const isListItem = this.isBlockActive('list-item');
      isActive = isListItem && isActive;
    }

    return (
      <button
        type="button"
        title={SHORTCUTS.find((s) => s.type === type)?.label}
        className={classNames('btn', {
          'btn-default': !isActive,
          'btn-primary': isActive,
        })}
        onMouseDown={(e) => {
          e.preventDefault();
          this.toggleBlock(type);
        }}
      >
        {label}
      </button>
    );
  };

  renderFullscreenButton() {
    const { fullscreen = false } = this.state;

    return (
      <button
        type="button"
        className="btn btn-default pull-right"
        onClick={() => this.setFullscreen(!fullscreen)}
        aria-label={getLabel('fullscreen')}
      >
        <i
          className={classNames('fa', {
            'fa-maximize': !fullscreen,
            'fa-minimize': fullscreen,
          })}
        />
      </button>
    );
  }

  renderMarkButton = (type) => {
    const isActive = this.isMarkActive(type);
    const label = SHORTCUTS.find((s) => s.type === type)?.label;

    return (
      <button
        type="button"
        aria-label={label}
        title={label}
        className={classNames('btn', {
          'btn-default': !isActive,
          'btn-primary': isActive,
        })}
        onMouseDown={(e) => {
          e.preventDefault();
          this.toggleMark(type);
        }}
      >
        <i className={`fa fa-${type}`} />
      </button>
    );
  };

  renderFullscreenTop() {
    const { field: fieldFromProps, lang } = this.props;

    const field = flattenFieldLabels(fieldFromProps, lang);

    return (
      <>
        <label htmlFor={field.field} className="control-label">
          {field.label}
        </label>
        {field.info ? <Info value={field.info} /> : null}
      </>
    );
  }

  renderFullscreenBottom() {
    const { field: fieldFromProps, lang, parentValue, error } = this.props;

    const field = flattenFieldLabels(fieldFromProps, lang);

    return (
      <>
        {field.max ? (
          <FieldCounter value={parentValue} max={field.max} />
        ) : null}
        {field.sub || field.error ? (
          <Sub label={field.sub} error={error} />
        ) : null}
      </>
    );
  }

  render() {
    const { value, fullscreen } = this.state;

    const { lang, field } = this.props;

    const { placeholder } = field;

    const labels = flatten(richTextLabels, lang, true);

    return (
      <div
        className={classNames('rich-textarea margin-top-xs', {
          fullscreen,
        })}
      >
        {fullscreen ? this.renderFullscreenTop() : null}
        <div className="toolbar">
          {this.renderBlockButton('heading-two', labels.heading)}
          {this.renderBlockButton('heading-three', labels.subHeading)}
          {this.renderMarkButton('bold')}
          {this.renderMarkButton('italic')}
          {this.renderBlockButton(
            'bulleted-list',
            <i className="fa fa-list" />,
          )}
          {this.renderBlockButton('link', <i className="fa fa-link" />)}
          {this.renderFullscreenButton()}
        </div>
        <div className="textarea-canvas">
          {this.isEmpty() && placeholder ? (
            <button
              type="button"
              onKeyDown={() => ReactEditor.focus(this.editor)}
              onClick={() => ReactEditor.focus(this.editor)}
              className="textarea-placeholder"
            >
              {nl2br(placeholder)}
            </button>
          ) : null}
          <Slate
            editor={this.editor}
            initialValue={value}
            onChange={this.onChange}
          >
            <Editable
              spellCheck={false}
              renderElement={this.renderElement}
              renderLeaf={this.renderLeaf}
              onKeyDown={this.onKeyDown}
              // placeholder={placeholder} // Slate gère aussi un placeholder natif si besoin
            />
          </Slate>
        </div>
        {fullscreen ? this.renderFullscreenBottom() : null}
      </div>
    );
  }
}
