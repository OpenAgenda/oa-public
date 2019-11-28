'use strict';

const options = require('../testconfig');
const OEmbed = require('../src');
const links = require('./fixtures/links.json');

describe('03 - injecting embedded items in html render', () => {
  const oe = new OEmbed(options);

  test('replaces link tags found in given text and matching given list of link/embed codes', async () => {
    const injected = oe.injectEmbeds(`
      <p>Hello, this is not a link</p>
      <p>But this is: <a href="https://youtu.be/q9zh7y2PW4g"></a></p>
    `, links);

    expect(injected).toEqual(`
      <p>Hello, this is not a link</p>
      <p>But this is: <div><div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;"><iframe src="https://www.youtube.com/embed/q9zh7y2PW4g?rel=0" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no" allow="encrypted-media; accelerometer; gyroscope; picture-in-picture"></iframe></div></div></p>
    `);
  });

});
