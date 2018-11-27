const { registerDependencies } = require( 'mjml-validator' );
const { BodyComponent } = require( 'mjml-core' );


registerDependencies( {
  // Tell the validator which tags are allowed as our component's parent
  'mj-body': [ 'mj-content' ],
  // // Tell the validator which tags are allowed as our component's children
  'mj-content': [ 'mj-column', 'mj-group', 'mj-raw' ]
} );


class MjContent extends BodyComponent {
  /*
    Render is the only required function in a component.
    It must return an html string.
  */

  render() {
    return this.renderMJML( `
	  	<mj-wrapper padding="0" css-class="content-wrapper">
        <mj-section
          background-color="#ffffff"
          padding="20px 40px"
        >
          ${this.getContent()}
        </mj-section>
      </mj-wrapper>
	  ` );
  }
};

// Tell the parser that our component won't contain other mjml tags
MjContent.endingTag = true;


module.exports = MjContent;
