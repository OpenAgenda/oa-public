'use strict';

const options = require('../testconfig');
const OEmbed = require('../src');
const links = require('./fixtures/links.json');
const legacyLinks = require('./fixtures/legacyLinks.json');

describe('03 - injecting embedded items in html render', () => {
  const oe = new OEmbed(options);

  test('replaces link tags found in given text and matching given list of link/embed codes', () => {
    const injected = oe.injectEmbeds(`
      <p>Hello, this is not a link</p>
      <p>But this is: <a href="https://youtu.be/q9zh7y2PW4g"></a></p>
    `, links);

    expect(injected).toEqual(`
      <p>Hello, this is not a link</p>
      <p>But this is: <div><div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;"><iframe src="https://www.youtube.com/embed/q9zh7y2PW4g?rel=0" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no" allow="encrypted-media; accelerometer; gyroscope; picture-in-picture"></iframe></div></div></p>
    `);
  });

  test('if link structure provides a link/code pair, code is used as embed when available', () => {
    const injected = oe.injectEmbeds(`
      <a href="https://www.facebook.com/jarsmsk/">JARMSLSMSK</a>
      <p>A comment</p>
      <a href="https://vimeo.com/315339603">A vimeo video</a>
    `, legacyLinks);

    expect(injected).toEqual(`
      <a href="https://www.facebook.com/jarsmsk/">JARMSLSMSK</a>
      <p>A comment</p>
      <div><div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 80%;"><iframe src="https://player.vimeo.com/video/315339603?byline=0&amp;badge=0&amp;portrait=0&amp;title=0" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no" allow="encrypted-media"></iframe></div>&lt;div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 80%;"&gt;&lt;iframe src="https://player.vimeo.com/video/315339603?byline=0&amp;amp;badge=0&amp;amp;portrait=0&amp;amp;title=0" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no" allow="encrypted-media"&gt;&lt;/iframe&gt;&lt;/div&gt;</div>
    `);

  });

});
