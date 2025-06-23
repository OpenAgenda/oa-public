import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _defineProperty from "@babel/runtime-corejs3/helpers/defineProperty";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/Components/SlateField.js";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import _keysInstanceProperty from "@babel/runtime-corejs3/core-js/instance/keys";
import "core-js/modules/es.array.iterator.js";
import "core-js/modules/web.dom-collections.iterator.js";
// import _ from 'lodash';

// import debug from 'debug';
import { Component } from 'react';
import { createEditor, Transforms, Editor, Node } from 'slate';
import { ReactEditor, Slate, Editable, withReact } from 'slate-react';
import { withHistory, HistoryEditor } from 'slate-history';
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
import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
const getLabel = makeLabelGetter(formSchemaLabels);

// const log = debug('SlateField');

const DEFAULT_VALUE = [{
  type: 'paragraph',
  children: [{
    text: ''
  }]
}];
const DEFAULT_NODE_TYPE = 'paragraph';
const SHORTCUTS = [{
  type: 'undo',
  label: 'ctrl+z',
  keys: ['z'],
  method: 'undo'
}, {
  type: 'redo',
  label: 'ctrl+y',
  keys: ['y'],
  method: 'redo'
}, {
  type: 'heading-two',
  label: 'ctrl+1',
  keys: ['1', '&'],
  method: 'toggleBlock'
}, {
  type: 'heading-three',
  label: 'ctrl+2',
  keys: ['2', 'é'],
  method: 'toggleBlock'
}, {
  type: 'bold',
  label: 'ctrl+b',
  keys: ['b'],
  method: 'toggleMark'
}, {
  type: 'italic',
  label: 'ctrl+i',
  keys: ['i'],
  method: 'toggleMark'
}, {
  type: 'link',
  label: 'ctrl+k',
  keys: ['k'],
  method: 'toggleBlock'
}, {
  type: 'bulleted-list',
  label: 'ctrl+l',
  keys: ['l'],
  method: 'toggleBlock'
}];
function withInlines(editor) {
  const {
    isInline,
    normalizeNode
  } = editor;
  editor.isInline = element => element.type === 'link' ? true : isInline(element);
  editor.normalizeNode = entry => {
    const [node, path] = entry;
    if (node.type === 'link' && Editor.isEmpty(editor, node)) {
      Transforms.unwrapNodes(editor, {
        at: path
      });
      return;
    }
    normalizeNode(entry);
  };
  return editor;
}
export default class SlateField extends Component {
  constructor(props) {
    super(props);
    _defineProperty(this, "onChange", newValue => {
      const {
        onChange,
        raw
      } = this.props;
      const {
        changed: alreadyChanged,
        value: oldValue
      } = this.state;
      const changed = alreadyChanged || JSON.stringify(newValue) !== JSON.stringify(oldValue);
      this.setState({
        value: newValue,
        changed
      });
      if (!changed) return;
      onChange(raw ? newValue : newValue);
    });
    _defineProperty(this, "onKeyDown", e => {
      if (!e.ctrlKey) {
        return;
      }
      const match = SHORTCUTS.find(s => {
        var _context;
        return _includesInstanceProperty(_context = _keysInstanceProperty(s)).call(_context, e.key);
      });
      if (!match) {
        return;
      }
      e.preventDefault();
      this[match.method](match.type);
    });
    _defineProperty(this, "setFullscreen", fullscreen => {
      if (fullscreen) {
        bodyScroll.disable();
      } else {
        bodyScroll.enable();
      }
      this.setState({
        fullscreen
      });
    });
    // eslint-disable-next-line class-methods-use-this
    _defineProperty(this, "renderElement", _ref => {
      let {
        attributes,
        children,
        element
      } = _ref;
      switch (element.type) {
        case 'heading-two':
          return /*#__PURE__*/_jsxDEV("h2", _objectSpread(_objectSpread({}, attributes), {}, {
            children: children
          }), void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 181,
            columnNumber: 16
          }, this);
        case 'heading-three':
          return /*#__PURE__*/_jsxDEV("h3", _objectSpread(_objectSpread({}, attributes), {}, {
            children: children
          }), void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 183,
            columnNumber: 16
          }, this);
        case 'bulleted-list':
          return /*#__PURE__*/_jsxDEV("ul", _objectSpread(_objectSpread({}, attributes), {}, {
            children: children
          }), void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 185,
            columnNumber: 16
          }, this);
        case 'list-item':
          return /*#__PURE__*/_jsxDEV("li", _objectSpread(_objectSpread({}, attributes), {}, {
            children: children
          }), void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 187,
            columnNumber: 16
          }, this);
        case 'link':
          return /*#__PURE__*/_jsxDEV("a", _objectSpread(_objectSpread({}, attributes), {}, {
            href: element.url,
            children: children
          }), void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 190,
            columnNumber: 11
          }, this);
        default:
          return /*#__PURE__*/_jsxDEV("p", _objectSpread(_objectSpread({}, attributes), {}, {
            children: children
          }), void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 195,
            columnNumber: 16
          }, this);
      }
    });
    // eslint-disable-next-line class-methods-use-this
    _defineProperty(this, "renderLeaf", _ref2 => {
      let {
        attributes,
        children,
        leaf
      } = _ref2;
      let child = children;
      if (leaf.bold) {
        child = /*#__PURE__*/_jsxDEV("strong", {
          children: child
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 203,
          columnNumber: 15
        }, this);
      }
      if (leaf.italic) {
        child = /*#__PURE__*/_jsxDEV("em", {
          children: child
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 206,
          columnNumber: 15
        }, this);
      }
      return /*#__PURE__*/_jsxDEV("span", _objectSpread(_objectSpread({}, attributes), {}, {
        children: child
      }), void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 208,
        columnNumber: 12
      }, this);
    });
    _defineProperty(this, "toggleMark", mark => {
      const isActive = this.isMarkActive(mark);
      if (isActive) {
        Editor.removeMark(this.editor, mark);
      } else {
        Editor.addMark(this.editor, mark, true);
      }
    });
    _defineProperty(this, "isMarkActive", mark => {
      const [match] = Editor.nodes(this.editor, {
        match: n => n[mark] === true,
        universal: true
      });
      return !!match;
    });
    _defineProperty(this, "toggleBlock", type => {
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
            match: n => n.type === 'bulleted-list',
            split: true
          });
          // On repasse en type paragraph
          Transforms.setNodes(this.editor, {
            type: DEFAULT_NODE_TYPE
          });
        } else {
          // On set le bloc courant en list-item
          Transforms.setNodes(this.editor, {
            type: 'list-item'
          });
          // On wrap le tout dans 'bulleted-list'
          Transforms.wrapNodes(this.editor, {
            type: 'bulleted-list',
            children: []
          });
        }
      } else {
        // Pour un heading-two, heading-three, etc.
        Transforms.setNodes(this.editor, {
          type: isActive ? DEFAULT_NODE_TYPE : type
        });
      }
    });
    _defineProperty(this, "isBlockActive", type => {
      const [match] = Editor.nodes(this.editor, {
        match: n => n.type === type
      });
      return !!match;
    });
    _defineProperty(this, "toggleLink", () => {
      const isLink = this.isBlockActive('link');
      if (isLink) {
        Transforms.unwrapNodes(this.editor, {
          match: n => n.type === 'link'
        });
      } else {
        const url = window.prompt('Enter the URL of the link:');
        if (!url) return;
        const {
          selection
        } = this.editor;
        const linkNode = {
          type: 'link',
          url,
          children: []
        };
        if (selection && Editor.string(this.editor, selection) === '') {
          Transforms.insertNodes(this.editor, {
            type: 'link',
            url,
            children: [{
              text: url
            }]
          });
        } else {
          Transforms.wrapNodes(this.editor, linkNode, {
            split: true
          });
        }
      }
    });
    // eslint-disable-next-line react/no-unused-class-component-methods
    _defineProperty(this, "undo", () => {
      HistoryEditor.undo(this.editor);
    });
    // eslint-disable-next-line react/no-unused-class-component-methods
    _defineProperty(this, "redo", () => {
      HistoryEditor.undo(this.editor);
    });
    _defineProperty(this, "isEmpty", () => {
      const {
        value
      } = this.state;
      if (!value || value.length === 0) return true;
      if (value.length === 1 && Node.string(value[0]) === '') {
        return true;
      }
      return false;
    });
    _defineProperty(this, "renderBlockButton", (type, label) => {
      var _SHORTCUTS$find;
      let isActive = this.isBlockActive(type);
      if (type === 'bulleted-list') {
        const isListItem = this.isBlockActive('list-item');
        isActive = isListItem && isActive;
      }
      return /*#__PURE__*/_jsxDEV("button", {
        type: "button",
        title: (_SHORTCUTS$find = SHORTCUTS.find(s => s.type === type)) === null || _SHORTCUTS$find === void 0 ? void 0 : _SHORTCUTS$find.label,
        className: classNames('btn', {
          'btn-default': !isActive,
          'btn-primary': isActive
        }),
        onMouseDown: e => {
          e.preventDefault();
          this.toggleBlock(type);
        },
        children: label
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 329,
        columnNumber: 7
      }, this);
    });
    _defineProperty(this, "renderFullscreenButton", () => {
      const {
        fullscreen = false
      } = this.state;
      return /*#__PURE__*/_jsxDEV("button", {
        type: "button",
        className: "btn btn-default pull-right",
        onClick: () => this.setFullscreen(!fullscreen),
        "aria-label": getLabel('fullscreen'),
        children: /*#__PURE__*/_jsxDEV("i", {
          className: classNames('fa', {
            'fa-maximize': !fullscreen,
            'fa-minimize': fullscreen
          })
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 356,
          columnNumber: 9
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 350,
        columnNumber: 7
      }, this);
    });
    _defineProperty(this, "renderMarkButton", type => {
      var _SHORTCUTS$find2;
      const isActive = this.isMarkActive(type);
      const label = (_SHORTCUTS$find2 = SHORTCUTS.find(s => s.type === type)) === null || _SHORTCUTS$find2 === void 0 ? void 0 : _SHORTCUTS$find2.label;
      return /*#__PURE__*/_jsxDEV("button", {
        type: "button",
        "aria-label": label,
        title: label,
        className: classNames('btn', {
          'btn-default': !isActive,
          'btn-primary': isActive
        }),
        onMouseDown: e => {
          e.preventDefault();
          this.toggleMark(type);
        },
        children: /*#__PURE__*/_jsxDEV("i", {
          className: "fa fa-".concat(type)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 384,
          columnNumber: 9
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 371,
        columnNumber: 7
      }, this);
    });
    _defineProperty(this, "renderFullscreenTop", () => {
      const {
        field: fieldFromProps,
        lang
      } = this.props;
      const field = flattenFieldLabels(fieldFromProps, lang);
      return /*#__PURE__*/_jsxDEV(_Fragment, {
        children: [/*#__PURE__*/_jsxDEV("label", {
          htmlFor: field.field,
          className: "control-label",
          children: field.label
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 396,
          columnNumber: 9
        }, this), field.info ? /*#__PURE__*/_jsxDEV(Info, {
          value: field.info
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 399,
          columnNumber: 23
        }, this) : null]
      }, void 0, true);
    });
    _defineProperty(this, "renderFullscreenBottom", () => {
      const {
        field: fieldFromProps,
        lang,
        parentValue,
        error
      } = this.props;
      const field = flattenFieldLabels(fieldFromProps, lang);
      return /*#__PURE__*/_jsxDEV(_Fragment, {
        children: [field.max ? /*#__PURE__*/_jsxDEV(FieldCounter, {
          value: parentValue,
          max: field.max
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 412,
          columnNumber: 11
        }, this) : null, field.sub || field.error ? /*#__PURE__*/_jsxDEV(Sub, {
          label: field.sub,
          error: error
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 415,
          columnNumber: 11
        }, this) : null]
      }, void 0, true);
    });
    this.editor = withInlines(withReact(withHistory(createEditor())));
    const {
      value: _value
    } = this.props;
    let initialValue;
    if (!_value) {
      initialValue = DEFAULT_VALUE;
    } else if (typeof _value === 'string') {
      try {
        initialValue = JSON.parse(_value);
      } catch (e) {
        initialValue = DEFAULT_VALUE;
      }
    } else if (Array.isArray(_value)) {
      initialValue = _value;
    } else {
      initialValue = _value.document ? _value.document.nodes || DEFAULT_VALUE : DEFAULT_VALUE;
    }
    this.state = {
      value: initialValue,
      changed: false,
      fullscreen: false // Pour la gestion de l’écran plein
    };
  }
  render() {
    const {
      value,
      fullscreen
    } = this.state;
    const {
      lang,
      field
    } = this.props;
    const {
      placeholder
    } = field;
    const labels = flatten(richTextLabels, lang, true);
    return /*#__PURE__*/_jsxDEV("div", {
      className: classNames('rich-textarea margin-top-xs', {
        fullscreen
      }),
      children: [fullscreen ? this.renderFullscreenTop() : null, /*#__PURE__*/_jsxDEV("div", {
        className: "toolbar",
        children: [this.renderBlockButton('heading-two', labels.heading), this.renderBlockButton('heading-three', labels.subHeading), this.renderMarkButton('bold'), this.renderMarkButton('italic'), this.renderBlockButton('bulleted-list', /*#__PURE__*/_jsxDEV("i", {
          className: "fa fa-list"
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 444,
          columnNumber: 13
        }, this)), this.renderBlockButton('link', /*#__PURE__*/_jsxDEV("i", {
          className: "fa fa-link"
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 446,
          columnNumber: 43
        }, this)), this.renderFullscreenButton()]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 437,
        columnNumber: 9
      }, this), /*#__PURE__*/_jsxDEV("div", {
        className: "textarea-canvas",
        children: [this.isEmpty() && placeholder ? /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          onKeyDown: () => ReactEditor.focus(this.editor),
          onClick: () => ReactEditor.focus(this.editor),
          className: "textarea-placeholder",
          children: nl2br(placeholder)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 451,
          columnNumber: 13
        }, this) : null, /*#__PURE__*/_jsxDEV(Slate, {
          editor: this.editor,
          initialValue: value,
          onChange: this.onChange,
          children: /*#__PURE__*/_jsxDEV(Editable, {
            spellCheck: false,
            renderElement: this.renderElement,
            renderLeaf: this.renderLeaf,
            onKeyDown: this.onKeyDown
            // placeholder={placeholder} // Slate gère aussi un placeholder natif si besoin
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 465,
            columnNumber: 13
          }, this)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 460,
          columnNumber: 11
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 449,
        columnNumber: 9
      }, this), fullscreen ? this.renderFullscreenBottom() : null]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 431,
      columnNumber: 7
    }, this);
  }
}
//# sourceMappingURL=SlateField.js.map