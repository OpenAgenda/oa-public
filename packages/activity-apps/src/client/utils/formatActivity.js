import _ from 'lodash';
import { getLocaleValue } from '@openagenda/intl';

function multiReplace(str, obj) {
  return Object.keys(obj).reduce((accu, key) => accu.replaceAll(`:${key}`, obj[key]), str);
}

function getActivityEntity(activity, entity) {
  const [name, key] = entity.split('.');
  const identifier = activity[name];

  if (!identifier) {
    return null;
  }

  const [entityType, entityUid] = identifier.split(':');
  if (key === 'type') return entityType;
  if (key === 'uid') return parseInt(entityUid, 10);
  return null;
}

function getEntities(activity, entityMap, lang) {
  if (!entityMap) return {};

  return Object.keys(entityMap).reduce((accu, entityKey) => {
    const entity = entityMap[entityKey];

    if (entity.startsWith('actor.') || entity.startsWith('object.') || entity.startsWith('target.')) {
      accu[entityKey] = getActivityEntity(activity, entity);
      return accu;
    }

    accu[entityKey] = getLocaleValue(_.get(activity, entity), lang);
    return accu;
  }, {});
}

function getTags(activity, tagMap, render, entities, intl) {
  if (!tagMap) return {};

  return Object.keys(tagMap).reduce((accu, tagName) => {
    const tagProps = tagMap[tagName];

    const link = tagProps.link ? multiReplace(tagProps.link, entities) : null;

    accu[tagName] = chunks => render({
      chunks,
      tagName,
      activity,
      entities,
      intl,
      ...tagProps,
      link,
    });

    return accu;
  }, {});
}

function getLabelId({ labelId, labelIds = [] }, data) {
  for (const [partialLabelId, requestedEntities] of labelIds) {
    const missing = requestedEntities.some(requestedEntity => !_.get(data, requestedEntity));

    if (!missing) {
      return partialLabelId;
    }
  }

  return labelId;
}

export default function createActivityFormatter(config) {
  const { intl, activities, renderTag } = config;

  return function formatActivity(activity) {
    try {
      const activityMap = activities[activity.verb];
      const entities = getEntities(activity, activityMap.entities, intl.locale);
      const tags = getTags(activity, activityMap.tags, renderTag, entities, intl);

      const labelId = getLabelId(activityMap, activity);

      const data = { ...entities, ...tags };

      return intl.formatMessage({ id: labelId }, data);
    } catch (e) {
      console.log(`Error when formatting activity "${activity.verb}"`, e);
      return '';
    }
  };
}

