'use strict';

const markdownToHTML = require('../utils/markdownToHTML');

describe('16 - utils - markdownToHTML', () => {
  it('creates html from markdown', () => {
    const HTML = markdownToHTML('# This is a title');

    expect(HTML).toBe('<h1>This is a title</h1>\n');
  });

  it('line break translates to <br /> in a single paragraph', () => {
    const HTML = markdownToHTML(`# This is a title
New line
New line
`);

    expect(HTML).toBe(`<h1>This is a title</h1>
<p>New line<br />New line</p>
`);
  });
});
