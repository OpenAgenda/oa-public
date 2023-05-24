import React, { useMemo } from 'react';
import { useIntl, FormattedDate } from 'react-intl';
import { getLocaleValue } from '@openagenda/intl';
import fieldsMessages from '@openagenda/common-labels/event/fields';
import locationFieldsMessages from '@openagenda/labels/agenda-locations/exportHeaders';
import formatState from '../utils/formatState';
import formatRole from '../utils/formatRole';
import createFormatActivity from '../utils/formatActivity';
import messages from '../messages/activities';
import useSsr from '../hooks/useSSR';


function getDiffFields(activity) {
  const { contributorFields = [], moderatorFields = [], administratorFields = [] } = activity.store;
  return [...contributorFields, ...moderatorFields, ...administratorFields];
}

function getFieldLabel(field, intl) {
  if (typeof field === 'string') {
    if (!fieldsMessages[field]) {
      console.log(`Missing message for field "${field}"`);
    }
    return intl.formatMessage(fieldsMessages[field]).toLowerCase();
  }
  return getLocaleValue(field.label, intl.locale);
}

function getLocationFieldLabel(field, intl) {
  if (typeof field === 'string') {
    if (!locationFieldsMessages[field]) {
      console.log(`Missing message for field "${field}"`);
    }
    return getLocaleValue(locationFieldsMessages[field], intl.locale).toLowerCase();
  }
  return getLocaleValue(field.label, intl.locale);
}

function renderHighlight(text) {
  return <span className="activity-highlight">{text}</span>
}

function renderTag({ chunks, tagName, activity, intl, entities, link, highlight, filter }) {
  let result = chunks;

  // event update
  // singleDiff, someDiff, manyDiff, field, fields
  if (tagName === 'singleDiff') {
    const diffFields = getDiffFields(activity);
    if (diffFields.length > 1) return null;
  }
  if (tagName === 'someDiff') {
    const diffFields = getDiffFields(activity);
    if (diffFields.length <= 1 || diffFields.length > 3) return null;
  }
  if (tagName === 'manyDiff') {
    const diffFields = getDiffFields(activity);
    if (diffFields.length <= 3) return null;
  }
  if (tagName === 'field') {
    const diffFields = getDiffFields(activity);
    return renderHighlight(getFieldLabel(diffFields[0], intl));
  }
  if (tagName === 'fields') {
    const diffFields = getDiffFields(activity);
    if (diffFields.length <= 3) {
      return intl.formatList(diffFields.map(v => renderHighlight(getFieldLabel(v, intl))));
    }
    return intl.formatList([
      ...diffFields.slice(0, 3).map(v => renderHighlight(getFieldLabel(v, intl))),
      renderHighlight(intl.formatMessage(messages.XOthers, { count: diffFields.length - 3 }))
    ]);
  }
  // location update
  if (tagName === 'locationField') {
    const diffFields = getDiffFields(activity);
    return renderHighlight(getLocationFieldLabel(diffFields[0], intl));
  }
  if (tagName === 'locationFields') {
    const diffFields = getDiffFields(activity);
    if (diffFields.length <= 3) {
      return intl.formatList(diffFields.map(v => renderHighlight(getLocationFieldLabel(v, intl))));
    }
    return intl.formatList([
      ...diffFields.slice(0, 3).map(v => renderHighlight(getLocationFieldLabel(v, intl))),
      renderHighlight(intl.formatMessage(messages.XOthers, { count: diffFields.length - 3 }))
    ]);
  }
  // location merge
  if (tagName === 'mergedOthers') {
    return renderHighlight(intl.formatMessage(messages.XOthers, { count: entities.mergedCount }));
  }

  if (tagName === 'state') {
    result = formatState(intl, chunks[0]);
  }

  if (tagName === 'role') {
    result = formatRole(intl, chunks[0]);
  }

  if (link) {
    result = <a href={link}>{result}</a>;
  }

  if (highlight) {
    result = renderHighlight(result);
  }

  return result;
}

export default function ActivityItem({ config, activity }) {
  const intl = useIntl();
  const formatActivity = useMemo(
    () =>
      createFormatActivity({
        intl,
        activities: config,
        renderTag,
      }),
    [config],
  );

  const { isBrowser } = useSsr();

  return (
    <li>
      <span className="activity-info activity-item">
        {formatActivity(activity)}
      </span>
      <span className="activity-time" style={{ visibility: isBrowser ? 'visible' : 'hidden' }}>
        <FormattedDate value={activity.createdAt} dateStyle="long" timeStyle="short" />
      </span>
    </li>
  );
}
