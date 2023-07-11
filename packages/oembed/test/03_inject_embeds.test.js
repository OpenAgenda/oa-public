'use strict';

const options = require('../testconfig');
const OEmbed = require('../');
const links = require('./fixtures/links.json');

describe('03 - injecting embedded items in html render', () => {
  const oe = new OEmbed(options);

  test('replaces link tags found in given text and matching given list of link/embed codes', () => {
    const injected = oe.injectEmbeds(`
      <p>Hello, this is not a link</p>
      <p>But this is: <a href="https://youtu.be/q9zh7y2PW4g"></a></p>
    `, links);

    expect(injected).toEqual(`
      <p>Hello, this is not a link</p>
      <p>But this is: <div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;"><iframe src="https://www.youtube.com/embed/q9zh7y2PW4g?rel=0" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no" allow="encrypted-media; accelerometer; gyroscope; picture-in-picture"></iframe></div></p>
    `);
  });

  test('escaped or not, links are replaced', () => {
    const html = `<p>Un lien wemap: <a href="https://livemap.getwemap.com/embed.html?emmid=14234&amp;token=K9UCJCEUJ3ZEJ1E3QXTA94YKO#/search@50.6851478,3.1661224,11.00">https://livemap.getwemap.com/embed.html?emmid=14234&token=K9UCJCEUJ3ZEJ1E3QXTA94YKO#/search@50.6851478,3.1661224,11.00</a></p>`;
    const htmlWithEscapedLink = `<p>Un lien wemap: <a href="https://livemap.getwemap.com/embed.html?emmid=14234&amp;token=K9UCJCEUJ3ZEJ1E3QXTA94YKO#/search@50.6851478,3.1661224,11.00">https://livemap.getwemap.com/embed.html?emmid=14234&amp;token=K9UCJCEUJ3ZEJ1E3QXTA94YKO#/search@50.6851478,3.1661224,11.00</a></p>`;
    const injected = `<p>Un lien wemap: <div class="iframely-embed"><div class="iframely-responsive" style="padding-bottom: 65.5137%; padding-top: 120px;"><a href="https://livemap.getwemap.com/embed.html?emmid=14234&amp;token=K9UCJCEUJ3ZEJ1E3QXTA94YKO#/search@50.6851478,3.1661224,11.00" data-iframely-url="//cdn.iframe.ly/api/iframe?url=https%3A%2F%2Flivemap.getwemap.com%2Fembed.html%3Femmid%3D14234%26token%3DK9UCJCEUJ3ZEJ1E3QXTA94YKO%23%2Fsearch%4050.6851478%2C3.1661224%2C11.00&amp;key=7db9d78bdbb5e7d79acb1240cae64b0e"></a></div></div><script async src="//cdn.iframe.ly/embed.js" charset="utf-8"></script></p>`;

    expect(oe.injectEmbeds(html, links)).toEqual(injected);
    expect(oe.injectEmbeds(htmlWithEscapedLink, links)).toEqual(injected);
  });

});
