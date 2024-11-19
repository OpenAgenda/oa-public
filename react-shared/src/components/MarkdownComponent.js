import { Component } from 'react';
import { fromMarkdownToHTML } from '@openagenda/md';
import turndown from 'turndown';
import uniqueLoad from './lib/uniqueLoad.js';
import cleanString from './lib/cleanString.js';

const TurndownService = turndown.default || turndown;
const ts = new TurndownService();

function generateUniqueIdentifier() {
  return Math.ceil(Math.random() * 100000000);
}

function getCleanTextContent(elem) {
  const attr = 'innerText' in elem ? 'innerText' : 'textContent';

  return cleanString(elem[attr] || '').trim();
}

function flattenChildren(node) {
  let flattened = '';

  if (!node.childNodes.length) {
    return getCleanTextContent(node);
  }

  for (let i = 0; i < node.childNodes.length; i++) {
    if (node.childNodes[i].childNodes.length) {
      flattened += flattenChildren(node.childNodes[i]);
    } else {
      flattened += node.childNodes[i].nodeValue || '';
    }
  }

  return flattened;
}

function cleanNode(node) {
  const clean = document.createElement(node.nodeName);
  let cleanChild;
  let i;
  let type;
  let child;
  let cleanType;

  for (i = 0; i < node.childNodes.length; i++) {
    child = node.childNodes[i];

    type = child.nodeName.toLowerCase();

    cleanType = ['p', 'h1', 'h2', 'h3'].indexOf(type) !== -1 ? type : 'p';

    cleanChild = document.createElement(cleanType);

    cleanChild.innerHTML = flattenChildren(child);

    if (cleanChild.innerHTML.length) {
      clean.appendChild(cleanChild);
    }
  }

  return clean;
}

function makeUrlConverter(editor) {
  const fn = editor.convertURL;

  function convertURL_(...args) {
    const [url] = args;
    fn.call(this, ...args);

    if (/^mailto:/.test(url)) {
      return url;
    }

    const regex = /(http:|https:)?\/\//;
    if (!regex.test(url)) {
      return `https://${url}`;
    }
    return url;
  }

  editor.convertURL = convertURL_;
}

export default class MarkdownComponent extends Component {
  static defaultProps = {
    className: 'form-group',
    value: '',
    tinyMceUrl: '/js/tinymce/tinymce.min.js',
    label: null,
    placeholder: null,
    onChange: () => {},
    uniqueClassName: null,
    lang: 'fr',
    loadComponent: null,
  };

  constructor(props) {
    super(props);

    this.onTinyMCEChange = this.onTinyMCEChange.bind(this);
    this.initializeTinyMceEditor = this.initializeTinyMceEditor.bind(this);
    this.updateTinyMceEditor = this.updateTinyMceEditor.bind(this);
    this.loadTinyMce = this.loadTinyMce.bind(this);

    const { uniqueClassName } = this.props;

    this.state = {
      tinyMceReady: typeof tinymce !== 'undefined',
      editorId: null,
      uniqueClassName: uniqueClassName || `js_${generateUniqueIdentifier()}`,
    };

    const { tinyMceReady } = this.state;

    if (!tinyMceReady && typeof document !== 'undefined') this.loadTinyMce();
  }

  componentWillUnmount() {
    const { editorId } = this.state;
    if (!editorId) return console.log('not loaded');

    window.tinymce.get(editorId).remove();
  }

  onTinyMCEChange(html) {
    const { onChange } = this.props;
    const editorMarkdown = ts.turndown(html);

    this.setState({
      editorMarkdown,
    });

    onChange(editorMarkdown);
  }

  initializeTinyMceEditor() {
    const { uniqueClassName } = this.state;
    const { lang, value } = this.props;

    window.tinymce.init({
      selector: `.${uniqueClassName}`,
      language: lang === 'fr' ? 'fr_FR' : 'en_EN',
      menubar: false,
      plugins: 'autolink link lists print preview autoresize paste placeholder',
      toolbar: 'formatselect bold italic bullist link',
      statusbar: false,
      browser_spellcheck: true,
      block_formats: 'Paragraph=p;Header 2=h2;Header 3=h3;',
      autoresize_min_height: 100,
      // https://www.tinymce.com/docs/plugins/link/#link_title
      link_title: false,
      target_list: false,
      default_link_target: '_blank',
      link_assume_external_targets: false,
      // pasted iframe are not converted in editor
      invalid_elements: 'iframe',
      // https://www.tiny.cloud/docs/configure/url-handling/
      relative_urls: false,
      remove_script_host: false,

      setup: (editor) => {
        this.setState({
          editorId: editor.id,
          editorMarkdown: value,
        });

        makeUrlConverter(editor);

        editor.on('change', (e) => {
          this.onTinyMCEChange(e.target.getContent());
        });
      },

      paste_postprocess: (pl, o) => {
        // paste from word-type processors insert a mess of tags
        // in the html; these must be cleaned
        o.node = cleanNode(o.node);
      },
    });
  }

  updateTinyMceEditor() {
    const { value } = this.props;
    const { editorId, editorMarkdown } = this.state;

    const editor = window.tinymce.get(editorId);

    if (!editor) return;

    if (editorMarkdown !== value) {
      // value in editor has diverged from value given in props. Needs to be updated
      window.tinymce.get(editorId).setContent(fromMarkdownToHTML(value));
    }
  }

  loadTinyMce() {
    const { tinyMceUrl } = this.props;
    uniqueLoad(tinyMceUrl, (_err, _script) => {
      this.setState({
        tinyMceReady: true,
      });
    });
  }

  render() {
    const { tinyMceReady, editorId, uniqueClassName } = this.state;
    if (!tinyMceReady) return null;

    if (!editorId) {
      setTimeout(this.initializeTinyMceEditor);
    } else {
      setTimeout(this.updateTinyMceEditor);
    }

    const { className, placeholder, label, value } = this.props;

    return (
      <div className={className}>
        {label && <label>{label}</label>}
        <textarea
          placeholder={placeholder}
          className={uniqueClassName}
          value={fromMarkdownToHTML(value)}
          style={{ minHeight: '200px', visibility: 'hidden' }}
          onChange={() => {}}
        />
      </div>
    );
  }
}
