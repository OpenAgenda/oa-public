import { renderToString } from 'react-dom/server';
import { load } from 'cheerio';
import { portalSelector } from './common.js';

export * from './common.js';

export class PortalServer {
  constructor(context) {
    this.context = context;
  }

  portals = [];

  collectPortals(children) {
    return (
      <this.context.Provider value={this.portals}>
        {children}
      </this.context.Provider>
    );
  }

  appendPortals(html) {
    if (!this.portals.length) {
      return html;
    }

    const dom = load(html);

    // Filter out dublicate, no ideer why there is at the moment.
    const result = [];
    const map = new Map();
    for (const item of this.portals) {
      if (!map.has(JSON.stringify(item.content))) {
        map.set(JSON.stringify(item.content), true);
        result.push({
          content: item.content,
          selector: item.selector,
        });
      }
    }

    result.forEach(({ content, selector }) => {
      dom(renderToString(content)).attr(portalSelector, '').appendTo(selector);
    });

    this.portals.length = 0;
    return dom.html();
  }
}
