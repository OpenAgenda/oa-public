import _ from 'lodash';
import VError from '@openagenda/verror';
import logs from '@openagenda/logs';

import addQRCode from './addQRCode.js';
import addText from './addText.js';
import addLink from './addLink.js';
import addImage from './addImage.js';
import addMarkdown from './addMarkdown.js';
import addTimings from './addTimings.js';
import addRegistration from './addRegistration.js';
import addLocationSection from './addLocation/addLocationSection.js';
import addTagsSection from './addLocation/addTagsSection.js';
import addContactSection from './addLocation/addContactSection.js';
import addAdditionalLinksSection from './addLocation/addAdditionalLinksSection.js';
import addOptioned from './addOptioned.js';
import Cursor from './Cursor.js';
import adjustSize from './adjustSize.js';
import rtd from './roundToDecimal.js';

const addFunctions = {
  text: addText,
  link: addLink,
  phone: addLink.phone,
  email: addLink.email,
  image: addImage,
  markdown: addMarkdown,
  select: addOptioned,
  radio: addOptioned,
  checkbox: addOptioned,
  multiselect: addOptioned,
  qr: addQRCode,
  timings: addTimings,
  status: addOptioned,
  registration: addRegistration,
  addLocationSection,
  addTagsSection,
  addContactSection,
  addAdditionalLinksSection,
};

const log = logs('addPageColumn');

const displayFieldLabel = (label, value, displayLabelIfUnset) => {
  if (!label) {
    return false;
  }
  if (!displayLabelIfUnset) {
    return ![null, undefined].includes(value);
  }
  return true;
};

async function addContentItem(doc, parentCursor, params = {}) {
  const {
    availableWidth,
    availableHeight,
    simulate,
    field: { fieldType, label },
    value,
    displayLabelIfUnset = true,
    hideIfIn,
    contentItemMargin = 0,
  } = params;

  const cursor = Cursor(parentCursor);
  if (contentItemMargin) {
    cursor.moveY(contentItemMargin);
    cursor.moveX(contentItemMargin);
  }
  const size = { height: 0, width: 0 };
  const itemAvailableWidth = availableWidth - (contentItemMargin ?? 0) * 2;

  if (!addFunctions[fieldType]) {
    log.warn(`addFn for type '${fieldType}' missing`);
    return { ...size, added: false };
  }

  if (hideIfIn && hideIfIn.includes(value)) {
    log('  item hidden');
    return { ...size, added: false };
  }

  let wroteLabel = false;

  if (displayFieldLabel(label, value, displayLabelIfUnset)) {
    const labelParams = {
      ...params,
      value: label,
      width: itemAvailableWidth,
      bold: true,
    };

    const labelSize = await addText(doc, cursor, {
      ...labelParams,
      simulate: true,
    });

    if (labelSize.height > availableHeight) {
      return { ...size, remaining: value, added: false };
    }

    await addText(doc, cursor, labelParams);

    wroteLabel = true;
    adjustSize(size, labelSize);
    cursor.moveY(labelSize.height);
  }

  const addedContent = await addFunctions[fieldType](doc, cursor, {
    ...params,
    availableWidth: itemAvailableWidth,
    availableHeight: availableHeight - size.height - (contentItemMargin ?? 0),
    simulate,
  });

  adjustSize(size, {
    width: addedContent.width + 2 * (contentItemMargin ?? 0),
    height: addedContent.height + 2 * (contentItemMargin ?? 0),
  });

  return { ...addedContent, ...size, wroteLabel, added: true };
}

export default async function addPageColumn(
  doc,
  parentCursor,
  column,
  options = {},
) {
  const { content, contentItemMargin } = column;

  const {
    availableHeight: availablePageHeight = doc.page.height,
    availableWidth,
  } = options;

  if (!content) {
    return { height: 0, width: 0 };
  }

  const cursor = Cursor(parentCursor);

  let availableHeight = availablePageHeight;

  const size = { height: 0, width: 0 };

  log(
    'adding column items on available size w:%s,h:%s x:%s,y:%s',
    rtd(availableWidth),
    rtd(availableHeight),
    cursor.x,
    cursor.y,
  );

  const remaining = { content, index: -1 };

  for (const [index, contentItem] of content.entries()) {
    log(contentItem.field.field);
    log(
      '  available size for column: w:%s,h:%s',
      rtd(availableWidth),
      rtd(availableHeight),
    );

    try {
      const added = await addContentItem(doc, cursor, {
        ...options,
        ...contentItem,
        availableHeight,
        firstOfColumn: index === 0,
        contentItemMargin,
      });

      const { added: itemAdded } = added;

      if (itemAdded) {
        log(
          '  added content item %s on w:%s,h:%s x:%s,y:%s',
          added.remaining ? 'partially' : 'entirely',
          rtd(added.width),
          rtd(added.height),
          rtd(cursor.x),
          rtd(cursor.y),
        );
      } else {
        log('  item not added');
      }

      if (added.remaining) {
        remaining.contentItem = {
          ...contentItem,
          value: added.remaining,
        };
        remaining.index = index;
        remaining.wroteLabel = added.wroteLabel;
        break;
      }

      if (itemAdded) {
        cursor.moveY(added.height);
        availableHeight -= added.height;
        adjustSize(size, added);
      }
    } catch (error) {
      throw new VError(
        { info: { contentItem, error } },
        'failed to generate content item',
      );
    }
  }

  if (remaining.index !== -1) {
    return {
      ...size,
      remaining: [
        {
          ...remaining.contentItem,
          ...remaining.wroteLabel && {
            field: _.omit(remaining.contentItem.field, ['label']),
          },
        },
      ].concat(content.slice(remaining.index + 1)),
    };
  }

  return size;
}
