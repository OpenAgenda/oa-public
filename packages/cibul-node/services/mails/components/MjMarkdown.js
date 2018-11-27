const { registerDependencies } = require( 'mjml-validator' );
const { BodyComponent } = require( 'mjml-core' );
const marked = require( 'marked' );


registerDependencies( {
  // Tell the validator which tags are allowed as our component's parent
  'mj-column': [ 'mj-markdown' ],
  'mj-hero': [ 'mj-markdown' ],
  'mj-text-md': [ 'mj-markdown' ],
  // 'mj-text': [ 'mj-markdown' ],
  // // Tell the validator which tags are allowed as our component's children
  'mj-markdown': [],
} );


class MjMarkdown extends BodyComponent {
  // This functions allows to define styles that can be used when rendering (see render() below)
  getStyles() {
    return {
      wrapperDiv: {
        color: this.getAttribute('color'),
        'font-family': this.getAttribute('font-family'),
        'font-size': this.getAttribute('font-size'),
        'font-style': this.getAttribute('font-style'),
        'font-weight': this.getAttribute('font-weight'),
        'letter-spacing': this.getAttribute('letter-spacing'),
        'line-height': this.getAttribute('line-height'),
        'text-align': this.getAttribute('align'),
        'text-decoration': this.getAttribute('text-decoration'),
        'text-transform': this.getAttribute('text-transform'),
      }
    };
  }

  /*
    Render is the only required function in a component.
    It must return an html string.
  */
  render() {
    return `
      <div ${this.htmlAttributes( { // this.htmlAttributes() is the recommended way to pass attributes to html tags
        class: this.getAttribute( 'css-class' ),
        style: 'wrapperDiv', // This will add the 'wrapperDiv' attributes from getStyles() as inline style
      } )}>
        ${marked( this.getContent(), { breaks: this.getAttribute( 'breaks' ) } )}
      </div>
    `;
  }
};

// Tell the parser that our component won't contain other mjml tags
MjMarkdown.endingTag = true;

// Tells the validator which attributes are allowed for mj-markdown
MjMarkdown.allowedAttributes = {
  align: 'enum(left,right,center)',
  breaks: 'boolean',
  color: 'color',
  'font-family': 'string',
  'font-size': 'unit(px)',
  'font-style': 'string',
  'font-weight': 'string',
  'letter-spacing': 'unit(px,%)',
  'line-height': 'unit(px,%)',
  'padding-bottom': 'unit(px,%)',
  'padding-left': 'unit(px,%)',
  'padding-right': 'unit(px,%)',
  'padding-top': 'unit(px,%)',
  padding: 'unit(px,%){1,4}',
  'text-decoration': 'string',
  'text-transform': 'string',
};

// What the name suggests. Fallback value for this.getAttribute('attribute-name').
MjMarkdown.defaultAttributes = {
  align: 'left',
  breaks: true,
  color: '#000000',
  'font-family': 'Ubuntu, Helvetica, Arial, sans-serif',
  'font-size': '13px',
  'line-height': '1',
  padding: '10px 25px'
};


module.exports = MjMarkdown;
