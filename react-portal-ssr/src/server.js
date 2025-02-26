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

    for (const { selector, content } of this.portals) {
      dom(renderToString(content)).attr(portalSelector, '').appendTo(selector);
    }

    this.portals.length = 0;
    return dom.html();
  }
}
