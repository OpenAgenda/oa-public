import { createPortal } from 'react-dom';
import { PortalContext, portalSelector } from './common';

export * from './common';

export function Portal({ children, selector = '#portal' }) {
  return (
    <PortalContext.Consumer>
      {(portals) => {
        if (typeof window === 'undefined') {
          portals.push({ content: children, selector });
          return null;
        }

        const element = document.querySelector(selector);

        if (!element) {
          throw new Error(`Dom is missing element with id of "${selector}"`);
        }

        return createPortal(children, element);
      }}
    </PortalContext.Consumer>
  );
}

export function prepareClientPortals() {
  if (typeof window !== 'undefined') {
    Array.prototype.slice
      .call(document.querySelectorAll(`[${portalSelector}]`))
      .forEach((node) => {
        node.parentNode.removeChild(node);
      });
  }
}
