import logs from '@openagenda/logs';
import rtd from './roundToDecimal.js';

const log = logs('addParentElement');

const lgi = (depth) => '  '.repeat(depth);

function injectRemainingInElement(element, remaining) {
  return {
    ...element,
    value: remaining,
  };
}

export default async function addParentElement(
  doc,
  state,
  element,
  params,
  addMarkdownElement,
) {
  const { simulate = false } = params;

  const { cursor } = state;

  const depth = (params.depth ?? 1) + 1;
  log(`${lgi(depth)}addParentElement (%s children)`, element.children.length);

  const children = [...element.children];

  let lastRemaining = null;

  while (children.length) {
    const child = children.shift();
    log(
      `${lgi(depth)} ↦ placing child %s`,
      child.children ? 'with children' : `"${child.value}"`,
      rtd({ simulate, x: cursor.x }),
    );

    const availableHeight = rtd(cursor.lineHeight);

    if (!availableHeight) {
      return { overflow: true };
    }
    const result = await addMarkdownElement(doc, state, child, {
      ...params,
      bold: params.bold || child.type === 'strong',
      depth,
      paragraphAvailableWidth: cursor.availableWidth,
      availableWidth: Math.floor(
        cursor.availableWidth - (cursor.x - cursor.init.x),
      ),
      availableHeight,
    });

    if (result?.overflow) {
      return { overflow: true };
    }

    const remaining = result?.remaining;

    if (remaining?.length) {
      if (lastRemaining === remaining) {
        throw new Error(
          `Infinite loop detected: remaining unchanged (${remaining.length} length).`,
        );
      }
      if (lastRemaining != null && remaining.length >= lastRemaining.length) {
        throw new Error(
          `Infinite loop detected: remaining not shrinking (prev=${lastRemaining.length}, now=${remaining.length}).`,
        );
      }

      lastRemaining = remaining;

      log(`${lgi(depth)} ↦ stacking remaining back in children to process`);
      children.splice(0, 0, injectRemainingInElement(child, remaining));
    } else {
      lastRemaining = null;
    }
  }
}
